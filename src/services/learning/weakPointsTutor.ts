import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { SubjectId, TrackId } from "../../types/academic";
import type { LearnerMastery } from "./weakPointsService";
import { getWeakPoints } from "./weakPointsService";

export type LearningJourneyKind = "exercise" | "quiz" | "revision";

export type LearningJourney = {
  courseOverview: {
    whyItMatters: string;
    goals: string[];
    watchFor: string[];
  };
  masterySnapshot: LearnerMastery[];
  nextAction: {
    kind: LearningJourneyKind;
    title: string;
    reason: string;
    difficulty: 1 | 2 | 3 | 4 | 5;
    count: number;
    conceptIds: string[];
    generationBrief: string;
  };
  afterAction: {
    success: string;
    difficulty: string;
    struggle: string;
  };
};

type JourneyInput = {
  trackId: TrackId;
  subjectId: SubjectId;
  lessonId: string;
  courseTitle: string;
  chapter: string;
  topic: string;
  intro?: string;
  objectives?: string[];
};

async function getFunctionError(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json() as { error?: string; detail?: string };
      if (payload?.detail) return `${payload.error ?? "Le tuteur adaptatif est indisponible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
  }
  return error instanceof Error ? error.message : "Le tuteur adaptatif est indisponible.";
}

function cacheKey(input: JourneyInput) {
  return `mentionmax:journey:${input.lessonId}:${new Date().toISOString().slice(0, 10)}`;
}

export async function getCourseJourney(input: JourneyInput): Promise<LearningJourney> {
  const key = cacheKey(input);
  if (typeof window !== "undefined") {
    try {
      const cached = window.sessionStorage.getItem(key);
      if (cached) return JSON.parse(cached) as LearningJourney;
    } catch {}
  }

  const weakPoints = await getWeakPoints(input.subjectId, 8);
  const { data, error } = await supabase.functions.invoke("weak-points-tutor", {
    body: {
      action: "course_journey",
      ...input,
      weakPoints,
    },
  });

  if (error) throw new Error(await getFunctionError(error));
  if (!data?.success || !data.journey) {
    throw new Error(data?.detail ? `${data?.error ?? "Le tuteur adaptatif a échoué."} ${data.detail}` : data?.error ?? "Le tuteur adaptatif a échoué.");
  }

  const journey = data.journey as LearningJourney;
  if (typeof window !== "undefined") {
    try { window.sessionStorage.setItem(key, JSON.stringify(journey)); } catch {}
  }
  return journey;
}
