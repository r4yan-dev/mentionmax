export type TrackId = "SP" | "SMA" | "SMB";
export type SubjectId = "maths" | "physique-chimie" | "svt" | "anglais" | "philosophie";

export type ResourceKind = "course" | "pdf" | "summary" | "exercise" | "video" | "national-exam" | "correction" | "flashcards" | "ai-revision" | "ai-exercises";
export type ContentSource = "OFFICIAL" | "APPROVED" | "AI_GENERATED" | "USER_CREATED";

export interface Track { id: TrackId; label: string; shortLabel: string; subjects: SubjectId[]; }
export interface Subject { id: SubjectId; name: string; shortName: string; coefficient: number; colorToken: "turquoise" | "deep" | "mint" | "ruby" | "gold"; }
export interface CurriculumNode { id: string; trackIds: TrackId[]; subjectId: SubjectId; chapter: string; topic: string; concept: string; skill?: string; bacRelevance: "low" | "medium" | "high"; resources: CurriculumResource[]; }
export interface CurriculumResource { id: string; kind: ResourceKind; source: ContentSource; title: string; description?: string; href?: string; }
export interface StudentKnowledgeState { studentId: string; subjectId: SubjectId; conceptId: string; mastery: number; confidence: number; attempts: number; correct: number; mistakes: string[]; difficulty: 1 | 2 | 3; lastAttempt: string | null; lastCorrect: string | null; lastReview: string | null; retention: number; bacRelevance: "low" | "medium" | "high"; }
export interface StudentProfile { id: string; displayName: string; avatarUrl: string | null; trackId: TrackId; city: string | null; school: string | null; className: string | null; targetScore: number | null; bacDate: string; }

export interface LessonBlock {
  type: "title" | "page" | "intro" | "concept" | "definition" | "theorem" | "formula" | "method" | "example" | "worked-solution" | "warning" | "common-mistake" | "exam-tip" | "diagram" | "graph" | "comparison" | "exercise" | "recap" | "annotation" | "highlight" | "animation" | "interactive";
  text?: string;
  latex?: string;
  title?: string;
  items?: string[];
  data?: Record<string, unknown>;
}
export interface LessonDocument { id: string; title: string; language: "fr"; source: ContentSource; subjectId: SubjectId; chapter: string; topic: string; blocks: LessonBlock[]; }
