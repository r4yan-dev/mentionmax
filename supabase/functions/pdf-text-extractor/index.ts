import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type ExtractRequest = { fileName?: string; mimeType?: string; data?: string };
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const MAX_FILE_SIZE_MB = 25;
const MAX_BASE64_LENGTH = 34_500_000;
const OPENAI_TIMEOUT_MS = 100_000;
const GEMINI_TIMEOUT_MS = 100_000;
const GEMINI_MODEL = "gemini-3.6-flash";

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
function normalizeMime(mimeType: string, fileName: string) {
  const mime = mimeType.toLowerCase().trim();
  if (mime === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")) return "application/pdf";
  if (["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(mime)) return mime === "image/jpg" ? "image/jpeg" : mime;
  if (/\.(png|jpe?g|webp)$/i.test(fileName)) { const ext = fileName.toLowerCase().split(".").pop(); return ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg"; }
  return mime;
}
function dataUrl(data: string, mimeType: string) { const trimmed = data.trim(); return trimmed.startsWith("data:") ? trimmed : `data:${mimeType};base64,${trimmed}`; }
function base64FromData(data: string) { return data.startsWith("data:") ? data.split(",", 2)[1] ?? "" : data; }
function getGeminiText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text.trim();
  if (Array.isArray(payload?.steps)) {
    const chunks: string[] = [];
    for (const step of payload.steps) {
      if (typeof step?.text === "string") chunks.push(step.text);
      if (Array.isArray(step?.content)) for (const part of step.content) if (typeof part?.text === "string") chunks.push(part.text);
    }
    if (chunks.length) return chunks.join("\n").trim();
  }
  if (typeof payload?.text === "string") return payload.text.trim();
  return "";
}

async function extractImageWithGemini(apiKey: string, mimeType: string, base64: string, prompt: string) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      input: [
        { inlineData: { mimeType, data: base64 } },
        { text: prompt },
      ],
      store: false,
      generation_config: { max_output_tokens: 12000, thinking_level: "low" },
    }),
    signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) return { error: payload?.error?.message ?? `Gemini HTTP ${response.status}` };
  const text = getGeminiText(payload);
  if (!text) return { error: "Gemini n'a renvoyé aucun texte lisible." };
  return { text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);
  try {
    const body = (await req.json().catch(() => null)) as ExtractRequest | null;
    const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : "document";
    const inputMime = typeof body?.mimeType === "string" ? body.mimeType : "";
    const data = typeof body?.data === "string" ? body.data.trim() : "";
    if (!data) return json({ error: "Aucun fichier reçu." }, 400);
    const mimeType = normalizeMime(inputMime, fileName);
    if (mimeType !== "application/pdf" && !mimeType.startsWith("image/")) return json({ error: "Format non pris en charge. Utilise un PDF, PNG, JPG ou WebP." }, 415);
    const base64 = base64FromData(data);
    if (!base64) return json({ error: "Le fichier reçu est vide." }, 400);
    if (base64.length > MAX_BASE64_LENGTH) return json({ error: `Fichier trop volumineux. La limite est de ${MAX_FILE_SIZE_MB} Mo.` }, 413);

    const prompt = `Tu es l'extracteur de documents de MentionMax, une plateforme de révision pour le bac marocain.\n\nExtrais le contenu textuel du document fourni avec la plus grande fidélité possible. Le document peut être un PDF numérique, un PDF scanné, une photo de feuille ou une capture d'écran.\n\nRègles :\n- Transcris tout le texte lisible, sans résumer.\n- Respecte l'ordre de lecture naturel des colonnes et des blocs.\n- Conserve les titres, sous-titres, listes, tableaux et numéros d'exercices.\n- Pour les mathématiques et la physique, écris les expressions et formules en LaTeX délimité par $...$ ou $$...$$.\n- Conserve les unités, indices, exposants, signes et nombres aussi précisément que possible.\n- Pour un tableau, utilise une structure texte lisible avec les colonnes séparées par |.\n- Ne fabrique pas de contenu illisible ou absent. Lorsque quelque chose est réellement illisible, écris [illisible].\n- Ne donne aucune explication, introduction ou commentaire sur le document.\n- Retourne uniquement le texte extrait.\n\nNom du fichier : ${fileName}`;

    if (mimeType.startsWith("image/")) {
      const geminiKey = Deno.env.get("GEMINI_API_KEY");
      if (!geminiKey) return json({ error: "GEMINI_API_KEY n'est pas configurée dans Supabase." }, 500);
      const result = await extractImageWithGemini(geminiKey, mimeType, base64, prompt);
      if (result.error) return json({ error: "L'extraction image IA a échoué.", detail: result.error }, 502);
      return json({ success: true, file: { name: fileName, mimeType }, text: result.text, extraction: "image-ai-gemini", model: GEMINI_MODEL });
    }

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) return json({ error: "OPENAI_API_KEY n'est pas configurée dans Supabase pour l'extraction PDF." }, 500);

    const content = [
      { type: "input_text", text: prompt },
      { type: "input_file", filename: fileName, file_data: base64 },
    ];
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openAiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-5.6-luna", input: [{ role: "user", content }], max_output_tokens: 12000, reasoning: { effort: "low" } }),
      signal: AbortSignal.timeout(OPENAI_TIMEOUT_MS),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return json({ error: "L'extraction PDF IA a échoué.", detail: payload?.error?.message ?? `OpenAI HTTP ${response.status}` }, 502);
    const text = typeof payload?.output_text === "string" ? payload.output_text.trim() : "";
    if (!text) return json({ error: "Aucun texte lisible n'a été extrait de ce document." }, 422);
    return json({ success: true, file: { name: fileName, mimeType }, text, extraction: "pdf-ai" });
  } catch (error) {
    console.error("pdf-text-extractor error", error);
    const message = error instanceof DOMException && error.name === "TimeoutError" ? "L'extraction a dépassé le délai maximal. Essaie un document plus court." : error instanceof Error ? error.message : String(error);
    return json({ error: "Impossible d'extraire le texte du document.", detail: message }, 422);
  }
});