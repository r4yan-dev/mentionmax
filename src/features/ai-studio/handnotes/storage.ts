import type { HandnoteSet } from "../types";

const STORAGE_KEY =
  "mentionmax:handnotes:v1";

export function getSavedHandnotes(): HandnoteSet[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as HandnoteSet[];
  } catch (error) {
    console.error(
      "Failed to read saved handnotes:",
      error
    );

    return [];
  }
}

export function saveHandnotes(
  handnotes: HandnoteSet
): void {
  try {
    const existing =
      getSavedHandnotes();

    const next = [
      handnotes,
      ...existing.filter(
        (item) =>
          item.id !== handnotes.id
      ),
    ].slice(0, 50);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );
  } catch (error) {
    console.error(
      "Failed to save handnotes:",
      error
    );

    throw new Error(
      "Impossible d'enregistrer les handnotes."
    );
  }
}

export function deleteHandnotes(
  id: string
): void {
  try {
    const next =
      getSavedHandnotes().filter(
        (item) => item.id !== id
      );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(next)
    );
  } catch (error) {
    console.error(
      "Failed to delete handnotes:",
      error
    );

    throw new Error(
      "Impossible de supprimer les handnotes."
    );
  }
}

export function clearSavedHandnotes(): void {
  localStorage.removeItem(
    STORAGE_KEY
  );
}
