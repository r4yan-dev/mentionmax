import type { LessonDocument, SubjectId, TrackId } from "../../types/academic";
import { secondBacLessons } from "../../data/curriculum/secondBac";
import { secondBacMathLesson2 } from "../../data/curriculum/secondBacMathLesson2";
import { secondBacMathSequencesLesson } from "../../data/curriculum/secondBacMathSequencesLesson";
import { secondBacMathPrimitivesLesson } from "../../data/curriculum/secondBacMathPrimitivesLesson";
import { secondBacMathDerivationLesson } from "../../data/curriculum/secondBacMathDerivationLesson";
import { secondBacPcLessonsLong } from "./pcLessonsLong";
import { secondBacSvtLessons, secondBacEnglishLessons, secondBacPhilosophyLessons } from "../../data/curriculum/secondBacHumanLessons";

const dedicatedMathLessonIds = new Set([
  "2bac-maths-sequences",
  "2bac-maths-derivation",
  "2bac-maths-primitives",
]);

const lessons: LessonDocument[] = [
  ...secondBacLessons.filter(
    (lesson) => lesson.subjectId !== "physique-chimie" && !dedicatedMathLessonIds.has(lesson.id),
  ),
  secondBacMathSequencesLesson,
  secondBacMathDerivationLesson,
  secondBacMathPrimitivesLesson,
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
