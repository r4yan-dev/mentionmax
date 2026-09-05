import type { Exercise } from "../../types/content";
import { base2BacSMDerivationExercises } from "./base2BacSMDerivationExercises";
import { base2BacSMPrimitivesExercises } from "./base2BacSMPrimitivesExercises";
import { base2BacSMProbabilityExercises } from "./base2BacSMProbabilityExercises";
import { base2BacSMLogExercises } from "./base2BacSMLogExercises";
import { base2BacSMComplexExercises } from "./base2BacSMComplexExercises";
import { base2BacSMCombinatoricsExercises } from "./base2BacSMCombinatoricsExercises";

const retarget = (items: Exercise[], topic: string, prefix: string): Exercise[] =>
  items.slice(0, 20).map((exercise) => ({
    ...exercise,
    id: `${prefix}-${exercise.id}`,
    target: { ...exercise.target, topic },
  }));

export const base2BacSMDerivationLessonExercises = retarget(
  base2BacSMDerivationExercises,
  "Dérivation",
  "lesson-deriv",
);

export const base2BacSMPrimitivesLessonExercises = retarget(
  base2BacSMPrimitivesExercises,
  "Primitives et calcul intégral",
  "lesson-prim",
);

export const base2BacSMProbabilityLessonExercises = retarget(
  base2BacSMProbabilityExercises,
  "Probabilités",
  "lesson-prob",
);

export const base2BacSMLogLessonExercises = retarget(
  base2BacSMLogExercises,
  "Fonctions logarithmes",
  "lesson-log",
);

export const base2BacSMComplexLessonExercises = retarget(
  base2BacSMComplexExercises,
  "Nombres complexes",
  "lesson-complex",
);

export const base2BacSMCombinatoricsLessonExercises = retarget(
  base2BacSMCombinatoricsExercises,
  "Principe multiplicatif, arrangements, permutations, combinaisons et tirages",
  "lesson-comb",
);
