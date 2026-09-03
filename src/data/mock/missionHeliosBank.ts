import { helios300MathExercises } from "./helios300MathExercises";
import { missionHeliosDay01Exercises } from "./missionHeliosDay01";

export const missionHeliosExercises = [
  ...missionHeliosDay01Exercises,
  ...helios300MathExercises.filter((exercise) => exercise.missionDay !== 1),
];

if (import.meta.env.DEV && missionHeliosExercises.length !== 300) {
  console.error(`Mission Helios must contain exactly 300 exercises. Found ${missionHeliosExercises.length}.`);
}

export const missionHeliosById = new Map(
  missionHeliosExercises.map((exercise) => [exercise.id, exercise]),
);

export const missionHeliosByDay = new Map<number, typeof missionHeliosExercises>(
  Array.from({ length: 15 }, (_, index) => {
    const day = index + 1;
    return [day, missionHeliosExercises.filter((exercise) => exercise.missionDay === day)];
  }),
);
