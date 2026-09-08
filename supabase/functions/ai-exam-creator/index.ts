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

const MOROCCAN_MATHS_PROFILE = `
MOROCCAN 2BAC MATHS GENERATION PROFILE
- Generate connected mathematical problems, not random unrelated questions.
- When appropriate, later questions must reuse earlier results. Treat question order as part of the pedagogy.
- Common progression: direct technique -> proof/verification -> deduction -> application -> deeper reasoning -> synthesis/graphical interpretation.
- Functions often follow: domain/continuity -> limits -> infinite branch -> derivative -> sign -> variations -> zeros/equations -> relative position -> tangent/asymptote -> concavity -> graph -> integral.
- Auxiliary-function pattern is common: study g -> establish sign of g -> express/use f' through g -> deduce variations of f -> continue to equation/graph/application.
- Sequences often follow: first term -> invariant interval/bounds -> positivity -> monotonicity -> convergence -> limit -> estimate/inequality; transformations such as v_n=phi(u_n) may be introduced to reveal a geometric/arithmetic sequence.
- Complex-number problems often bridge algebra and geometry: equation in C -> algebraic/trigonometric form -> module/argument -> affixes -> rotation/translation/homothety -> angle/alignment/triangle/circle conclusion.
- Integral problems often chain primitive recognition -> integration by parts -> definite integral -> deduction -> area.
- Probability problems often chain sample space -> event probability -> random variable values -> probability law -> expectation -> standard deviation.
- Reciprocal-function problems often chain continuity -> strict monotonicity -> image -> inverse existence -> inverse values/comparison -> formula.
- Short independent questions should only be used when the source pattern explicitly calls for independence.
- Moroccan instruction verbs have mathematical roles: "Montrer que" = proof, "Vérifier que" = short verification, "En déduire" = dependent deduction, "Étudier" = structured study, "Dresser le tableau" = organize established sign/variation information, "Interpréter géométriquement" = translate analytic result into geometry, "Construire/Tracer" = final representation.
- Difficulty should come mainly from reasoning, deduction, dependency and representation changes, not ugly coefficients.
- Build the barème with the question. Prefer small, evidence-based allocations and do not double-count the same reasoning.
- Use concise formal French consistent with Moroccan 2BAC assessment.
- For mathematics use standard notation such as R, C, N, intervals, limits, derivatives, integrals, affine/complex notation and LaTeX. Never wrap formulas in dollar or other math delimiters inside JSON strings.
- Never introduce concepts absent from the supplied source or selected curriculum.
`;

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

function prompt(input: {
  text: string;
  subject?: string;
  chapter?: string;
  track?: string;
  difficulty?: string;
  durationMinutes?: number;
  questionCount?: number;
  weakPoints?: string[];
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

  return `Tu es le générateur d'examens de MentionMax pour le baccalauréat marocain 2BAC.

${meta}

${MOROCCAN_MATHS_PROFILE}

OBJECTIF
Crée un vrai sujet d'entraînement à partir UNIQUEMENT du contenu source. Il doit ressembler à un devoir sérieux de niveau Bac, avec progression de difficulté, barème cohérent et correction exploitable.

RÈGLES DE GÉNÉRATION
- Transforme le contenu source en problème(s) original(aux) mais fidèle(s) aux notions disponibles.
- Favorise une architecture logique et cumulative quand le chapitre s'y prête.
- Vérifie mentalement les résultats et la cohérence des questions avant de répondre.
- Ne donne pas une question difficile simplement parce que les calculs sont longs.
- Les sous-questions d'un même exercice doivent avoir un lien mathématique clair lorsque l'exercice est construit comme un problème.
- Si des faiblesses sont fournies, cible-les par des compétences et raisonnements précis sans rendre le sujet artificiel.
- Pour le parcours SMB, n'introduis jamais de SVT.

FORMAT MATHÉMATIQUE
- Écris toutes les expressions mathématiques en LaTeX BRUT, sans délimiteurs.
- Exemples: \\frac{a}{b}, x^2, \\sqrt{x}, \\sum_{k=1}^n, \\int_0^1 x^2 dx, \\leq, \\rightarrow.
- N'écris jamais $...$, $$...$$, \\( ... \\) ou \\[ ... \\].
- Les chaînes JSON doivent conserver les commandes LaTeX intactes.

CORRECTION
- Donne une correction complète pour chaque question.
- La correction doit suivre exactement la question et montrer les étapes réellement nécessaires.
- Pour les questions dépendantes, réutilise explicitement les résultats précédents.

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

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": key,
        "Api-Revision": "2026-05-20",
      },
      body: JSON.stringify({
        model: MODEL,
        input: [{
          type: "text",
          text: prompt({
            text,
            subject: typeof body?.subject === "string" ? body.subject : undefined,
            chapter: typeof body?.chapter === "string" ? body.chapter : undefined,
            track: typeof body?.track === "string" ? body.track : undefined,
            difficulty,
            durationMinutes,
            questionCount,
            weakPoints,
          }),
        }],
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
      return jsonResponse({ success: true, result, model: MODEL, profile: "moroccan-maths-v1" });
    } catch (error) {
      console.error("ai-exam-creator parse failure", { message: error instanceof Error ? error.message : String(error), preview: raw.slice(0, 1200) });
      return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Réponse IA invalide.", preview: raw.slice(0, 1200) }, 502);
    }
  } catch (error) {
    console.error("ai-exam-creator unexpected error", error);
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Erreur inattendue." }, 500);
  }
});
