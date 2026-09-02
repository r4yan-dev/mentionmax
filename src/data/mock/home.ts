import type { StudentProfile, TrackId } from "../../types/academic";

export const mockStudentProfile: StudentProfile = {
  id: "mock-student",
  displayName: "Étudiant",
  avatarUrl: null,
  trackId: "SMA" as TrackId,
  city: "Casablanca",
  school: null,
  className: "2BAC SM",
  targetScore: 17.8,
  bacDate: "2027-06-06T08:00:00+01:00",
};

export const mockHomeStats = {
  estimatedProbability: null as number | null,
  xp: 2840,
  streakDays: 7,
  leaderboardPosition: 42,
  friendsStudying: 3,
  focusMinutesToday: 58,
};

export const mockContinueLearning = {
  subject: "maths",
  title: "Dérivabilité : conditions et méthodes",
  chapter: "Analyse",
  progress: 0.41,
  href: "/lecons/maths/tvi",
};

export const mockWeakTopic = {
  subject: "maths",
  chapter: "Probabilités",
  concept: "Loi binomiale",
  mastery: 0.29,
  href: "/exercices/maths/probabilites",
};
