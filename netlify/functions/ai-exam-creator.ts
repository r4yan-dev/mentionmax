const SUPABASE_FUNCTION_URL = "https://ideyxjuptbizfubyokim.supabase.co/functions/v1/ai-exam-creator";

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.text();
    const headers = new Headers({ "Content-Type": "application/json" });
    const authorization = req.headers.get("authorization");
    const apikey = req.headers.get("apikey");
    const xClientInfo = req.headers.get("x-client-info");

    if (authorization) headers.set("Authorization", authorization);
    if (apikey) headers.set("apikey", apikey);
    if (xClientInfo) headers.set("x-client-info", xClientInfo);

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: "POST",
      headers,
      body,
    });

    const responseBody = await response.text();
    return new Response(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : "Exam creator proxy failed.",
    }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config = {
  path: "/api/ai-exam-creator",
};
