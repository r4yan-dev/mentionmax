import type { CurriculumNode } from "../../types/academic";

export const mockCurriculum: CurriculumNode[] = [
  {
    id: "maths-analyse-derivabilite-tv",
    trackIds: ["SP", "SMA", "SMB"],
    subjectId: "maths",
    chapter: "Analyse",
    topic: "Dérivabilité",
    concept: "Théorème des valeurs intermédiaires",
    skill: "Identifier les conditions d'application du TVI",
    bacRelevance: "high",
    resources: [
      { id: "r-tv-lesson", kind: "course", source: "OFFICIAL", title: "Leçon structurée : TVI", href: "/lecons/maths/tvi" },
      { id: "r-tv-exercises", kind: "exercise", source: "APPROVED", title: "S'entraîner sur le TVI", href: "/exercices/maths/tvi" },
    ],
  },
  {
    id: "maths-analyse-integrales",
    trackIds: ["SP", "SMA", "SMB"],
    subjectId: "maths",
    chapter: "Analyse",
    topic: "Intégration",
    concept: "Calcul d'intégrales",
    skill: "Choisir une primitive et vérifier le résultat",
    bacRelevance: "high",
    resources: [
      { id: "r-int-lesson", kind: "course", source: "OFFICIAL", title: "Intégrales : méthodes", href: "/lecons/maths/integrales" },
      { id: "r-int-exercises", kind: "exercise", source: "APPROVED", title: "Exercices d'intégration", href: "/exercices/maths/integrales" },
    ],
  },
  {
    id: "pc-chimie-equilibre",
    trackIds: ["SP", "SMA", "SMB"],
    subjectId: "physique-chimie",
    chapter: "Chimie",
    topic: "Équilibres chimiques",
    concept: "Constante d'équilibre",
    skill: "Exploiter une constante et un état d'équilibre",
    bacRelevance: "high",
    resources: [
      { id: "r-eq-lesson", kind: "course", source: "OFFICIAL", title: "Équilibres chimiques", href: "/lecons/physique-chimie/equilibres" },
    ],
  },
  {
    id: "svt-genetique-expression",
    trackIds: ["SP", "SMA"],
    subjectId: "svt",
    chapter: "Génétique",
    topic: "Expression du patrimoine génétique",
    concept: "De l'ADN aux protéines",
    skill: "Relier information génétique et synthèse protéique",
    bacRelevance: "high",
    resources: [
      { id: "r-adn-lesson", kind: "course", source: "OFFICIAL", title: "De l'ADN à la protéine", href: "/lecons/svt/adn-proteines" },
    ],
  },
];
