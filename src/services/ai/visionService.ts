import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

type VisionResponse = {
  text?: string;
  model?: string;
  error?: string;
  details?: string;
};

async function getVisionError(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as VisionResponse;
      if (payload?.details) return `${payload.error ?? "Le service vision IA est indisponible."} ${payload.details}`;
      if (payload?.error) return payload.error;
    } catch {
      // Fall back to the SDK error when the response body is not JSON.
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Le service vision IA est indisponible.";
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Impossible de lire l'image."));
    };
    reader.onerror = () => reject(new Error("Impossible de lire l'image."));
    reader.readAsDataURL(file);
  });
}

export async function transcribeImage(file: File, prompt: string): Promise<string> {
  const image = await fileToDataUrl(file);

  try {
    const { data, error } = await supabase.functions.invoke<VisionResponse>("ai-vision", {
      body: {
        image,
        mimeType: file.type || "image/jpeg",
        prompt,
      },
    });

    if (error) throw error;
    if (!data?.text?.trim()) {
      throw new Error(data?.details ? `${data.error ?? "Gemini n'a renvoyé aucun texte."} ${data.details}` : data?.error ?? "Gemini n'a renvoyé aucun texte.");
    }

    return data.text.trim();
  } catch (error) {
    throw new Error(await getVisionError(error));
  }
}
