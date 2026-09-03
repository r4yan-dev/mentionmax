import { aiService } from "./aiService";
import { mockAIProvider } from "./mockAIProvider";

aiService.setProvider(mockAIProvider);

export { aiService } from "./aiService";
export type { AIProvider, AIRequest, AIResponse, AIProviderName } from "./aiService";
