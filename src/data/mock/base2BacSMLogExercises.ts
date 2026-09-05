import type { Exercise } from "../../types/content";

const target = (topic: string) => ({ trackIds: ["SMA", "SMB"] as const, subjectId: "maths" as const, chapter: "Fonctions logarithmes", topic });
const make = (id: string, topic: string, title: string, statement: string, answer: string, correction: string, difficulty: 1 | 2 | 3 | 4, minutes: number, type: Exercise["type"] = "calculation"): Exercise => ({ id, mode: "BASE", source: "APPROVED", target: target(topic), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint: "Commence par le domaine puis choisis la propriété de ln adaptée.", examTip: "Pour un exercice logarithmique, vérifie toujours les conditions de positivité.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6, tags: ["2BAC SM", "ln", "logarithme"] });

export const base2BacSMLogExercises: Exercise[] = [
  make("sm-log-01", "Variations", "Variations de ln", "Étudier les variations de ln sur ]0,+∞[.", "ln est strictement croissante", "ln'(x)=1/x>0 sur ]0,+∞[, donc ln est strictement croissante.", 1, 2, "short-answer"),
  make("sm-log-02", "Signe", "Signe de ln", "Étudier le signe de ln(x) sur ]0,+∞[.", "ln(x)<0 sur ]0,1[, ln(1)=0, ln(x)>0 sur ]1,+∞[", "Comme ln est croissante et ln(1)=0, le signe suit la position de x par rapport à 1.", 1, 2),
  make("sm-log-03", "Domaine", "Domaine de ln(3x+9)", "Déterminer le domaine de définition de ln(3x+9).", "]-3,+∞[", "Il faut 3x+9>0, donc x>-3.", 1, 2),
  make("sm-log-04", "Domaine", "Domaine d'un quotient", "Déterminer le domaine de ln((x+1)/(x-2)).", "]-∞,-1[ ∪ ]2,+∞[", "Il faut (x+1)/(x-2)>0. Le tableau de signes donne ]-∞,-1[ ∪ ]2,+∞[.", 2, 4),
  make("sm-log-05", "Propriétés", "Produit et quotient", "Simplifier ln(9)+ln(3)-ln(27).", "0", "ln(9)+ln(3)=ln(27), donc l'expression vaut 0.", 1, 2),
  make("sm-log-06", "Propriétés", "Puissance", "Simplifier ln(√8).", "3/2 ln(2)", "√8=2^(3/2), donc ln(√8)=3/2 ln(2).", 1, 2),
  make("sm-log-07", "Équation", "Égalité de logarithmes", "Résoudre ln(x-1)=ln(2-x).", "x=3/2", "Le domaine est 1<x<2. Comme ln est injective, x-1=2-x, donc x=3/2.", 2, 3, "multi-step"),
  make("sm-log-08", "Équation", "Équation quadratique", "Résoudre ln(x²-2x)=0.", "x=1-√2 ou x=1+√2", "Domaine x<0 ou x>2. ln(u)=0 équivaut à u=1, donc x²-2x-1=0.", 2, 4, "multi-step"),
  make("sm-log-09", "Inéquation", "Comparer deux logarithmes", "Résoudre ln(2x-1)≥ln(x).", "[1,+∞[", "Domaine x>1/2. Comme ln est croissante, 2x-1≥x, donc x≥1.", 2, 3, "multi-step"),
  make("sm-log-10", "Domaine", "ln(ln x)", "Déterminer le domaine de ln(ln x).", "]1,+∞[", "Il faut ln(x)>0, donc x>1.", 1, 2, "short-answer"),
  make("sm-log-11", "Équation", "Équation 4ln(x)=3", "Résoudre 4ln(x)=3.", "x=e^(3/4)", "Pour x>0, ln(x)=3/4 puis x=e^(3/4).", 1, 2, "short-answer"),
  make("sm-log-12", "Équation", "Polynôme en ln(x)", "Résoudre (ln x)^2-4ln x+3=0.", "x=e ou x=e^3", "Poser t=ln x. Alors (t-1)(t-3)=0, donc t=1 ou 3.", 2, 4, "multi-step"),
  make("sm-log-13", "Limite", "ln x sur x", "Calculer lim(x→+∞) ln(x)/x.", "0", "Le logarithme est négligeable devant toute puissance positive, donc ln(x)/x→0.", 1, 2, "short-answer"),
  make("sm-log-14", "Limite", "ln x - racine", "Calculer lim(x→+∞)(ln x-√x).", "-∞", "√x domine ln x à l'infini.", 1, 2, "short-answer"),
  make("sm-log-15", "Limite", "Quotient logarithmique", "Calculer lim(x→e)(ln x-1)/(x-e).", "1/e", "C'est le taux de variation de ln en e, donc la limite vaut ln'(e)=1/e.", 2, 3, "short-answer"),
  make("sm-log-16", "Dérivée", "Dérivée de ln(u)", "Calculer la dérivée de ln(x²-x+1).", "(2x-1)/(x²-x+1)", "u=x²-x+1>0 et u'=2x-1, donc (ln u)'=u'/u.", 1, 3),
  make("sm-log-17", "Dérivée", "Dérivée de ln(ln x)", "Calculer la dérivée de ln(ln x).", "1/(x ln x)", "Sur x>1, appliquer u'/u avec u=ln x.", 2, 3),
  make("sm-log-18", "Dérivée", "Produit avec ln", "Calculer la dérivée de x ln(2x-1).", "ln(2x-1)+2x/(2x-1)", "Utiliser la règle du produit.", 2, 4),
  make("sm-log-19", "Primitive", "Primitive de u'/u", "Déterminer les primitives de 1/(x ln x) sur ]1,+∞[.", "ln(ln x)+C", "La dérivée de ln(ln x) est 1/(x ln x).", 2, 3),
  make("sm-log-20", "Log base a", "Logarithme base 2", "Calculer log_2(8)-log_3(27)+log_5(1/125).", "-3", "3-3-3=-3.", 1, 2, "short-answer"),
  make("sm-log-21", "Log décimal", "Logarithme décimal", "Calculer log(1000)-log(0,0001)+log(1/10000).", "3", "3-(-4)+(-4)=3.", 1, 3, "short-answer"),
  make("sm-log-22", "Synthèse", "Fonction type", "Pour f(x)=2x ln x-2x, déterminer f'(x).", "2ln x", "f'(x)=2ln x+2-2=2ln x.", 2, 3),
];
