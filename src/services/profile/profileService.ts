import type { StudentProfile } from "../../types/academic";

export const profileService = {
  async getById(_id: string): Promise<StudentProfile | null> {
    return null;
  },
  async savePreferences(_profile: Partial<StudentProfile>): Promise<{ saved: boolean }> {
    return { saved: false };
  },
};
