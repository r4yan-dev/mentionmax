const MODEL = "gemini-3.1-flash-lite";
const CORS_HEADERS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Max-Age": "86400" };
const JSON_HEADERS = { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" };

const planSchema = { type: "object", properties: {
  title: { type: "string" }, subtitle: { type: "string" }, estimatedMinutes: { type: "integer" },
  tasks: { type: "array", items: { type: "object", properties: {
    id: { type: "string" }, type: { type: "string", enum: ["review", "exercise", "quiz"] },
    title: { type: "string" }, reason: { type: "string" }, subjectId: { type: "string" },
    chapter: { type: "string" }, conceptIds: { type: "array", items: { type: "string" } },
    minutes: { type: "integer" }, route: { type: "string" }
  }, required: ["id","type","title","reason","subjectId","chapter","conceptIds","minutes","route"] } }
}, required: ["title","subtitle","estimatedMinutes","tasks"] };

function out(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS }); }
function secret() { return Deno.env.get("weak_points_tutor") || Deno.env.get("WEAK_POINTS_TUTOR") || ""; }
function publishableKey() { return Deno.env.get("SUPABASE_ANON_KEY") || ""; }
function serverKey() { return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_SECRET_KEY") || ""; }

async function userId(req: Request) {
  const authorization = req.headers.get("authorization") || "";
  if (!authorization.toLowerCase().startsWith("bearer ")) return null;
  const base = Deno.env.get("SUPABASE_URL"); const key = publishableKey(); if (!base || !key) return null;
  try { const r = await fetch(`${base}/auth/v1/user`, { headers: { apikey: key, Authorization: authorization }, signal: AbortSignal.timeout(5000) }); if (!r.ok) return null; const u = await r.json(); return typeof u?.id === "string" ? u.id : null; } catch { return null; }
}
function extract(payload: any) { if (typeof payload?.output_text === "string") return payload.output_text.trim(); const parts: string[] = []; for (const key of ["steps","outputs"]) if (Array.isArray(payload?.[key])) for (const item of payload[key]) { if (typeof item?.text === "string") parts.push(item.text); for (const nested of [item?.content,item?.output]) if (Array.isArray(nested)) for (const p of nested) if (typeof p?.text === "string") parts.push(p.text); } return parts.join("\n").trim(); }
function parseJson(raw: string) { const cleaned = raw.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim(); try { return JSON.parse(cleaned); } catch {} const a = cleaned.indexOf("{"); const b = cleaned.lastIndexOf("}"); if (a >= 0 && b > a) return JSON.parse(cleaned.slice(a,b+1)); throw new Error("Plan IA invalide."); }
function cleanWeakPoints(value: unknown) { if (!Array.isArray(value)) return []; return value.slice(0,10).map((item) => { const x = (item && typeof item === "object" ? item : {}) as Record<string,unknown>; return { subject_id: String(x.subject_id ?? ""), chapter: String(x.chapter ?? ""), topic: String(x.topic ?? ""), concept_id: String(x.concept_id ?? ""), mastery: typeof x.mastery === "number" ? x.mastery : null, attempts: typeof x.attempts === "number" ? x.attempts : 0, trend: String(x.trend ?? "new") }; }); }
async function generate(apiKey: string, prompt: string) {
  const r = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey, "Api-Revision": "2026-05-20" }, body: JSON.stringify({ model: MODEL, input: prompt, store: false, response_format: { type: "text", mime_type: "application/json", schema: planSchema }, generation_config: { max_output_tokens: 2600, thinking_level: "minimal" } }), signal: AbortSignal.timeout(45000) }); const raw = await r.text(); const payload = (() => { try { return JSON.parse(raw); } catch { return null; } })(); if (!r.ok) { const e = new Error(payload?.error?.message ?? `Gemini HTTP ${r.status}`); (e as Error & {status?:number}).status = r.status; throw e; } return parseJson(extract(payload));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return out({ success:false, error:"Méthode non autorisée." },405);
  try {
    const uid = await userId(req); if (!uid) return out({ success:false,error:"Authentification requise." },401);
    const key = secret(); if (!key) return out({success:false,error:"Secret weak_points_tutor manquant."},500);
    const body = await req.json();
    const planDate = typeof body?.planDate === "string" ? body.planDate : new Date().toISOString().slice(0,10);
    const trackId = typeof body?.trackId === "string" ? body.trackId : "SP";
    const weakPoints = cleanWeakPoints(body?.weakPoints);
    const subjects = Array.isArray(body?.subjects) ? body.subjects.slice(0,8).map((s:any)=>({id:String(s?.id??""),name:String(s?.name??"")})) : [];
    const prompt = `Tu es le planificateur pédagogique de MentionMax pour un élève de 2BAC marocain. Conçois UNE mission d'étude pour le ${planDate}. Parcours: ${trackId}. Matières disponibles: ${JSON.stringify(subjects)}. Points faibles mesurés: ${JSON.stringify(weakPoints)}.\n\nRÈGLES:\n- 3 à 4 tâches maximum, 25 à 45 minutes au total.\n- Priorité aux faiblesses avec faible mastery et tendances décroissantes, mais varie les matières quand utile.\n- Ordre recommandé: réactivation courte -> pratique ciblée -> exercice/quiz de montée en difficulté -> checkpoint si pertinent.\n- Une tâche 'review' doit pointer vers une leçon; 'exercise' vers /exercices?subject=...&chapter=...; 'quiz' vers /exercices?subject=...&mode=quiz.\n- route doit être une route interne MentionMax valide, sans URL externe.\n- Les conceptIds doivent être des notions courtes et stables.\n- Le plan doit être réalisable, spécifique et utile, pas motivational fluff.\n- Si peu de données existent, commence par un mini-diagnostic puis une pratique.\nJSON uniquement.`;
    let plan: any; try { plan = await generate(key,prompt); } catch (e) { const status=(e as Error & {status?:number}).status; return out({success:false,error:status===429?"Le planificateur IA est temporairement limité.":"La génération du plan a échoué.",detail:e instanceof Error?e.message:String(e)},status===429?429:500); }
    const tasks = Array.isArray(plan.tasks) ? plan.tasks.slice(0,4).map((task:any,i:number)=>({ ...task, id: typeof task?.id === "string" && task.id ? task.id : `task-${i+1}`, completed:false, minutes:Math.max(3,Math.min(25,Number(task?.minutes)||8)) })) : [];
    plan = { ...plan, tasks, estimatedMinutes: Math.max(10, tasks.reduce((n:number,t:any)=>n+Number(t.minutes||0),0)) };
    const base=Deno.env.get("SUPABASE_URL"); const sk=serverKey(); if(base&&sk){ await fetch(`${base}/rest/v1/learning_daily_plans?on_conflict=user_id%2Cplan_date`, { method:"POST", headers:{apikey:sk,Authorization:`Bearer ${sk}`,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}, body:JSON.stringify({user_id:uid,plan_date:planDate,track_id:trackId,title:plan.title,subtitle:plan.subtitle,estimated_minutes:plan.estimatedMinutes,tasks:plan.tasks,status:"active",updated_at:new Date().toISOString()}) }); }
    return out({success:true,plan,model:MODEL});
  } catch(e){ return out({success:false,error:e instanceof Error?e.message:"Erreur inattendue."},500); }
});