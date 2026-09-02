import { baseContent } from "../../data/mock/baseContent";
import type { Exercise, Flashcard, Quiz, RevisionSheet } from "../../types/content";
import type { SubjectId, TrackId } from "../../types/academic";

function matchesTarget(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string) {
  return (item: { target: { trackIds: TrackId[]; subjectId: SubjectId; chapter: string; topic: string } }) =>
    item.target.trackIds.includes(trackId) &&
    item.target.subjectId === subjectId &&
    (!chapter || item.target.chapter === chapter) &&
    (!topic || item.target.topic === topic);
}

export const contentCatalogService = {
  getBaseFlashcards(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): Flashcard[] {
    return baseContent.flashcards.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },

  getBaseExercises(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): Exercise[] {
    return baseContent.exercises.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },

  getBaseQuizzes(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): Quiz[] {
    return baseContent.quizzes.filter(matchesTarget(trackId, subjectId, chapter, topic));
  },

  getBaseRevisionSheets(trackId: TrackId, subjectId: SubjectId, chapter?: string, topic?: string): RevisionSheet[] {
    return baseContent.revisionSheets.filter(matchesTarget(trackId, subjectId, chapter, topic));
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
