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

type SaveInput = {
  resourceType: LibraryResourceType;
  title: string;
  subject?: string | null;
  chapter?: string | null;
  sourceType?: string | null;
  sourceRef?: string | null;
  content: Record<string, unknown>;
};

const saveQueues = new Map<string, Promise<PersonalLibraryItem>>();

function saveKey(userId: string, input: SaveInput) {
  return JSON.stringify([
    userId,
    input.resourceType,
    input.title.trim(),
    input.subject?.trim() || null,
    input.chapter?.trim() || null,
    input.sourceType ?? null,
    input.sourceRef ?? null,
    input.content,
  ]);
}

export async function saveToPersonalLibrary(input: SaveInput) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Connecte-toi pour sauvegarder cette ressource.");

  const key = saveKey(user.id, input);
  const previous = saveQueues.get(key) ?? Promise.resolve({} as PersonalLibraryItem);

  const operation = previous
    .catch(() => ({} as PersonalLibraryItem))
    .then(async () => {
      const { data: candidates, error: lookupError } = await supabase
        .from("personal_library_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("resource_type", input.resourceType)
        .eq("title", input.title)
        .eq("subject", input.subject ?? null)
        .eq("chapter", input.chapter ?? null)
        .eq("source_type", input.sourceType ?? null)
        .eq("source_ref", input.sourceRef ?? null)
        .order("created_at", { ascending: false })
        .limit(10);

      if (lookupError) throw lookupError;

      const existing = (candidates ?? []).find((item) => JSON.stringify(item.content) === JSON.stringify(input.content));
      if (existing) {
        const { error } = await supabase
          .from("personal_library_items")
          .delete()
          .eq("id", existing.id);
        if (error) throw error;
        return existing as PersonalLibraryItem;
      }

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
    });

  saveQueues.set(key, operation);
  try {
    return await operation;
  } finally {
    if (saveQueues.get(key) === operation) saveQueues.delete(key);
  }
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
