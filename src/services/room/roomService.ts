export interface RoomInactivityPolicy {
  daysRemaining: number;
  inactiveAfterDays: number;
}

export const roomService = {
  inactivityPolicy: [
    { daysRemaining: 240, inactiveAfterDays: 15 },
    { daysRemaining: 30, inactiveAfterDays: 5 },
  ] as RoomInactivityPolicy[],
  async list() {
    return [] as unknown[];
  },
};
