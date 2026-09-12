import type { Exercise } from "../../types/content";
import { buildExercise, cases } from "./smPhysics300Generator";

const exercises: Exercise[] = [];
for (let index = 1; index <= 300; index += 1) {
  const template = cases[(index - 1) % cases.length];
  const variant = Math.floor((index - 1) / cases.length);
  exercises.push(buildExercise(index, template, variant));
}

export const smPhysics300Exercises = exercises;

if (smPhysics300Exercises.length !== 300) {
  throw new Error(`Expected 300 physical-sciences exercises, got ${smPhysics300Exercises.length}`);
}
