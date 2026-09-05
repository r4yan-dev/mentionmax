import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = (topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Dérivation et étude des fonctions", topic });

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
  examTip: "Pour une étude de fonction, garde l'ordre domaine → dérivée → signe → variations → extrema.",
  estimatedMinutes: minutes,
  xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "derivation", "fonctions"],
});

export const base2BacSMDerivationExercises: Exercise[] = [
  make("sm-deriv-01", "Nombre dérivé", "Taux de variation", "Calculer lim(x→1) (x²−1)/(x−1).", "2", "On reconnaît le taux de variation de f(x)=x² en a=1. Donc la limite vaut f'(1)=2.", "Reconnais la définition du nombre dérivé.", 1, 2, "short-answer"),
  make("sm-deriv-02", "Tangente", "Équation de la tangente", "Pour f(x)=x²+1, déterminer la tangente au point d'abscisse 2.", "y=4x−3", "f'(x)=2x, donc f'(2)=4 et f(2)=5. La tangente est y=4(x−2)+5=4x−3.", "Utilise y=f'(a)(x−a)+f(a).", 2, 4),
  make("sm-deriv-03", "Dérivabilité", "Valeur absolue", "La fonction f(x)=|x| est-elle dérivable en 0 ?", "Non", "La dérivée à droite en 0 vaut 1 et la dérivée à gauche vaut −1. Elles sont différentes, donc f n'est pas dérivable en 0.", "Compare les deux dérivées latérales.", 1, 3, "short-answer"),
  make("sm-deriv-04", "Dérivées usuelles", "Dérivée d'une puissance", "Calculer la dérivée de f(x)=3x⁵−2x²+7x−1.", "f'(x)=15x⁴−4x+7", "On dérive terme à terme : (3x⁵)'=15x⁴, (−2x²)'=−4x, (7x)'=7 et la constante donne 0.", "Applique la dérivée de xⁿ terme à terme.", 1, 3),
  make("sm-deriv-05", "Produit", "Règle du produit", "Calculer la dérivée de f(x)=x²sin(x).", "f'(x)=2xsin(x)+x²cos(x)", "Avec u=x² et v=sin x, (uv)'=u'v+uv'=2xsin x+x²cos x.", "Utilise (uv)'=u'v+uv'.", 2, 3),
  make("sm-deriv-06", "Quotient", "Règle du quotient", "Calculer la dérivée de f(x)=x/(x+1) sur son domaine.", "f'(x)=1/(x+1)²", "f'=[(1)(x+1)−x(1)]/(x+1)²=1/(x+1)².", "Écris le numérateur u'v−uv'.", 2, 4),
  make("sm-deriv-07", "Composition", "Dérivée composée", "Calculer la dérivée de f(x)=sin(x²−4x+1).", "f'(x)=(2x−4)cos(x²−4x+1)", "Avec u=x²−4x+1, u'=2x−4 et (sin u)'=u'cos u.", "Ne perds pas la dérivée de la fonction intérieure.", 2, 3),
  make("sm-deriv-08", "Racine composée", "Dérivée d'une racine", "Calculer la dérivée de f(x)=√(x²+2x+5).", "f'(x)=(x+1)/√(x²+2x+5)", "f'= (2x+2)/(2√(x²+2x+5))=(x+1)/√(x²+2x+5).", "Applique la règle de chaîne à √u.", 2, 4),
  make("sm-deriv-09", "Variations", "Étude de signe", "Étudier les variations de f(x)=x²−4x+3 sur ℝ.", "Décroissante sur ]−∞,2] puis croissante sur [2,+∞[", "f'(x)=2x−4=2(x−2). Elle est négative avant 2 et positive après 2. Donc f décroît puis croît, avec minimum f(2)=−1.", "Étudie le signe de f'.", 2, 5, "multi-step"),
  make("sm-deriv-10", "Extrema", "Extremum local", "Déterminer l'extremum de f(x)=−x²+6x−5 sur ℝ.", "Maximum 4 en x=3", "f'(x)=−2x+6, donc f'=0 pour x=3. Le signe passe de + à − : maximum. f(3)=−9+18−5=4.", "Résous f'(x)=0 puis étudie le changement de signe.", 2, 4, "multi-step"),
  make("sm-deriv-11", "Réciproque", "Dérivée de la réciproque", "On sait f(2)=5 et f'(2)=3. Calculer (f⁻¹)'(5).", "1/3", "La formule donne (f⁻¹)'(f(2))=1/f'(2)=1/3.", "Utilise directement la formule de la fonction réciproque.", 2, 3, "short-answer"),
  make("sm-deriv-12", "Synthèse", "Étude complète", "Pour f(x)=x+3/x sur ]0,+∞[, calculer f'(x) et déterminer ses variations.", "f'(x)=1−3/x² ; décroissante sur ]0,√3] puis croissante sur [√3,+∞[", "f'=1−3/x²=(x²−3)/x². Comme x²>0, le signe dépend de x²−3. Il est négatif pour 0<x<√3 et positif pour x>√3. Donc f décroît puis croît.", "Factorise le signe de f' et note que x²>0.", 4, 6, "multi-step"),
];
