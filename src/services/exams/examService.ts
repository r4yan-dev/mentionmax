export interface ExamDescriptor {
  id: string;
  title: string;
  subjectId: string;
  year: number | null;
  session: string | null;
  source: "OFFICIAL" | "APPROVED" | "AI_GENERATED" | "USER_CREATED";
}

export const examService = {
  async list(): Promise<ExamDescriptor[]> {
    return [];
  },
  async getById(_id: string): Promise<ExamDescriptor | null> {
    return null;
  },
};
