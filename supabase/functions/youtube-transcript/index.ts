import "jsr:@supabase/functions-js/edge-runtime.d.ts";

type Segment = { start: number; duration: number; text: string };

type PlayerClient = {
  name: string;
  version: string;
  userAgent: string;
  extra?: Record<string, unknown>;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

// Public InnerTube client key used by YouTube clients. We do not fetch the
// YouTube watch page, avoiding the server-side "confirm you're not a robot"
// challenge that blocks datacenter requests.
const INNER_TUBE_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";

const clients: PlayerClient[] = [
  {
    name: "ANDROID",
    version: "20.01.38",
    userAgent: "com.google.android.youtube/20.01.38 (Linux; U; Android 14) gzip",
    extra: { androidSdkVersion: 35 },
  },
  {
    name: "IOS",
    version: "20.10.4",
    userAgent: "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_5 like Mac OS X)",
  },
  {
    name: "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
    version: "2.0",
    userAgent: "Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/537.36",
  },
  {
    name: "WEB",
    version: "2.20260828.01.00",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  },
];

function cleanInput(input: string) {
  return input
    .trim()
    .replace(/^['"`<\[]+|['"`>\]]+$/g, "")
    .trim();
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
      if (parts.length >= 2 && ["shorts", "embed", "live", "v"].includes((parts[0] ?? "").toLowerCase())) {
        const id = parts[1] ?? "";
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
    .trim();
}

function parseVtt(body: string): Segment[] {
  const lines = body.replace(/\r/g, "").split("\n");
  const segments: Segment[] = [];
  const toSeconds = (value: string) => {
    const p = value.replace(",", ".").split(":").map(Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    return p[0] * 60 + p[1];
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
      segments.push({ start, duration: Math.max(0, end - start), text: cleaned });
    }
  }
  return segments;
}

function parseXml(body: string): Segment[] {
  const segments: Segment[] = [];
  for (const match of body.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attrs = match[1] ?? "";
    const content = match[2] ?? "";
    const attr = (name: string) => new RegExp(`${name}="([^"]*)"`).exec(attrs)?.[1] ?? "";
    const start = Number(attr("start"));
    const duration = Number(attr("dur"));
    const text = decodeHtml(content.replace(/<br\s*\/?/gi, " "));
    if (text && Number.isFinite(start)) {
      segments.push({ start, duration: Number.isFinite(duration) ? duration : 0, text });
    }
  }
  return segments;
}

function parseJson3(body: string): Segment[] {
  const data = JSON.parse(body);
  const segments: Segment[] = [];
  for (const event of data?.events ?? []) {
    if (!Array.isArray(event?.segs)) continue;
    const text = event.segs.map((seg: { utf8?: string }) => seg?.utf8 ?? "").join("").trim();
    if (!text) continue;
    const start = Number(event.tStartMs ?? 0) / 1000;
    const duration = Number(event.dDurationMs ?? 0) / 1000;
    if (Number.isFinite(start)) segments.push({ start, duration: Number.isFinite(duration) ? duration : 0, text: decodeHtml(text) });
  }
  return segments;
}

function parseCaptionBody(body: string, contentType: string) {
  if (contentType.includes("json") || body.trimStart().startsWith("{")) {
    try {
      const jsonSegments = parseJson3(body);
      if (jsonSegments.length) return jsonSegments;
    } catch {}
  }
  return body.includes("WEBVTT") ? parseVtt(body) : parseXml(body);
}

function rankTracks(tracks: any[], languages: string[]) {
  return [...tracks].sort((a, b) => {
    const al = String(a?.languageCode ?? "").toLowerCase();
    const bl = String(b?.languageCode ?? "").toLowerCase();
    const ai = languages.findIndex((lang) => al === lang.toLowerCase());
    const bi = languages.findIndex((lang) => bl === lang.toLowerCase());
    const aScore = ai < 0 ? 999 : ai;
    const bScore = bi < 0 ? 999 : bi;
    if (aScore !== bScore) return aScore - bScore;
    return a?.kind === "asr" ? 1 : -1;
  });
}

async function fetchPlayer(videoId: string, client: PlayerClient) {
  const endpoint = `https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(INNER_TUBE_API_KEY)}&prettyPrint=false`;
  const payload = {
    context: {
      client: {
        clientName: client.name,
        clientVersion: client.version,
        userAgent: client.userAgent,
        ...(client.extra ?? {}),
        hl: "en",
        gl: "US",
      },
    },
    videoId,
    contentCheckOk: true,
    racyCheckOk: true,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": client.userAgent,
      "Origin": "https://www.youtube.com",
      "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) throw new Error(`${client.name} player HTTP ${response.status}`);
  return await response.json();
}

async function fetchCaptionTrack(track: any): Promise<Segment[]> {
  const rawBaseUrl = typeof track?.baseUrl === "string" ? track.baseUrl : "";
  if (!rawBaseUrl) return [];

  const formats = ["json3", "vtt", "xml"];
  let lastError = "Caption track unavailable";

  for (const fmt of formats) {
    try {
      const captionUrl = new URL(rawBaseUrl);
      // YouTube may return an URL that already contains a format parameter.
      for (const key of ["fmt", "xorb", "xosf", "xosp", "tlang"]) captionUrl.searchParams.delete(key);
      captionUrl.searchParams.set("fmt", fmt);
      const response = await fetch(captionUrl.toString(), {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MentionMax/1.0)",
          "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8,ar;q=0.7",
        },
      });
      if (!response.ok) {
        lastError = `Captions HTTP ${response.status}`;
        continue;
      }
      const body = await response.text();
      const segments = parseCaptionBody(body, response.headers.get("content-type") ?? "");
      if (segments.length) return segments;
      lastError = `Empty ${fmt} caption response`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
  }

  throw new Error(lastError);
}

async function getTranscript(videoId: string, languages: string[]) {
  let lastError = "Aucune piste de sous-titres exploitable.";

  for (const client of clients) {
    try {
      const player = await fetchPlayer(videoId, client);
      const tracks = player?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      if (!Array.isArray(tracks) || !tracks.length) {
        lastError = `${client.name}: aucune piste de sous-titres`;
        continue;
      }

      const ranked = rankTracks(tracks, languages);
      for (const track of ranked) {
        try {
          const segments = await fetchCaptionTrack(track);
          if (segments.length) {
            return {
              language: track?.name?.simpleText ?? track?.languageCode ?? languages[0] ?? "unknown",
              languageCode: track?.languageCode ?? "unknown",
              isGenerated: track?.kind === "asr",
              segments,
              source: client.name,
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

    const transcript = await getTranscript(videoId, languages);

    let metadata: any = null;
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
        { headers: { "User-Agent": "Mozilla/5.0" } },
      );
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
