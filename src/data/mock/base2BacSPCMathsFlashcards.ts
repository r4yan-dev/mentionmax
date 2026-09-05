import type { Flashcard } from "../../types/content";
import { base2BacSPCMathsLimitsFlashcards } from "./base2BacSPCMathsFlashcardsLimits";
import { base2BacSPCMathsDerivationFlashcards } from "./base2BacSPCMathsFlashcardsDerivation";
import { base2BacSPCMathsFunctionsFlashcards } from "./base2BacSPCMathsFlashcardsFunctions";
import { base2BacSPCMathsSequencesFlashcards } from "./base2BacSPCMathsFlashcardsSequences";
import { base2BacSPCMathsRootsPrimitivesFlashcards } from "./base2BacSPCMathsFlashcardsRootsPrimitives";
import { base2BacSPCMathsLogComplexFlashcards } from "./base2BacSPCMathsFlashcardsLogComplex";

export const base2BacSPCMathsFlashcards: Flashcard[] = [
  ...base2BacSPCMathsLimitsFlashcards,
  ...base2BacSPCMathsDerivationFlashcards,
  ...base2BacSPCMathsFunctionsFlashcards,
  ...base2BacSPCMathsSequencesFlashcards,
  ...base2BacSPCMathsRootsPrimitivesFlashcards,
  ...base2BacSPCMathsLogComplexFlashcards,
];
