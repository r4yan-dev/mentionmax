import type { StudentKnowledgeState, SubjectId, TrackId } from "../../types/academic";
import type { PersonalizedContentRequest } from "../../types/content";

export type PersonalizedContentKind = "flashcards" | "exercises" | "quiz" | "revision-sheet";

export interface PersonalizedContentPlan {
  kind: PersonalizedContentKind;
  mode: "PERSONALIZED";
  source: "AI_GENERATED";
  request: PersonalizedContentRequest;
  rationale: string[];
}

function clampCount(count: number) {
  return Math.min(30, Math.max(1, Math.floor(count)));
}

export const personalizedContentService = {
  createPlan(
    kind: PersonalizedContentKind,
    request: PersonalizedContentRequest,
    knowledge: StudentKnowledgeState[] = [],
  ): PersonalizedContentPlan {
    const relevant = knowledge.filter(
      (state) =>
        state.studentId === request.studentId &&
        state.subjectId === request.subjectId,
    );

    const weakStates = relevant
      .filter((state) => state.mastery < 0.65)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5);

    const rationale = weakStates.map(
      (state) =>
        `Renforcer ${state.conceptId} : maîtrise ${(state.mastery * 100).toFixed(0)}%`,
    );

    if (!rationale.length) {
      rationale.push("Aucune faiblesse suffisamment documentée : répartir le contenu sur les notions demandées.");
    }

    return {
      kind,
      mode: "PERSONALIZED",
      source: "AI_GENERATED",
      request: {
        ...request,
        count: clampCount(request.count),
        weaknessFirst: request.weaknessFirst ?? true,
      },
      rationale,
    };
  },

  subjectScope(trackId: TrackId, subjectId: SubjectId) {
    return { trackId, subjectId };
  },
};

export function isPersonalizedMode(value: string): value is "PERSONALIZED" {
  return value === "PERSONALIZED";
}
