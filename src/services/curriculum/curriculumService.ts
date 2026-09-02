import { pcFormulaMap } from "../../data/curriculum/pcFormulaMap";
import { mockCurriculum } from "../../data/curriculum/mockCurriculum";
import { getTrackSubjects, subjects, tracks } from "../../data/curriculum/tracks";
import type { CurriculumNode, Subject, SubjectId, Track, TrackId } from "../../types/academic";

export const curriculumService = {
  getTracks(): Track[] {
    return Object.values(tracks);
  },

  getTrack(trackId: TrackId): Track {
    return tracks[trackId];
  },

  getSubjects(trackId: TrackId): Subject[] {
    return getTrackSubjects(trackId);
  },

  getSubject(subjectId: SubjectId): Subject {
    return subjects[subjectId];
  },

  getNodes(trackId: TrackId, subjectId?: SubjectId): CurriculumNode[] {
    return mockCurriculum.filter(
      (node) => node.trackIds.includes(trackId) && (!subjectId || node.subjectId === subjectId),
    );
  },

  getPCFormulaChapters() {
    return pcFormulaMap;
  },

  getPCFormulaChapter(chapterId: string) {
    return pcFormulaMap.find((chapter) => chapter.id === chapterId) ?? null;
  },
};
