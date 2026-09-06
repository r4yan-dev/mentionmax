import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { YouTubeTranscriptApi } from "npm:@hallelx/youtube-transcript@0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Segment = { start: number; duration: number; text: string };
const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

function cleanInput(value: string) {
  return value.trim().replace(/^['"`<\[]+|['"`>\]]+$/g, "").trim();
}

function extractVideoId(input: string): string | null {
  const value = cleanInput(input);
  if (youtubeIdPattern.test(value)) return value;

  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})(?:[&#/]|$)/i,
    /(?:youtube(?:-nocookie)?\.com|youtu\.be)\/(?:watch\?v=|shorts\/|embed\/|live\/|v\/)?([A-Za-z0-9_-]{11})(?:[?&#/]|$)/i,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(value);
    if (match?.[1]) return match[1];
  }

  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(normalized);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
      if (youtubeIdPattern.test(id)) return id;
    }
    if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtube-nocookie.com" || host.endsWith(".youtube-nocookie.com")) {
      const v = url.searchParams.get("v") ?? "";
      if (youtubeIdPattern.test(v)) return v;
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes(parts[0]?.toLowerCase() ?? "")) {
        const id = parts[1];
        if (youtubeIdPattern.test(id)) return id;
      }
    }
  } catch {}

  return null;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function decodeHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/gi, "'")
    .trim();
}

function parseVtt(body: string): Segment[] {
  const lines = body.replace(/\r/g, "").split("\n");
  const result: Segment[] = [];
  const toSeconds = (value: string) => {
    const p = value.replace(",", ".").split(":").map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1];
  };

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes("-->")) continue;
    const [startRaw, endRaw] = lines[i].split("-->").map((x) => x.trim().split(" ")[0]);
    const start = toSeconds(startRaw);
    const end = toSeconds(endRaw);
    const text: string[] = [];
    for (let j = i + 1; j < lines.length && lines[j].trim(); j++) text.push(lines[j].trim());
    const cleaned = decodeHtml(text.join(" "));
    if (cleaned && Number.isFinite(start) && Number.isFinite(end)) {
      result.push({ start, duration: Math.max(0, end - start), text: cleaned });
    }
  }
  return result;
}

function parseXml(body: string): Segment[] {
  const result: Segment[] = [];

  for (const match of body.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attrs = match[1] ?? "";
    const content = match[2] ?? "";
    const attr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1] ?? "";
    const start = Number(attr("start"));
    const duration = Number(attr("dur"));
    const text = decodeHtml(content.replace(/<br\s*\/?/gi, " "));
    if (text && Number.isFinite(start)) {
      result.push({ start, duration: Number.isFinite(duration) ? duration : 0, text });
    }
  }

  // YouTube's srv3 format can use <p t="..." d="..."> instead of <text start="..." dur="...">.
  for (const match of body.matchAll(/<p([^>]*)>([\s\S]*?)<\/p>/g)) {
    const attrs = match[1] ?? "";
    const content = match[2] ?? "";
    const attr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1] ?? "";
    const startMs = Number(attr("t"));
    const durationMs = Number(attr("d"));
    const text = decodeHtml(content.replace(/<s[^>]*>/g, "").replace(/<\/s>/g, " ").replace(/<br\s*\/?/gi, " "));
    if (text && Number.isFinite(startMs)) {
      result.push({
        start: startMs / 1000,
        duration: Number.isFinite(durationMs) ? durationMs / 1000 : 0,
        text,
      });
    }
  }

  return result;
}

function parseJson3(body: string): Segment[] {
  const data = JSON.parse(body);
  const result: Segment[] = [];
  for (const event of data?.events ?? []) {
    if (!Array.isArray(event?.segs)) continue;
    const text = event.segs.map((seg: any) => seg?.utf8 ?? "").join("").trim();
    if (!text) continue;
    const start = Number(event.tStartMs ?? 0) / 1000;
    const duration = Number(event.dDurationMs ?? 0) / 1000;
    if (Number.isFinite(start)) result.push({ start, duration: Number.isFinite(duration) ? duration : 0, text: decodeHtml(text) });
  }
  return result;
}

function parseCaptionBody(body: string, contentType = "") {
  if (contentType.includes("json") || body.trim().startsWith("{")) {
    try {
      const segments = parseJson3(body);
      if (segments.length) return segments;
    } catch {}
  }
  return body.includes("WEBVTT") ? parseVtt(body) : parseXml(body);
}

async function getInnerTubeApiKey(videoId: string) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
    },
  });
  if (!response.ok) throw new Error(`YouTube watch page HTTP ${response.status}`);
  const html = await response.text();
  const matches = [
    /"INNERTUBE_API_KEY":"([^"]+)"/,
    /\\"INNERTUBE_API_KEY\\":\\"([^\\"]+)\\"/,
  ];
  for (const pattern of matches) {
    const match = pattern.exec(html);
    if (match?.[1]) return match[1];
  }
  throw new Error("Impossible de récupérer la clé InnerTube de YouTube.");
}

async function fetchInnerTube(videoId: string, languages: string[]) {
  const apiKey = await getInnerTubeApiKey(videoId);
  const clients = [
    {
      clientName: "ANDROID",
      clientVersion: "20.10.38",
      androidSdkVersion: 34,
      hl: "en",
      gl: "US",
      userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip",
    },
    {
      clientName: "WEB",
      clientVersion: "2.20250312.04.00",
      hl: "en",
      gl: "US",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36",
    },
  ];

  let lastError = "Aucune piste de sous-titres disponible via YouTube.";

  for (const client of clients) {
    try {
      const response = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(apiKey)}&prettyPrint=false`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": client.userAgent,
          "X-YouTube-Client-Name": client.clientName === "ANDROID" ? "3" : "1",
          "X-YouTube-Client-Version": client.clientVersion,
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: client.clientName,
              clientVersion: client.clientVersion,
              ...(client.androidSdkVersion ? { androidSdkVersion: client.androidSdkVersion } : {}),
              hl: client.hl,
              gl: client.gl,
              userAgent: client.userAgent,
            },
          },
          videoId,
          contentCheckOk: true,
          racyCheckOk: true,
        }),
      });

      if (!response.ok) {
        lastError = `YouTube InnerTube ${client.clientName} HTTP ${response.status}`;
        continue;
      }

      const player = await response.json();
      const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (!Array.isArray(tracks) || !tracks.length) {
        lastError = `Aucune piste de sous-titres disponible via ${client.clientName}.`;
        continue;
      }

      const ranked = [...tracks].sort((a: any, b: any) => {
        const ai = languages.indexOf(a?.languageCode ?? "");
        const bi = languages.indexOf(b?.languageCode ?? "");
        const aRank = ai < 0 ? 999 : ai;
        const bRank = bi < 0 ? 999 : bi;
        if (aRank !== bRank) return aRank - bRank;
        return (a?.kind === "asr" ? 1 : 0) - (b?.kind === "asr" ? 1 : 0);
      });

      for (const track of ranked) {
        if (!track?.baseUrl || typeof track.baseUrl !== "string") continue;
        try {
          const captionUrl = new URL(track.baseUrl);
          // Replace YouTube's existing format instead of appending a second fmt parameter.
          captionUrl.searchParams.delete("fmt");
          captionUrl.searchParams.delete("tlang");
          captionUrl.searchParams.set("fmt", "json3");

          const captionResponse = await fetch(captionUrl.toString(), {
            headers: {
              "User-Agent": client.userAgent,
              "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
            },
          });
          if (!captionResponse.ok) {
            lastError = `YouTube captions HTTP ${captionResponse.status}`;
            continue;
          }

          const body = await captionResponse.text();
          const segments = parseCaptionBody(body, captionResponse.headers.get("content-type") ?? "");
          if (!segments.length) {
            lastError = "La piste de sous-titres est vide ou illisible.";
            continue;
          }

          return {
            language: track?.name?.simpleText ?? track?.languageCode ?? "unknown",
            languageCode: track?.languageCode ?? "unknown",
            isGenerated: track?.kind === "asr",
            segments,
          };
        } catch (error) {
          lastError = error instanceof Error ? error.message : String(error);
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(lastError);
}

async function getTranscript(videoId: string, languages: string[]) {
  try {
    const transcript = await new YouTubeTranscriptApi().fetch(videoId, { languages });
    return {
      language: transcript.language,
      languageCode: transcript.languageCode,
      isGenerated: transcript.isGenerated,
      segments: transcript.snippets.map((s) => ({ start: s.start, duration: s.duration, text: s.text })),
    };
  } catch (error) {
    console.warn("Package transcript extractor failed; trying direct InnerTube", error);
  }
  return await fetchInnerTube(videoId, languages);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Méthode non autorisée." }, 405);

  try {
    const body = await req.json().catch(() => null);
    const rawUrl = typeof body?.url === "string" ? body.url : "";
    const videoId = extractVideoId(rawUrl);
    if (!videoId) return json({ error: "Lien YouTube invalide.", detail: "Impossible d'identifier l'ID vidéo." }, 400);

    const requested = Array.isArray(body?.languages)
      ? body.languages.filter((x: unknown): x is string => typeof x === "string").slice(0, 8)
      : ["fr", "en", "ar"];
    const languages = requested.length ? requested : ["fr", "en", "ar"];

    const transcript = await getTranscript(videoId, languages);

    let metadata: any = null;
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
        headers: { "User-Agent": "MentionMax/1.0" },
      });
      if (response.ok) metadata = await response.json();
    } catch {}

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
