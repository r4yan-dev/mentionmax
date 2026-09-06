import { aiService } from "./aiService";
import { geminiProvider } from "./geminiProvider";

aiService.setProvider(geminiProvider);

export { aiService } from "./aiService";
export { transcribeImage } from "./visionService";
export type { AIProvider, AIRequest, AIResponse, AIProviderName } from "./aiService";
