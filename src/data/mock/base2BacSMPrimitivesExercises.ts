import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = (topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Les fonctions primitives", topic });

const make = (id: string, topic: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4, minutes: number, type: Exercise["type"] = "calculation"): Exercise => ({
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
  examTip: "Identifie d'abord la forme de la dérivée recherchée, puis vérifie le résultat en dérivant.",
  estimatedMinutes: minutes,
  xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "primitives", "integrales"],
});

export const base2BacSMPrimitivesExercises: Exercise[] = [
  make("sm-prim-01", "Définition", "Primitive d'un polynôme", "Déterminer les primitives de f(x)=3x²−4x+5 sur ℝ.", "x³−2x²+5x+C", "On intègre terme à terme : ∫3x²dx=x³, ∫−4xdx=−2x² et ∫5dx=5x. Donc F(x)=x³−2x²+5x+C.", "Intègre chaque monôme séparément.", 1, 3),
  make("sm-prim-02", "Unicité", "Condition initiale", "Déterminer la primitive F de f(x)=4x³−3x²+2 qui vérifie F(1)=4.", "F(x)=x⁴−x³+2x+2", "Une primitive générale est F(x)=x⁴−x³+2x+C. La condition F(1)=4 donne 1−1+2+C=4, donc C=2. Ainsi F(x)=x⁴−x³+2x+2.", "Trouve d'abord la constante avec F(1)=4.", 2, 4, "multi-step"),
  make("sm-prim-03", "Primitives usuelles", "Primitives trigonométriques", "Déterminer une primitive de cos(x)+2sin(x).", "sin(x)−2cos(x)+C", "Une primitive de cos x est sin x et une primitive de 2sin x est −2cos x. Donc F=sin x−2cos x+C.", "Utilise le tableau des primitives usuelles.", 1, 2),
  make("sm-prim-04", "Composition", "Forme U' Uⁿ", "Déterminer une primitive de (2x+1)(x²+x+3)⁴.", "(x²+x+3)⁵/5+C", "Avec U=x²+x+3, U'=2x+1. Une primitive de U'U⁴ est U⁵/5.", "Cherche U et U'.", 2, 4, "multi-step"),
  make("sm-prim-05", "Logarithme", "Forme U'/U", "Déterminer une primitive de (2x)/(x²+1) sur ℝ.", "ln(x²+1)+C", "Avec U=x²+1 et U'=2x, la primitive est ln|U|+C. Comme x²+1>0, ln(x²+1)+C.", "Reconnais la dérivée du dénominateur.", 2, 3),
  make("sm-prim-06", "Changement ax+b", "Cosinus composé", "Déterminer une primitive de cos(3x−2).", "(1/3)sin(3x−2)+C", "La dérivée de sin(3x−2) est 3cos(3x−2), donc on multiplie par 1/3.", "N'oublie pas le coefficient 3.", 1, 2),
  make("sm-prim-07", "Changement ax+b", "Puissance composée", "Déterminer une primitive de (5x−1)⁶.", "(5x−1)⁷/35+C", "La dérivée de (5x−1)⁷ est 35(5x−1)⁶. Il faut donc diviser par 35.", "Le coefficient intérieur devient un facteur au dénominateur.", 2, 3),
  make("sm-prim-08", "Existence", "Continuité", "Une fonction polynomiale est-elle assurée d'admettre une primitive sur ℝ ?", "Oui", "Toute fonction continue sur un intervalle admet une primitive. Toute fonction polynomiale est continue sur ℝ.", "Utilise le théorème d'existence.", 1, 2, "short-answer"),
  make("sm-prim-09", "Intégrale", "Calcul intégral", "Calculer ∫₀² (3x²+1) dx.", "10", "Une primitive est F(x)=x³+x. Donc F(2)−F(0)=8+2=10.", "Trouve une primitive puis applique F(b)−F(a).", 2, 3),
  make("sm-prim-10", "Intégrale", "Relation de Chasles", "On sait ∫₀² f(x)dx=5 et ∫₂⁵ f(x)dx=−1. Calculer ∫₀⁵ f(x)dx.", "4", "Par Chasles, ∫₀⁵f=∫₀²f+∫₂⁵f=5−1=4.", "Découpe l'intégrale au point 2.", 1, 2),
  make("sm-prim-11", "Aire", "Aire algébrique", "Si f(x)=x−1 sur [0,2], calculer ∫₀²f(x)dx.", "0", "Une primitive est x²/2−x. Sa valeur en 2 est 0 et sa valeur en 0 est 0, donc l'intégrale vaut 0. La partie négative et la partie positive se compensent.", "Ne confonds pas intégrale et aire géométrique.", 2, 3, "multi-step"),
  make("sm-prim-12", "Synthèse", "Primitive avec condition", "Déterminer F telle que F'(x)=1/x² sur ]0,+∞[ et F(1)=3.", "F(x)=4−1/x", "Une primitive de x⁻² est −x⁻¹+C, soit F(x)=−1/x+C. Comme F(1)=3, C=4. Donc F(x)=4−1/x.", "Intègre x⁻² comme une puissance.", 2, 4, "multi-step"),
];
