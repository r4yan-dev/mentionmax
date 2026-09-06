import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { YouTubeTranscriptApi } from "npm:@hallelx/youtube-transcript@0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const invidiousInstances = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://yt.chocolatemoo53.com",
];

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

function parseVtt(vtt: string) {
  const lines = vtt.replace(/\r/g, "").split("\n");
  const segments: { start: number; duration: number; text: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.includes("-->") || !line) continue;
    const [rawStart, rawEnd] = line.split("-->").map((x) => x.trim().split(" ")[0]);
    const toSeconds = (value: string) => {
      const parts = value.replace(",", ".").split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      return parts[0] * 60 + parts[1];
    };
    const start = toSeconds(rawStart);
    const end = toSeconds(rawEnd);
    const text: string[] = [];
    for (let j = i + 1; j < lines.length && lines[j].trim(); j++) text.push(lines[j].trim());
    const clean = text.join(" ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
    if (clean && Number.isFinite(start) && Number.isFinite(end)) {
      segments.push({ start, duration: Math.max(0, end - start), text: clean });
    }
  }
  return segments;
}

function parseCaptionXml(xml: string) {
  const segments: { start: number; duration: number; text: string }[] = [];
  for (const match of xml.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attrs = match[1] ?? "";
    const content = match[2] ?? "";
    const readAttr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1] ?? "";
    const start = Number(readAttr("start"));
    const duration = Number(readAttr("dur"));
    const text = content
      .replace(/<br\s*\/?/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
    if (text && Number.isFinite(start)) {
      segments.push({ start, duration: Number.isFinite(duration) ? duration : 0, text });
    }
  }
  return segments;
}

function extractJsonAfterMarker(html: string, marker: string) {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return null;
  const start = html.indexOf("{", markerIndex + marker.length);
  if (start < 0) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < html.length; i++) {
    const char = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function fetchViaYoutubePage(videoId: string, languages: string[]) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; MentionMax/1.0)",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
    },
  });
  if (!response.ok) throw new Error(`YouTube watch page HTTP ${response.status}`);
  const html = await response.text();
  const player = extractJsonAfterMarker(html, "ytInitialPlayerResponse");
  const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!Array.isArray(tracks) || !tracks.length) {
    throw new Error("Aucun sous-titre disponible dans la piste YouTube.");
  }

  const ranked = [...tracks].sort((a, b) => {
    const ai = languages.indexOf(a?.languageCode ?? "");
    const bi = languages.indexOf(b?.languageCode ?? "");
    return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
  });

  let lastError = "Aucune piste de sous-titres exploitable.";
  for (const track of ranked) {
    if (!track?.baseUrl || typeof track.baseUrl !== "string") continue;
    try {
      const captionUrl = new URL(track.baseUrl);
      captionUrl.searchParams.set("fmt", "vtt");
      const captionResponse = await fetch(captionUrl.toString(), {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MentionMax/1.0)" },
      });
      if (!captionResponse.ok) {
        lastError = `YouTube captions HTTP ${captionResponse.status}`;
        continue;
      }
      const body = await captionResponse.text();
      const segments = body.includes("WEBVTT") ? parseVtt(body) : parseCaptionXml(body);
      if (!segments.length) {
        lastError = "La piste de sous-titres est vide ou illisible.";
        continue;
      }
      return {
        language: track?.name?.simpleText ?? track?.languageCode ?? languages[0] ?? "unknown",
        languageCode: track?.languageCode ?? languages[0] ?? "unknown",
        isGenerated: track?.kind === "asr",
        segments,
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }
  throw new Error(lastError);
}

async function fetchViaInvidious(videoId: string, languages: string[]) {
  let lastError = "Invidious fallback failed";
  for (const instance of invidiousInstances) {
    for (const lang of languages) {
      try {
        const response = await fetch(`${instance}/api/v1/captions/${videoId}?lang=${encodeURIComponent(lang)}`, {
          headers: { "User-Agent": "MentionMax/1.0" },
        });
        if (!response.ok) {
          lastError = `${instance}: HTTP ${response.status}`;
          continue;
        }
        const contentType = response.headers.get("content-type") ?? "";
        if (contentType.includes("application/json")) {
          const data = await response.json();
          const caption = data?.captions?.find((x: any) => x.languageCode === lang) ?? data?.captions?.[0];
          if (!caption?.url) {
            lastError = `${instance}: no caption URL`;
            continue;
          }
          const captionResponse = await fetch(caption.url, {
            headers: { "User-Agent": "MentionMax/1.0" },
          });
          if (!captionResponse.ok) {
            lastError = `${instance}: caption HTTP ${captionResponse.status}`;
            continue;
          }
          const body = await captionResponse.text();
          const segments = body.includes("WEBVTT") ? parseVtt(body) : parseCaptionXml(body);
          if (segments.length) {
            return {
              language: caption.label ?? lang,
              languageCode: caption.languageCode ?? lang,
              isGenerated: true,
              segments,
            };
          }
        } else {
          const body = await response.text();
          const segments = body.includes("WEBVTT") ? parseVtt(body) : parseCaptionXml(body);
          if (segments.length) {
            return { language: lang, languageCode: lang, isGenerated: true, segments };
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }
  }
  throw new Error(lastError);
}

async function fetchTranscript(videoId: string, languages: string[]) {
  try {
    const transcript = await new YouTubeTranscriptApi().fetch(videoId, { languages });
    return {
      language: transcript.language,
      languageCode: transcript.languageCode,
      isGenerated: transcript.isGenerated,
      segments: transcript.snippets.map((s) => ({ start: s.start, duration: s.duration, text: s.text })),
    };
  } catch (directError) {
    console.warn("Direct YouTube transcript request failed; trying YouTube watch-page captions", directError);
  }

  try {
    return await fetchViaYoutubePage(videoId, languages);
  } catch (pageError) {
    console.warn("YouTube watch-page caption extraction failed; trying Invidious fallback", pageError);
  }

  return await fetchViaInvidious(videoId, languages);
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

    const requested = Array.isArray(body?.languages)
      ? body.languages.filter((x: unknown): x is string => typeof x === "string").slice(0, 8)
      : ["fr", "en", "ar"];
    const languages = requested.length ? requested : ["fr", "en", "ar"];
    const transcript = await fetchTranscript(videoId, languages);

    const metadataResponse = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      { headers: { "User-Agent": "MentionMax/1.0" } },
    );
    const metadata = metadataResponse.ok ? await metadataResponse.json().catch(() => null) : null;

    return json({
      success: true,
      video: {
        id: videoId,
        title: metadata?.title ?? `Vidéo YouTube ${videoId}`,
        author: metadata?.author_name ?? null,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      },
      transcript,
    });
  } catch (error) {
    console.error("youtube-transcript error", error);
    return json({
      error: "Impossible d'extraire les sous-titres de cette vidéo.",
      detail: error instanceof Error ? error.message : String(error),
    }, 422);
  }
});
