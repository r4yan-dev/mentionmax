import type { LessonDocument, SubjectId, TrackId } from "../../types/academic";
import { secondBacLessons } from "../../data/curriculum/secondBac";

const lessons: LessonDocument[] = secondBacLessons;

export const lessonService = {
  list(subjectId?: SubjectId, trackId?: TrackId): LessonDocument[] {
    return lessons.filter((lesson) => {
      if (subjectId && lesson.subjectId !== subjectId) return false;
      if (trackId === "SMB" && lesson.subjectId === "svt") return false;
      return true;
    });
  },
  getById(id: string): LessonDocument | null {
    return lessons.find((lesson) => lesson.id === id) ?? null;
  },
};
