import type { Exercise } from "../../types/content";

const tracks = ["SP"] as const;
const target = (chapter: string, topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter, topic });

const make = (id: string, chapter: string, topic: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3, minutes: number): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(chapter, topic), type: "calculation", difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint, examTip: "Présente la méthode avant l'application et garde les unités cohérentes.", estimatedMinutes: minutes, xpValue: difficulty * 7 + 5, tags: ["2BAC SP", chapter.toLowerCase() ],
});

export const base2BacSPMathExercises: Exercise[] = [
  make("sp-math-limits-01", "Limites et continuité", "Limite", "Limite rationnelle", "Calculer lim(x→+∞) (2x²+3)/(x²−1).", "2", "En divisant par x², les termes de degré inférieur tendent vers 0, donc la limite vaut 2.", "Compare les coefficients dominants.", 1, 2),
  make("sp-math-derivation-01", "Dérivation et étude des fonctions", "Tangente", "Tangente en 1", "Pour f(x)=x²+2x−1, déterminer l'équation de la tangente en x=1.", "y=4x−3", "f'(x)=2x+2 donc f'(1)=4 et f(1)=2. Ainsi y=2+4(x−1)=4x−2. Correction: y=4x−2.", "Calcule f(1) puis f'(1) séparément.", 2, 3),
  make("sp-math-sequences-01", "Suites numériques", "Suite géométrique", "Terme d'une suite géométrique", "Une suite géométrique vérifie u0=3 et q=2. Calculer u8.", "768", "u8=u0×q^8=3×256=768.", "Utilise u_n=u_0q^n.", 1, 2),
  make("sp-math-primitives-01", "Fonctions primitives et calcul intégral", "Intégrale", "Intégrale d'un polynôme", "Calculer ∫₀² (2x+1) dx.", "6", "Une primitive est x²+x. Donc [x²+x]₀²=4+2=6.", "Cherche une primitive simple.", 1, 2),
  make("sp-math-log-01", "Fonctions logarithmiques", "Équation", "Résoudre une équation logarithmique", "Résoudre ln(x)=2.", "e²", "La fonction ln est bijective de ]0,+∞[ vers ℝ, donc x=e².", "Applique l'exponentielle aux deux membres.", 1, 2),
  make("sp-math-exp-01", "Fonctions exponentielles", "Équation", "Équation exponentielle", "Résoudre e^x=5.", "ln(5)", "En appliquant ln, on obtient x=ln(5).", "ln est la fonction réciproque de exp.", 1, 2),
  make("sp-math-complex-01", "Nombres complexes", "Module", "Module d'un complexe", "Calculer |z| pour z=3−4i.", "5", "|z|=√(3²+(−4)²)=√25=5.", "Utilise √(a²+b²).", 1, 2),
  make("sp-math-integral-01", "Calcul intégral", "Aire", "Aire sous une courbe", "Calculer ∫₁³ 2x dx.", "8", "Une primitive est x². Donc 3²−1²=8.", "Applique F(3)−F(1).", 1, 2),
  make("sp-math-space-01", "Géométrie dans l'espace", "Produit scalaire", "Orthogonalité", "u=(1,2,−1), v=(2,−1,0). Calculer u·v.", "0", "1×2+2×(−1)+(−1)×0=0, donc les vecteurs sont orthogonaux.", "Multiplie les trois composantes.", 1, 2),
  make("sp-math-prob-01", "Dénombrement et probabilités", "Probabilité", "Deux tirages", "Une urne contient 3 boules rouges et 2 bleues. Une boule est tirée. Calculer P(rouge).", "3/5", "Il y a 3 issues favorables parmi 5 issues équiprobables: P(R)=3/5.", "Favorables sur possibles.", 1, 2),
];
