const MODEL = "gemini-3.1-flash-lite";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" };

const journeySchema = {
  type: "object",
  properties: {
    courseOverview: {
      type: "object",
      properties: {
        whyItMatters: { type: "string" },
        goals: { type: "array", items: { type: "string" } },
        watchFor: { type: "array", items: { type: "string" } },
      },
      required: ["whyItMatters", "goals", "watchFor"],
    },
    nextAction: {
      type: "object",
      properties: {
        kind: { type: "string", enum: ["exercise", "quiz", "revision"] },
        title: { type: "string" },
        reason: { type: "string" },
        difficulty: { type: "integer" },
        count: { type: "integer" },
        conceptIds: { type: "array", items: { type: "string" } },
        generationBrief: { type: "string" },
      },
      required: ["kind", "title", "reason", "difficulty", "count", "conceptIds", "generationBrief"],
    },
    afterAction: {
      type: "object",
      properties: {
        success: { type: "string" },
        difficulty: { type: "string" },
        struggle: { type: "string" },
      },
      required: ["success", "difficulty", "struggle"],
    },
  },
  required: ["courseOverview", "nextAction", "afterAction"],
};

function out(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function getSecretKey() {
  return Deno.env.get("weak_points_tutor") || Deno.env.get("WEAK_POINTS_TUTOR") || "";
}

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

function getPublishableKey() {
  const direct = Deno.env.get("SUPABASE_ANON_KEY");
  if (direct) return direct;
  const packed = Deno.env.get("SUPABASE_PUBLISHABLE_KEYS");
  if (!packed) return "";
  try {
    const parsed = JSON.parse(packed);
    return typeof parsed?.default === "string" ? parsed.default : "";
  } catch { return ""; }
}

async function getUserId(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  const base = Deno.env.get("SUPABASE_URL");
  const key = getPublishableKey();
  if (!base || !key) return null;
  try {
    const response = await fetch(`${base}/auth/v1/user`, {
      headers: { apikey: key, Authorization: authorization },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const user = await response.json();
    return typeof user?.id === "string" ? user.id : null;
  } catch { return null; }
}

function extractText(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
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
  return parts.join("\n").trim();
}

function parseJson(raw: string) {
  const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
  throw new Error("Le tuteur a renvoyé une réponse invalide.");
}

async function saveRecommendation(userId: string, input: any, journey: any) {
  const base = Deno.env.get("SUPABASE_URL");
  const key = getServerKey();
  if (!base || !key) return;
  try {
    await fetch(`${base}/rest/v1/learning_recommendations`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        user_id: userId,
        subject_id: input.subjectId ?? null,
        track_id: input.trackId ?? null,
        chapter: input.chapter ?? null,
        topic: input.topic ?? null,
        kind: journey.nextAction.kind,
        payload: journey,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }),
    });
  } catch {
    // Recommendation persistence is secondary to delivering the learning plan.
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return out({ success: false, error: "Méthode non autorisée." }, 405);

  try {
    const userId = await getUserId(req);
    if (!userId) return out({ success: false, error: "Authentification requise." }, 401);

    const apiKey = getSecretKey();
    if (!apiKey) return out({ success: false, error: "Secret weak_points_tutor manquant." }, 500);

    const body = await req.json();
    const subjectId = typeof body?.subjectId === "string" ? body.subjectId : "maths";
    const trackId = typeof body?.trackId === "string" ? body.trackId : "SP";
    const courseTitle = typeof body?.courseTitle === "string" ? body.courseTitle : "Cours 2BAC";
    const chapter = typeof body?.chapter === "string" ? body.chapter : "";
    const topic = typeof body?.topic === "string" ? body.topic : "";
    const intro = typeof body?.intro === "string" ? body.intro : "";
    const objectives = Array.isArray(body?.objectives) ? body.objectives.filter((x: unknown) => typeof x === "string").slice(0, 6) : [];
    const weakPoints = Array.isArray(body?.weakPoints) ? body.weakPoints.slice(0, 8) : [];

    const prompt = `Tu es le tuteur adaptatif de MentionMax pour le 2BAC marocain.\nTu dois construire une progression intelligente à partir d'un cours et de l'historique récent de l'élève.\n\nCOURS:\nTitre: ${courseTitle}\nChapitre: ${chapter}\nSujet: ${subjectId}\nParcours: ${trackId}\nIntroduction: ${intro}\nObjectifs: ${JSON.stringify(objectives)}\n\nPOINTS FAIBLES OBSERVÉS:\n${JSON.stringify(weakPoints)}\n\nRÈGLES:\n- Commence toujours par un aperçu clair du cours: pourquoi il compte, 2 à 4 objectifs, 2 à 4 pièges à surveiller.\n- Ensuite choisis UNE prochaine action: exercice, quiz ou révision.\n- Priorise les notions faibles quand elles sont liées au cours actuel.\n- Si l'élève n'a presque aucune donnée, choisis un quiz diagnostique court.\n- Si une faiblesse est claire, choisis des exercices ciblés avant un quiz large.\n- La difficulté doit rester progressive, jamais punitive.\n- count doit rester entre 3 et 8.\n- conceptIds doit contenir les notions visées, pas des paragraphes.\n- generationBrief doit être directement réutilisable par le générateur d'exercices ou de quiz.\n- Après l'action, explique quoi faire en cas de réussite, de difficulté moyenne et d'échec.\n- Réponds uniquement avec le JSON conforme au schéma.`;

    const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey, "Api-Revision": "2026-05-20" },
      body: JSON.stringify({
        model: MODEL,
        input: prompt,
        store: false,
        response_format: { type: "text", mime_type: "application/json", schema: journeySchema },
        generation_config: { max_output_tokens: 2200, thinking_level: "minimal" },
      }),
      signal: AbortSignal.timeout(45000),
    });

    const raw = await upstream.text();
    const payload = (() => { try { return JSON.parse(raw); } catch { return null; } })();
    if (!upstream.ok) {
      if (upstream.status === 429) return out({ success: false, error: "Le tuteur IA est temporairement limité. Réessaie dans quelques secondes.", detail: payload?.error?.message ?? "Gemini rate limit" }, 429);
      return out({ success: false, error: "Le tuteur adaptatif a échoué.", detail: payload?.error?.message ?? `Gemini HTTP ${upstream.status}` }, upstream.status);
    }

    const journey = parseJson(extractText(payload));
    await saveRecommendation(userId, { subjectId, trackId, chapter, topic }, journey);
    return out({ success: true, journey, model: MODEL });
  } catch (error) {
    return out({ success: false, error: error instanceof Error ? error.message : "Erreur inattendue." }, 500);
  }
});
