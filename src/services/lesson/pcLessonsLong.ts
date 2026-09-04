import type { LessonBlock, LessonDocument } from "../../types/academic";
import { secondBacPcLessonsDetailed } from "./pcLessonsDetailed";

/**
 * Long-form teaching layer for MentionMax.
 *
 * The source lessons already contain the scientific content. This layer makes
 * the teaching sequence explicit so the future renderer can show four tall
 * pages per lesson instead of collapsing everything into one short card.
 */
const splitIntoFourPages = (lesson: LessonDocument): LessonDocument => {
  const source = lesson.blocks.filter((block) => block.type !== "title" && block.type !== "intro");
  const definitions = source.filter((block) => ["definition", "concept", "theorem"].includes(block.type));
  const construction = source.filter((block) => ["formula", "example", "worked-solution", "graph", "comparison"].includes(block.type));
  const practice = source.filter((block) => ["method", "common-mistake", "warning", "exam-tip", "animation", "interactive"].includes(block.type));
  const exercises = source.filter((block) => block.type === "exercise");
  const visual = source.filter((block) => ["diagram", "highlight", "annotation"].includes(block.type));

  const page = (title: string, subtitle: string, blocks: LessonBlock[]): LessonBlock[] => [
    { type: "page", title, text: subtitle, data: { pageLayout: "long-form", minHeight: "tall" } },
    ...blocks,
  ];

  const recapItems = [
    "Reformuler l'idée principale sans regarder le cours.",
    "Identifier les grandeurs et leurs unités.",
    "Écrire la relation avant l'application numérique.",
    "Vérifier signe, unité et ordre de grandeur.",
  ];

  const integratedPractice: LessonBlock[] = exercises.length
    ? exercises
    : [{ type: "exercise", title: "Application intégrée · Niveau Bac", text: `Construire un exercice du même type que la leçon « ${lesson.title} » avec des valeurs nouvelles mais une situation proche.`, data: { integrated: true, revealMode: "stepwise" } };

  return {
    ...lesson,
    blocks: [
      { type: "title", title: lesson.title },
      { type: "intro", text: (lesson.blocks.find((b) => b.type === "intro")?.text ?? "") },
      ...page("01 · Déclic", "Comprendre le phénomène, le visualiser et savoir ce que l'on cherche à expliquer.", [
        ...definitions,
        ...visual.slice(0, 2),
        { type: "highlight", title: "Mission de la page", text: `Avant de calculer, explique ce qui se passe dans « ${lesson.topic} ».`, data: { checkpoint: "concept-first" } },
        ...(visual.slice(2).length ? visual.slice(2) : []),
        { type: "interactive", title: "Manipule avant de retenir", text: `Explorer ${lesson.topic.toLowerCase()} avec des paramètres contrôlables, puis observer qualitativement le résultat avant d'afficher la relation.`, data: { interaction: "explore-then-explain", lessonId: lesson.id } },
      ]),
      ...page("02 · Construire", "Formules, exemples guidés et lecture graphique : on transforme l'intuition en méthode de calcul.", [
        ...construction,
        { type: "example", title: "Exemple supplémentaire · Valeurs modifiées", text: `Reprendre le contexte du chapitre « ${lesson.title} » avec des valeurs légèrement différentes. D'abord la relation littérale, ensuite le calcul, puis une conclusion physique.`, data: { variant: "same-context-new-values" } },
        { type: "worked-solution", title: "Pourquoi cette méthode marche", text: "Chaque étape a une fonction : les données fixent le contexte, la relation fixe le modèle, le calcul produit une valeur et la conclusion donne son sens physique." },
      ]),
      ...page("03 · Méthode active", "Réflexes Bac, pièges, animation et coach de raisonnement. Ici, l'élève doit agir.", [
        ...practice,
        { type: "interactive", title: "Coach de résolution", text: "Choisir la prochaine étape du raisonnement parmi plusieurs propositions. Le feedback explique l'erreur et laisse une nouvelle tentative avant de révéler la solution complète.", data: { interaction: "guided-step-choice", reveal: "stepwise", lessonId: lesson.id } },
        { type: "animation", title: "Avant → après", text: `Montrer visuellement la situation de départ puis la transformation liée à ${lesson.topic.toLowerCase()}. Faire apparaître la grandeur mesurée au moment où elle devient utile.`, data: { animation: "concept-to-formula", lessonId: lesson.id } },
      ]),
      ...page("04 · Entraînement intégré", "Trois niveaux, correction progressive, puis rappel actif avant de quitter la leçon.", [
        ...integratedPractice,
        { type: "exercise", title: "Remix Bac · Même compétence", text: `Créer une variante proche de la situation étudiée dans « ${lesson.title} » : changer les nombres, garder la compétence et demander une justification en plus du résultat.`, data: { level: 2, integrated: true, revealMode: "stepwise", variant: "same-situation-new-values" } },
        { type: "exercise", title: "Défi · Sans formule", text: `Expliquer qualitativement comment évoluerait le résultat si une grandeur pertinente de « ${lesson.title} » augmentait, diminuait ou changeait de signe. Justifier avant tout calcul.`, data: { level: 3, integrated: true, revealMode: "stepwise", variant: "reasoning-first" } },
        { type: "highlight", title: "Quick check", text: `Fermer le cours et répondre de mémoire : définition, relation centrale, unité, piège principal et idée du chapitre « ${lesson.title} ».`, data: { checkpoint: "retrieval" } },
        { type: "recap", title: "À retenir", items: recapItems },
        { type: "diagram", title: "Carte mentale Menti", text: `Centre : ${lesson.title}. Relier définition → visualisation → relation → exemple → méthode → exercice → piège.`, data: { style: "menti-mindmap" } },
      ]),
    ],
  };
};

export const secondBacPcLessonsLong: LessonDocument[] = secondBacPcLessonsDetailed.map(splitIntoFourPages);
