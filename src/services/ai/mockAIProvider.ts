import type { AIProvider, AIRequest, AIResponse } from "./aiService";

function textFromInput(input: unknown) {
  if (typeof input === "string") return input.trim();
  if (input && typeof input === "object") return JSON.stringify(input);
  return "";
}

export const mockAIProvider: AIProvider = {
  name: "openrouter",
  async run<T = unknown>(request: AIRequest): Promise<AIResponse<T>> {
    const text = textFromInput(request.input);
    const context = request.context ? Object.entries(request.context).map(([k, v]) => `${k}: ${String(v)}`).join(" · ") : "";

    const answers: Record<AIRequest["task"], string> = {
      explain: `Voici une explication structurée de « ${text || "cette notion"} ». Commence par la définition, identifie la propriété du cours utilisée, puis applique-la sur un exemple simple.${context ? ` Contexte : ${context}.` : ""}`,
      correct: `Méthode de correction : identifie les données, écris la propriété ou formule, effectue le calcul ligne par ligne, puis vérifie le résultat.${context ? ` Contexte : ${context}.` : ""}`,
      generate: `Mini-activité générée autour de « ${text || "la notion demandée"} » : 1) rappel de cours, 2) application directe, 3) question de transfert.${context ? ` Contexte : ${context}.` : ""}`,
      personalize: `Parcours personnalisé : commence par la notion la moins maîtrisée, fais un exercice guidé, puis termine par une question autonome.${context ? ` Contexte : ${context}.` : ""}`,
    };

    return { data: answers[request.task] as T, provider: "openrouter", cached: false };
  },
};
