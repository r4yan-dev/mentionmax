import { FunctionsHttpError } from "@supabase/supabase-js";
import type { SubjectId, TrackId } from "../../types/academic";
import { supabase } from "../../lib/supabase";
import { getWeakPoints, type LearnerMastery } from "./weakPointsService";

export type StudyAgentTask = {
  id: string;
  type: "review" | "exercise" | "quiz" | "lesson";
  subjectId: string;
  chapter: string;
  title: string;
  reason: string;
  minutes: number;
  route: string;
  conceptIds: string[];
  completed?: boolean;
};

export type StudyAgentSession = {
  id: string | null;
  title: string;
  subtitle: string;
  priorities: string[];
  tasks: StudyAgentTask[];
  availableMinutes: number;
  status: "active" | "completed" | "abandoned";
};

async function errorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json() as { error?: string; detail?: string };
      return payload?.detail ? `${payload.error ?? "L'agent de travail a échoué."} ${payload.detail}` : payload?.error ?? "L'agent de travail a échoué.";
    } catch {}
  }
  return error instanceof Error ? error.message : "L'agent de travail a échoué.";
}

export async function createStudyAgentSession(params: {
  trackId: TrackId;
  subjects: Array<{ id: SubjectId; name: string }>;
  availableMinutes: number;
}): Promise<StudyAgentSession> {
  const weakPoints = await getWeakPoints(undefined, 12);
  const { data, error } = await supabase.functions.invoke("study-agent", {
    body: {
      trackId: params.trackId,
      subjects: params.subjects,
      availableMinutes: params.availableMinutes,
      weakPoints,
    },
  });
  if (error) throw new Error(await errorMessage(error));
  if (!data?.success || !data?.session) {
    throw new Error(data?.detail ? `${data?.error ?? "La session n'a pas pu être créée."} ${data.detail}` : data?.error ?? "La session n'a pas pu être créée.");
  }
  return data.session as StudyAgentSession;
}

export async function getLatestStudyAgentSession(): Promise<StudyAgentSession | null> {
  const { data, error } = await supabase
    .from("learning_agent_sessions")
    .select("id,title,subtitle,tasks,priorities,available_minutes,status")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const tasks = Array.isArray(data.tasks) ? data.tasks as StudyAgentTask[] : [];
  return {
    id: data.id,
    title: data.title,
    subtitle: data.subtitle ?? "",
    priorities: Array.isArray(data.priorities) ? data.priorities as string[] : [],
    tasks,
    availableMinutes: data.available_minutes,
    status: data.status,
  };
}

export async function updateStudyAgentSession(sessionId: string, tasks: StudyAgentTask[], status?: StudyAgentSession["status"]) {
  const nextStatus = status ?? (tasks.length > 0 && tasks.every((task) => task.completed) ? "completed" : "active");
  const { error } = await supabase
    .from("learning_agent_sessions")
    .update({ tasks, status: nextStatus })
    .eq("id", sessionId);
  if (error) throw error;
}

export function rankAgentContext(weakPoints: LearnerMastery[]) {
  return weakPoints
    .filter((point) => point.attempts > 0)
    .sort((a, b) => (a.mastery - b.mastery) || (b.recent_mistakes.length - a.recent_mistakes.length))
    .slice(0, 5);
}
