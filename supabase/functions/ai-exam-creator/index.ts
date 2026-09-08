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

  return `Tu es le générateur d'examens de MentionMax pour le baccalauréat marocain 2BAC.\n\n${meta}\n\nOBJECTIF\nCrée un vrai sujet d'entraînement à partir UNIQUEMENT du contenu source. Il doit ressembler à un devoir sérieux de niveau Bac, avec progression de difficulté, barème cohérent et correction exploitable.\n\nRÈGLES PÉDAGOGIQUES\n- Ne fabrique pas de notion absente de la source.\n- Transforme la source en questions, au lieu de simplement recopier ses phrases.\n- Mélange compréhension, application, raisonnement et exercices plus exigeants.\n- Chaque question doit tester une compétence identifiable.\n- Le total des points doit être cohérent, idéalement sur 20 si le sujet est court, sinon indique le total réel.\n- Évite les questions ambiguës ou dépendantes d'informations non fournies.\n- Pour un enchaînement de sous-questions, fais progresser la difficulté.\n- Si des faiblesses sont fournies, donne-leur davantage de poids sans rendre le sujet artificiel.\n- Pour le parcours SMB, n'introduis jamais de SVT.\n\nFORMAT MATHÉMATIQUE\n- Écris toutes les expressions mathématiques en LaTeX BRUT, sans délimiteurs.\n- Exemples autorisés: \\frac{a}{b}, x^2, \\sqrt{x}, \\sum_{k=1}^n, \\int_0^1 x^2 dx, \\leq, \\rightarrow.\n- N'écris jamais $...$, $$...$$, \\( ... \\) ou \\[ ... \\].\n- Les chaînes JSON doivent conserver les commandes LaTeX intactes.\n\nCORRECTION\n- Donne une correction complète pour chaque question.\n- La correction doit être concise mais suffisamment détaillée pour comprendre la méthode.\n- Pour les mathématiques et la physique-chimie, montre les étapes utiles, unités et conclusions.\n\nRetourne UNIQUEMENT le JSON conforme au schéma.\n\nSOURCE:\n${input.text}`;
}

function extractText(payload: any): string {
  const parts: string[] = [];
  if (typeof payload?.output_text === "string") parts.push(payload.output_text);
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

function normalizeMath(value: any): any {
  if (typeof value === "string") {
    return value
      .replace(/\\\\\\(([\\\\s\\\\S]*?)\\\\\\)/g, "$1")
      .replace(/\\\\\\[([\\\\s\\\\S]*?)\\\\\\]/g, "$1");
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
      const result = normalizeMath(JSON.parse(raw));
      return jsonResponse({ success: true, result, model: MODEL });
    } catch (error) {
      return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Réponse IA invalide.", raw: raw.slice(0, 4000) }, 502);
    }
  } catch (error) {
    return jsonResponse({ success: false, error: error instanceof Error ? error.message : "Erreur inattendue." }, 500);
  }
});
