import { supabase } from "../../lib/supabase";

const EXAM_CREATOR_URL = "/api/ai-exam-creator";

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

export async function generateExamWithAI(input: AIExamCreatorInput): Promise<AIExamResult> {
  const text = input.text.trim();
  if (!text) throw new Error("Le texte source est vide.");

  const session = await supabase.auth.getSession();
  const headers = new Headers({ "Content-Type": "application/json" });
  if (session.data.session?.access_token) {
    headers.set("Authorization", `Bearer ${session.data.session.access_token}`);
  }

  const response = await fetch(EXAM_CREATOR_URL, {
    method: "POST",
    headers,
    credentials: "same-origin",
    body: JSON.stringify({
      text,
      subject: input.subject?.trim() || undefined,
      chapter: input.chapter?.trim() || undefined,
      track: input.track?.trim() || undefined,
      difficulty: input.difficulty ?? "bac",
      durationMinutes: input.durationMinutes ?? 60,
      questionCount: input.questionCount ?? 10,
      weakPoints: input.weakPoints ?? [],
    }),
  });

  const payload = await response.json().catch(() => null) as { success?: boolean; result?: AIExamResult; error?: string; detail?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.detail ? `${payload.error ?? "La génération a échoué."} ${payload.detail}` : payload?.error ?? `Le générateur a répondu avec une erreur HTTP (${response.status}).`);
  }

  if (!payload?.success || !payload.result) {
    throw new Error(payload?.detail ? `${payload.error ?? "La génération a échoué."} ${payload.detail}` : payload?.error ?? "La génération de l'examen a échoué.");
  }

  return payload.result;
}
