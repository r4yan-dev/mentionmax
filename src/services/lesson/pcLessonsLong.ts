import type { LessonBlock, LessonDocument } from "../../types/academic";

/** MentionMax PC long-form course corpus. Every lesson contains FOUR explicit content pages. */
type LessonSpec = { id: string; title: string; chapter: string; topic: string; intro: string; cards: [string,string,string,string,string][] };

const page = (title: string, subtitle: string, blocks: LessonBlock[]): LessonBlock[] => [
  { type: "page", title, text: subtitle },
  ...blocks,
];

const buildLesson = (spec: LessonSpec, exercises: [string,string,string][]): LessonDocument => {
  const [c1,c2,c3,c4,c5] = spec.cards;
  const blocks: LessonBlock[] = [
    { type: "title", title: spec.title },
    { type: "intro", text: spec.intro },
    ...page("01 · Comprendre", "Le déclic avant la formule : observer, nommer et relier les grandeurs.", [
      { type: "definition", title: c1[0], text: c1[1] },
      { type: "concept", title: c2[0], text: c2[1] },
      { type: "diagram", title: "Visuel Menti", text: `Illustration pédagogique au style Menti : ${c1[1]}`, data: { style: "menti-scientific", layout: "hero-diagram" } },
      { type: "highlight", title: "Objectif Bac", text: "À la fin de cette page, tu dois pouvoir expliquer le phénomène avec tes propres mots avant d’écrire une relation." },
      { type: "interactive", title: "Mini-manipulation", text: `Faire varier la grandeur principale et observer ce qui change : ${c2[1]}`, data: { interaction: "slider-observe", subject: spec.id } },
    ]),
    ...page("02 · Construire le cours", "Les relations utiles, puis des exemples proches du Bac avec des nombres légèrement modifiés.", [
      { type: "concept", title: c3[0], text: c3[1] },
      { type: "formula", latex: c3[1] },
      { type: "example", title: "Exemple guidé · 01", text: c4[1] },
      { type: "worked-solution", title: "Correction expliquée", text: `On commence par identifier les données, écrire la relation littérale, remplacer les valeurs avec leurs unités, puis interpréter le résultat dans le contexte : ${c4[1]}` },
      { type: "example", title: "Exemple guidé · 02", text: c5[1] },
      { type: "graph", title: "Lecture graphique", text: `Tracer ou afficher une représentation simple liée à ${c3[0].toLowerCase()}. Faire apparaître les axes, unités et grandeurs avant toute interprétation.`, data: { graphType: "conceptual", subject: spec.id } },
    ]),
    ...page("03 · Méthode active", "Résoudre, vérifier, corriger : la méthode de copie et les pièges du chapitre.", [
      { type: "method", title: "Méthode Bac en 5 gestes", text: "1. Poser le système ou le phénomène étudié. 2. Lister les données avec leurs unités. 3. Écrire la relation littérale. 4. Calculer sans arrondir trop tôt. 5. Conclure par une phrase physique qui répond exactement à la question." },
      { type: "common-mistake", title: "Erreur fréquente à traquer", text: `Dans ce chapitre, le piège principal est de recopier une formule sans vérifier ce que représentent les grandeurs. Reviens à la situation physique : ${c2[1]}` },
      { type: "exam-tip", title: "Réflexe copie Bac", text: "Une valeur numérique sans unité ni phrase de conclusion n’est pas une démonstration complète. Fais apparaître l’étape qui justifie ton résultat." },
      { type: "animation", title: "Animation Menti", text: "Animation courte : visualiser le mécanisme étudié avant puis pendant le calcul. Mettre en évidence la grandeur qui varie et celle qui reste fixe.", data: { animation: "before-after", subject: spec.id } },
      { type: "interactive", title: "Contrôle instantané", text: "Un bouton « Vérifier mon raisonnement » compare les étapes attendues, signale l’unité incohérente et explique l’erreur sans donner immédiatement toute la réponse.", data: { interaction: "guided-check", reveal: "stepwise" } },
      { type: "comparison", title: "Je choisis quelle relation ?", items: [c1[0], c3[0], "Lecture du schéma ou du graphe", "Conclusion physique"] },
    ]),
    ...page("04 · S’entraîner dans la leçon", "Les exercices arrivent avant la sortie de chapitre : court, Bac, puis défi. La correction se révèle par étapes.", [
      ...exercises.map(([title,text,solution], index) => ({ type: "exercise", title, text, data: { level: index + 1, solution, revealMode: "stepwise", integrated: true } } as LessonBlock)),
      { type: "highlight", title: "Quick check", text: "Sans regarder le cours, reformule la relation centrale, donne l’unité de chaque grandeur et explique ce qui se passe si une donnée augmente." },
      { type: "recap", title: "À retenir", items: [c1[0], c3[0], "Écrire la relation littérale avant les nombres", "Vérifier unité et ordre de grandeur", "Toujours conclure en langage physique"] },
      { type: "diagram", title: "Carte mentale Menti", text: `Centre : ${spec.title}. Branches : définition → grandeur(s) → relation → exemple → exercice → piège.`, data: { style: "menti-mindmap" } },
    ]),
  ];
  return { id: spec.id, title: spec.title, language: "fr", source: "APPROVED", subjectId: "physique-chimie", chapter: spec.chapter, topic: spec.topic, blocks };
};

const lessonSpecs: LessonSpec[] = [
  {
    id: "2bac-pc-waves", title: "Ondes mécaniques progressives", chapter: "Ondes mécaniques progressives", topic: "Célérité, perturbation et retard",
    intro: "Une onde mécanique progressive est une perturbation qui se propage de proche en proche dans un milieu matériel. Le signal avance, tandis que les points du milieu restent autour de leur position d'équilibre.",
    cards: [
      ["La photo mentale", "Imagine une corde tendue. Tu soulèves brièvement un morceau puis tu le relâches : la bosse avance le long de la corde, mais chaque morceau de corde ne voyage pas avec la bosse.", "Propagation", "Pour comparer deux points A et B, on s'intéresse au retard Δt entre leurs perturbations. La célérité mesure la distance parcourue par le signal par unité de temps.", "Relation fondamentale", "v = d / Δt"],
      ["", "", "", "Une impulsion parcourt 3,6 m en 0,90 s. v = 3,6 / 0,90 = 4,0 m·s⁻¹.", "", "Deux capteurs sont séparés de 1,70 m. Le premier détecte le signal 5,0 ms avant le second. Δt = 5,0×10⁻³ s, donc v ≈ 340 m·s⁻¹."],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
      ["", "", "", "", "", ""],
    ],
  },
];

const exerciseBank: Record<string, [string,string,string][]> = {
  "2bac-pc-waves": [
    ["Niveau 1 · Célérité", "Une onde parcourt 2,8 m en 8,0 ms. Calculer sa célérité.", "v = d/Δt = 2,8/(8,0×10⁻³) = 350 m·s⁻¹."],
    ["Niveau Bac · Retard", "Deux capteurs A et B sont séparés de 2,40 m. Le signal arrive en B 7,0 ms après A. Déterminer v.", "v = 2,40/(7,0×10⁻³) ≈ 343 m·s⁻¹."],
    ["Défi · Raisonnement", "Un étudiant trouve 0,0035 m·s⁻¹ pour une propagation de 1,7 m en 5,0 ms. Identifier son erreur.", "Il a probablement utilisé 5,0×10³ s au lieu de 5,0×10⁻³ s. La valeur correcte est 340 m·s⁻¹."],
  ],
};

export const secondBacPcLessonsLong: LessonDocument[] = lessonSpecs.map((spec) =>
  buildLesson(spec, exerciseBank[spec.id] ?? []),
);
