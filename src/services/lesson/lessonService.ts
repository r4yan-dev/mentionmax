import type { LessonDocument, SubjectId } from "../../types/academic";
import { mathLessons } from "./mathLessons";

const lessons: LessonDocument[] = [
  {
    id: "lesson-maths-tvi",
    title: "Théorème des valeurs intermédiaires",
    language: "fr",
    source: "OFFICIAL",
    subjectId: "maths",
    chapter: "Analyse",
    topic: "Théorème des valeurs intermédiaires",
    blocks: [
      { type: "title", title: "Théorème des valeurs intermédiaires" },
      { type: "intro", text: "Un outil fondamental pour montrer l'existence d'une solution dans un intervalle." },
      { type: "definition", title: "Énoncé", text: "Si f est continue sur [a,b], alors toute valeur comprise entre f(a) et f(b) est atteinte par f." },
      { type: "formula", latex: "\\exists c\\in[a,b],\\quad f(c)=k" },
      { type: "exam-tip", title: "Réflexe Bac", text: "Commence par vérifier la continuité sur l'intervalle avant d'invoquer le théorème." },
      { type: "common-mistake", title: "Erreur fréquente", text: "Confondre existence d'une solution et unicité de cette solution." },
      { type: "recap", title: "À retenir", items: ["Continuité sur [a,b]", "Valeur cible entre f(a) et f(b)", "Conclusion d'existence"] },
    ],
  },
  ...mathLessons,
];

export const lessonService = {
  list(subjectId?: SubjectId): LessonDocument[] {
    return lessons.filter((lesson) => !subjectId || lesson.subjectId === subjectId);
  },
  getById(id: string): LessonDocument | null {
    return lessons.find((lesson) => lesson.id === id) ?? null;
  },
};
