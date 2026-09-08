import "jsr:@supabase/functions-js@2/edge-runtime.d.ts";

const MODEL = "gemini-3.6-flash";
const MAX_INPUT = 120000;
const HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

const FALLBACK_PROFILE = {
  version: 2,
  rules: {
    assessment_system: "Moroccan Bac 2BAC",
    language: "fr",
    core_principle: "Generate authentic Moroccan 2BAC mathematical papers, not generic textbook quizzes.",
    structure: [
      "Prefer 2 to 4 coherent exercises over many isolated micro-questions.",
      "Within an exercise use numbered subquestions 1., 2., 3. and a), b), c) when needed.",
      "Later subquestions should reuse previous results when the mathematical architecture allows it.",
      "Use a clear progression from direct technique to reasoning, deduction, application and synthesis.",
      "Use the standard Moroccan instruction verbs Calculer, Déterminer, Montrer que, Vérifier que, Étudier, En déduire, Dresser le tableau, Interpréter géométriquement, Construire and Tracer.",
      "Avoid titles that read like skill labels or study-card headings.",
      "Do not fabricate difficulty by using arbitrary ugly coefficients or excessive calculation.",
      "Do not produce a flat list of unrelated one-line exercises when the source supports a connected problem."
    ],
    function_architecture: [
      "domain/continuity -> limits -> branch/asymptote -> derivative -> sign -> variations -> equation/graph -> integral",
      "auxiliary function -> sign -> derivative relation -> variations -> deduction -> application",
      "sequence bounds/invariant interval -> positivity -> monotonicity -> convergence -> limit -> estimate",
      "complex equation -> algebraic/trigonometric form -> module/argument -> affixes -> transformation -> geometric conclusion",
      "primitive -> integration method -> definite integral -> deduction -> area",
      "probability model -> events -> random variable -> distribution -> expectation -> dispersion",
      "inverse function: monotonicity -> image -> inverse existence -> inverse values/comparison -> formula"
    ],
    document_style: [
      "The generated content must be suitable for an A4 Moroccan school examination sheet.",
      "Use formal compact French, with mathematically conventional wording.",
      "Use exercise-level titles such as Etude d'une fonction, Suites numériques, Calcul intégral, Nombres complexes when a title is useful.",
      "Never put metadata inside the student-facing statement: no difficulty labels, competency labels, AI labels or internal field names.",
      "Never use Markdown headings, bold markers, emojis, HTML or the literal words QUESTION 1/QUESTION 2 in statements.",
      "Keep instructions short and exam-like rather than explanatory or conversational."
    ],
    math_notation: {
      latex: true,
      raw_latex: true,
      no_math_delimiters_in_json: true,
      examples: ["\\frac{a}{b}", "x^2", "\\sqrt{x}", "\\int_0^1 x^2 dx", "\\leq", "\\rightarrow"]
    }
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
          correction: { type: "string" },
        },
        required: ["number", "title", "points", "statement", "expectedSkill", "difficulty", "correction"],
      },
    },
    sourceCoverage: { type: "array", items: { type: "string" } },
    weakPointTargets: { type: "array", items: { type: "string" } },
  },
  required: ["title", "subject", "track", "durationMinutes", "instructions", "totalPoints", "questions", "sourceCoverage", "weakPointTargets"],
};

async function loadGenerationProfile(subject?: string, track?: string) {
  try {
    const baseUrl = Deno.env.get("SUPABASE_URL");
    const secretKeysRaw = Deno.env.get("SUPABASE_SECRET_KEYS");
    if (!baseUrl || !secretKeysRaw) return FALLBACK_PROFILE;
    const secretKeys = JSON.parse(secretKeysRaw) as Record<string, string>;
    const secretKey = secretKeys.default;
    if (!secretKey) return FALLBACK_PROFILE;

    const subjectFilter = subject?.toLowerCase().includes("math") ? "maths" : subject?.toLowerCase() || "maths";
    const url = new URL(`${baseUrl}/rest/v1/ai_generation_profiles`);
    url.searchParams.set("select", "version,rules,exemplars,source_count,exemplar_count");
    url.searchParams.set("status", "eq.active");
    url.searchParams.set("subject", `eq.${subjectFilter}`);
    url.searchParams.set("order", "version.desc");
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      headers: {
        apikey: secretKey,
        Authorization: `Bearer ${secretKey}`,
      },
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return FALLBACK_PROFILE;
    const rows = await response.json();
    if (!Array.isArray(rows) || !rows[0]) return FALLBACK_PROFILE;

    return {
      version: Number(rows[0].version) || 1,
      rules: rows[0].rules ?? FALLBACK_PROFILE.rules,
      exemplars: Array.isArray(rows[0].exemplars) ? rows[0].exemplars : [],
      source_count: Number(rows[0].source_count) || 0,
      exemplar_count: Number(rows[0].exemplar_count) || 0,
      requestedTrack: track ?? null,
    };
  } catch (error) {
    console.warn("ai-exam-creator profile load failed", error instanceof Error ? error.message : String(error));
    return FALLBACK_PROFILE;
  }
}

function compactProfile(profile: any) {
  return JSON.stringify({
    version: profile.version,
    rules: profile.rules,
    exemplars: Array.isArray(profile.exemplars) ? profile.exemplars.slice(0, 20) : [],
    source_count: profile.source_count ?? 0,
    exemplar_count: profile.exemplar_count ?? 0,
  });
}

function prompt(input: {
  text: string;
  subject?: string;
  chapter?: string;
  track?: string;
  difficulty?: string;
  durationMinutes?: number;
  questionCount?: number;
  weakPoints?: string[];
  profile: any;
}) {
  const meta = [
    input.subject && `Matière: ${input.subject}`,
    input.chapter && `Chapitre(s): ${input.chapter}`,
    input.track && `Parcours: ${input.track}`,
    input.difficulty && `Niveau demandé: ${input.difficulty}`,
    input.durationMinutes && `Durée cible: ${input.durationMinutes} minutes`,
    input.questionCount && `Nombre de questions cible: ${input.questionCount}`,
    input.weakPoints?.length ? `Faiblesses à cibler: ${input.weakPoints.join(", ")}` : "",
  ].filter(Boolean).join("\n");

  return `Tu es le générateur de sujets du baccalauréat marocain 2BAC de MentionMax.

${meta}

TRAINING PROFILE ACTIF — SOURCE PRIORITAIRE
Le bloc JSON ci-dessous est un corpus de règles et d'exemplaires sélectionnés pour apprendre la forme pédagogique et rédactionnelle attendue. Tu dois réellement l'utiliser pour décider de la structure du sujet. Ce n'est pas une simple information descriptive.
${compactProfile(input.profile)}

HIÉRARCHIE
1. Respecte le contenu source et le niveau/curriculum demandé.
2. Applique le Training Profile actif pour la structure, le style de rédaction, les dépendances et le barème.
3. Applique les règles de format ci-dessous.

OBJECTIF
Produis un vrai sujet d'entraînement de type Bac marocain, pas une fiche de révision et pas une liste de dix questions générées indépendamment.

ARCHITECTURE OBLIGATOIRE
- Regroupe les questions en 2 à 4 exercices cohérents quand le volume le permet.
- Un exercice doit former un problème identifiable avec une idée, des données et une progression.
- Les sous-questions doivent être courtes et dépendantes quand cela est mathématiquement naturel.
- Favorise: question directe -> justification -> déduction -> application -> synthèse.
- Réutilise explicitement un résultat précédent dans une question de type "En déduire" lorsqu'il existe une dépendance réelle.
- Réserve les questions indépendantes aux situations où le profil ou la source l'indique.
- Ne transforme jamais une même notion en 10 petites questions juste pour atteindre questionCount.

RÉDACTION MAROCAINE
- Utilise une langue française formelle, compacte, scolaire et naturelle.
- Préfère les formulations: "Soit...", "On considère...", "On pose...", "Montrer que...", "Vérifier que...", "Déterminer...", "Étudier...", "En déduire...", "Dresser le tableau...", "Interpréter géométriquement...", "Construire...", "Tracer...".
- Les titres d'exercice doivent être neutres et académiques: "Étude d'une fonction", "Suites numériques", "Calcul intégral", "Nombres complexes", etc.
- N'écris jamais "QUESTION 1", "Question 1", "QUESTION 2" dans title ou statement.
- N'écris jamais dans le sujet: easy, medium, hard, difficulté, Compétence, compétence, expectedSkill, AI, généré par IA, prompt, skill, metadata ou tout autre champ interne.
- Aucun Markdown: pas de ###, ##, **, *, HTML ou emoji.
- La numérotation des exercices et sous-questions est gérée par l'interface. Ne préfixe pas automatiquement chaque question par "QUESTION".

BARÈME
- Le barème doit suivre la difficulté réelle de la sous-question.
- Donne plus de points aux raisonnements et conclusions qu'aux simples calculs mécaniques.
- Évite de donner deux fois les mêmes points pour une chaîne de raisonnement déjà évaluée.
- Le total doit être cohérent avec un devoir sur 20 quand le contexte est un examen complet, sinon conserver une proportion raisonnable pour la durée.

PAPIER ÉLÈVE
- instructions contient seulement les consignes générales utiles à l'élève.
- title doit ressembler à un vrai devoir: "Devoir surveillé de mathématiques", "Sujet d'entraînement de mathématiques", ou un intitulé de chapitre.
- expectedSkill et difficulty restent des métadonnées internes destinées à MentionMax, jamais au papier élève.

FORMAT MATHÉMATIQUE
- Écris toutes les expressions mathématiques en LaTeX BRUT, sans délimiteurs.
- Exemples: \\frac{a}{b}, x^2, \\sqrt{x}, \\sum_{k=1}^n, \\int_0^1 x^2 dx, \\leq, \\rightarrow.
- N'écris jamais $...$, $$...$$, \\( ... \\) ou \\[ ... \\].

CONTRÔLE FINAL AVANT JSON
- Vérifie que le sujet ressemble à un devoir marocain et non à une liste de quiz.
- Vérifie que les exercices sont cohérents et que les dépendances sont mathématiquement valides.
- Vérifie que le nombre de questions ne détruit pas l'architecture: mieux vaut 8 sous-questions bien construites que 15 artificielles.
- Vérifie que chaque question peut réellement être corrigée avec le barème fourni.
- Pour SMB, ne jamais introduire de SVT.

Retourne UNIQUEMENT le JSON conforme au schéma.

SOURCE:
${input.text}`;
}

function extractText(payload: any): string {
  const direct = typeof payload?.output_text === "string" ? payload.output_text.trim() : "";
  if (direct) return direct;
  const parts: string[] = [];
  for (const key of ["steps", "outputs"]) {
    if (!Array.isArray(payload?.[key])) continue;
    for (const item of payload[key]) {
      if (typeof item?.text === "string") parts.push(item.text);
      for (const nested of [item?.content, item?.output]) {
        if (!Array.isArray(nested)) continue;
        for (const part of nested) if (typeof part?.text === "string") parts.push(part.text);
      }
    }
  }
  if (typeof payload?.text === "string") parts.push(payload.text);
  return parts.join("\n").trim();
}

function normalizeRaw(raw: string): string {
  return raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function parseJson(raw: string): any {
  const cleaned = normalizeRaw(raw);
  try { return JSON.parse(cleaned); } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
  throw new Error("Gemini a renvoyé un JSON invalide.");
}

function normalizeMath(value: any): any {
  if (typeof value === "string") {
    return value
      .replace(/\\\\\\(([\\s\\S]*?)\\\\\\)/g, "$1")
      .replace(/\\\\\\[([\\s\\S]*?)\\\\\\]/g, "$1");
  }
  if (Array.isArray(value)) return value.map(normalizeMath);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) out[key] = normalizeMath(val);
    return out;
  }
  return value;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: HEADERS });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: HEADERS });
  if (req.method !== "POST") return jsonResponse({ success: false, error: "Méthode non autorisée." }, 405);

  try {
    const key = Deno.env.get("AI_EXAM_CREATOR_API_KEY");
    if (!key) return jsonResponse({ success: false, error: "Secret AI_EXAM_CREATOR_API_KEY manquant." }, 500);

    const body = await req.json();
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) return jsonResponse({ success: false, error: "Le texte source est vide." }, 400);
    if (text.length > MAX_INPUT) return jsonResponse({ success: false, error: "Texte source trop long." }, 413);

    const questionCount = Math.max(1, Math.min(20, Number(body?.questionCount) || 10));
    const durationMinutes = Math.max(15, Math.min(180, Number(body?.durationMinutes) || 60));
    const difficulty = typeof body?.difficulty === "string" ? body.difficulty : "bac";
    const weakPoints = Array.isArray(body?.weakPoints) ? body.weakPoints.filter((x: unknown) => typeof x === "string").slice(0, 12) : [];
    const subject = typeof body?.subject === "string" ? body.subject : undefined;
    const track = typeof body?.track === "string" ? body.track : undefined;
    const profile = await loadGenerationProfile(subject, track);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model: MODEL,
        input: [{ type: "text", text: prompt({ text, subject, chapter: typeof body?.chapter === "string" ? body.chapter : undefined, track, difficulty, durationMinutes, questionCount, weakPoints, profile }) }],
        store: false,
        response_format: { type: "text", mime_type: "application/json", schema },
        generation_config: { max_output_tokens: 14000, thinking_level: "low" },
      }),
      signal: AbortSignal.timeout(90000),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      return jsonResponse({ success: false, error: "La génération de l'examen a échoué.", detail: payload?.error?.message ?? `Gemini HTTP ${response.status}` }, response.status);
    }

    const raw = extractText(payload);
    try {
      const result = normalizeMath(parseJson(raw));
      return jsonResponse({ success: true, result, model: MODEL, profile: `moroccan-${subject?.toLowerCase().includes("math") ? "maths" : "2bac"}-v${profile.version}` });
    } catch (error) {
      console.error("ai-exam-creator parse failure", { message: error instanceof Error ? error.message : String(error), preview: raw.slice(0, 1200) });
      return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Réponse IA invalide.", preview: raw.slice(0, 1200) }, 502);
    }
  } catch (error) {
    console.error("ai-exam-creator unexpected error", error);
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Erreur inattendue." }, 500);
  }
});
