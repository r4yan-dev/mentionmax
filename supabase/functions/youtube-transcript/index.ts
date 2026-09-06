import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Segment = { start: number; duration: number; text: string };

type CaptionTrack = {
  baseUrl?: string;
  languageCode?: string;
  kind?: string;
  name?: { simpleText?: string };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;
const playerUrl = "https://www.youtube.com/youtubei/v1/player";
const clients = [
  {
    name: "ANDROID",
    version: "20.10.38",
    sdk: 34,
    userAgent: "com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip",
    headerName: "3",
  },
  {
    name: "WEB",
    version: "2.20240926.01.00",
    sdk: undefined,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
    headerName: "1",
  },
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function cleanInput(value: string) {
  return value.trim().replace(/^['"`<\[]+|['"`>\]]+$/g, "").trim();
}

function extractVideoId(input: string): string | null {
  const value = cleanInput(input);
  if (youtubeIdPattern.test(value)) return value;

  const query = /[?&]v=([A-Za-z0-9_-]{11})(?:[&#/\s]|$)/i.exec(value);
  if (query?.[1]) return query[1];

  const path = /(?:youtube(?:-nocookie)?\.com|youtu\.be)\/(?:watch\?v=|shorts\/|embed\/|live\/|v\/)?([A-Za-z0-9_-]{11})(?:[?&#/\s]|$)/i.exec(value);
  if (path?.[1]) return path[1];

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
      if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes((parts[0] ?? "").toLowerCase())) {
        const id = parts[1];
        if (youtubeIdPattern.test(id)) return id;
      }
    }
  } catch {}

  return null;
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
    const parts = value.replace(",", ".").split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return parts[0] * 60 + parts[1];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.includes("-->")) continue;
    const [startRaw, endRaw] = line.split("-->").map((x) => x.trim().split(" ")[0]);
    const start = toSeconds(startRaw);
    const end = toSeconds(endRaw);
    const text: string[] = [];
    for (let j = i + 1; j < lines.length && lines[j].trim(); j++) text.push(lines[j].trim());
    const cleaned = decodeHtml(text.join(" "));
    if (cleaned && Number.isFinite(start) && Number.isFinite(end)) result.push({ start, duration: Math.max(0, end - start), text: cleaned });
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
    if (text && Number.isFinite(start)) result.push({ start, duration: Number.isFinite(duration) ? duration : 0, text });
  }
  return result;
}

function parseJson3(body: string): Segment[] {
  const data = JSON.parse(body);
  const result: Segment[] = [];
  for (const event of data?.events ?? []) {
    if (!Array.isArray(event?.segs)) continue;
    const text = event.segs.map((seg: { utf8?: string }) => seg?.utf8 ?? "").join("").trim();
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
      const parsed = parseJson3(body);
      if (parsed.length) return parsed;
    } catch {}
  }
  return body.includes("WEBVTT") ? parseVtt(body) : parseXml(body);
}

function extractApiKey(html: string) {
  const patterns = [
    /["']INNERTUBE_API_KEY["']\s*:\s*["']([^"']+)["']/,
    /ytcfg\.set\(\s*({[\s\S]*?})\s*\)\s*;/,
  ];
  const direct = patterns[0].exec(html)?.[1];
  if (direct) return direct;
  const config = patterns[1].exec(html)?.[1];
  if (config) {
    try {
      const parsed = JSON.parse(config);
      return parsed?.INNERTUBE_API_KEY ?? null;
    } catch {}
  }
  return null;
}

async function getApiKey(videoId: string) {
  const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
      "Accept": "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`YouTube watch page HTTP ${response.status}`);
  const html = await response.text();
  return extractApiKey(html);
}

function pickTrack(tracks: CaptionTrack[], languages: string[]) {
  const rank = (track: CaptionTrack) => {
    const langIndex = languages.indexOf(track.languageCode ?? "");
    const languageScore = langIndex < 0 ? 1000 : langIndex * 10;
    const generatedScore = track.kind === "asr" ? 1 : 0;
    return languageScore + generatedScore;
  };
  return [...tracks].sort((a, b) => rank(a) - rank(b))[0] ?? null;
}

async function fetchPlayer(videoId: string, languages: string[]) {
  let apiKey: string | null = null;
  try {
    apiKey = await getApiKey(videoId);
  } catch (error) {
    console.warn("Unable to read YouTube API key from watch page", error);
  }

  let lastError = "YouTube player request failed";
  for (const client of clients) {
    try {
      const endpoint = new URL(playerUrl);
      if (apiKey) endpoint.searchParams.set("key", apiKey);
      endpoint.searchParams.set("prettyPrint", "false");

      const clientContext: Record<string, unknown> = {
        clientName: client.name,
        clientVersion: client.version,
        hl: languages[0] ?? "en",
        gl: "US",
        userAgent: client.userAgent,
      };
      if (client.sdk) clientContext.androidSdkVersion = client.sdk;

      const response = await fetch(endpoint.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": client.userAgent,
          "X-YouTube-Client-Name": client.headerName,
          "X-YouTube-Client-Version": client.version,
          "Origin": "https://www.youtube.com",
          "Referer": "https://www.youtube.com/",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
        },
        body: JSON.stringify({ context: { client: clientContext }, videoId }),
      });

      if (!response.ok) {
        lastError = `YouTube ${client.name} player HTTP ${response.status}`;
        continue;
      }

      const player = await response.json();
      const status = player?.playabilityStatus?.status;
      if (status && status !== "OK") {
        lastError = player?.playabilityStatus?.reason ?? `YouTube playability status: ${status}`;
      }

      const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks as CaptionTrack[] | undefined;
      if (!Array.isArray(tracks) || tracks.length === 0) continue;

      const track = pickTrack(tracks, languages);
      if (!track?.baseUrl) continue;

      let captionUrl = new URL(track.baseUrl);
      const original = captionUrl.toString();
      const variants = [original, (() => {
        const copy = new URL(original);
        copy.searchParams.delete("fmt");
        copy.searchParams.delete("tlang");
        return copy.toString();
      })()];

      for (const url of variants) {
        try {
          const captionResponse = await fetch(url, {
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
          if (segments.length) {
            return {
              language: track.name?.simpleText ?? track.languageCode ?? languages[0] ?? "unknown",
              languageCode: track.languageCode ?? languages[0] ?? "unknown",
              isGenerated: track.kind === "asr",
              segments,
            };
          }
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

    const transcript = await fetchPlayer(videoId, languages);

    let metadata: Record<string, unknown> | null = null;
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
