export interface FocusSessionInput {
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  mode: "free" | "pomodoro";
  subjectId?: string;
  groupId?: string;
}

export const focusService = {
  async save(_session: FocusSessionInput) {
    return { saved: false, reason: "Focus persistence stays behind the service boundary in foundation phase." } as const;
  },
};
