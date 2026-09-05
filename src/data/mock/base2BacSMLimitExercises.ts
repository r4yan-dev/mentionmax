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
  difficulty: 1 | 2 | 3 | 4 | 5,
  minutes: number,
  type: Exercise["type"] = "calculation",
): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(topic), type, difficulty, title, statement,
  expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Identifie d'abord le théorème ou la limite de référence utilisé avant de faire les calculs.",
  estimatedMinutes: minutes, xpValue: difficulty * 6 + 6, tags: ["2BAC SM", "suites", "limites"],
});

export const base2BacSMLimitExercises: Exercise[] = [
  make("sm-seq-limit-01", "Limite finie", "Inverse d'un entier", "Calculer lim(n→+∞) 1/n.", "0", "C'est une limite de référence : 1/n→0 lorsque n→+∞.", "Utilise une limite fondamentale.", 1, 2),
  make("sm-seq-limit-02", "Limite de référence", "Puissance négative", "Calculer lim(n→+∞) 1/n³.", "0", "Comme n³→+∞, son inverse tend vers 0.", "Réécris 1/n³ comme n⁻³.", 1, 2),
  make("sm-seq-limit-03", "Limite infinie", "Racine carrée", "Déterminer lim(n→+∞) √n.", "+∞", "La fonction racine est croissante et √n→+∞.", "Utilise la limite de référence de √n.", 1, 2, "short-answer"),
  make("sm-seq-limit-04", "Suite géométrique", "Raison comprise entre −1 et 1", "Calculer lim(n→+∞) (3/4)ⁿ.", "0", "|3/4|<1, donc la suite géométrique converge vers 0.", "Compare |q| à 1.", 1, 2),
  make("sm-seq-limit-05", "Suite géométrique", "Raison supérieure à 1", "Calculer lim(n→+∞) (5/2)ⁿ.", "+∞", "La raison 5/2 est supérieure à 1. Donc (5/2)ⁿ→+∞.", "Une raison strictement supérieure à 1 donne une divergence vers +∞.", 1, 2),
  make("sm-seq-limit-06", "Suite géométrique", "Raison négative", "La suite u_n=(−1)ⁿ admet-elle une limite ?", "Non", "Les termes pairs valent 1 et les termes impairs −1. Deux sous-suites ont des limites différentes.", "Étudie les rangs pairs et impairs.", 2, 3, "proof"),
  make("sm-seq-limit-07", "Opérations sur les limites", "Quotient de polynômes", "Calculer lim(n→+∞) (2n²+3)/(n²−1).", "2", "En divisant par n², on obtient (2+3/n²)/(1−1/n²)→2.", "Divise par n².", 2, 3),
  make("sm-seq-limit-08", "Forme indéterminée", "Différence avec racine", "Calculer lim(n→+∞) (√(n²+n)−n).", "1/2", "Rationalisation : n/(√(n²+n)+n), puis division par n donne 1/2.", "Multiplie par la quantité conjuguée.", 3, 5, "multi-step"),
  make("sm-seq-limit-09", "Théorème des gendarmes", "Oscillation bornée", "Soit u_n=sin(n)/(n³+1). Montrer que lim u_n=0.", "0", "−1/(n³+1)≤u_n≤1/(n³+1), et les deux bornes tendent vers 0.", "Encadre sin(n) entre −1 et 1.", 2, 4, "proof"),
  make("sm-seq-limit-10", "Théorème de comparaison", "Divergence vers −∞", "Montrer que u_n=−2n+sin(n) tend vers −∞.", "−∞", "u_n≤−2n+1 et −2n+1→−∞. Par comparaison, u_n→−∞.", "Trouve une majorante tendant vers −∞.", 2, 4, "proof"),
  make("sm-seq-limit-11", "Suites monotones", "Convergence par monotonie", "u_0=4 et u_{n+1}=(u_n+2)/2. Montrer que u_n≥2 et que la suite est décroissante.", "u_n≥2 et (u_n) décroissante", "u_{n+1}−2=(u_n−2)/2≥0. Puis u_{n+1}−u_n=(2−u_n)/2≤0.", "Calcule u_{n+1}−2 puis u_{n+1}−u_n.", 3, 6, "multi-step"),
  make("sm-seq-limit-12", "Suite récurrente", "Point fixe", "Une suite converge vers l et vérifie u_{n+1}=(u_n+6)/3. Déterminer l.", "3", "l=(l+6)/3, donc 3l=l+6 et l=3.", "Écris l=f(l).", 2, 4, "multi-step"),
  make("sm-seq-limit-13", "Composition continue", "Image d'une suite convergente", "On sait que u_n→2. Calculer lim √(u_n+7).", "3", "La fonction x↦√(x+7) est continue en 2, donc la limite vaut 3.", "Utilise la continuité.", 2, 3),
  make("sm-seq-limit-14", "Étude complète", "Limites possibles", "On définit u_{n+1}=(u_n+4)/(u_n+2). Déterminer les limites possibles si la suite converge.", "(−1+√17)/2 ou (−1−√17)/2", "l=(l+4)/(l+2), donc l²+l−4=0 et l=(−1±√17)/2.", "Résous l=f(l).", 4, 6, "multi-step"),
  make("sm-seq-limit-15", "Synthèse", "Terme dominant", "Calculer lim(n→+∞) (3n⁵−2n+1)/(6n⁵+n²−4).", "1/2", "Après division par n⁵, les termes en 1/n^k disparaissent et il reste 3/6.", "Regarde le degré maximal.", 2, 3),
  make("sm-seq-limit-16", "Suite arithmétique", "Limite d'une suite arithmétique", "Étudier la limite de u_n=7−3n.", "−∞", "C'est une suite arithmétique de raison −3<0, donc elle décroît sans borne et tend vers −∞.", "Regarde le signe de la raison.", 1, 2, "short-answer"),
  make("sm-seq-limit-17", "Suite géométrique", "Convergence et limite", "Étudier la limite de u_n=5(−2/3)^n.", "0", "|−2/3|<1, donc (−2/3)^n→0 et u_n→0.", "La valeur absolue de la raison est déterminante.", 2, 3),
  make("sm-seq-limit-18", "Encadrement", "Limite avec valeur absolue", "Montrer que lim |sin n|/n=0.", "0", "0≤|sin n|/n≤1/n et 1/n→0. Le théorème des gendarmes donne 0.", "Commence par 0≤|sin n|≤1.", 2, 4, "proof"),
  make("sm-seq-limit-19", "Récurrence", "Suite décroissante minorée", "u_0=4 et u_{n+1}=√(u_n+2). Montrer que 2≤u_n≤4 et que la suite est décroissante.", "2≤u_n≤4 et décroissante", "Si u_n∈[2,4], alors u_{n+1}∈[2,√6]⊂[2,4]. Pour x≥2, √(x+2)≤x car x²−x−2=(x−2)(x+1)≥0. Donc la suite décroît.", "Travaille sur [2,4] et compare √(x+2) à x.", 5, 8, "proof"),
  make("sm-seq-limit-20", "Synthèse Bac", "Récurrence et limite", "u_0=0 et u_{n+1}=2u_n/(1+u_n). Montrer que 0≤u_n<1 puis étudier la convergence.", "u_n=0 pour tout n", "Avec u_0=0, la relation donne immédiatement u_1=0 puis, par récurrence, u_n=0 pour tout n. La suite converge donc vers 0.", "Commence par calculer u_1.", 4, 5, "multi-step"),
];
