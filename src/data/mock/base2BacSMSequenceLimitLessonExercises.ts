import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = () => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Suites numériques", topic: "Limite d'une suite numérique" });
const make = (id: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "multi-step"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Pour une limite, identifie d'abord le type de forme obtenu, puis annonce la propriété ou transformation utilisée avant le calcul.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "limite suite"],
});

export const base2BacSMSequenceLimitLessonExercises: Exercise[] = [
  make("sm-seqlimit-01", "Limite fondamentale", "Calculer lim(n→+∞) 1/n.", "0", "C'est une limite fondamentale : 1/n→0.", "Utilise la suite de référence.", 1, 2, "calculation"),
  make("sm-seqlimit-02", "Puissance", "Calculer lim(n→+∞) 1/n^3.", "0", "n^3→+∞, donc son inverse tend vers 0.", "Réécris en n^(−3).", 1, 2, "calculation"),
  make("sm-seqlimit-03", "Géométrique", "Calculer lim(n→+∞)(3/4)^n.", "0", "|3/4|<1, donc la suite géométrique converge vers 0.", "Compare |q| à 1.", 1, 2),
  make("sm-seqlimit-04", "Géométrique", "Calculer lim(n→+∞)(5/2)^n.", "+∞", "La raison est strictement supérieure à 1, donc la suite tend vers +∞.", "Compare q à 1.", 1, 2),
  make("sm-seqlimit-05", "Quotient", "Calculer lim(n→+∞)(2n^2+3)/(n^2−1).", "2", "En divisant par n², on obtient (2+3/n²)/(1−1/n²)→2.", "Divise par le terme dominant.", 2, 3),
  make("sm-seqlimit-06", "Quotient", "Calculer lim(n→+∞)(3n^3−n)/(6n^3+4).", "1/2", "Après division par n³, les termes de degré inférieur tendent vers 0. La limite vaut 3/6.", "Compare les coefficients des termes dominants.", 2, 3),
  make("sm-seqlimit-07", "Rationalisation", "Calculer lim(n→+∞)(√(n²+n)−n).", "1/2", "Rationaliser : n/(√(n²+n)+n), puis diviser par n. On obtient 1/(√(1+1/n)+1)→1/2.", "Multiplie par la quantité conjuguée.", 3, 5),
  make("sm-seqlimit-08", "Rationalisation", "Calculer lim(n→+∞)n(√(1+2/n)−1).", "1", "Rationaliser : 2/(√(1+2/n)+1)→1.", "La quantité n se simplifie après rationalisation.", 4, 5),
  make("sm-seqlimit-09", "Gendarmes", "Montrer que u_n=sin(n)/(n+1) converge et donner sa limite.", "0", "−1/(n+1)≤u_n≤1/(n+1). Les deux bornes tendent vers 0.", "Utilise −1≤sin n≤1.", 2, 4, "proof"),
  make("sm-seqlimit-10", "Gendarmes", "Montrer que u_n=(−1)^n/n converge.", "0", "−1/n≤(−1)^n/n≤1/n et les deux bornes tendent vers 0.", "Encadre (−1)^n.", 2, 4, "proof"),
  make("sm-seqlimit-11", "Comparaison", "Montrer que u_n=−2n+cos n tend vers −∞.", "−∞", "u_n≤−2n+1 et −2n+1→−∞. Par comparaison, u_n→−∞.", "Encadre cos n.", 2, 4, "proof"),
  make("sm-seqlimit-12", "Forme indéterminée", "Calculer lim(n→+∞)(n^2+1−n)/(2n^2−3n+4).", "1/2", "Diviser par n² : (1+1/n²−1/n)/(2−3/n+4/n²)→1/2.", "Divise chaque terme par n².", 2, 3),
  make("sm-seqlimit-13", "Croissance comparée", "Calculer lim(n→+∞)ln(n)/n.", "0", "Le logarithme est dominé par n : ln n/n→0.", "Utilise la croissance comparée.", 3, 4),
  make("sm-seqlimit-14", "Croissance comparée", "Calculer lim(n→+∞)n/2^n.", "0", "La croissance exponentielle domine toute puissance polynomiale : n/2^n→0.", "Compare n et 2^n.", 3, 4),
  make("sm-seqlimit-15", "Continuité", "On sait u_n→3. Calculer lim √(u_n+6).", "3", "La fonction x↦√(x+6) est continue en 3. Donc la limite vaut √9=3.", "Applique la composition par une fonction continue.", 2, 3),
  make("sm-seqlimit-16", "Suite récurrente", "Une suite convergente vérifie u_{n+1}=(u_n+6)/3. Déterminer sa limite.", "3", "Par continuité, l=(l+6)/3, donc 3l=l+6 et l=3.", "Écris l=f(l).", 2, 4),
  make("sm-seqlimit-17", "Suite récurrente", "Une suite convergente vérifie u_{n+1}=(u_n+4)/(u_n+2). Déterminer les limites possibles.", "(−1+√17)/2 ou (−1−√17)/2", "l=(l+4)/(l+2) donne l²+l−4=0, donc l=(−1±√17)/2.", "Résous l=f(l) en faisant attention au domaine.", 4, 6),
  make("sm-seqlimit-18", "Oscillation", "Étudier l'existence d'une limite pour u_n=(−1)^n+1/n.", "Aucune limite", "La sous-suite paire tend vers 1 et la sous-suite impaire vers −1. La suite ne possède donc pas de limite.", "Sépare les rangs pairs et impairs.", 3, 5, "proof"),
  make("sm-seqlimit-19", "Récurrence et convergence", "u_0=1 et u_{n+1}=(u_n+2)/2. Montrer que 1≤u_n≤2 puis que la suite converge vers 2.", "u_n→2", "La stabilité de [1,2] se montre par récurrence. Ensuite u_{n+1}−u_n=(2−u_n)/2≥0, donc la suite est croissante et majorée par 2. Elle converge et le point fixe donne l=2.", "Fais stabilité, monotonie, convergence, puis point fixe.", 4, 8, "multi-step"),
  make("sm-seqlimit-20", "Synthèse Bac", "u_0=4 et u_{n+1}=√(u_n+2). Montrer que la suite est minorée par 2 et décroissante, puis déterminer sa limite.", "u_n→2", "Si u_n≥2, alors u_{n+1}=√(u_n+2)≥2. De plus pour x≥2, √(x+2)≤x car (x−2)(x+1)≥0. La suite décroît et est minorée par 2. Elle converge ; l=√(l+2), donc l²−l−2=0 et l=2 puisque l≥2.", "Ne saute aucune étape : stabilité, monotonie, bornitude, point fixe.", 5, 9, "multi-step"),
];
