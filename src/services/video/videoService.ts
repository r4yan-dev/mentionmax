export interface VideoToLessonRequest {
  url: string;
  subjectId?: string;
  knownConceptIds?: string[];
  weakConceptIds?: string[];
}

export const videoService = {
  async toLesson(_request: VideoToLessonRequest) {
    return { status: "not-configured" as const, lesson: null };
  },
};
