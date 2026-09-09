import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type WeakPointSpotResult = {
  subjectId: string;
  trackId?: string;
  chapter: string;
  topic: string;
  conceptId: string;
  mistakeType: string;
  weaknessPoints: number;
  message: string;
  priority: "low" | "medium" | "high";
};

async function errorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json() as { error?: string; detail?: string };
      if (payload?.detail) return `${payload.error ?? "Analyse indisponible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
  }
  return error instanceof Error ? error.message : "Analyse du point faible indisponible.";
}

export async function spotWeakPoint(input: {
  subjectId: string;
  trackId?: string;
  chapter?: string;
  topic?: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  quizTitle?: string;
}) {
  const { data, error } = await supabase.functions.invoke<{ success?: boolean; data?: WeakPointSpotResult; error?: string; detail?: string }>("weak-points-spot", {
    body: input,
  });
  if (error) throw new Error(await errorMessage(error));
  if (!data?.success || !data.data) throw new Error(data?.detail ? `${data.error ?? "Analyse indisponible."} ${data.detail}` : data?.error ?? "Analyse indisponible.");
  return data.data;
}
