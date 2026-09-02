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

class UnconfiguredAIProvider implements AIProvider {
  readonly name: AIProviderName = "openrouter";

  async run<T>(): Promise<AIResponse<T>> {
    throw new Error("AI provider is not configured. Connect a server-side provider before making AI requests.");
  }
}

let provider: AIProvider = new UnconfiguredAIProvider();

export const aiService = {
  setProvider(nextProvider: AIProvider) {
    provider = nextProvider;
  },
  async run<T = unknown>(request: AIRequest): Promise<AIResponse<T>> {
    return provider.run<T>(request);
  },
};
