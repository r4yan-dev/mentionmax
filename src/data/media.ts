import studentHero from "../assets/people/student-hero.webp";
import mathsCover from "../assets/subjects/mathematics/cover.webp";

export const media = {
  people: {
    hero: studentHero,
  },

  subjects: {
    mathematics: {
      cover: mathsCover,
    },
  },
} as const;