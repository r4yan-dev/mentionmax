import { supabase } from "./supabase";

export type LibraryResourceType = "handnote" | "summary" | "flashcards" | "quiz";

export type PersonalLibraryItem = {
  id: string;
  user_id: string;
  resource_type: LibraryResourceType;
  title: string;
  subject: string | null;
  chapter: string | null;
  source_type: string | null;
  source_ref: string | null;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export async function saveToPersonalLibrary(input: {
  resourceType: LibraryResourceType;
  title: string;
  subject?: string | null;
  chapter?: string | null;
  sourceType?: string | null;
  sourceRef?: string | null;
  content: Record<string, unknown>;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Connecte-toi pour sauvegarder cette ressource.");

  const { data, error } = await supabase
    .from("personal_library_items")
    .insert({
      user_id: user.id,
      resource_type: input.resourceType,
      title: input.title,
      subject: input.subject ?? null,
      chapter: input.chapter ?? null,
      source_type: input.sourceType ?? null,
      source_ref: input.sourceRef ?? null,
      content: input.content,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as PersonalLibraryItem;
}

export async function listPersonalLibrary() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("personal_library_items")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PersonalLibraryItem[];
}

export async function deletePersonalLibraryItem(id: string) {
  const { error } = await supabase
    .from("personal_library_items")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
