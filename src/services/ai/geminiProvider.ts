import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { AIProvider, AIRequest, AIResponse } from "./aiService";

type FunctionResponse<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  detail?: string;
};

async function getFunctionError(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as FunctionResponse<never>;
      if (payload?.detail) return `${payload.error ?? "Le tuteur IA est indisponible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {
      // Fall back to the SDK error when the response body is not JSON.
    }
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return "Le tuteur IA est indisponible.";
}

export const geminiProvider: AIProvider = {
  name: "gemini",
  async run<T = unknown>(request: AIRequest): Promise<AIResponse<T>> {
    try {
      const { data, error } = await supabase.functions.invoke<FunctionResponse<T>>("ai-tutor", {
        body: request,
      });

      if (error) throw error;
      if (!data?.success || data.data === undefined) {
        throw new Error(data?.detail ? `${data.error ?? "Le tuteur IA est indisponible."} ${data.detail}` : data?.error ?? "Le tuteur IA est indisponible.");
      }

      return {
        data: data.data,
        provider: "gemini",
        cached: false,
      };
    } catch (error) {
      throw new Error(await getFunctionError(error));
    }
  },
};
