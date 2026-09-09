import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type RequestBody = {
  subjectId?: string;
  trackId?: string;
  chapter?: string;
  topic?: string;
  question?: string;
  selectedAnswer?: string;
  correctAnswer?: string;
  quizTitle?: string;
};

type SpotResult = {
  subjectId: string;
  trackId?: string;
  chapter: string;
  topic: string;
  conceptId: string;
  mistakeType: string;
  weaknessPoints: number;
  message: string;
  priority: "low" | "medium" | "high";
};

const MODEL = "gemini-3.1-flash-lite";
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
}

function apiKey() {
  return Deno.env.get("weak_points_spot") || Deno.env.get("WEAK_POINTS_SPOT") || "";
}

function extractText(payload: any) {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) return payload.output_text.trim();
  const chunks: string[] = [];
  for (const step of Array.isArray(payload?.steps) ? payload.steps : []) {
    if (typeof step?.text === "string") chunks.push(step.text);
    if (Array.isArray(step?.content)) for (const part of step.content) if (typeof part?.text === "string") chunks.push(part.text);
  }
  return chunks.join("\n").trim();
}

function parse(raw: string): SpotResult {
  const clean = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  let value: any;
  try { value = JSON.parse(clean); } catch {
    const start = clean.indexOf("{");
    const end = clean.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Réponse JSON invalide.");
    value = JSON.parse(clean.slice(start, end + 1));
  }
  const weaknessPoints = Math.max(1, Math.min(10, Math.round(Number(value?.weaknessPoints) || 4)));
  const priority = value?.priority === "high" || value?.priority === "low" ? value.priority : "medium";
  return {
    subjectId: String(value?.subjectId || "unknown"),
    trackId: typeof value?.trackId === "string" ? value.trackId : undefined,
    chapter: String(value?.chapter || ""),
    topic: String(value?.topic || "Notion non classée"),
    conceptId: String(value?.conceptId || "general"),
    mistakeType: String(value?.mistakeType || "misconception"),
    weaknessPoints,
    message: String(value?.message || "Cette réponse révèle probablement une faiblesse sur cette notion. Révise la méthode puis retente une question proche."),
    priority,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS_HEADERS });
  if (req.method !== "POST") return json({ success: false, error: "Méthode non autorisée." }, 405);

  try {
    const key = apiKey();
    if (!key) return json({ success: false, error: "Secret weak_points_spot manquant." }, 500);
    const body = await req.json().catch(() => ({})) as RequestBody;
    if (!body.question?.trim()) return json({ success: false, error: "Question manquante." }, 400);

    const prompt = `Tu es le détecteur de points faibles de MentionMax pour un élève de 2BAC marocain.
Analyse UNIQUEMENT l'erreur pédagogique suggérée par la question et la réponse incorrecte. Ne prétends pas connaître l'intention exacte de l'élève.
Identifie la notion la plus précise possible, crée un conceptId stable et normalisé en kebab-case, classe le type d'erreur, attribue 1-10 weaknessPoints et donne un message court et utile.
Contexte: matière=${body.subjectId || "unknown"}; parcours=${body.trackId || ""}; chapitre=${body.chapter || ""}; thème=${body.topic || ""}; quiz=${body.quizTitle || ""}.
Question: ${body.question}
Réponse de l'élève: ${body.selectedAnswer || "Réponse incorrecte"}
Bonne réponse / indication disponible: ${body.correctAnswer || "Voir la correction du quiz"}
Retourne UNIQUEMENT ce JSON:
{"subjectId":"maths|physique-chimie|svt|anglais|philosophie","trackId":"SP|SMA|SMB","chapter":"...","topic":"...","conceptId":"...","mistakeType":"calculation|formula|sign|method|concept|reasoning|vocabulary|other","weaknessPoints":4,"message":"...","priority":"low|medium|high"}`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key, "Api-Revision": "2026-05-20" },
      body: JSON.stringify({ model: MODEL, input: prompt, store: false, generation_config: { max_output_tokens: 900, thinking_level: "minimal" } }),
      signal: AbortSignal.timeout(20_000),
    });
    const raw = await response.text();
    let payload: any = null;
    try { payload = JSON.parse(raw); } catch {}
    if (!response.ok) return json({ success: false, error: "Le détecteur de point faible a échoué.", detail: payload?.error?.message || `Gemini HTTP ${response.status}` }, 502);
    const text = extractText(payload);
    if (!text) return json({ success: false, error: "Aucune analyse reçue." }, 502);
    return json({ success: true, data: parse(text), model: MODEL });
  } catch (error) {
    return json({ success: false, error: "Le détecteur de point faible a échoué.", detail: error instanceof Error ? error.message : String(error) }, 502);
  }
});
