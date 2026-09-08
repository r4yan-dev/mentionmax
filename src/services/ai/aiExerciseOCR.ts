import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type OCRSegment = {
  kind: "printed_question" | "student_answer" | "annotation" | "unknown";
  label: string;
  text: string;
};

export type AIExerciseOCRResult = {
  text: string;
  documentType: "exercise" | "exam_copy" | "notes" | "unknown";
  confidence: number | null;
  segments: OCRSegment[];
};

type FunctionResponse = {
  success?: boolean;
  data?: AIExerciseOCRResult;
  error?: string;
  detail?: string;
};

async function getFunctionError(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as FunctionResponse;
      if (payload?.detail) return `${payload.error ?? "Le service OCR IA est indisponible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {
      // Fall back to the SDK error below.
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Le service OCR IA est indisponible.";
}

export async function extractExerciseOCR(file: File): Promise<AIExerciseOCRResult> {
  if (!file) throw new Error("Sélectionne une image ou un PDF.");
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("Format non pris en charge. Utilise une image ou un PDF.");
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error("Le fichier est trop volumineux. Limite de 15 Mo pour le scanner.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Impossible de lire le fichier."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });

  try {
    const { data, error } = await supabase.functions.invoke<FunctionResponse>("ai-exercise-ocr", {
      body: { file: dataUrl, mimeType: file.type },
    });

    if (error) throw error;
    if (!data?.success || !data.data) {
      throw new Error(data?.detail ? `${data.error ?? "Le service OCR IA est indisponible."} ${data.detail}` : data?.error ?? "Le service OCR IA est indisponible.");
    }

    return data.data;
  } catch (error) {
    throw new Error(await getFunctionError(error));
  }
}
