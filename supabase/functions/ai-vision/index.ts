import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const MODEL = "gemini-3.6-flash";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders });
}

function getText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text.trim();
  if (Array.isArray(payload?.steps)) {
    const chunks: string[] = [];
    for (const step of payload.steps) {
      if (step?.type !== "model_output") continue;
      if (typeof step?.text === "string") chunks.push(step.text);
      if (Array.isArray(step?.content)) {
        for (const part of step.content) {
          if (part?.type === "text" && typeof part.text === "string") chunks.push(part.text);
        }
      }
    }
    if (chunks.length) return chunks.join("\n").trim();
  }
  if (typeof payload?.text === "string") return payload.text.trim();
  return "";
}

function extractDataUrl(value: string) {
  const match = value.match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) return null;
  return { mimeType: match[1], data: match[2] };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return json({ error: "GEMINI_API_KEY is not configured" }, 500);

  try {
    const body = await req.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
    const image = typeof body?.image === "string" ? body.image : "";
    const mimeType = typeof body?.mimeType === "string" ? body.mimeType : "";

    if (!prompt && !image) return json({ error: "prompt or image is required" }, 400);

    const parsed = image ? extractDataUrl(image) : null;
    const resolvedMimeType = parsed?.mimeType ?? mimeType;
    const resolvedImageData = parsed?.data ?? image;

    if (image && (!resolvedMimeType || !resolvedImageData)) {
      return json({ error: "image must be a valid data URL or provide mimeType" }, 400);
    }

    const content = [
      ...(image
        ? [{
            type: "image",
            mime_type: resolvedMimeType,
            data: resolvedImageData,
          }]
        : []),
      ...(prompt ? [{ type: "text", text: prompt }] : []),
    ];

    const input = {
      type: "user_input",
      content,
    };

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        model: MODEL,
        input,
        store: false,
        generation_config: {
          max_output_tokens: 1600,
          thinking_level: "low",
        },
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      return json({
        error: "Gemini request failed",
        status: response.status,
        details: payload?.error?.message ?? payload,
      }, 502);
    }

    const text = getText(payload);
    if (!text) return json({ error: "Gemini returned no text", raw: payload }, 502);

    return json({ text, model: MODEL });
  } catch (error) {
    return json({
      error: "Invalid request",
      details: error instanceof Error ? error.message : String(error),
    }, 400);
  }
});