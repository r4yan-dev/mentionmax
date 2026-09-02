export type XPSource = "national_exam" | "national_question" | "exercise" | "flashcard" | "quiz" | "diagnostic";

export interface XPTransaction {
  userId: string;
  source: XPSource;
  amount: number;
  sourceId?: string;
  createdAt: string;
}

const baseWeights: Record<XPSource, number> = {
  national_exam: 250,
  national_question: 80,
  exercise: 30,
  flashcard: 5,
  quiz: 10,
  diagnostic: 100,
};

export const xpService = {
  awardXP(source: XPSource, multiplier = 1): number {
    return Math.max(0, Math.round(baseWeights[source] * multiplier));
  },
};
