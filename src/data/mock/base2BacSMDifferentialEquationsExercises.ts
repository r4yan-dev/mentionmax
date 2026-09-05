import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = () => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Équations différentielles", topic: "Équations différentielles linéaires" });
const make = (id: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "multi-step"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Commence par écrire la forme générale de la solution, puis utilise les conditions initiales. Vérifie la solution par substitution lorsqu'une question de validation est demandée.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "équations différentielles"],
});

export const base2BacSMDifferentialEquationsExercises: Exercise[] = [
  make("sm-diff-01", "Premier ordre homogène", "Résoudre y'=3y sur ℝ.", "y(x)=Ce^(3x)", "C'est l'équation y'=ay avec a=3. Les solutions sont y=Ce^(3x).", "Reconnais la forme y'=ay.", 1, 3, "calculation"),
  make("sm-diff-02", "Condition initiale", "Résoudre y'=−2y avec y(0)=5.", "y=5e^(−2x)", "La solution générale est Ce^(−2x). La condition y(0)=5 donne C=5.", "Remplace x par 0 dans la solution générale.", 1, 3),
  make("sm-diff-03", "Premier ordre", "Résoudre y'+4y=8.", "y=2+Ce^(−4x)", "Une solution particulière constante vaut 2. La solution de l'homogène y'+4y=0 est Ce^(−4x).", "Cherche d'abord une solution constante.", 2, 4),
  make("sm-diff-04", "Condition initiale", "Résoudre y'+2y=4 avec y(0)=−1.", "y=2−3e^(−2x)", "La solution générale est y=2+Ce^(−2x). Comme y(0)=−1, C=−3.", "Utilise la condition initiale après la forme générale.", 2, 4),
  make("sm-diff-05", "Vérification", "Vérifier que y=3e^(2x)−1 est solution de y'−2y=2.", "Oui", "y'=6e^(2x), donc y'−2y=6e^(2x)−2(3e^(2x)−1)=2.", "Dérive puis remplace dans l'équation.", 2, 4, "proof"),
  make("sm-diff-06", "Modèle de croissance", "Une population vérifie P'=0,05P et P(0)=1200. Déterminer P(t).", "P(t)=1200e^(0,05t)", "La solution générale est Ce^(0,05t). P(0)=1200 donne C=1200.", "Même méthode que y'=ay avec une donnée initiale.", 2, 4),
  make("sm-diff-07", "Doublement", "Pour P(t)=1200e^(0,05t), déterminer T tel que P(T)=2400.", "T=20ln2", "1200e^(0,05T)=2400 donne e^(0,05T)=2, donc 0,05T=ln2 et T=20ln2.", "Commence par diviser par 1200.", 3, 5),
  make("sm-diff-08", "Équation caractéristique", "Pour y''−5y'+6y=0, déterminer l'équation caractéristique et ses racines.", "r=2 et r=3", "L'équation caractéristique est r²−5r+6=0=(r−2)(r−3).", "Factorise le polynôme caractéristique.", 2, 4),
  make("sm-diff-09", "Solution générale", "Résoudre y''−5y'+6y=0.", "y=Ae^(2x)+Be^(3x)", "Les deux racines réelles distinctes 2 et 3 donnent la combinaison Ae^(2x)+Be^(3x).", "Deux racines réelles distinctes donnent deux exponentielles.", 3, 4),
  make("sm-diff-10", "Deux conditions initiales", "Résoudre y''−5y'+6y=0 avec y(0)=1 et y'(0)=0.", "y=3e^(2x)−2e^(3x)", "A+B=1 et 2A+3B=0. On obtient A=3 et B=−2.", "Écris les deux équations sur A et B.", 4, 7),
  make("sm-diff-11", "Racine double", "Résoudre y''+4y'+4y=0.", "y=(A+Bx)e^(−2x)", "r²+4r+4=(r+2)². La racine double r=−2 donne y=(A+Bx)e^(−2x).", "Pour Δ=0, le second terme contient x.", 3, 5),
  make("sm-diff-12", "Racines complexes", "Résoudre y''+2y'+5y=0.", "y=e^(−x)(A cos2x+B sin2x)", "r²+2r+5=0 donne r=−1±2i. La solution réelle est e^(−x)(A cos2x+B sin2x).", "Calcule p et q dans p±iq.", 4, 6),
  make("sm-diff-13", "Oscillation amortie", "Pour une solution de la forme e^(−x)(A cos2x+B sin2x), identifier le facteur d'amortissement et la pulsation.", "amortissement e^(−x), pulsation 2", "Le facteur exponentiel e^(−x) décrit l'amortissement et les fonctions trigonométriques de 2x donnent la pulsation 2.", "Sépare les deux rôles dans l'expression.", 3, 4, "short-answer"),
  make("sm-diff-14", "Vérification second ordre", "Vérifier que y=xe^(−2x) vérifie y''+4y'+4y=0.", "Oui", "y'=(1−2x)e^(−2x), y''=(4x−4)e^(−2x). Alors y''+4y'+4y=0 après simplification.", "Calcule y' puis y'' avant de remplacer.", 4, 7, "proof"),
  make("sm-diff-15", "Décroissance", "V(t) vérifie V'=−0,03V et V(0)=50000. Donner V(t) puis V(10).", "V(t)=50000e^(−0,03t) ; V(10)=50000e^(−0,3)", "Solution Ce^(−0,03t), avec C=50000 par la condition initiale. On remplace ensuite t par 10.", "Applique deux fois la même forme.", 2, 5),
  make("sm-diff-16", "Variations", "Résoudre y'+y=3 avec y(0)=4 et étudier les variations de y.", "y=3+e^(−x), décroissante", "y=3+Ce^(−x), C=1. Donc y'=−e^(−x)<0, la fonction est strictement décroissante.", "La dérivée de la solution donne le sens de variation.", 3, 5),
  make("sm-diff-17", "Paramètres", "Résoudre y''−4y'+4y=0 avec y(0)=2 et y'(0)=1.", "y=(2−3x)e^(2x)", "La racine double est 2. Donc y=(A+Bx)e^(2x), A=2 et B+2A=1, donc B=−3.", "Dérive la forme à racine double.", 5, 8),
  make("sm-diff-18", "Modèle complet", "Une grandeur vérifie y'+2y=6, y(0)=0. Déterminer y(t) puis le temps t pour lequel y(t)=2.", "y=3(1−e^(−2t)) ; t=(ln3)/2", "La solution est y=3+Ce^(−2t), avec C=−3. Puis 2=3(1−e^(−2t)) donne e^(−2t)=1/3, donc t=(ln3)/2.", "Sépare la résolution différentielle et la résolution de l'équation en t.", 4, 8),
  make("sm-diff-19", "Synthèse second ordre", "Résoudre y''−2y'+5y=0 avec y(0)=1 et y'(0)=3.", "y=e^x(cos2x+sin2x)", "r²−2r+5=0 donne 1±2i. Donc y=e^x(A cos2x+B sin2x). y(0)=1 donne A=1 et y'(0)=3 donne 1+2B=3, donc B=1.", "Utilise les deux conditions après avoir dérivé la forme générale.", 5, 9),
  make("sm-diff-20", "Problème Bac", "On considère y'+ay=b avec a>0 et y(0)=y0. Montrer que y(t)=b/a+(y0−b/a)e^(−at), puis déterminer sa limite lorsque t→+∞.", "y(t)=b/a+(y0−b/a)e^(−at) ; lim y=b/a", "La solution générale est y=b/a+Ce^(−at). La condition y(0)=y0 donne C=y0−b/a. Comme a>0, e^(−at)→0, donc y(t)→b/a.", "Commence par déterminer la solution particulière constante.", 5, 9, "multi-step"),
];
