import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { YouTubeTranscriptApi } from "npm:@hallelx/youtube-transcript@0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const invidiousInstances = ["https://inv.nadeko.net", "https://invidious.nerdvpn.de", "https://yt.chocolatemoo53.com"];

function extractVideoId(input: string): string | null {
  const value = input.trim();
  if (youtubeIdPattern.test(value)) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0];
      return youtubeIdPattern.test(id) ? id : null;
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      const queryId = url.searchParams.get("v");
      if (queryId && youtubeIdPattern.test(queryId)) return queryId;
      const parts = url.pathname.split("/").filter(Boolean);
      const candidate = parts[1] ?? parts[0];
      if (["shorts", "embed", "live"].includes(parts[0] ?? "") && youtubeIdPattern.test(candidate)) return candidate;
    }
  } catch { return null; }
  return null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function parseVtt(vtt: string) {
  const lines = vtt.replace(/\r/g, "").split("\n");
  const segments: { start: number; duration: number; text: string }[] = [];
  const toSeconds = (value: string) => {
    const parts = value.replace(",", ".").split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.includes("-->") || !line) continue;
    const [rawStart, rawEnd] = line.split("-->").map((x) => x.trim().split(" ")[0]);
    const start = toSeconds(rawStart);
    const end = toSeconds(rawEnd);
    const text: string[] = [];
    for (let j = i + 1; j < lines.length && lines[j].trim(); j++) text.push(lines[j].trim());
    const clean = text.join(" ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
    if (clean && Number.isFinite(start) && Number.isFinite(end)) segments.push({ start, duration: Math.max(0, end - start), text: clean });
  }
  return segments;
}

async function fetchViaInvidious(videoId: string, languages: string[]) {
  let lastError = "Invidious fallback failed";
  for (const instance of invidiousInstances) {
    for (const lang of languages) {
      try {
        const response = await fetch(`${instance}/api/v1/captions/${videoId}?lang=${encodeURIComponent(lang)}`, { headers: { "User-Agent": "MentionMax/1.0" } });
        if (!response.ok) { lastError = `${instance}: HTTP ${response.status}`; continue; }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          const caption = data?.captions?.find((x: any) => x.languageCode === lang) ?? data?.captions?.[0];
          if (!caption?.url) { lastError = `${instance}: no caption URL`; continue; }
          const captionResponse = await fetch(caption.url, { headers: { "User-Agent": "MentionMax/1.0" } });
          if (!captionResponse.ok) { lastError = `${instance}: caption HTTP ${captionResponse.status}`; continue; }
          const segments = parseVtt(await captionResponse.text());
          if (segments.length) return { language: caption.label ?? lang, languageCode: caption.languageCode ?? lang, isGenerated: true, segments };
        } else {
          const segments = parseVtt(await response.text());
          if (segments.length) return { language: lang, languageCode: lang, isGenerated: true, segments };
        }
      } catch (error) { lastError = error instanceof Error ? error.message : String(error); }
    }
  }
  throw new Error(lastError);
}

async function fetchTranscript(videoId: string, languages: string[]) {
  try {
    const transcript = await new YouTubeTranscriptApi().fetch(videoId, { languages });
    return { language: transcript.language, languageCode: transcript.languageCode, isGenerated: transcript.isGenerated, segments: transcript.snippets.map((s) => ({ start: s.start, duration: s.duration, text: s.text })) };
  } catch (directError) {
    console.warn("Direct YouTube transcript request failed; trying Invidious fallback", directError);
    return await fetchViaInvidious(videoId, languages);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);
  try {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url : "";
    const videoId = extractVideoId(url);
    if (!videoId) return json({ error: "Lien YouTube invalide. Utilise une URL YouTube classique, Shorts, Live ou youtu.be." }, 400);
    const requested = Array.isArray(body?.languages) ? body.languages.filter((x: unknown): x is string => typeof x === "string").slice(0, 8) : ["fr", "en", "ar"];
    const languages = requested.length ? requested : ["fr", "en", "ar"];
    const transcript = await fetchTranscript(videoId, languages);
    const metadataResponse = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, { headers: { "User-Agent": "MentionMax/1.0" } });
    const metadata = metadataResponse.ok ? await metadataResponse.json().catch(() => null) : null;
    return json({ success: true, video: { id: videoId, title: metadata?.title ?? `Vidéo YouTube ${videoId}`, author: metadata?.author_name ?? null, thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` }, transcript });
  } catch (error) {
    console.error("youtube-transcript error", error);
    return json({ error: "Impossible d'extraire les sous-titres de cette vidéo.", detail: error instanceof Error ? error.message : String(error) }, 422);
  }
});
