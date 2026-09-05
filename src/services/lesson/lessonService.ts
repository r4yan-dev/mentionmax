import type { LessonDocument, SubjectId, TrackId } from "../../types/academic";
import { secondBacLessons } from "../../data/curriculum/secondBac";
import { secondBacMathLesson2 } from "../../data/curriculum/secondBacMathLesson2";
import { secondBacMathSequencesLesson } from "../../data/curriculum/secondBacMathSequencesLesson";
import { secondBacMathPrimitivesLesson } from "../../data/curriculum/secondBacMathPrimitivesLesson";
import { secondBacMathDerivationLesson } from "../../data/curriculum/secondBacMathDerivationLesson";
import { secondBacMathProbabilityLesson } from "../../data/curriculum/secondBacMathProbabilityLesson";
import { secondBacMathLogLesson } from "../../data/curriculum/secondBacMathLogLesson";
import { secondBacMathComplexesLesson } from "../../data/curriculum/secondBacMathComplexesLesson";
import { secondBacMathExponentialLesson } from "../../data/curriculum/secondBacMathExponentialLesson";
import { secondBacMathDifferentialEquationsLesson } from "../../data/curriculum/secondBacMathDifferentialEquationsLesson";
import { secondBacMathIntegralLesson } from "../../data/curriculum/secondBacMathIntegralLesson";
import { secondBacMathSpaceGeometryLesson } from "../../data/curriculum/secondBacMathSpaceGeometryLesson";
import { secondBacMathCombinatoricsLesson } from "../../data/curriculum/secondBacMathCombinatoricsLesson";
import { secondBacPcLessonsLong } from "./pcLessonsLong";
import { secondBacSvtLessons, secondBacEnglishLessons } from "../../data/curriculum/secondBacHumanLessons";

const dedicatedMathLessonIds = new Set([
  "2bac-maths-sequences",
  "2bac-maths-derivation",
  "2bac-maths-primitives",
  "2bac-maths-probabilities",
  "2bac-maths-log",
  "2bac-maths-complexes",
  "2bac-maths-exp",
  "2bac-maths-differential-equations",
]);

const lessons: LessonDocument[] = [
  ...secondBacLessons.filter(
    (lesson) =>
      lesson.subjectId !== "physique-chimie" &&
      lesson.subjectId !== "philosophie" &&
      !dedicatedMathLessonIds.has(lesson.id),
  ),
  secondBacMathSequencesLesson,
  secondBacMathDerivationLesson,
  secondBacMathPrimitivesLesson,
  secondBacMathProbabilityLesson,
  secondBacMathLogLesson,
  secondBacMathComplexesLesson,
  secondBacMathExponentialLesson,
  secondBacMathDifferentialEquationsLesson,
  secondBacMathIntegralLesson,
  secondBacMathSpaceGeometryLesson,
  secondBacMathCombinatoricsLesson,
  secondBacMathLesson2,
  ...secondBacPcLessonsLong.slice(0, 14),
  ...secondBacSvtLessons,
  ...secondBacEnglishLessons,
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
