import { supabase } from "../../lib/supabase";
import type { AIProvider, AIRequest, AIResponse } from "./aiService";

type FunctionResponse<T> = {
  success?: boolean;
  data?: T;
  error?: string;
  detail?: string;
};

export const geminiProvider: AIProvider = {
  name: "gemini",
  async run<T = unknown>(request: AIRequest): Promise<AIResponse<T>> {
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
  },
};
