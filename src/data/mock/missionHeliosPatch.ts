import { helios300MathExercises } from "./helios300MathExercises";
import { missionHeliosDay01Exercises } from "./missionHeliosDay01";

// Keep one canonical array so every existing consumer automatically sees the
// authored Day 01 content without having to duplicate the 300-exercise file.
helios300MathExercises.splice(0, 20, ...missionHeliosDay01Exercises);

if (import.meta.env.DEV) {
  const uniqueIds = new Set(helios300MathExercises.map((exercise) => exercise.id));
  if (helios300MathExercises.length !== 300 || uniqueIds.size !== 300) {
    console.error("Mission Helios bank integrity check failed.", {
      length: helios300MathExercises.length,
      uniqueIds: uniqueIds.size,
    });
  }
}
