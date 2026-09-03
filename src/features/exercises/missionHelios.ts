import { supabase } from "../../integrations/supabase/client";

export type MissionHeliosChapter = {
  id: number;
  day: number;
  chapter_number: number;
  title: string;
  mission_context: string;
  exercise_count: number;
};

export type MissionHeliosExercise = {
  id: number;
  chapter_id: number;
  exercise_number: number;
  title: string;
  context: string;
  parts: string[];
  animation: string;
  difficulty: number;
  is_synthesis: boolean;
  chapter: MissionHeliosChapter;
};

const chapterFields = "id, day, chapter_number, title, mission_context, exercise_count";
const exerciseFields = "id, chapter_id, exercise_number, title, context, parts, animation, difficulty, is_synthesis";

export async function getMissionHeliosChapter(day: number) {
  const { data, error } = await supabase
    .from("mission_helios_chapters")
    .select(chapterFields)
    .eq("day", day)
    .single();

  if (error) throw error;
  return data as MissionHeliosChapter;
}

export async function getMissionHeliosExercises(day?: number) {
  const chaptersQuery = supabase
    .from("mission_helios_chapters")
    .select(chapterFields)
    .order("day", { ascending: true });

  const exercisesQuery = supabase
    .from("mission_helios_exercises")
    .select(exerciseFields)
    .order("chapter_id", { ascending: true })
    .order("exercise_number", { ascending: true });

  const [{ data: chapters, error: chaptersError }, { data: exercises, error: exercisesError }] =
    await Promise.all([
      day === undefined ? chaptersQuery : chaptersQuery.eq("day", day),
      exercisesQuery,
    ]);

  if (chaptersError) throw chaptersError;
  if (exercisesError) throw exercisesError;

  const chapterById = new Map((chapters ?? []).map((chapter) => [chapter.id, chapter as MissionHeliosChapter]));
  return (exercises ?? [])
    .filter((exercise) => chapterById.has(exercise.chapter_id))
    .map((exercise) => ({
      ...(exercise as Omit<MissionHeliosExercise, "chapter">),
      chapter: chapterById.get(exercise.chapter_id)!,
    }));
}

export async function getMissionHeliosDay(day: number) {
  const chapter = await getMissionHeliosChapter(day);
  const exercises = await getMissionHeliosExercises(day);
  return { chapter, exercises };
}
