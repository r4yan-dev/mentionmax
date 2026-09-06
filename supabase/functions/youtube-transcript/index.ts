import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { YouTubeTranscriptApi } from "npm:@hallelx/youtube-transcript@0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

function extractVideoId(input: string): string | null {
  const value = input.trim();
  if (youtubeIdPattern.test(value)) return value;

  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return youtubeIdPattern.test(id) ? id : null;
    }

    if (url.hostname === "youtube.com" || url.hostname.endsWith(".youtube.com")) {
      const queryId = url.searchParams.get("v");
      if (queryId && youtubeIdPattern.test(queryId)) return queryId;

      const parts = url.pathname.split("/").filter(Boolean);
      const candidate = parts[1] ?? parts[0];
      if ((parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") && youtubeIdPattern.test(candidate)) {
        return candidate;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  try {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url : "";
    const videoId = extractVideoId(url);

    if (!videoId) {
      return json({ error: "Lien YouTube invalide. Utilise une URL YouTube classique, Shorts, Live ou youtu.be." }, 400);
    }

    const requestedLanguages = Array.isArray(body?.languages)
      ? body.languages.filter((language: unknown): language is string => typeof language === "string").slice(0, 8)
      : ["fr", "en", "ar"];

    const api = new YouTubeTranscriptApi();
    const transcript = await api.fetch(videoId, {
      languages: requestedLanguages.length ? requestedLanguages : ["fr", "en", "ar"],
    });

    const metadataUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const metadataResponse = await fetch(metadataUrl, { headers: { "User-Agent": "MentionMax/1.0" } });
    const metadata = metadataResponse.ok ? await metadataResponse.json().catch(() => null) : null;

    return json({
      success: true,
      video: {
        id: videoId,
        title: metadata?.title ?? `Vidéo YouTube ${videoId}`,
        author: metadata?.author_name ?? null,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      },
      transcript: {
        language: transcript.language,
        languageCode: transcript.languageCode,
        isGenerated: transcript.isGenerated,
        segments: transcript.snippets.map((snippet) => ({
          start: snippet.start,
          duration: snippet.duration,
          text: snippet.text,
        })),
      },
    });
  } catch (error) {
    console.error("youtube-transcript error", error);
    const message = error instanceof Error ? error.message : "Impossible d'extraire les sous-titres.";
    return json({
      error: "Impossible d'extraire les sous-titres de cette vidéo.",
      detail: message,
    }, 422);
  }
});
