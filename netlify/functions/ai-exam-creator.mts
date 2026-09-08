export default async (req: Request) => {
  const supabaseFunctionUrl = "https://ideyxjuptbizfubyokim.supabase.co/functions/v1/ai-exam-creator";

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: req.method === "OPTIONS" ? "OK" : "Method not allowed",
      }),
      {
        status: req.method === "OPTIONS" ? 200 : 405,
        headers: { "Content-Type": "application/json" },
      },
    );
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

    const response = await fetch(supabaseFunctionUrl, {
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
    console.error("ai-exam-creator proxy failed", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Exam creator proxy failed.",
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const config = {
  path: "/api/ai-exam-creator",
};
