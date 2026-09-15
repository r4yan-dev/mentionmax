const MODEL = "gemini-3.1-flash-lite";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" };

const sessionSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    subtitle: { type: "string" },
    explanation: { type: "string" },
    priorities: { type: "array", items: { type: "string" } },
    tasks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          type: { type: "string", enum: ["review", "exercise", "quiz", "lesson"] },
          subjectId: { type: "string" },
          chapter: { type: "string" },
          title: { type: "string" },
          reason: { type: "string" },
          minutes: { type: "integer" },
          route: { type: "string" },
          conceptIds: { type: "array", items: { type: "string" } },
        },
        required: ["id", "type", "subjectId", "chapter", "title", "reason", "minutes", "route", "conceptIds"],
      },
    },
  },
  required: ["title", "subtitle", "explanation", "priorities", "tasks"],
};

function out(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function getGeminiKey() {
  return Deno.env.get("weak_points_tutor") || Deno.env.get("WEAK_POINTS_TUTOR") || "";
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
function parseJson(raw: string) {
  const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) return JSON.parse(cleaned.slice(first, last + 1));
  throw new Error("Réponse JSON invalide.");
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

async function callGemini(apiKey: string, input: string) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey, "Api-Revision": "2026-05-20" },
    body: JSON.stringify({ model: MODEL, input, store: false, response_format: { type: "text", mime_type: "application/json", schema: sessionSchema }, generation_config: { max_output_tokens: 3500, thinking_level: "minimal" } }),
    signal: AbortSignal.timeout(45000),
  });
  const raw = await response.text();
  const payload = (() => { try { return JSON.parse(raw); } catch { return null; } })();
  if (!response.ok) {
    const error = new Error(payload?.error?.message ?? `Gemini HTTP ${response.status}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return parseJson(extractText(payload));
}

async function getUserId(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  const base = Deno.env.get("SUPABASE_URL");
  const key = getPublishableKey();
  if (!base || !key) return null;
  const response = await fetch(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: authorization }, signal: AbortSignal.timeout(5000) });
  if (!response.ok) return null;
  const user = await response.json();
  return typeof user?.id === "string" ? user.id : null;
}

async function fetchJson(req: Request, table: string, select: string, userId: string, extra = "") {
  const base = Deno.env.get("SUPABASE_URL");
  const key = getPublishableKey();
  const authorization = req.headers.get("authorization") || "";
  if (!base || !key) return null;
  const url = `${base}/rest/v1/${table}?select=${encodeURIComponent(select)}&user_id=eq.${encodeURIComponent(userId)}${extra}`;
  const response = await fetch(url, { headers: { apikey: key, Authorization: authorization, Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) return null;
  return await response.json();
}

async function fetchMastery(req: Request, userId: string) {
  return await fetchJson(req, "learner_mastery", "subject_id,track_id,chapter,topic,concept_id,mastery,confidence,attempts,correct,partial,incorrect,recent_mistakes,trend,last_attempt,last_correct,updated_at", userId, "&order=mastery.asc&limit=24") ?? [];
}
async function fetchPlanningProfile(req: Request, userId: string) {
  const rows = await fetchJson(req, "student_learning_profiles", "onboarding_completed,strong_subjects,weak_subjects,priority_subjects,subject_status,session_minutes,academic_start_date", userId, "&limit=1");
  return Array.isArray(rows) ? rows[0] ?? null : null;
}
async function fetchStudentExams(req: Request, userId: string) {
  const rows = await fetchJson(req, "student_exams", "title,exam_date,subjects,coverage,mastery,notes", userId, "&order=exam_date.asc&limit=12");
  if (!Array.isArray(rows)) return [];
  const today = new Date().toISOString().slice(0, 10);
  return rows.filter((exam) => typeof exam?.exam_date === "string" && exam.exam_date >= today).slice(0, 8);
}

async function saveSession(req: Request, session: any, trackId: string, minutes: number) {
  const base = Deno.env.get("SUPABASE_URL");
  const key = getPublishableKey();
  const authorization = req.headers.get("authorization") || "";
  if (!base || !key) return null;
  const response = await fetch(`${base}/rest/v1/learning_agent_sessions`, {
    method: "POST",
    headers: { apikey: key, Authorization: authorization, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ track_id: trackId || null, available_minutes: minutes, title: session.title, subtitle: session.subtitle, explanation: session.explanation, tasks: session.tasks, priorities: session.priorities }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) && rows[0]?.id ? rows[0].id : null;
}

function normalizeSession(session: any, minutes: number, mastery: any[]) {
  const tasks = Array.isArray(session?.tasks) ? session.tasks : [];
  const safeTasks = tasks.slice(0, 8).map((task: any, index: number) => {
    const type = ["review", "exercise", "quiz", "lesson"].includes(task?.type) ? task.type : "exercise";
    const subjectId = typeof task?.subjectId === "string" ? task.subjectId : "maths";
    const chapter = typeof task?.chapter === "string" ? task.chapter : "";
    const route = type === "quiz" ? `/exercices?subject=${encodeURIComponent(subjectId)}&mode=quiz` : type === "exercise" ? `/exercices?subject=${encodeURIComponent(subjectId)}${chapter ? `&chapter=${encodeURIComponent(chapter)}` : ""}` : `/lecons/${encodeURIComponent(subjectId)}${chapter ? `?chapter=${encodeURIComponent(chapter)}` : ""}`;
    return { id: typeof task?.id === "string" ? task.id : `agent-${index + 1}`, type, subjectId, chapter, title: typeof task?.title === "string" ? task.title : "Travail ciblé", reason: typeof task?.reason === "string" ? task.reason : "Renforcer une notion prioritaire.", minutes: Math.max(5, Math.min(45, Number(task?.minutes) || 10)), route, conceptIds: Array.isArray(task?.conceptIds) ? task.conceptIds.filter((x: unknown) => typeof x === "string").slice(0, 5) : [] };
  });
  if (!safeTasks.length) {
    const weak = mastery[0];
    safeTasks.push({ id: "agent-1", type: "quiz", subjectId: weak?.subject_id ?? "maths", chapter: weak?.chapter ?? "", title: "Diagnostic ciblé", reason: "Commencer par mesurer la notion la plus fragile.", minutes: Math.min(15, minutes), route: `/exercices?subject=${encodeURIComponent(weak?.subject_id ?? "maths")}&mode=quiz`, conceptIds: weak?.concept_id ? [weak.concept_id] : [] });
  }
  let total = safeTasks.reduce((sum: number, task: any) => sum + task.minutes, 0);
  if (total > minutes) { const factor = minutes / total; safeTasks.forEach((task: any) => { task.minutes = Math.max(5, Math.floor(task.minutes * factor)); }); }
  return { title: String(session?.title || "Ta session adaptive"), subtitle: String(session?.subtitle || "Une session construite à partir de ton profil et de tes résultats."), explanation: String(session?.explanation || "J'ai privilégié les notions qui semblent les plus utiles maintenant selon ton profil, tes résultats et le contexte de ta semaine."), priorities: Array.isArray(session?.priorities) ? session.priorities.filter((x: unknown) => typeof x === "string").slice(0, 4) : [], tasks: safeTasks };
}

function academicContext(date: Date) {
  const start = new Date(date.getFullYear(), 8, 1);
  if (date.getMonth() < 8) start.setFullYear(date.getFullYear() - 1);
  const days = Math.max(0, Math.floor((date.getTime() - start.getTime()) / 86400000));
  const month = Math.max(0, Math.min(9, Math.floor(days / 30)));
  const phases = ["début d'année : diagnostic, bases et premiers chapitres", "consolidation des premiers chapitres et rattrapage des lacunes", "avancement dans le programme tout en récupérant les notions fragiles", "rattrapage des chapitres non couverts et pratique régulière", "consolidation avancée et récupération espacée", "approfondissement avec davantage d'exercices niveau Bac", "entraînement transversal et premières annales régulières", "révision structurée et ciblage des points à fort enjeu", "préparation finale avec annales et examens blancs", "dernière ligne droite : erreurs récurrentes et notions indispensables"];
  return { today: date.toISOString().slice(0, 10), academicStart: start.toISOString().slice(0, 10), monthIndex: month, phase: phases[month] };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return out({ success: false, error: "Méthode non autorisée." }, 405);
  try {
    const userId = await getUserId(req);
    if (!userId) return out({ success: false, error: "Authentification requise." }, 401);
    const apiKey = getGeminiKey();
    if (!apiKey) return out({ success: false, error: "Secret weak_points_tutor manquant." }, 500);
    const body = await req.json();
    const minutes = Math.max(10, Math.min(180, Math.round(Number(body?.availableMinutes) || 30)));
    const trackId = typeof body?.trackId === "string" ? body.trackId : "";
    const subjects = Array.isArray(body?.subjects) ? body.subjects.slice(0, 8) : [];
    const mastery = await fetchMastery(req, userId);
    const profile = await fetchPlanningProfile(req, userId);
    const exams = await fetchStudentExams(req, userId);
    const context = academicContext(new Date());
    const profileSummary = profile ? { strongSubjects: profile.strong_subjects ?? [], weakSubjects: profile.weak_subjects ?? [], prioritySubjects: profile.priority_subjects ?? [], subjectStatus: profile.subject_status ?? {}, onboardingCompleted: Boolean(profile.onboarding_completed) } : { onboardingCompleted: false };

    const prompt = `Tu es l'agent personnel de travail de MentionMax pour un élève marocain de 2BAC. Compose UNE SEULE SESSION réaliste pour aujourd'hui.

DATE DU JOUR: ${context.today}
CONTEXTE SCOLAIRE: ${context.phase}. Ceci est une cadence conseillée de MentionMax, pas une statistique officielle sur tous les élèves marocains.
PARCOURS: ${trackId}
MATIÈRES DISPONIBLES: ${JSON.stringify(subjects)}
TEMPS DISPONIBLE: ${minutes} minutes
PROFIL INITIAL DE L'ÉLÈVE: ${JSON.stringify(profileSummary)}
EXAMENS PERSONNELS À VENIR: ${JSON.stringify(exams)}
MAÎTRISE OBSERVÉE PAR LES EXERCICES/QUIZ: ${JSON.stringify(mastery.slice(0, 18))}

OBJECTIF:
- Choisir ce qui apporte le plus de valeur maintenant.
- Expliquer clairement à l'élève POURQUOI cette session a été choisie, en reliant profil initial, maîtrise observée, progression de l'année et examens à venir quand ils existent.
- Pour chaque tâche, expliquer dans reason pourquoi elle arrive à ce moment.

RÈGLES:
- Si le profil initial existe, utilise les forces comme points d'appui et les faiblesses/priorités comme signal de sélection.
- Les statuts not_started/in_progress/studied_weak/mastered sont fiables comme déclarations de l'élève et doivent influencer le choix.
- Une matière notée mastered ne doit pas dominer la session sauf si les performances récentes montrent une baisse ou qu'un examen proche la rend prioritaire.
- Une notion non couverte ne doit pas être traitée comme une faiblesse de performance : elle nécessite d'abord découverte/révision.
- Un examen proche peut augmenter la priorité des matières et chapitres qu'il couvre.
- Prends en compte le nombre de jours avant chaque examen. Ne prétends jamais connaître les chapitres d'un examen si l'élève ne les a pas fournis.
- Respecte exactement les matières du parcours. Pour SMB, jamais de SVT.
- Une seule session cohérente de 2 à 5 tâches. Pas de remplissage.
- Difficulté progressive et somme des minutes <= ${minutes}.
- Utilise uniquement les routes existantes indiquées par les types de tâches.
- Retourne uniquement le JSON demandé.`;

    try {
      const rawSession = await callGemini(apiKey, prompt);
      const session = normalizeSession(rawSession, minutes, mastery);
      const sessionId = await saveSession(req, session, trackId, minutes);
      return out({ success: true, session: { ...session, id: sessionId, availableMinutes: minutes, status: "active" }, model: MODEL, planningContext: context });
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      return out({ success: false, error: status === 429 ? "L'agent IA est temporairement limité." : "La génération de ta session a échoué.", detail: error instanceof Error ? error.message : "Erreur inconnue" }, status === 429 ? 429 : 500);
    }
  } catch (error) {
    return out({ success: false, error: error instanceof Error ? error.message : "Erreur inattendue." }, 500);
  }
});
