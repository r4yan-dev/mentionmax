export type HomeWidgetId =
  | "objective"
  | "trajectory"
  | "continue"
  | "weakest"
  | "focus"
  | "xp"
  | "leaderboard"
  | "friends"
  | "countdown";

export const defaultHomeWidgets: HomeWidgetId[] = [
  "objective",
  "trajectory",
  "continue",
  "weakest",
  "focus",
  "xp",
  "leaderboard",
  "friends",
  "countdown",
];

export function loadHomeWidgets(storageKey: string): HomeWidgetId[] {
  if (typeof window === "undefined") return defaultHomeWidgets;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return defaultHomeWidgets;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((id) => typeof id !== "string")) return defaultHomeWidgets;
    return parsed.filter((id): id is HomeWidgetId => defaultHomeWidgets.includes(id as HomeWidgetId));
  } catch {
    return defaultHomeWidgets;
  }
}

export function saveHomeWidgets(storageKey: string, widgets: HomeWidgetId[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey, JSON.stringify(widgets));
}
