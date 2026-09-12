import type { SubjectId, TrackId } from "./academic";

export type ContentMode = "BASE" | "PERSONALIZED";

export type ExerciseType =
  | "mcq"
  | "numeric"
  | "short-answer"
  | "proof"
  | "calculation"
  | "document-analysis"
  | "multi-step";

export type ContentDifficulty = 1 | 2 | 3 | 4 | 5;

export interface ContentTarget {
  trackIds: readonly TrackId[];
  subjectId: SubjectId;
  chapter: string;
  topic: string;
  conceptIds?: string[];
}

export interface ExerciseGraphPoint {
  x: number;
  y: number;
  label?: string;
}

export interface ExerciseGraphCurve {
  points: ExerciseGraphPoint[];
  label?: string;
  dashed?: boolean;
}

export interface ExerciseSchemeNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface ExerciseSchemeLink {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export type ExerciseVisual =
  | {
      kind: "graph";
      title?: string;
      ariaLabel?: string;
      xLabel?: string;
      yLabel?: string;
      xMin?: number;
      xMax?: number;
      yMin?: number;
      yMax?: number;
      curves?: ExerciseGraphCurve[];
      points?: ExerciseGraphPoint[];
    }
  | {
      kind: "scheme";
      title?: string;
      ariaLabel?: string;
      nodes: ExerciseSchemeNode[];
      links: ExerciseSchemeLink[];
    };

export interface ExerciseSubQuestion {
  id: string;
  label: string;
  prompt: string;
  correction?: string;
}

export interface ExerciseQuestion {
  id: string;
  number: number;
  prompt?: string;
  subQuestions: ExerciseSubQuestion[];
}

export interface ExercisePart {
  id: string;
  number: 1 | 2;
  title: string;
  introduction?: string;
  questions: ExerciseQuestion[];
  visual?: ExerciseVisual;
}

export interface Flashcard {
  id: string;
  mode: ContentMode;
  source: "OFFICIAL" | "APPROVED" | "AI_GENERATED" | "USER_CREATED";
  target: ContentTarget;
  front: string;
  back: string;
  hint?: string;
  tags: string[];
  difficulty: ContentDifficulty;
}

export interface ExerciseOption {
  id: string;
  label: string;
}

export interface Exercise {
  id: string;
  mode: ContentMode;
  source: "OFFICIAL" | "APPROVED" | "AI_GENERATED" | "USER_CREATED";
  target: ContentTarget;
  type: ExerciseType;
  difficulty: ContentDifficulty;
  title: string;
  statement: string;
  options?: ExerciseOption[];
  expectedAnswer?: string;
  acceptedAnswers?: string[];
  correction: string;
  hint?: string;
  examTip?: string;
  estimatedMinutes: number;
  xpValue: number;
  tags: string[];
  visual?: ExerciseVisual;
  parts?: ExercisePart[];
}

export interface Quiz {
  id: string;
  mode: ContentMode;
  source: Flashcard["source"];
  target: ContentTarget;
  title: string;
  description: string;
  itemIds: string[];
  estimatedMinutes: number;
}

export interface RevisionSheet {
  id: string;
  mode: ContentMode;
  source: Flashcard["source"];
  target: ContentTarget;
  title: string;
  summary: string;
  keyPoints: string[];
  formulaIds?: string[];
}

export interface DiagnosticQuestion {
  id: string;
  target: ContentTarget;
  type: ExerciseType;
  difficulty: ContentDifficulty;
  statement: string;
  acceptedAnswers?: string[];
  options?: ExerciseOption[];
  correctAnswer: string;
  skillId?: string;
}

export interface NationalExamQuestionRef {
  id: string;
  year: number;
  session: "normale" | "rattrapage";
  subjectId: SubjectId;
  chapter?: string;
  exerciseLabel: string;
  questionLabel: string;
  source: "OFFICIAL";
}

export interface PersonalizedContentRequest {
  studentId: string;
  trackId: TrackId;
  subjectId: SubjectId;
  chapter?: string;
  topic?: string;
  conceptIds?: string[];
  difficulty?: ContentDifficulty;
  weaknessFirst?: boolean;
  count: number;
}
