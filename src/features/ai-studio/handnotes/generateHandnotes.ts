import type {
  HandnoteHint,
  HandnoteSet,
} from "../types";

function createId() {
  return `handnote-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export async function generateHandnotes(
  text: string,
  hint?: HandnoteHint
): Promise<HandnoteSet> {
  const cleaned = text
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) {
    throw new Error(
      "Le texte source est vide."
    );
  }

  const sentences = cleaned
    .split(/[.!?]\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const concepts = sentences.slice(0, 6);

  const formulas = sentences
    .filter((sentence) =>
      /[=²√∑Δ→<>]/.test(sentence)
    )
    .slice(0, 6);

  const examples = sentences
    .filter((sentence) =>
      /exemple|par exemple|application|exercice/i.test(
        sentence
      )
    )
    .slice(0, 4);

  const section = {
    title:
      hint?.chapter ||
      "Synthèse du cours",

    keyConcepts:
      concepts.length > 0
        ? concepts
        : [cleaned],

    definitions: [],

    formulas,

    examples,

    commonMistakes: [
      "Vérifier les conditions d'application avant d'utiliser une formule.",
      "Justifier les étapes importantes du raisonnement.",
      "Vérifier le résultat final.",
    ],

    examFocusPoints: [
      "Identifier les notions importantes.",
      "Connaître les définitions essentielles.",
      "Maîtriser les formules et leurs conditions d'utilisation.",
      "Rédiger une réponse claire et justifiée.",
    ],
  };

  return {
    id: createId(),
    sourceType: "text",
    sourceRef: `local:${Date.now()}`,
    subject: hint?.subject,
    chapter: hint?.chapter,
    generatedAt: new Date().toISOString(),
    sections: [section],
  };
}
