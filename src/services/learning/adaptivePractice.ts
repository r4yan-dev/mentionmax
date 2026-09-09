import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { SubjectId, TrackId } from "../../types/academic";
import type { LearningJourney } from "./weakPointsTutor";
import { getWeakPoints } from "./weakPointsService";

export type AdaptiveQuizQuestion = { question: string; choices: string[]; answerIndex: number; explanation: string; conceptIds: string[]; difficulty: number };
export type AdaptiveQuiz = { title: string; subtitle: string; kind: "quiz"; conceptIds: string[]; difficulty: number; questions: AdaptiveQuizQuestion[] };
export type AdaptiveExercisePart = { id: string; label: string; prompt: string; acceptedAnswers: string[]; explanation: string; hint: string; conceptIds: string[]; difficulty: number; points: number };
export type AdaptiveExercise = { title: string; subtitle: string; kind: "exercise"; conceptIds: string[]; difficulty: number; statement: string; parts: AdaptiveExercisePart[] };
export type AdaptiveActivity = AdaptiveQuiz | AdaptiveExercise;

async function errorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) { try { const payload = await error.context.json() as { error?: string; detail?: string }; return payload?.detail ? `${payload.error ?? "Le générateur adaptatif a échoué."} ${payload.detail}` : payload?.error ?? "Le générateur adaptatif a échoué."; } catch {} }
  return error instanceof Error ? error.message : "Le générateur adaptatif a échoué.";
}

export async function generateAdaptiveActivity(input: { trackId: TrackId; subjectId: SubjectId; lessonId: string; courseTitle: string; chapter: string; topic: string; intro?: string; objectives?: string[]; nextAction: LearningJourney["nextAction"] }) {
  const weakPoints = await getWeakPoints(input.subjectId, 8);
  const { data, error } = await supabase.functions.invoke("weak-points-tutor", { body: { action: "adaptive_activity", ...input, weakPoints } });
  if (error) throw new Error(await errorMessage(error));
  if (!data?.success || !data?.activity) throw new Error(data?.detail ? `${data?.error ?? "La pratique adaptative a échoué."} ${data.detail}` : data?.error ?? "La pratique adaptative a échoué.");
  return data.activity as AdaptiveActivity;
}

export async function generateAdaptiveQuiz(input: Parameters<typeof generateAdaptiveActivity>[0]) {
  const activity = await generateAdaptiveActivity(input);
  if (activity.kind !== "quiz") throw new Error("Le tuteur a choisi un exercice structuré au lieu d'un quiz.");
  return activity;
}
