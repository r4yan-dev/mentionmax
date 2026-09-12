const MODEL = "gemini-3.1-flash-lite";
const MAX_INPUT = 120000;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" };

const FALLBACK_PROFILE = {
  version: 2,
  rules: {
    assessment_system: "Moroccan Bac 2BAC",
    language: "fr",
    core_principle: "Generate authentic Moroccan 2BAC mathematical papers, not generic textbook quizzes.",
    structure: [
      "Prefer a coherent number of exercises matched to the requested duration.",
      "Within one exercise, keep every question inside the same exercise container.",
      "Use question numbering 1., 2., 3., subquestions a), b), c), and sub-subquestions i), ii), iii) only when needed.",
      "Never turn a subquestion into a new exercise.",
      "Later questions should reuse previous results when mathematically natural.",
      "Use a clear progression from direct technique to reasoning, deduction, application and synthesis."
    ],
    document_style: [
      "Suitable for an A4 Moroccan school examination sheet.",
      "Formal compact French.",
      "Neutral academic exercise titles.",
      "No metadata, Markdown, HTML, emojis or literal QUESTION labels in student statements."
    ],
    math_notation: { latex: true, raw_latex: true, no_math_delimiters_in_json: true },
    exam_duration_modes: [
      { minutes: 20, recommendedExercises: 1 },
      { minutes: 30, recommendedExercises: 1 },
      { minutes: 45, recommendedExercises: 2 },
      { minutes: 60, recommendedExercises: 2 },
      { minutes: 90, recommendedExercises: 2 },
      { minutes: 120, recommendedExercises: 3 },
      { minutes: 180, recommendedExercises: 3 },
      { minutes: 240, recommendedExercises: 4, fullPaper: true }
    ]
  }
};

const schema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subject: { type: "string" },
    track: { type: "string" },
    durationMinutes: { type: "integer" },
    instructions: { type: "array", items: { type: "string" } },
    totalPoints: { type: "number" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          number: { type: "integer" },
          title: { type: "string" },
          points: { type: "number" },
          statement: { type: "string" },
          expectedSkill: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          correction: { type: "string" }
        },
        required: ["number", "title", "points", "statement", "expectedSkill", "difficulty", "correction"]
      }
    },
    sourceCoverage: { type: "array", items: { type: "string" } },
    weakPointTargets: { type: "array", items: { type: "string" } }
  },
  required: ["title", "subject", "track", "durationMinutes", "instructions", "totalPoints", "questions", "sourceCoverage", "weakPointTargets"]
};

function getServerKey() {
  const direct = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY");
  if (direct) return direct;
  const packed = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!packed) return "";
  try {
    const parsed = JSON.parse(packed);
    return typeof parsed?.default === "string" ? parsed.default : "";
  } catch { return ""; }
}

function getAuthKey() { return Deno.env.get("SUPABASE_ANON_KEY") || getServerKey(); }

async function requireUser(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return false;
  const base = Deno.env.get("SUPABASE_URL");
  const key = getAuthKey();
  if (!base || !key) return false;
  try {
    const response = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: key, Authorization: authorization },
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch { return false; }
}

async function loadProfile(subject?: string) {
  const base = Deno.env.get("SUPABASE_URL");
  const key = getServerKey();
  if (!base || !key) return FALLBACK_PROFILE;
  const normalized = subject?.toLowerCase().includes("math") ? "maths" : subject?.toLowerCase() || "maths";
  try {
    const url = new URL(`${base}/rest/v1/ai_generation_profiles`);
    url.searchParams.set("select", "version,rules,exemplars,source_count,exemplar_count");
    url.searchParams.set("status", "eq.active");
    url.searchParams.set("subject", `eq.${normalized}`);
    url.searchParams.set("order", "version.desc");
    url.searchParams.set("limit", "1");
    const response = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) return FALLBACK_PROFILE;
    const rows = await response.json();
    return Array.isArray(rows) && rows[0] ? rows[0] : FALLBACK_PROFILE;
  } catch { return FALLBACK_PROFILE; }
}

function getExamPlan(durationMinutes: number, requestedExerciseCount: number) {
  if (durationMinutes >= 210) return { durationMinutes: 240, exerciseCount: 4, totalPoints: 20, pointDistribution: [10, 3.5, 3, 3.5], fullPaper: true };
  if (durationMinutes <= 20) return { durationMinutes: 20, exerciseCount: 1, totalPoints: 20, pointDistribution: [20], fullPaper: false };
  if (durationMinutes <= 30) return { durationMinutes: 30, exerciseCount: 1, totalPoints: 20, pointDistribution: [20], fullPaper: false };
  if (durationMinutes <= 45) return { durationMinutes, exerciseCount: 2, totalPoints: 20, pointDistribution: [10, 10], fullPaper: false };
  if (durationMinutes <= 90) return { durationMinutes, exerciseCount: 2, totalPoints: 20, pointDistribution: [10, 10], fullPaper: false };
  if (durationMinutes <= 120) return { durationMinutes, exerciseCount: 3, totalPoints: 20, pointDistribution: [8, 6, 6], fullPaper: false };
  return { durationMinutes, exerciseCount: Math.max(3, Math.min(4, requestedExerciseCount || 3)), totalPoints: 20, pointDistribution: [], fullPaper: false };
}

function buildPrompt(i: { text:string; subject?:string; chapter?:string; track?:string; difficulty:string; durationMinutes:number; questionCount:number; weakPoints:string[]; profile:any; plan:any }) {
  const meta = [
    i.subject && `Matière: ${i.subject}`,
    i.chapter && `Chapitre(s): ${i.chapter}`,
    i.track && `Parcours: ${i.track}`,
    `Niveau: ${i.difficulty}`,
    `Durée demandée: ${i.durationMinutes} minutes`,
    `Plan retenu: ${i.plan.exerciseCount} exercice(s)`,
    `Cible: ${i.questionCount} questions`
  ].filter(Boolean).join("\n");
  const training = JSON.stringify({
    version: i.profile?.version ?? 2,
    rules: i.profile?.rules ?? FALLBACK_PROFILE.rules,
    exemplars: Array.isArray(i.profile?.exemplars) ? i.profile.exemplars.slice(0, 24) : []
  });
  const durationInstruction = i.plan.fullPaper
    ? `MODE NATIONAL SM 4H OBLIGATOIRE:\n- Durée exactement 240 minutes.\n- EXACTEMENT 4 exercices indépendants.\n- Total exactement 20 points.\n- Architecture cible: Exercice 1 Analyse = 10 pts; Exercice 2 Nombres complexes = 3,5 pts; Exercice 3 Arithmétique / probabilités = 3 pts; Exercice 4 Structures algébriques = 3,5 pts.\n- Les exercices sont des problèmes cohérents, chacun avec une chaîne de questions numérotées.\n- N’ajoute pas de SVT au parcours SMB.`
    : `MODE ENTRAÎNEMENT ${i.plan.durationMinutes} MIN:\n- Respecte exactement la durée demandée.\n- Utilise environ ${i.plan.exerciseCount} exercice(s), avec de vraies chaînes de sous-questions plutôt qu’une liste de micro-questions.\n- Garde une densité réaliste: une séance courte doit rester faisable dans son temps.`;
  return `Tu construis un vrai devoir marocain 2BAC, pas une liste de questions.\n\n${meta}\n\nPROFILE ACTIF:\n${training}\n\n${durationInstruction}\n\nRÈGLE DE STRUCTURE ABSOLUE:\n- Un EXERCICE est un problème complet et cohérent.\n- TOUS les éléments d'un même exercice restent ensemble.\n- Un exercice peut contenir plusieurs questions 1., 2., 3.\n- Une question peut contenir a), b), c).\n- Une sous-question peut contenir i), ii), iii).\n- JAMAIS créer un nouvel exercice pour a), b), c), i), ii), iii) ou pour une question appartenant au même problème.\n- Le titre doit être EXACTEMENT identique pour toutes les questions appartenant au même exercice.\n- Les questions d'un même exercice doivent être consécutives dans le tableau JSON.\n- Le champ number est le numéro global de la question, mais la numérotation visible fine sera gérée par l'interface.\n\nEXEMPLE:\nExercice 1 — Nombres complexes\n  1. ...\n  2. ...\n    a) ...\n    b) ...\n  3. ...\n\nExercice 2 — Étude d'une fonction\n  1. ...\n  2. ...\n    a) ...\n    b) ...\n\nIMPORTANT: « Exercice 1 — ... » est un titre de GROUPE, pas le titre de chaque petite question. Ne crée jamais « Exercice 2 — Question 1.b ».\n\nRÉDACTION:\n- Français académique compact.\n- Utilise Soit, On considère, Montrer que, Vérifier que, Déterminer, Calculer, Résoudre, Étudier, En déduire, Interpréter géométriquement.\n- Aucun Markdown, HTML, emoji, QUESTION 1, easy, medium, hard ou métadonnée dans le texte élève.\n- LaTeX brut sans délimiteurs.\n- Total sur 20.\n- Pour SMB, aucun contenu SVT.\n\nAvant de répondre, vérifie: nombre d’exercices conforme au plan, titres répétés exactement à l'intérieur d'un exercice, exercices consécutifs, aucune sous-question transformée en exercice, et durée compatible avec la charge de travail.\nRetourne UNIQUEMENT le JSON conforme au schéma.\n\nSOURCE:\n${i.text}`;
}

function extractText(payload:any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const parts:string[] = [];
  for (const key of ["steps", "outputs"]) if (Array.isArray(payload?.[key])) for (const item of payload[key]) {
    if (typeof item?.text === "string") parts.push(item.text);
    for (const nested of [item?.content, item?.output]) if (Array.isArray(nested)) {
      for (const part of nested) if (typeof part?.text === "string") parts.push(part.text);
    }
  }
  if (typeof payload?.text === "string") parts.push(payload.text);
  return parts.join("\n").trim();
}

function parseJson(raw:string) {
  const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
  throw new Error("Gemini a renvoyé un JSON invalide.");
}

function normalizeMath(value:any):any {
  if (typeof value === "string") return value.replace(/\\\(([\s\S]*?)\\\)/g, "$1").replace(/\\\[([\s\S]*?)\\\]/g, "$1");
  if (Array.isArray(value)) return value.map(normalizeMath);
  if (value && typeof value === "object") {
    const out:any = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeMath(v);
    return out;
  }
  return value;
}

function normalizeExerciseTitles(result:any) {
  if (!Array.isArray(result?.questions)) return result;
  let exerciseNo = 0;
  let currentBase = "";
  let currentTitle = "";
  const questions = result.questions.map((q:any, index:number) => {
    const raw = typeof q?.title === "string" ? q.title.trim() : "";
    const match = raw.match(/^Exercice\s+\d+\s*[—–-]\s*(.+)$/i);
    const base = match ? match[1].trim() : raw.replace(/^Exercice\s+\d+\s*/i, "").trim();
    const looksLikeQuestionTitle = /^(Question\b|Question\s+\d+)/i.test(base);
    const isNew = index === 0 || (!!match && !!base && !looksLikeQuestionTitle && base !== currentBase);
    if (isNew) {
      exerciseNo += 1;
      currentBase = base || `Partie ${exerciseNo}`;
      currentTitle = `Exercice ${exerciseNo} — ${currentBase}`;
    }
    return { ...q, title: currentTitle };
  });
  return { ...result, questions };
}

function response(body:unknown, status=200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return response({ success:false, error:"Méthode non autorisée." }, 405);
  try {
    if (!(await requireUser(req))) return response({ success:false, error:"Authentification requise." }, 401);
    const apiKey = Deno.env.get("AI_EXAM_CREATOR_API_KEY");
    if (!apiKey) return response({ success:false, error:"Secret AI_EXAM_CREATOR_API_KEY manquant." }, 500);
    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) return response({ success:false, error:"Le texte source est vide." }, 400);
    if (text.length > MAX_INPUT) return response({ success:false, error:"Texte source trop long." }, 413);
    const requestedQuestionCount = Math.max(1, Math.min(12, Number(body?.questionCount)||10));
    const requestedDuration = Math.max(20, Math.min(240, Number(body?.durationMinutes)||60));
    const difficulty = typeof body?.difficulty === "string" ? body.difficulty : "bac";
    const weakPoints = Array.isArray(body?.weakPoints) ? body.weakPoints.filter((x:unknown)=>typeof x === "string").slice(0,12) : [];
    const subject = typeof body?.subject === "string" ? body.subject : undefined;
    const track = typeof body?.track === "string" ? body.track : undefined;
    const requestedExerciseCount = Math.max(1, Math.min(4, Number(body?.exerciseCount)||3));
    const plan = getExamPlan(requestedDuration, requestedExerciseCount);
    const questionCount = plan.fullPaper ? 12 : Math.min(12, Math.max(plan.exerciseCount * 3, requestedQuestionCount));
    const profile = await loadProfile(subject);
    const prompt = buildPrompt({ text, subject, chapter:typeof body?.chapter === "string" ? body.chapter : undefined, track, difficulty, durationMinutes:plan.durationMinutes, questionCount, weakPoints, profile, plan });
    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method:"POST",
      headers:{"Content-Type":"application/json","x-goog-api-key":apiKey,"Api-Revision":"2026-05-20"},
      body:JSON.stringify({
        model:MODEL,
        input:prompt,
        store:false,
        response_format:{type:"text",mime_type:"application/json",schema},
        generation_config:{max_output_tokens:9000,thinking_level:"minimal"}
      }),
      signal:AbortSignal.timeout(90000)
    });
    const rawUpstream = await upstream.text();
    const payload = (()=>{try{return JSON.parse(rawUpstream)}catch{return null}})();
    if (!upstream.ok) {
      if (upstream.status === 429) return response({success:false,error:"Le générateur IA est temporairement limité. Réessaie dans quelques secondes.",detail:payload?.error?.message ?? "Gemini quota/rate limit"},429);
      return response({success:false,error:"La génération de l'examen a échoué.",detail:payload?.error?.message ?? `Gemini HTTP ${upstream.status}`},upstream.status);
    }
    try {
      const result = normalizeExerciseTitles(normalizeMath(parseJson(extractText(payload))));
      result.durationMinutes = plan.durationMinutes;
      result.totalPoints = 20;
      return response({success:true,result,model:MODEL,profile:`moroccan-${subject?.toLowerCase().includes("math") ? "maths" : "2bac"}-v${profile.version ?? 2}`});
    } catch (error) {
      console.error("ai-exam-creator parse failure", error);
      return response({success:false,error:error instanceof Error ? error.message : "Réponse IA invalide.",detail:rawUpstream.slice(0,4000)},502);
    }
  } catch (error) {
    console.error("ai-exam-creator unexpected error", error);
    return response({success:false,error:error instanceof Error ? error.message : "Erreur inattendue."},500);
  }
});
