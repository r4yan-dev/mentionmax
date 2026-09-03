export type AIProviderName = "openai" | "anthropic" | "gemini" | "mistral" | "groq" | "cerebras" | "openrouter";

export interface AIRequest {
  task: "generate" | "explain" | "correct" | "personalize";
  input: unknown;
  context?: Record<string, unknown>;
}

export interface AIResponse<T = unknown> {
  data: T;
  provider: AIProviderName;
  cached: boolean;
}

export interface AIProvider {
  readonly name: AIProviderName;
  run<T = unknown>(request: AIRequest): Promise<AIResponse<T>>;
}

let provider: AIProvider;

export const aiService = {
  setProvider(nextProvider: AIProvider) {
    provider = nextProvider;
  },
  async run<T = unknown>(request: AIRequest) {
    if (!provider) {
      throw new Error("Aucun fournisseur IA configuré.");
    }
    return provider.run<T>(request);
  },
};
