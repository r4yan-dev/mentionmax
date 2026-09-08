import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type AIExamQuestion = {
  number: number;
  title: string;
  points: number;
  statement: string;
  expectedSkill: string;
  difficulty: "easy" | "medium" | "hard";
  correction: string;
};

export type AIExamResult = {
  title: string;
  subject: string;
  track: string;
  durationMinutes: number;
  instructions: string[];
  totalPoints: number;
  questions: AIExamQuestion[];
  sourceCoverage: string[];
  weakPointTargets: string[];
};

export type AIExamCreatorInput = {
  text: string;
  subject?: string;
  chapter?: string;
  track?: string;
  difficulty?: "revision" | "bac" | "hard";
  durationMinutes?: number;
  questionCount?: number;
  weakPoints?: string[];
};

async function getErrorMessage(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as { error?: string; detail?: string };
      if (payload?.detail) return `${payload.error ?? "La génération de l'examen a échoué."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
    return `Le générateur a répondu avec une erreur HTTP (${error.context?.status ?? "inconnue"}).`;
  }
  return error instanceof Error ? error.message : "Impossible de contacter le générateur d'examens IA.";
}

export async function generateExamWithAI(input: AIExamCreatorInput): Promise<AIExamResult> {
  const text = input.text.trim();
  if (!text) throw new Error("Le texte source est vide.");

  const { data, error } = await supabase.functions.invoke("ai-exam-creator", {
    body: {
      text,
      subject: input.subject?.trim() || undefined,
      chapter: input.chapter?.trim() || undefined,
      track: input.track?.trim() || undefined,
      difficulty: input.difficulty ?? "bac",
      durationMinutes: input.durationMinutes ?? 60,
      questionCount: input.questionCount ?? 10,
      weakPoints: input.weakPoints ?? [],
    },
  });

  if (error) throw new Error(await getErrorMessage(error));
  const response = data as { success?: boolean; result?: AIExamResult; error?: string; detail?: string } | null;

  if (!response?.success || !response.result) {
    throw new Error(response?.detail ? `${response.error ?? "La génération a échoué."} ${response.detail}` : response?.error ?? "La génération de l'examen a échoué.");
  }

  return response.result;
}
