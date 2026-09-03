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
};

export async function getMissionHeliosChapter(day: number) {
  const { data, error } = await supabase
    .from("mission_helios_chapters")
    .select("id, day, chapter_number, title, mission_context, exercise_count")
    .eq("day", day)
    .single();

  if (error) throw error;
  return data as MissionHeliosChapter;
}

export async function getMissionHeliosExercises(day: number) {
  const chapter = await getMissionHeliosChapter(day);

  const { data, error } = await supabase
    .from("mission_helios_exercises")
    .select(
      "id, chapter_id, exercise_number, title, context, parts, animation, difficulty, is_synthesis"
    )
    .eq("chapter_id", chapter.id)
    .order("exercise_number", { ascending: true });

  if (error) throw error;
  return (data ?? []) as MissionHeliosExercise[];
}

export async function getMissionHeliosDay(day: number) {
  const chapter = await getMissionHeliosChapter(day);
  const { data, error } = await supabase
    .from("mission_helios_exercises")
    .select(
      "id, chapter_id, exercise_number, title, context, parts, animation, difficulty, is_synthesis"
    )
    .eq("chapter_id", chapter.id)
    .order("exercise_number", { ascending: true });

  if (error) throw error;
  return { chapter, exercises: (data ?? []) as MissionHeliosExercise[] };
}
