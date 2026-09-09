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

  if (error) {
    let detail = "";
    try {
      const context = (error as { context?: Response }).context;
      if (context) {
        const payload = await context.clone().json().catch(() => null) as { error?: string; detail?: string } | null;
        detail = payload?.detail ? ` ${payload.detail}` : payload?.error ? ` ${payload.error}` : "";
      }
    } catch {
      // Ignore malformed error bodies and use the SDK error message.
    }
    throw new Error(`${error.message || "Impossible de contacter le générateur d'examens IA."}${detail}`);
  }

  if (!data?.success || !data.result) {
    throw new Error(data?.detail ? `${data.error ?? "La génération a échoué."} ${data.detail}` : data?.error ?? "La génération de l'examen a échoué.");
  }

  return data.result as AIExamResult;
}
