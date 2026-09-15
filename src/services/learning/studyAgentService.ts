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
  explanation: string;
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

export async function getPlanningProfile() {
  const { data, error } = await supabase
    .from("student_learning_profiles")
    .select("user_id,onboarding_completed,strong_subjects,weak_subjects,priority_subjects,subject_status,session_minutes,academic_start_date")
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function savePlanningProfile(input: {
  strongSubjects: string[];
  weakSubjects: string[];
  prioritySubjects: string[];
  subjectStatus: Record<string, { status: "not_started" | "in_progress" | "studied_weak" | "mastered"; lastReached?: string }>;
  sessionMinutes?: number;
  academicStartDate?: string;
}) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Utilisateur non connecté.");
  const { data, error } = await supabase.from("student_learning_profiles").upsert({
    user_id: userData.user.id,
    onboarding_completed: true,
    strong_subjects: input.strongSubjects,
    weak_subjects: input.weakSubjects,
    priority_subjects: input.prioritySubjects,
    subject_status: input.subjectStatus,
    session_minutes: Math.max(10, Math.min(180, input.sessionMinutes ?? 30)),
    academic_start_date: input.academicStartDate ?? "2026-09-01",
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" }).select("user_id,onboarding_completed,strong_subjects,weak_subjects,priority_subjects,subject_status,session_minutes,academic_start_date").single();
  if (error) throw error;
  return data;
}

export type StudentExam = {
  id: string;
  title: string;
  exam_date: string;
  subjects: string[];
  coverage: Record<string, unknown>;
  mastery: number | null;
  notes: string | null;
};

export async function listStudentExams() {
  const { data, error } = await supabase.from("student_exams").select("id,title,exam_date,subjects,coverage,mastery,notes").order("exam_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as StudentExam[];
}

export async function createStudentExam(input: Omit<StudentExam, "id">) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Utilisateur non connecté.");
  const { data, error } = await supabase.from("student_exams").insert({ ...input, user_id: userData.user.id }).select("id,title,exam_date,subjects,coverage,mastery,notes").single();
  if (error) throw error;
  return data as StudentExam;
}

export async function deleteStudentExam(id: string) {
  const { error } = await supabase.from("student_exams").delete().eq("id", id);
  if (error) throw error;
}

export function planningCalendarContext(date = new Date()) {
  const yearStart = new Date(date.getFullYear(), 8, 1);
  if (date.getMonth() < 8) yearStart.setFullYear(date.getFullYear() - 1);
  const diffDays = Math.floor((date.getTime() - yearStart.getTime()) / 86400000);
  const monthIndex = Math.max(0, Math.min(9, Math.floor(diffDays / 30)));
  const phases = [
    "Début d'année : diagnostic, bases et premiers chapitres.",
    "Consolidation : stabiliser les premiers chapitres et corriger les lacunes.",
    "Avancement : couvrir de nouveaux chapitres sans abandonner les bases.",
    "Rattrapage : réduire les chapitres non couverts et renforcer les notions fragiles.",
    "Consolidation avancée : alterner nouveaux chapitres et récupération espacée.",
    "Approfondissement : augmenter la pratique et les exercices de niveau Bac.",
    "Entraînement : mélanger les chapitres et augmenter la part d'annales.",
    "Révision structurée : cibler les faiblesses et les chapitres à fort enjeu.",
    "Préparation finale : annales, examens blancs et corrections ciblées.",
    "Dernière ligne droite : revoir les erreurs récurrentes et les points indispensables.",
  ];
  return {
    today: date.toISOString().slice(0, 10),
    academicStart: yearStart.toISOString().slice(0, 10),
    monthIndex,
    phase: phases[monthIndex],
    daysSinceStart: Math.max(0, diffDays),
  };
}

export async function createStudyAgentSession(params: {
  trackId: TrackId;
  subjects: Array<{ id: SubjectId; name: string }>;
  availableMinutes: number;
}): Promise<StudyAgentSession> {
  const weakPoints = await getWeakPoints(undefined, 12);
  const { data, error } = await supabase.functions.invoke("study-agent", {
    body: { trackId: params.trackId, subjects: params.subjects, availableMinutes: params.availableMinutes, weakPoints },
  });
  if (error) throw new Error(await errorMessage(error));
  if (!data?.success || !data?.session) throw new Error(data?.detail ? `${data?.error ?? "La session n'a pas pu être créée."} ${data.detail}` : data?.error ?? "La session n'a pas pu être créée.");
  return data.session as StudyAgentSession;
}

export async function getLatestStudyAgentSession(): Promise<StudyAgentSession | null> {
  const { data, error } = await supabase.from("learning_agent_sessions").select("id,title,subtitle,explanation,tasks,priorities,available_minutes,status").eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, title: data.title, subtitle: data.subtitle ?? "", explanation: data.explanation ?? "", priorities: Array.isArray(data.priorities) ? data.priorities as string[] : [], tasks: Array.isArray(data.tasks) ? data.tasks as StudyAgentTask[] : [], availableMinutes: data.available_minutes, status: data.status };
}

export async function updateStudyAgentSession(sessionId: string, tasks: StudyAgentTask[], status?: StudyAgentSession["status"]) {
  const nextStatus = status ?? (tasks.length > 0 && tasks.every((task) => task.completed) ? "completed" : "active");
  const { error } = await supabase.from("learning_agent_sessions").update({ tasks, status: nextStatus }).eq("id", sessionId);
  if (error) throw error;
}

export function rankAgentContext(weakPoints: LearnerMastery[]) {
  return weakPoints.filter((point) => point.attempts > 0).sort((a, b) => (a.mastery - b.mastery) || (b.recent_mistakes.length - a.recent_mistakes.length)).slice(0, 5);
}
