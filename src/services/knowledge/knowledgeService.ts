import type { StudentKnowledgeState } from "../../types/academic";

export const knowledgeService = {
  clamp(value: number): number {
    return Math.min(1, Math.max(0, value));
  },

  updateFromAttempt(state: StudentKnowledgeState, correct: boolean): StudentKnowledgeState {
    const attempts = state.attempts + 1;
    const correctCount = state.correct + (correct ? 1 : 0);
    const observedAccuracy = correctCount / attempts;

    return {
      ...state,
      attempts,
      correct: correctCount,
      mastery: this.clamp(state.mastery * 0.7 + observedAccuracy * 0.3),
      confidence: this.clamp(state.confidence * 0.8 + (correct ? 0.2 : 0)),
      lastAttempt: new Date().toISOString(),
      lastCorrect: correct ? new Date().toISOString() : state.lastCorrect,
    };
  },
};
