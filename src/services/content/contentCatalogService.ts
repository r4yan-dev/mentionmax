import { baseContent } from "../../data/mock/baseContent";
import { basePCExercises, basePCFlashcards, basePCQuizzes, basePCRevisionSheets } from "../../data/mock/basePCContent";
import { basePCHardExercises } from "../../data/mock/basePCHardExercises";
import { baseSMMathExercises } from "../../data/mock/baseSMMathExercises";
import { baseSMPCExercises } from "../../data/mock/baseSMPCExercises";
import { base2BacHumanExercises } from "../../data/mock/base2BacHumanExercises";
import { extended2BacExercises } from "../../data/mock/base2BacHumanExercisesExtended";
import { base2BacSPMathExercises } from "../../data/mock/base2BacSPMathExercises";
import { helios300MathExercises } from "../../data/mock/helios300MathExercises";
import type { Exercise, Flashcard, Quiz, RevisionSheet } from "../../types/content";
import type { SubjectId, TrackId } from "../../types/academic";

const allBaseFlashcards: Flashcard[] = [...baseContent.flashcards, ...basePCFlashcards];
const allBaseExercises: Exercise[] = [
  ...basePCExercises,
  ...basePCHardExercises,
  ...baseSMMathExercises,
  ...baseSMPCExercises,
  ...base2BacHumanExercises,
  ...extended2BacExercises,
  ...base2BacSPMathExercises,
  ...helios300MathExercises,
];
const allBaseQuizzes: Quiz[] = [...baseContent.quizzes, ...basePCQuizzes];
const allBaseRevisionSheets: RevisionSheet[] = [...baseContent.revisionSheets, ...basePCRevisionSheets];

function matchesTarget(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) {
  return (item: { target: { trackIds: TrackId[]; subjectId: SubjectId; chapter: string; topic: string } }) =>
    item.target.trackIds.includes(trackId) &&
    item.target.subjectId === subjectId &&
    (!chapter || item.target.chapter === chapter) &&
    (!topic || item.target.topic === topic);
}

export const contentCatalogService = {
  getBaseFlashcards(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): Flashcard[] {
    return allBaseFlashcards.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },
  getBaseExercises(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): Exercise[] {
    return allBaseExercises.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },
  getBaseQuizzes(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): Quiz[] {
    return allBaseQuizzes.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },
  getBaseRevisionSheets(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): RevisionSheet[] {
    return allBaseRevisionSheets.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },
  getCounts(trackId: TrackId, subjectId: SubjectId) {
    return {
      flashcards: this.getBaseFlashcards(trackId, subjectId).length,
      exercises: this.getBaseExercises(trackId, subjectId).length,
      quizzes: this.getBaseQuizzes(trackId, subjectId).length,
      revisionSheets: this.getBaseRevisionSheets(trackId, subjectId).length,
    };
  },
};
