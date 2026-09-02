export interface DiagnosticDimension {
  subjectId: string;
  chapter: string;
  conceptId: string;
  skill?: string;
  difficulty: 1 | 2 | 3;
}

export const diagnosticService = {
  buildPlan(_dimensions: DiagnosticDimension[]) {
    return [] as DiagnosticDimension[];
  },
};
