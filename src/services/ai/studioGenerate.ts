import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";

export type StudioGenerationMode = "handnote" | "summary" | "flashcards" | "quiz";

export type StudioGenerationInput = {
  mode: StudioGenerationMode;
  text: string;
  subject?: string;
  chapter?: string;
  track?: string;
};

export type StudioGenerationResponse<T = unknown> = {
  success: boolean;
  mode: StudioGenerationMode;
  result?: T;
  error?: string;
  detail?: string;
};

type LearningContext = { mode: StudioGenerationMode; subject: string | null; chapter: string | null; track: string | null };

declare global {
  interface Window { __mentionmaxLearningContext?: LearningContext; }
}

let lastSelectedMode: StudioGenerationMode | null = null;

const modeFromLabel: Record<string, StudioGenerationMode> = {
  "leçon menti": "handnote",
  "résumé": "summary",
  "flashcards": "flashcards",
  "quiz": "quiz",
};

if (typeof document !== "undefined") {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest(".generator-mode");
    if (!button) return;
    const label = button.textContent?.replace(/\s+/g, " ").trim().toLocaleLowerCase() ?? "";
    const matched = Object.entries(modeFromLabel).find(([name]) => label.includes(name));
    if (matched) lastSelectedMode = matched[1];
  });
}

function resolveGenerationMode(inputMode: StudioGenerationMode): StudioGenerationMode {
  return lastSelectedMode ?? inputMode;
}

async function getErrorMessage(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as { error?: string; detail?: string };
      if (payload?.detail) return `${payload.error ?? "La génération IA a échoué."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
    return `Le générateur a répondu avec une erreur HTTP (${error.context?.status ?? "inconnue"}).`;
  }
  return error instanceof Error ? error.message : "Impossible de contacter le générateur IA.";
}

export async function generateStudioResource<T = unknown>(input: StudioGenerationInput): Promise<T> {
  const text = input.text.trim();
  if (!text) throw new Error("Le texte source est vide.");

  const mode = resolveGenerationMode(input.mode);
  const context: LearningContext = {
    mode,
    subject: input.subject?.trim() || null,
    chapter: input.chapter?.trim() || null,
    track: input.track?.trim() || null,
  };

  const { data, error } = await supabase.functions.invoke("ai-studio-generate", {
    body: {
      mode,
      text,
      subject: context.subject ?? undefined,
      chapter: context.chapter ?? undefined,
      track: context.track ?? undefined,
    },
  });

  if (error) throw new Error(await getErrorMessage(error));

  const response = data as StudioGenerationResponse<T> | null;
  if (!response?.success || response.result === undefined) {
    const message = response?.detail
      ? `${response.error ?? "La génération IA a échoué."} ${response.detail}`
      : response?.error ?? "La génération IA a échoué.";
    throw new Error(message);
  }

  if (typeof window !== "undefined") window.__mentionmaxLearningContext = context;

  if (response.result && typeof response.result === "object" && !Array.isArray(response.result)) {
    const result = response.result as Record<string, unknown>;
    return { ...result, __mentionmaxContext: context } as T;
  }

  return response.result;
}
