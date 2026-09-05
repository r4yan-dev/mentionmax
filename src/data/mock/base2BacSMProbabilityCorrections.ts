import type { Exercise } from "../../types/content";

const target = (topic: string) => ({ trackIds: ["SMA", "SMB"] as const, subjectId: "maths" as const, chapter: "Dénombrement et probabilités", topic });

export const base2BacSMProbabilityCorrections: Exercise[] = [
  {
    id: "sm-prob-13-corrected",
    mode: "BASE",
    source: "APPROVED",
    target: target("Bayes"),
    type: "multi-step",
    difficulty: 3,
    title: "Choix d'un sac — correction",
    statement: "On choisit au hasard U1 contenant 4 blanches et 1 noire, ou U2 contenant 2 blanches et 3 noires. Sachant que la boule tirée est noire, calculer P(U1|Noire).",
    expectedAnswer: "1/4",
    acceptedAnswers: ["1/4"],
    correction: "P(U1∩N)=1/2×1/5=1/10. P(N)=1/10+1/2×3/5=2/5. Donc P(U1|N)=(1/10)/(2/5)=1/4.",
    hint: "Calcule d'abord P(N), puis utilise P(U1|N)=P(U1∩N)/P(N).",
    examTip: "Dans un arbre, multiplie sur les branches puis additionne les chemins compatibles avec l'événement conditionnant.",
    estimatedMinutes: 5,
    xpValue: 24,
    tags: ["2BAC SM", "probabilités", "Bayes"],
  },
  {
    id: "sm-prob-21-corrected",
    mode: "BASE",
    source: "APPROVED",
    target: target("Loi binomiale"),
    type: "multi-step",
    difficulty: 2,
    title: "Trois réussites — correction",
    statement: "Un jeu a une probabilité de gain 3/5 à chaque partie. Si Ahmed joue 4 fois indépendamment, calculer la probabilité de gagner exactement 3 fois.",
    expectedAnswer: "216/625",
    acceptedAnswers: ["216/625"],
    correction: "X∼B(4,3/5). P(X=3)=C₄³(3/5)³(2/5)=4×27/125×2/5=216/625.",
    hint: "Utilise C₄³p³(1−p).",
    examTip: "Pour exactement k succès en n épreuves indépendantes, utilise C_n^k p^k(1-p)^{n-k}.",
    estimatedMinutes: 3,
    xpValue: 18,
    tags: ["2BAC SM", "probabilités", "binomiale"],
  },
];
