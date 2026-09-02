export const appConfig = {
  productName: "MentionMax",
  locale: "fr-MA",
  bacDate: "2027-06-06T08:00:00+01:00",
  targetTracks: ["SP", "SMA", "SMB"] as const,
  homeWidgetStorageKey: "mentionmax.home.widgets.v1",
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
} as const;

export function daysUntilBac(now = new Date()): number {
  const target = new Date(appConfig.bacDate).getTime();
  return Math.max(0, Math.ceil((target - now.getTime()) / 86_400_000));
}
