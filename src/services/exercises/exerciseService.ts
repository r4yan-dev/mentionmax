export interface ExerciseFilters {
  subjectId?: string;
  chapter?: string;
  conceptId?: string;
  difficulty?: 1 | 2 | 3;
  source?: "OFFICIAL" | "APPROVED" | "AI_GENERATED" | "USER_CREATED";
}

export interface ExerciseAttempt {
  exerciseId: string;
  correct: boolean;
  answer: unknown;
  durationSeconds: number;
  hintsUsed: number;
}

export const exerciseService = {
  async list(_filters: ExerciseFilters = {}) {
    return [] as unknown[];
  },
  async recordAttempt(_attempt: ExerciseAttempt) {
    return { saved: false, reason: "Backend exercise storage is not connected in foundation phase." } as const;
  },
};
