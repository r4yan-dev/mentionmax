import type { Exercise } from "../../types/content";
import { base2BacSMSequenceLimitLessonExercises } from "./base2BacSMSequenceLimitLessonExercises";
import { base2BacSMSequencesLessonExercises } from "./base2BacSMSequencesLessonExercises";
import {
  base2BacSMDerivationLessonExercises,
  base2BacSMPrimitivesLessonExercises,
  base2BacSMProbabilityLessonExercises,
  base2BacSMLogLessonExercises,
  base2BacSMComplexLessonExercises,
  base2BacSMCombinatoricsLessonExercises,
} from "./base2BacSMLessonSpecificExercises";
import { base2BacSMExponentialExercises } from "./base2BacSMExponentialExercises";
import { base2BacSMDifferentialEquationsExercises } from "./base2BacSMDifferentialEquationsExercises";
import { base2BacSMIntegralExercises } from "./base2BacSMIntegralExercises";
import { base2BacSMSpaceGeometryExercises } from "./base2BacSMSpaceGeometryExercises";

const toSP = (items: Exercise[], prefix: string): Exercise[] =>
  items.slice(0, 20).map((exercise) => ({
    ...exercise,
    id: `sp-${prefix}-${exercise.id}`,
    target: { ...exercise.target, trackIds: ["SP"] as const },
    tags: [...exercise.tags.filter((tag) => tag !== "2BAC SM"), "2BAC SP", "2BAC Sciences Physiques"],
  }));

export const base2BacSPMathLessonExercises: Exercise[] = [
  ...toSP(base2BacSMSequenceLimitLessonExercises, "seqlimit"),
  ...toSP(base2BacSMSequencesLessonExercises, "sequences"),
  ...toSP(base2BacSMDerivationLessonExercises, "derivation"),
  ...toSP(base2BacSMPrimitivesLessonExercises, "primitives"),
  ...toSP(base2BacSMProbabilityLessonExercises, "probabilities"),
  ...toSP(base2BacSMLogLessonExercises, "log"),
  ...toSP(base2BacSMComplexLessonExercises, "complex"),
  ...toSP(base2BacSMCombinatoricsLessonExercises, "combinatorics"),
  ...toSP(base2BacSMExponentialExercises, "exponential"),
  ...toSP(base2BacSMDifferentialEquationsExercises, "differential"),
  ...toSP(base2BacSMIntegralExercises, "integral"),
  ...toSP(base2BacSMSpaceGeometryExercises, "space"),
];
