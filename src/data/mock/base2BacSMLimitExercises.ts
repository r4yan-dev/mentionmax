import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = (topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Suites numériques", topic });

const make = (
  id: string,
  topic: string,
  title: string,
  statement: string,
  answer: string,
  correction: string,
  hint: string,
  difficulty: 1 | 2 | 3 | 4,
  minutes: number,
  type: Exercise["type"] = "calculation",
): Exercise => ({
  id,
  mode: "BASE",
  source: "APPROVED",
  target: target(topic),
  type,
  difficulty,
  title,
  statement,
  expectedAnswer: answer,
  acceptedAnswers: [answer],
  correction,
  hint,
  examTip: "Identifie d'abord le théorème ou la limite de référence utilisé avant de faire les calculs.",
  estimatedMinutes: minutes,
  xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "suites", "limites"],
});

export const base2BacSMLimitExercises: Exercise[] = [
  make("sm-seq-limit-01", "Limite finie", "Inverse d'un entier", "Calculer lim(n→+∞) 1/n.", "0", "C'est une limite de référence : 1/n→0 lorsque n→+∞.", "Utilise une limite fondamentale.", 1, 2),
  make("sm-seq-limit-02", "Limite de référence", "Puissance négative", "Calculer lim(n→+∞) 1/n³.", "0", "Comme n³→+∞, son inverse tend vers 0.", "Réécris 1/n³ comme n⁻³.", 1, 2),
  make("sm-seq-limit-03", "Limite infinie", "Racine carrée", "Déterminer lim(n→+∞) √n.", "+∞", "La fonction racine est croissante et √n dépasse tout réel positif lorsque n devient arbitrairement grand.", "Utilise la limite de référence de √n.", 1, 2, "short-answer"),
  make("sm-seq-limit-04", "Suite géométrique", "Raison comprise entre −1 et 1", "Calculer lim(n→+∞) (3/4)ⁿ.", "0", "La raison vérifie |3/4|<1. Donc la suite géométrique converge vers 0.", "Compare |q| à 1.", 1, 2),
  make("sm-seq-limit-05", "Suite géométrique", "Raison supérieure à 1", "Calculer lim(n→+∞) (5/2)ⁿ.", "+∞", "La raison 5/2 est supérieure à 1. Donc (5/2)ⁿ→+∞.", "Une puissance de raison strictement supérieure à 1 diverge vers +∞.", 1, 2),
  make("sm-seq-limit-06", "Suite géométrique", "Raison négative", "La suite uₙ=(−1)ⁿ admet-elle une limite ?", "Non", "Les termes alternent entre 1 et −1. Deux sous-suites ont des limites différentes, donc la suite n'admet pas de limite.", "Observe les termes pairs et impairs.", 2, 3, "proof"),
  make("sm-seq-limit-07", "Opérations sur les limites", "Quotient de polynômes", "Calculer lim(n→+∞) (2n²+3)/(n²−1).", "2", "En divisant numérateur et dénominateur par n², on obtient (2+3/n²)/(1−1/n²)→2.", "Divise par la plus grande puissance de n.", 2, 3),
  make("sm-seq-limit-08", "Forme indéterminée", "Différence avec racine", "Calculer lim(n→+∞) (√(n²+n)−n).", "1/2", "Rationaliser : √(n²+n)−n = n/[√(n²+n)+n]. En factorisant n au dénominateur, la limite vaut 1/2.", "Multiplie par la quantité conjuguée.", 3, 5, "multi-step"),
  make("sm-seq-limit-09", "Théorème des gendarmes", "Oscillation bornée", "Soit uₙ=sin(n)/(n³+1). Montrer que lim uₙ=0.", "0", "Comme −1≤sin(n)≤1, on a −1/(n³+1)≤uₙ≤1/(n³+1). Les deux bornes tendent vers 0, donc uₙ→0.", "Encadre sin(n) entre −1 et 1.", 2, 4, "proof"),
  make("sm-seq-limit-10", "Théorème de comparaison", "Divergence vers −∞", "Montrer que uₙ=−2n+sin(n) tend vers −∞.", "−∞", "Comme sin(n)≤1, uₙ≤−2n+1. Or −2n+1→−∞. Par comparaison, uₙ→−∞.", "Trouve une suite supérieure qui tend vers −∞.", 2, 4, "proof"),
  make("sm-seq-limit-11", "Suites monotones", "Convergence par monotonie", "On considère u₀=4 et uₙ₊₁=(uₙ+2)/2. Montrer que uₙ≥2 et que la suite est décroissante.", "uₙ≥2 et (uₙ) décroissante", "Si uₙ≥2, alors uₙ₊₁−2=(uₙ−2)/2≥0. De plus uₙ₊₁−uₙ=(2−uₙ)/2≤0. Donc la suite reste minorée par 2 et décroît.", "Calcule uₙ₊₁−2 puis uₙ₊₁−uₙ.", 3, 6, "multi-step"),
  make("sm-seq-limit-12", "Suite récurrente", "Point fixe", "Une suite converge vers l et vérifie uₙ₊₁=f(uₙ) avec f(x)=(x+6)/3. Déterminer l.", "3", "Par continuité, l=f(l), donc l=(l+6)/3. Ainsi 3l=l+6, donc l=3.", "Écris l=f(l).", 2, 4, "multi-step"),
  make("sm-seq-limit-13", "Composition continue", "Image d'une suite convergente", "On sait que uₙ→2. Calculer lim(n→+∞) √(uₙ+7).", "3", "La fonction f(x)=√(x+7) est continue au voisinage de 2. Donc f(uₙ)→f(2)=3.", "Vérifie la continuité de la fonction au point limite.", 2, 3),
  make("sm-seq-limit-14", "Étude complète", "Récurrence et limite", "On définit u₀=1 et uₙ₊₁=(uₙ+4)/(uₙ+2). Déterminer les limites possibles si (uₙ) converge.", "(−1+√17)/2 ou (−1−√17)/2", "Une limite l doit vérifier l=(l+4)/(l+2). Donc l(l+2)=l+4, soit l²+l−4=0, d'où l=(−1±√17)/2. Les limites possibles sont donc (−1+√17)/2 et (−1−√17)/2.", "Résous l=f(l) après avoir posé l=lim uₙ.", 4, 6, "multi-step"),
  make("sm-seq-limit-15", "Synthèse", "Limite avec terme dominant", "Calculer lim(n→+∞) (3n⁵−2n+1)/(6n⁵+n²−4).", "1/2", "On divise par n⁵ : (3−2/n⁴+1/n⁵)/(6+1/n³−4/n⁵)→3/6=1/2.", "Compare les termes de degré maximal.", 2, 3),
];
