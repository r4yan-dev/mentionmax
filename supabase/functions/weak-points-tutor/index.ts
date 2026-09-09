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

const activitySchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    kind: { type: "string", enum: ["quiz"] },
    conceptIds: { type: "array", items: { type: "string" } },
    difficulty: { type: "integer" },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          choices: { type: "array", items: { type: "string" } },
          answerIndex: { type: "integer" },
          explanation: { type: "string" },
          conceptIds: { type: "array", items: { type: "string" } },
          difficulty: { type: "integer" },
        },
        required: ["question", "choices", "answerIndex", "explanation", "conceptIds", "difficulty"],
      },
    },
  },
  required: ["title", "subtitle", "kind", "conceptIds", "difficulty", "questions"],
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
  } catch {}
}

function cleanWeakPoints(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((item) => {
    if (!item || typeof item !== "object") return item;
    const x = item as Record<string, unknown>;
    return {
      chapter: typeof x.chapter === "string" ? x.chapter : "",
      topic: typeof x.topic === "string" ? x.topic : "",
      concept_id: typeof x.concept_id === "string" ? x.concept_id : "",
      mastery: typeof x.mastery === "number" ? x.mastery : null,
      attempts: typeof x.attempts === "number" ? x.attempts : 0,
      recent_mistakes: Array.isArray(x.recent_mistakes) ? x.recent_mistakes.slice(0, 3) : [],
      trend: typeof x.trend === "string" ? x.trend : "new",
    };
  });
}

async function callGemini(apiKey: string, input: string, schema: unknown, maxOutputTokens: number) {
  const upstream = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey, "Api-Revision": "2026-05-20" },
    body: JSON.stringify({
      model: MODEL,
      input,
      store: false,
      response_format: { type: "text", mime_type: "application/json", schema },
      generation_config: { max_output_tokens: maxOutputTokens, thinking_level: "minimal" },
    }),
    signal: AbortSignal.timeout(45000),
  });
  const raw = await upstream.text();
  const payload = (() => { try { return JSON.parse(raw); } catch { return null; } })();
  if (!upstream.ok) {
    const detail = payload?.error?.message ?? `Gemini HTTP ${upstream.status}`;
    const error = new Error(detail);
    (error as Error & { status?: number }).status = upstream.status;
    throw error;
  }
  return parseJson(extractText(payload));
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
    const action = body?.action === "adaptive_activity" ? "adaptive_activity" : "course_journey";
    const subjectId = typeof body?.subjectId === "string" ? body.subjectId : "maths";
    const trackId = typeof body?.trackId === "string" ? body.trackId : "SP";
    const courseTitle = typeof body?.courseTitle === "string" ? body.courseTitle : "Cours 2BAC";
    const chapter = typeof body?.chapter === "string" ? body.chapter : "";
    const topic = typeof body?.topic === "string" ? body.topic : "";
    const intro = typeof body?.intro === "string" ? body.intro : "";
    const objectives = Array.isArray(body?.objectives) ? body.objectives.filter((x: unknown) => typeof x === "string").slice(0, 6) : [];
    const weakPoints = cleanWeakPoints(body?.weakPoints);

    if (action === "adaptive_activity") {
      const nextAction = body?.nextAction && typeof body.nextAction === "object" ? body.nextAction : {};
      const conceptIds = Array.isArray(nextAction.conceptIds) ? nextAction.conceptIds.filter((x: unknown) => typeof x === "string").slice(0, 6) : [];
      const count = Math.min(8, Math.max(3, typeof nextAction.count === "number" ? Math.round(nextAction.count) : 5));
      const difficulty = Math.min(5, Math.max(1, typeof nextAction.difficulty === "number" ? Math.round(nextAction.difficulty) : 2));
      const generationBrief = typeof nextAction.generationBrief === "string" ? nextAction.generationBrief : "Construis une courte série diagnostique sur les notions faibles du cours.";
      const prompt = `Tu es le moteur de pratique adaptative de MentionMax pour le 2BAC marocain. Génère un QUIZ QCM ciblé, jamais du remplissage.\n\nCOURS: ${courseTitle}\nCHAPITRE: ${chapter}\nSUJET: ${subjectId}\nPARCOURS: ${trackId}\nINTRO: ${intro}\nOBJECTIFS: ${JSON.stringify(objectives)}\n\nPOINTS FAIBLES MESURÉS:\n${JSON.stringify(weakPoints)}\n\nCIBLE DE LA PROCHAINE ACTION:\nconceptIds=${JSON.stringify(conceptIds)}\ndifficulty=${difficulty}/5\ncount=${count}\nbrief=${generationBrief}\n\nRÈGLES:\n- Génère exactement ${count} questions si possible, minimum 3.\n- Chaque question doit tester une notion précise du brief ou des weak points.\n- 4 choix exactement, une seule bonne réponse.\n- Vraies questions scolaires 2BAC marocaines, avec calcul, raisonnement ou application selon la matière.\n- La progression doit aller du rappel/application vers le raisonnement, sans saut brutal.\n- explanation doit expliquer pourquoi la bonne réponse est correcte et signaler le piège principal.\n- conceptIds doit reprendre les concepts réellement testés.\n- difficulty par question entre 1 et 5 et autour du niveau demandé.\n- N'inclus pas de markdown. JSON uniquement.`;
      try {
        const activity = await callGemini(apiKey, prompt, activitySchema, 3600);
        const questions = Array.isArray(activity?.questions) ? activity.questions.slice(0, 8) : [];
        return out({ success: true, activity: { ...activity, questions }, model: MODEL });
      } catch (error) {
        const status = (error as Error & { status?: number }).status;
        if (status === 429) return out({ success: false, error: "Le générateur adaptatif est temporairement limité. Réessaie dans quelques secondes.", detail: String(error) }, 429);
        return out({ success: false, error: "La génération adaptative a échoué.", detail: error instanceof Error ? error.message : "Erreur inconnue" }, 500);
      }
    }

    const prompt = `Tu es le tuteur adaptatif de MentionMax pour le 2BAC marocain.\nTu dois construire une progression intelligente à partir d'un cours et de l'historique récent de l'élève.\n\nCOURS:\nTitre: ${courseTitle}\nChapitre: ${chapter}\nSujet: ${subjectId}\nParcours: ${trackId}\nIntroduction: ${intro}\nObjectifs: ${JSON.stringify(objectives)}\n\nPOINTS FAIBLES OBSERVÉS:\n${JSON.stringify(weakPoints)}\n\nRÈGLES:\n- Commence toujours par un aperçu clair du cours: pourquoi il compte, 2 à 4 objectifs, 2 à 4 pièges à surveiller.\n- Ensuite choisis UNE prochaine action: exercice, quiz ou révision.\n- Priorise les notions faibles quand elles sont liées au cours actuel.\n- Si l'élève n'a presque aucune donnée, choisis un quiz diagnostique court.\n- Si une faiblesse est claire, choisis des exercices ciblés avant un quiz large.\n- La difficulté doit rester progressive, jamais punitive.\n- count doit rester entre 3 et 8.\n- conceptIds doit contenir les notions visées, pas des paragraphes.\n- generationBrief doit être directement réutilisable par le générateur de pratique.\n- Après l'action, explique quoi faire en cas de réussite, de difficulté moyenne et d'échec.\n- Réponds uniquement avec le JSON conforme au schéma.`;

    try {
      const journey = await callGemini(apiKey, prompt, journeySchema, 2200);
      await saveRecommendation(userId, { subjectId, trackId, chapter, topic }, journey);
      return out({ success: true, journey, model: MODEL });
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      if (status === 429) return out({ success: false, error: "Le tuteur IA est temporairement limité. Réessaie dans quelques secondes.", detail: String(error) }, 429);
      return out({ success: false, error: "Le tuteur adaptatif a échoué.", detail: error instanceof Error ? error.message : "Erreur inconnue" }, 500);
    }
  } catch (error) {
    return out({ success: false, error: error instanceof Error ? error.message : "Erreur inattendue." }, 500);
  }
});
