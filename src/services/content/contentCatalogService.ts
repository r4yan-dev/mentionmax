import { baseContent } from "../../data/mock/baseContent";
import { basePCExercises, basePCFlashcards, basePCQuizzes, basePCRevisionSheets } from "../../data/mock/basePCContent";
import { basePCHardExercises } from "../../data/mock/basePCHardExercises";
import { baseSMMathExercises } from "../../data/mock/baseSMMathExercises";
import { baseSMPCExercises } from "../../data/mock/baseSMPCExercises";
import { base2BacHumanExercises } from "../../data/mock/base2BacHumanExercises";
import { extended2BacExercises } from "../../data/mock/base2BacHumanExercisesExtended";
import { base2BacSPMathLessonExercises } from "../../data/mock/base2BacSPMathLessonExercises";
import { base2BacSMLimitExercises } from "../../data/mock/base2BacSMLimitExercises";
import { base2BacSMSequenceLimitLessonExercises } from "../../data/mock/base2BacSMSequenceLimitLessonExercises";
import { base2BacSMSequencesLessonExercises } from "../../data/mock/base2BacSMSequencesLessonExercises";
import { base2BacSMPrimitivesExercises } from "../../data/mock/base2BacSMPrimitivesExercises";
import { base2BacSMDerivationExercises } from "../../data/mock/base2BacSMDerivationExercises";
import {
  base2BacSMDerivationLessonExercises,
  base2BacSMPrimitivesLessonExercises,
  base2BacSMProbabilityLessonExercises,
  base2BacSMLogLessonExercises,
  base2BacSMComplexLessonExercises,
  base2BacSMCombinatoricsLessonExercises,
} from "../../data/mock/base2BacSMLessonSpecificExercises";
import { base2BacSMProbabilityExercises } from "../../data/mock/base2BacSMProbabilityExercises";
import { base2BacSMProbabilityCorrections } from "../../data/mock/base2BacSMProbabilityCorrections";
import { base2BacSMLogExercises } from "../../data/mock/base2BacSMLogExercises";
import { base2BacSMComplexExercises } from "../../data/mock/base2BacSMComplexExercises";
import { base2BacSMCombinatoricsExercises } from "../../data/mock/base2BacSMCombinatoricsExercises";
import { base2BacSMExponentialExercises } from "../../data/mock/base2BacSMExponentialExercises";
import { base2BacSMDifferentialEquationsExercises } from "../../data/mock/base2BacSMDifferentialEquationsExercises";
import { base2BacSMIntegralExercises } from "../../data/mock/base2BacSMIntegralExercises";
import { base2BacSMSpaceGeometryExercises } from "../../data/mock/base2BacSMSpaceGeometryExercises";
import { helios300MathExercises } from "../../data/mock/helios300MathExercises";
import type { Exercise, Flashcard, Quiz, RevisionSheet } from "../../types/content";
import type { SubjectId, TrackId } from "../../types/academic";

const allFlashcards: Flashcard[] = [...baseContent.flashcards, ...basePCFlashcards];
const allExercises: Exercise[] = [
  ...basePCExercises,
  ...basePCHardExercises,
  ...baseSMMathExercises,
  ...baseSMPCExercises,
  ...base2BacHumanExercises,
  ...extended2BacExercises,
  ...base2BacSPMathLessonExercises,
  ...base2BacSMLimitExercises,
  ...base2BacSMSequenceLimitLessonExercises,
  ...base2BacSMSequencesLessonExercises,
  ...base2BacSMPrimitivesExercises,
  ...base2BacSMDerivationExercises,
  ...base2BacSMDerivationLessonExercises,
  ...base2BacSMPrimitivesLessonExercises,
  ...base2BacSMProbabilityExercises.filter((exercise) => !["sm-prob-13", "sm-prob-21"].includes(exercise.id)),
  ...base2BacSMProbabilityCorrections,
  ...base2BacSMProbabilityLessonExercises,
  ...base2BacSMLogExercises,
  ...base2BacSMLogLessonExercises,
  ...base2BacSMComplexExercises,
  ...base2BacSMComplexLessonExercises,
  ...base2BacSMCombinatoricsExercises,
  ...base2BacSMCombinatoricsLessonExercises,
  ...base2BacSMExponentialExercises,
  ...base2BacSMDifferentialEquationsExercises,
  ...base2BacSMIntegralExercises,
  ...base2BacSMSpaceGeometryExercises,
  ...helios300MathExercises,
];
const allQuizzes: Quiz[] = [...baseContent.quizzes, ...basePCQuizzes];
const allRevisionSheets: RevisionSheet[] = [...baseContent.revisionSheets, ...basePCRevisionSheets];

type TargetedItem = {
  target: { trackIds: readonly TrackId[]; subjectId: SubjectId; chapter: string; topic: string };
};

const matchesTarget = (trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) =>
  (item: TargetedItem) =>
    item.target.trackIds.includes(trackId) &&
    item.target.subjectId === subjectId &&
    (!chapter || item.target.chapter === chapter) &&
    (!topic || item.target.topic === topic);

export const contentCatalogService = {
  getBaseFlashcards: (trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) =>
    allFlashcards.filter(matchesTarget(trackId, subjectId, chapter, topic)),

  getBaseExercises: (trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) =>
    allExercises.filter(matchesTarget(trackId, subjectId, chapter, topic)),

  getBaseQuizzes: (trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) =>
    allQuizzes.filter(matchesTarget(trackId, subjectId, chapter, topic)),

  getBaseRevisionSheets: (trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) =>
    allRevisionSheets.filter(matchesTarget(trackId, subjectId, chapter, topic)),

  getCounts(trackId: TrackId, subjectId: SubjectId) {
    return {
      flashcards: this.getBaseFlashcards(trackId, subjectId).length,
      exercises: this.getBaseExercises(trackId, subjectId).length,
      quizzes: this.getBaseQuizzes(trackId, subjectId).length,
      revisionSheets: this.getBaseRevisionSheets(trackId, subjectId).length,
    };
  },
};
