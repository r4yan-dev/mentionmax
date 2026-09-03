import type { Subject, SubjectId, Track, TrackId } from "../../types/academic";

export const subjects: Record<SubjectId, Subject> = {
  maths: { id: "maths", name: "Mathématiques", shortName: "Maths", coefficient: 9, colorToken: "turquoise" },
  "physique-chimie": { id: "physique-chimie", name: "Physique-Chimie", shortName: "PC", coefficient: 7, colorToken: "deep" },
  svt: { id: "svt", name: "Sciences de la Vie et de la Terre", shortName: "SVT", coefficient: 3, colorToken: "mint" },
  anglais: { id: "anglais", name: "Anglais", shortName: "EN", coefficient: 2, colorToken: "gold" },
  philosophie: { id: "philosophie", name: "Philosophie", shortName: "Philo", coefficient: 2, colorToken: "ruby" },
};

export const tracks: Record<TrackId, Track> = {
  SP: {
    id: "SP",
    label: "2BAC Sciences Physiques",
    shortLabel: "SP",
    subjects: ["maths", "physique-chimie", "svt", "anglais", "philosophie"],
  },
  SMA: {
    id: "SMA",
    label: "2BAC Sciences Mathématiques A",
    shortLabel: "SM A",
    subjects: ["maths", "physique-chimie", "svt", "anglais", "philosophie"],
  },
  SMB: {
    id: "SMB",
    label: "2BAC Sciences Mathématiques B",
    shortLabel: "SM B",
    subjects: ["maths", "physique-chimie", "anglais", "philosophie"],
  },
};

export function getTrackSubjects(trackId: TrackId): Subject[] {
  return tracks[trackId].subjects.map((id) => subjects[id]);
}

export function isSubjectAvailable(trackId: TrackId, subjectId: SubjectId): boolean {
  return tracks[trackId].subjects.includes(subjectId);
}
