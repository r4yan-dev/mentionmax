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
  make("sm-prim-13", "Série source", "Primitive polynomiale", "Déterminer une primitive de f₁(x)=2x⁵−3x²−1.", "F(x)=x⁶/3−x³−x+C", "On intègre terme à terme : 2∫x⁵dx=x⁶/3, −3∫x²dx=−x³ et ∫(−1)dx=−x. Donc F=x⁶/3−x³−x+C.", "Applique la règle ∫xⁿdx=xⁿ⁺¹/(n+1).", 1, 3),
  make("sm-prim-14", "Série source", "Puissances et racines", "Déterminer une primitive de f₃(x)=√x(x²+2√x) sur ]0,+∞[.", "F(x)=2x^(7/2)/7+x³/3+C", "Développer donne x^(5/2)+2x. On intègre : x^(7/2)/(7/2)=2x^(7/2)/7 et 2x donne x². Donc F=2x^(7/2)/7+x²+C.", "Réécris √x en puissance x^(1/2), puis développe.", 3, 5, "multi-step"),
  make("sm-prim-15", "Série source", "Racine affine", "Déterminer une primitive de f₄(x)=√x+2 sur [0,+∞[.", "F(x)=2x^(3/2)/3+2x+C", "On utilise ∫√x dx=∫x^(1/2)dx=(2/3)x^(3/2). Puis ∫2dx=2x.", "Écris √x=x^(1/2).", 1, 3),
  make("sm-prim-16", "Série source", "Racine composée", "Déterminer une primitive de f₅(x)=(2x+1)√(2x+1).", "F(x)=2/5(2x+1)^(5/2)+C", "Avec U=2x+1, U'=2. Comme (2x+1)√(2x+1)=U^(3/2), une primitive est U^(5/2)/(5/2) puis il faut le facteur 1/2 : 2/5 U^(5/2).", "Réécris l'expression comme U^(3/2).", 3, 5, "multi-step"),
  make("sm-prim-17", "Série source", "Sinus composé", "Déterminer une primitive de f₆(x)=sin(5−2x).", "(1/2)cos(5−2x)+C", "La dérivée de cos(5−2x) vaut 2sin(5−2x), donc une primitive est (1/2)cos(5−2x)+C.", "Vérifie le signe après dérivation.", 2, 3),
  make("sm-prim-18", "Série source", "Cosinus composé", "Déterminer une primitive de f₇(x)=cos(3x−1).", "(1/3)sin(3x−1)+C", "La dérivée de sin(3x−1) est 3cos(3x−1). Il faut donc multiplier par 1/3.", "Repère le coefficient 3.", 1, 2),
  make("sm-prim-19", "Série source", "Forme U'U²", "Déterminer une primitive de f₈(x)=(3x²−1)(x³−x)².", "(x³−x)³/3+C", "Avec U=x³−x, U'=3x²−1. Une primitive de U'U² est U³/3+C.", "Cherche exactement U'.", 2, 4, "multi-step"),
  make("sm-prim-20", "Série source", "Puissance de sinus", "Déterminer une primitive de f₉(x)=cos(x)(sin x)⁴.", "(sin x)⁵/5+C", "Avec U=sin x et U'=cos x, une primitive de U'U⁴ est U⁵/5+C.", "Pose U=sin x.", 2, 3),
  make("sm-prim-21", "Série source", "Racine quadratique", "Déterminer une primitive de f₁₀(x)=2x/√(x²+1).", "2√(x²+1)+C", "La dérivée de √(x²+1) est x/√(x²+1). Il faut donc multiplier par 2.", "Reconnais la dérivée de la racine.", 2, 3),
  make("sm-prim-22", "Synthèse série source", "Condition initiale Bac", "Déterminer la primitive F de f(x)=4x³−5x²+8x−7 sur ℝ vérifiant F(1)=0.", "F(x)=x⁴−5x³/3+4x²−7x+5/3", "Une primitive générale est x⁴−5x³/3+4x²−7x+C. La condition F(1)=0 donne 1−5/3+4−7+C=0, donc C=5/3.", "Intègre d'abord, puis applique F(1)=0.", 3, 5, "multi-step"),
];
