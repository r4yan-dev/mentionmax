import { supabase } from "../lib/supabase";

export type Track = "SPC" | "SM";

export type SchoolSection = "A" | "B" | null;

export interface SchoolProfile {
  track: Track;
  section: SchoolSection;
}

export async function loadSchoolProfile(): Promise<
  SchoolProfile | null
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      `Auth: ${userError.message}`
    );
  }

  if (!user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const { data, error } =
    await supabase
      .from("school_preferences")
      .select("track, section")
      .eq("user_id", user.id)
      .maybeSingle();

  if (error) {
    throw new Error(
      `Lecture Supabase: ${error.message}`
    );
  }

  if (!data) {
    return null;
  }

  return {
    track: data.track as Track,
    section:
      data.section === "A" ||
      data.section === "B"
        ? data.section
        : null,
  };
}

export async function saveSchoolProfile(
  profile: SchoolProfile
): Promise<SchoolProfile> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      `Auth: ${userError.message}`
    );
  }

  if (!user) {
    throw new Error(
      "Utilisateur non connecté."
    );
  }

  const section =
    profile.track === "SPC"
      ? null
      : profile.section;

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_school_preferences",
    {
      p_track: profile.track,
      p_section: section,
    }
  );

  if (error) {
    console.error(
      "Supabase RPC error",
      error
    );

    throw new Error(
      `Sauvegarde Supabase: ${error.message}`
    );
  }

  if (!data) {
    throw new Error(
      "Supabase: réponse vide."
    );
  }

  return {
    track: data.track as Track,
    section:
      data.section === "A" ||
      data.section === "B"
        ? data.section
        : null,
  };
}
