import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = () => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Fonctions exponentielles", topic: "Exponentielle népérienne et fonctions exponentielles" });
const make = (id: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "multi-step"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Rédige comme au Bac : justifie la propriété utilisée, garde les valeurs exactes et vérifie le domaine avant de conclure.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "exponentielle"],
});

export const base2BacSMExponentialExercises: Exercise[] = [
  make("sm-exp-01", "Simplification", "Simplifier e^3 × e^(−5).", "e^(−2)", "e^3e^(−5)=e^(3−5)=e^(−2).", "Additionne les exposants.", 1, 2, "calculation"),
  make("sm-exp-02", "Équation élémentaire", "Résoudre e^(2x−1)=e^5.", "x=3", "L'exponentielle est injective : 2x−1=5, donc x=3.", "Compare les exposants.", 1, 3),
  make("sm-exp-03", "Équation avec ln", "Résoudre e^x=7.", "x=ln 7", "Les deux membres sont positifs. En appliquant ln, on obtient x=ln 7.", "Utilise la fonction réciproque.", 2, 3),
  make("sm-exp-04", "Inéquation", "Résoudre e^(3x−2)>e^4.", "x>2", "e^x est strictement croissante, donc 3x−2>4, soit x>2.", "L'exponentielle conserve l'ordre.", 2, 3),
  make("sm-exp-05", "Dérivée", "Calculer la dérivée de f(x)=e^(4x−3).", "f'(x)=4e^(4x−3)", "Avec u=4x−3, u'=4. Donc f'=u'e^u.", "N'oublie pas la dérivée de l'exposant.", 2, 3, "calculation"),
  make("sm-exp-06", "Produit", "Dériver f(x)=xe^(−x).", "f'(x)=e^(−x)(1−x)", "Par produit, f'=e^(−x)−xe^(−x)=e^(−x)(1−x).", "Factorise e^(−x).", 2, 4),
  make("sm-exp-07", "Équation en e^x", "Résoudre e^(2x)−5e^x+6=0.", "x=ln 2 ou x=ln 3", "Poser X=e^x>0. Alors X²−5X+6=(X−2)(X−3), donc X=2 ou 3.", "Pose X=e^x et garde X>0.", 3, 5),
  make("sm-exp-08", "Inéquation en e^x", "Résoudre e^(2x)−3e^x−4≥0.", "x≥ln 4", "Avec X=e^x>0, (X−4)(X+1)≥0. Comme X>0, X≥4, donc x≥ln4.", "La contrainte X>0 élimine une partie des solutions.", 3, 6),
  make("sm-exp-09", "Base 2", "Résoudre 2^x=7.", "x=ln7/ln2", "2^x=e^(x ln2). Donc x ln2=ln7, d'où x=ln7/ln2.", "Prends ln des deux membres.", 2, 4),
  make("sm-exp-10", "Variations", "Étudier les variations de f(x)=3e^x−2x.", "f décroît sur ]−∞,ln(2/3)] puis croît sur [ln(2/3),+∞[", "f'=3e^x−2. Le zéro est x=ln(2/3). Le signe est négatif avant et positif après.", "Résous f'(x)=0 puis étudie son signe.", 3, 6),
  make("sm-exp-11", "Extremum", "Déterminer le minimum de f(x)=e^x−x.", "Minimum 1 atteint en x=0", "f'=e^x−1. Elle est négative sur ]−∞,0[ et positive sur ]0,+∞[. Donc f(0)=1 est le minimum.", "Étudie le signe de e^x−1.", 3, 5),
  make("sm-exp-12", "Limite", "Calculer lim(x→+∞) e^x/x^3.", "+∞", "L'exponentielle domine toute puissance polynomiale à +∞.", "Utilise une limite de croissance comparée.", 2, 3, "calculation"),
  make("sm-exp-13", "Limite", "Calculer lim(x→−∞) x²e^x.", "0", "Poser t=−x. Alors x²e^x=t²e^(−t)=t²/e^t→0.", "Transforme en quotient par une exponentielle.", 3, 5),
  make("sm-exp-14", "Primitive", "Déterminer une primitive de 2e^(2x+1).", "F(x)=e^(2x+1)+C", "La dérivée de e^(2x+1) est 2e^(2x+1).", "Vérifie par dérivation.", 2, 3, "calculation"),
  make("sm-exp-15", "Tangente", "Déterminer la tangente à y=e^x au point d'abscisse 0.", "y=x+1", "f(0)=1 et f'(0)=1. La tangente est donc y=x+1.", "Utilise y=f'(a)(x−a)+f(a).", 2, 4),
  make("sm-exp-16", "Convexité", "Étudier la convexité de f(x)=e^x−x.", "f est strictement convexe sur ℝ", "f''(x)=e^x>0 pour tout x. Donc f est strictement convexe.", "Le signe de f'' suffit.", 2, 4, "proof"),
  make("sm-exp-17", "Asymptote", "Montrer que f(x)=x−(e^x−1)/(e^x+1) admet une asymptote oblique en +∞ et la déterminer.", "y=x−1", "(e^x−1)/(e^x+1)=1−2/(e^x+1), donc f(x)=x−1+2/(e^x+1). Le dernier terme tend vers 0.", "Réécris le quotient avant de prendre la limite.", 4, 7, "proof"),
  make("sm-exp-18", "Étude de fonction", "Étudier les variations de f(x)=x−ln(1+e^x).", "f est strictement croissante sur ℝ", "f'=1−e^x/(1+e^x)=1/(1+e^x)>0. Donc f est strictement croissante.", "Simplifie f' avant d'étudier son signe.", 4, 6),
  make("sm-exp-19", "Suite récurrente", "On pose u0=1 et u(n+1)=e^(u_n−1). Montrer que 1 est un point fixe et donner l'équation que doit vérifier une limite éventuelle.", "1 est point fixe ; l=e^(l−1)", "f(1)=e^0=1. Si la suite converge vers l, la continuité donne l=f(l), donc l=e^(l−1).", "Distingue point fixe et preuve de convergence.", 4, 6, "proof"),
  make("sm-exp-20", "Synthèse Bac", "On considère f(x)=e^x/(1+e^x). Étudier ses variations, déterminer ses limites aux deux infinis et montrer qu'elle possède un centre de symétrie.", "f croît de 0 vers 1 ; centre (0,1/2)", "f'=e^x/(1+e^x)^2>0. Les limites sont 0 en −∞ et 1 en +∞. Enfin f(x)+f(−x)=1, ce qui montre une symétrie centrale de centre (0,1/2).", "Calcule f(−x) et exploite f(x)+f(−x).", 5, 9, "multi-step"),
];
