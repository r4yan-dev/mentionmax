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

const exerciseSelect = `
  id,
  chapter_id,
  exercise_number,
  title,
  context,
  parts,
  animation,
  difficulty,
  is_synthesis,
  chapter:mission_helios_chapters (
    id,
    day,
    chapter_number,
    title,
    mission_context,
    exercise_count
  )
`;

export async function getMissionHeliosChapter(day: number) {
  const { data, error } = await supabase
    .from("mission_helios_chapters")
    .select("id, day, chapter_number, title, mission_context, exercise_count")
    .eq("day", day)
    .single();

  if (error) throw error;
  return data as MissionHeliosChapter;
}

export async function getMissionHeliosExercises(day?: number) {
  let query = supabase
    .from("mission_helios_exercises")
    .select(exerciseSelect)
    .order("chapter_id", { ascending: true })
    .order("exercise_number", { ascending: true });

  if (day !== undefined) {
    const chapter = await getMissionHeliosChapter(day);
    query = query.eq("chapter_id", chapter.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as MissionHeliosExercise[];
}

export async function getMissionHeliosDay(day: number) {
  const exercises = await getMissionHeliosExercises(day);
  const chapter = await getMissionHeliosChapter(day);
  return { chapter, exercises };
}
