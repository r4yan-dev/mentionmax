import { supabase } from "../../lib/supabase";
import type { ContentDifficulty } from "../../types/content";
import type { SubjectId, TrackId } from "../../types/academic";

export type LearningEventSource = "quiz" | "ai_corrector" | "exercise" | "diagnostic";
export type LearningOutcome = "correct" | "partial" | "incorrect" | "skipped";

export type LearningEventInput = {
  source: LearningEventSource;
  subjectId?: SubjectId | string;
  trackId?: TrackId | string;
  chapter?: string;
  topic?: string;
  conceptId?: string;
  outcome: LearningOutcome;
  pointsEarned?: number | null;
  pointsPossible?: number | null;
  difficulty?: ContentDifficulty | number | null;
  mistakeType?: string | null;
  metadata?: Record<string, unknown>;
};

export type LearnerMastery = {
  user_id: string;
  subject_id: string;
  track_id?: string | null;
  chapter: string;
  topic: string;
  concept_id: string;
  mastery: number;
  confidence: number;
  attempts: number;
  correct: number;
  partial: number;
  incorrect: number;
  recent_mistakes: string[];
  trend: "improving" | "stable" | "declining" | "new";
  last_attempt: string | null;
  last_correct: string | null;
  updated_at: string;
};

type PendingEvent = LearningEventInput & { queuedAt: string };

const QUEUE_KEY = "mentionmax:pending-learning-events:v1";
const COOKIE_KEY = "mm_learning_session";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function getLearningSessionId() {
  const existing = getCookie(COOKIE_KEY);
  if (existing) return existing;
  if (typeof crypto === "undefined" || !crypto.randomUUID) return "anonymous";
  const value = crypto.randomUUID();
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; Max-Age=31536000; Path=/; SameSite=Lax`;
  }
  return value;
}

function readQueue(): PendingEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(events: PendingEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-100)));
  } catch {
    // Local storage is only a fallback queue. Never block learning UX on it.
  }
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function recordLearningEvent(input: LearningEventInput) {
  const normalized: LearningEventInput = {
    ...input,
    metadata: {
      ...(input.metadata ?? {}),
      learningSessionId: getLearningSessionId(),
    },
  };

  const userId = await currentUserId();
  if (!userId) {
    const queue = readQueue();
    queue.push({ ...normalized, queuedAt: new Date().toISOString() });
    writeQueue(queue);
    return { queued: true };
  }

  const { error } = await supabase.from("learning_events").insert({
    user_id: userId,
    source: normalized.source,
    subject_id: normalized.subjectId ?? null,
    track_id: normalized.trackId ?? null,
    chapter: normalized.chapter ?? "",
    topic: normalized.topic ?? "",
    concept_id: normalized.conceptId ?? normalized.topic ?? normalized.chapter ?? "general",
    outcome: normalized.outcome,
    points_earned: normalized.pointsEarned ?? null,
    points_possible: normalized.pointsPossible ?? null,
    difficulty: normalized.difficulty ?? null,
    mistake_type: normalized.mistakeType ?? null,
    metadata: normalized.metadata ?? {},
  });

  if (error) {
    const queue = readQueue();
    queue.push({ ...normalized, queuedAt: new Date().toISOString() });
    writeQueue(queue);
    return { queued: true, error };
  }

  return { queued: false };
}

export async function flushPendingLearningEvents() {
  const userId = await currentUserId();
  if (!userId) return 0;
  const queue = readQueue();
  if (!queue.length) return 0;

  const payload = queue.map((event) => ({
    user_id: userId,
    source: event.source,
    subject_id: event.subjectId ?? null,
    track_id: event.trackId ?? null,
    chapter: event.chapter ?? "",
    topic: event.topic ?? "",
    concept_id: event.conceptId ?? event.topic ?? event.chapter ?? "general",
    outcome: event.outcome,
    points_earned: event.pointsEarned ?? null,
    points_possible: event.pointsPossible ?? null,
    difficulty: event.difficulty ?? null,
    mistake_type: event.mistakeType ?? null,
    metadata: { ...(event.metadata ?? {}), queuedAt: event.queuedAt },
  }));

  const { error } = await supabase.from("learning_events").insert(payload);
  if (error) return 0;
  writeQueue([]);
  return payload.length;
}

export async function getWeakPoints(subjectId?: SubjectId | string, limit = 8) {
  let query = supabase
    .from("learner_mastery")
    .select("*")
    .order("mastery", { ascending: true })
    .limit(Math.min(20, Math.max(1, limit)));

  if (subjectId) query = query.eq("subject_id", subjectId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LearnerMastery[];
}

export async function recordCorrectionOutcome(params: {
  subjectId: SubjectId | string;
  trackId: TrackId | string;
  chapter?: string;
  topic?: string;
  conceptIds?: string[];
  score?: number | null;
  pointsPossible?: number | null;
  verdict: "correct" | "mostly_correct" | "partially_correct" | "incorrect";
  errors?: Array<{ location?: string; expected?: string; observed?: string; fix?: string }>;
  exerciseId?: string;
}) {
  const ratio = params.verdict === "correct"
    ? 1
    : params.verdict === "mostly_correct"
      ? 0.8
      : params.verdict === "partially_correct"
        ? 0.5
        : 0;
  const outcome: LearningOutcome = ratio >= 0.95 ? "correct" : ratio > 0 ? "partial" : "incorrect";
  const concepts = (params.conceptIds?.length ? params.conceptIds : [params.topic || params.chapter || "general"]).slice(0, 6);

  return Promise.all(concepts.map((conceptId) => recordLearningEvent({
    source: "ai_corrector",
    subjectId: params.subjectId,
    trackId: params.trackId,
    chapter: params.chapter,
    topic: params.topic,
    conceptId,
    outcome,
    pointsEarned: params.pointsPossible ? ratio * params.pointsPossible : null,
    pointsPossible: params.pointsPossible ?? null,
    mistakeType: params.errors?.[0]?.location ?? null,
    metadata: {
      exerciseId: params.exerciseId ?? null,
      verdict: params.verdict,
      score: params.score ?? null,
      errors: params.errors ?? [],
    },
  })));
}

export async function recordQuizAttempt(params: {
  subjectId: SubjectId | string;
  trackId: TrackId | string;
  quizId: string;
  chapter?: string;
  items: Array<{
    conceptIds?: string[];
    topic?: string;
    difficulty?: number;
    correct: boolean;
    partial?: boolean;
    pointsEarned?: number;
    pointsPossible?: number;
  }>;
}) {
  return Promise.all(params.items.map((item, index) => {
    const outcome: LearningOutcome = item.correct ? "correct" : item.partial ? "partial" : "incorrect";
    const concepts = (item.conceptIds?.length ? item.conceptIds : [item.topic || params.chapter || "general"]).slice(0, 6);
    return Promise.all(concepts.map((conceptId) => recordLearningEvent({
      source: "quiz",
      subjectId: params.subjectId,
      trackId: params.trackId,
      chapter: params.chapter,
      topic: item.topic,
      conceptId,
      outcome,
      pointsEarned: item.pointsEarned ?? (item.correct ? 1 : 0),
      pointsPossible: item.pointsPossible ?? 1,
      difficulty: item.difficulty ?? null,
      metadata: { quizId: params.quizId, itemIndex: index },
    })));
  }));
}
