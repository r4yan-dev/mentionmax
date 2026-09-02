export type LeaderboardMetric = "xp" | "focus" | "exercises";
export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all-time";

export const leaderboardService = {
  async get(metric: LeaderboardMetric, period: LeaderboardPeriod) {
    return { metric, period, entries: [] as unknown[] };
  },
};
