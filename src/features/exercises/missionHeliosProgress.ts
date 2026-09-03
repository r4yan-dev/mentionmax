import { supabase } from "../../lib/supabase";

export type MissionHeliosProgress = {
  exercise_id: string;
  answers: string[];
  completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

export async function getMissionHeliosProgress(exerciseId: string) {
  const { data, error } = await supabase
    .from("mission_helios_progress")
    .select("exercise_id, answers, completed, completed_at, updated_at")
    .eq("exercise_id", exerciseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    ...(data as MissionHeliosProgress),
    answers: Array.isArray(data.answers) ? data.answers.map(String) : [],
  };
}

export async function saveMissionHeliosProgress(
  exerciseId: string,
  answers: string[],
  completed: boolean,
) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non authentifié");

  const { data, error } = await supabase
    .from("mission_helios_progress")
    .upsert(
      {
        user_id: userData.user.id,
        exercise_id: exerciseId,
        answers,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,exercise_id" },
    )
    .select("exercise_id, answers, completed, completed_at, updated_at")
    .single();

  if (error) throw error;

  return {
    ...(data as MissionHeliosProgress),
    answers: Array.isArray(data.answers) ? data.answers.map(String) : [],
  };
}

export async function getMissionHeliosDayProgress(exerciseIds: string[]) {
  if (!exerciseIds.length) return [];

  const { data, error } = await supabase
    .from("mission_helios_progress")
    .select("exercise_id, answers, completed, completed_at, updated_at")
    .in("exercise_id", exerciseIds);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    ...(row as MissionHeliosProgress),
    answers: Array.isArray(row.answers) ? row.answers.map(String) : [],
  }));
}
