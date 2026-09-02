export interface HandnoteSet {
  id: string;
  sourceType: "text" | "pdf" | "youtube" | "exercise";
  sourceRef: string;
  subject?: string;
  chapter?: string;
  generatedAt: string;
  sections: HandnoteSection[];
}

export interface HandnoteSection {
  title: string;
  keyConcepts: string[];
  definitions: {
    term: string;
    definition: string;
  }[];
  formulas: string[];
  examples: string[];
  commonMistakes: string[];
  examFocusPoints: string[];
}

export interface HandnoteHint {
  subject?: string;
  chapter?: string;
}
