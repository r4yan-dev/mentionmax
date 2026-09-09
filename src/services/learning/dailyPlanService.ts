import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { SubjectId, TrackId } from "../../types/academic";
import { getWeakPoints, type LearnerMastery } from "./weakPointsService";

export type DailyPlanTask = {
  id: string;
  type: "review" | "exercise" | "quiz";
  title: string;
  reason: string;
  subjectId: string;
  chapter: string;
  conceptIds: string[];
  minutes: number;
  route: string;
  completed: boolean;
};
export type DailyPlan = { title: string; subtitle: string; estimatedMinutes: number; tasks: DailyPlanTask[]; planDate: string; status: "active" | "completed" | "expired" };

async function errorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try { const payload = await error.context.json() as { error?: string; detail?: string }; return payload?.detail ? `${payload.error ?? "Le plan du jour a échoué."} ${payload.detail}` : payload?.error ?? "Le plan du jour a échoué."; } catch {}
  }
  return error instanceof Error ? error.message : "Le plan du jour a échoué.";
}

export async function getDailyPlan(params: { trackId: TrackId; subjects: Array<{ id: SubjectId; name: string }>; force?: boolean }): Promise<DailyPlan> {
  const today = new Date().toISOString().slice(0,10);
  if (!params.force) {
    const { data } = await supabase.from("learning_daily_plans").select("title, subtitle, estimated_minutes, tasks, plan_date, status").eq("plan_date", today).maybeSingle();
    if (data) return { title: data.title, subtitle: data.subtitle ?? "", estimatedMinutes: data.estimated_minutes, tasks: Array.isArray(data.tasks) ? data.tasks as DailyPlanTask[] : [], planDate: data.plan_date, status: data.status };
  }
  const weakPoints = await getWeakPoints(undefined, 10);
  const { data, error } = await supabase.functions.invoke("daily-plan", { body: { planDate: today, trackId: params.trackId, subjects: params.subjects, weakPoints } });
  if (error) throw new Error(await errorMessage(error));
  if (!data?.success || !data?.plan) throw new Error(data?.detail ? `${data?.error ?? "Le plan du jour a échoué."} ${data.detail}` : data?.error ?? "Le plan du jour a échoué.");
  return { ...data.plan, planDate: today, status: "active" } as DailyPlan;
}

export async function updateDailyPlanTask(planDate: string, tasks: DailyPlanTask[]) {
  const completed = tasks.length > 0 && tasks.every((task) => task.completed);
  const { error } = await supabase.from("learning_daily_plans").update({ tasks, status: completed ? "completed" : "active", updated_at: new Date().toISOString() }).eq("plan_date", planDate);
  if (error) throw error;
}
