import type { LessonDocument, SubjectId, TrackId } from "../../types/academic";
import { secondBacLessons } from "../../data/curriculum/secondBac";
import { secondBacMathLesson2 } from "../../data/curriculum/secondBacMathLesson2";
import { secondBacPcLessonsLong } from "./pcLessonsLong";
import { secondBacSvtLessons, secondBacEnglishLessons, secondBacPhilosophyLessons } from "../../data/curriculum/secondBacHumanLessons";

const lessons: LessonDocument[] = [
  ...secondBacLessons.filter((lesson) => lesson.subjectId !== "physique-chimie"),
  secondBacMathLesson2,
  ...secondBacPcLessonsLong.slice(0, 14),
  ...secondBacSvtLessons,
  ...secondBacEnglishLessons,
  ...secondBacPhilosophyLessons,
];

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
