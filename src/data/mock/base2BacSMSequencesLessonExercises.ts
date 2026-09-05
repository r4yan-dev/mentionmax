import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = () => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Suites numériques", topic: "Suites numériques" });
const make = (id: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "multi-step"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Rédige les démonstrations par étapes : propriété, calcul, conclusion. Au Bac, la récurrence et l'étude de monotonie doivent être justifiées.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "suites numériques"],
});

export const base2BacSMSequencesLessonExercises: Exercise[] = [
  make("sm-seq-lesson-01", "Suite arithmétique", "u0=7 et u(n+1)=u_n+4. Déterminer u_n puis u_20.", "u_n=7+4n ; u_20=87", "La raison est 4, donc u_n=u0+4n=7+4n. Alors u20=87.", "Identifie une suite arithmétique.", 1, 3, "calculation"),
  make("sm-seq-lesson-02", "Suite arithmétique", "u2=9 et u7=24. Déterminer la raison et u0.", "r=3 ; u0=3", "u7−u2=5r=15, donc r=3. Puis u2=u0+6, donc u0=3.", "Écris deux expressions du terme général.", 2, 4),
  make("sm-seq-lesson-03", "Somme", "Calculer S=5+8+11+…+65.", "S=735", "r=3 et 65=5+3×20, donc 21 termes. S=21(5+65)/2=735.", "Détermine le nombre de termes.", 2, 4, "calculation"),
  make("sm-seq-lesson-04", "Suite géométrique", "u0=3 et u(n+1)=2u_n. Déterminer u_n puis u_8.", "u_n=3·2^n ; u8=768", "Suite géométrique de raison 2 : u_n=3·2^n, donc u8=768.", "Reconnais le multiplicateur constant.", 1, 3),
  make("sm-seq-lesson-05", "Somme géométrique", "Calculer 1+3+3²+…+3^8.", "9841", "La somme vaut (3^9−1)/(3−1)=9841.", "Utilise la formule de somme géométrique.", 2, 4, "calculation"),
  make("sm-seq-lesson-06", "Monotonie", "Étudier le sens de variation de u_n=n/(n+2).", "u_n est croissante", "u(n+1)−u_n=2/((n+2)(n+3))>0. Donc la suite est strictement croissante.", "Calcule la différence entre deux termes consécutifs.", 2, 4, "proof"),
  make("sm-seq-lesson-07", "Bornitude", "Montrer que la suite u_n=2−1/(n+1) est bornée.", "1≤u_n<2", "Pour n≥0, 0<1/(n+1)≤1. Ainsi 1≤u_n<2.", "Encadre 1/(n+1).", 2, 4, "proof"),
  make("sm-seq-lesson-08", "Récurrence", "u0=1 et u(n+1)=(u_n+3)/2. Montrer que 1≤u_n≤3.", "1≤u_n≤3", "Si 1≤u_n≤3, alors 2≤u(n+1)≤3. L'initialisation u0=1 est vraie, donc la propriété est vraie par récurrence.", "Étudie l'image de [1,3].", 3, 6, "proof"),
  make("sm-seq-lesson-09", "Monotonie récurrente", "Pour la suite précédente, montrer qu'elle est croissante.", "La suite est croissante", "u(n+1)−u_n=(3−u_n)/2≥0 puisque u_n≤3.", "Utilise la borne supérieure.", 3, 4, "proof"),
  make("sm-seq-lesson-10", "Convergence", "Pour la suite précédente, déterminer la limite.", "3", "La suite est croissante et majorée par 3, donc convergente. Si u_n→l, l=(l+3)/2, d'où l=3.", "Prouve la convergence avant d'utiliser l=f(l).", 3, 6),
  make("sm-seq-lesson-11", "Suite adjacente", "u_n=1−1/n et v_n=1+1/n pour n≥1. Montrer qu'elles sont adjacentes.", "Elles sont adjacentes et convergent vers 1", "u_n croît, v_n décroît, u_n≤v_n et v_n−u_n=2/n→0. Elles ont donc la même limite 1.", "Vérifie les quatre conditions.", 3, 6, "proof"),
  make("sm-seq-lesson-12", "Gendarmes", "Montrer que u_n=cos(n)/n converge vers 0.", "0", "−1/n≤cos(n)/n≤1/n et les deux bornes tendent vers 0.", "Encadre cos(n).", 2, 4, "proof"),
  make("sm-seq-lesson-13", "Récurrence", "u0=4 et u(n+1)=(u_n+2)/2. Montrer que la suite est décroissante et minorée par 2.", "Décroissante et minorée par 2", "u(n+1)−2=(u_n−2)/2≥0. De plus u(n+1)−u_n=(2−u_n)/2≤0 dès que u_n≥2.", "Compare u(n+1) à 2 puis à u_n.", 4, 6, "proof"),
  make("sm-seq-lesson-14", "Limite récurrente", "Pour la suite précédente, déterminer la limite.", "2", "Elle converge par monotonie et bornitude. La limite vérifie l=(l+2)/2, donc l=2.", "Utilise le point fixe après la convergence.", 3, 5),
  make("sm-seq-lesson-15", "Point fixe", "Une suite convergente vérifie u(n+1)=(2u_n+6)/(u_n+3). Déterminer les limites possibles.", "l=2 ou l=−3", "l=(2l+6)/(l+3) donne l²+3l=2l+6, soit l²+l−6=0=(l−2)(l+3). Donc l=2 ou l=−3.", "Résous soigneusement l'équation de point fixe.", 4, 6),
  make("sm-seq-lesson-16", "Étude de suite", "u0=0 et u(n+1)=1/(2+u_n). Montrer que 0<u_n≤1/2 pour n≥1.", "0<u_n≤1/2", "u1=1/2. Si 0<u_n≤1/2, alors 2<2+u_n≤5/2, donc 2/5≤u(n+1)<1/2. Ainsi 0<u(n+1)≤1/2.", "Contrôle le dénominateur entre 2 et 5/2.", 4, 6, "proof"),
  make("sm-seq-lesson-17", "Suite géométrique", "Étudier la limite de u_n=4(−0,6)^n et préciser si la suite est monotone.", "u_n→0 ; elle n'est pas monotone", "|−0,6|<1 donc u_n→0. Les signes alternent, donc la suite n'est pas monotone.", "Sépare convergence et monotonie.", 3, 4),
  make("sm-seq-lesson-18", "Croissance comparée", "Calculer lim(n→+∞) n²/3^n.", "0", "Une suite exponentielle de raison 3 domine toute puissance de n, donc n²/3^n→0.", "Compare croissance polynomiale et exponentielle.", 3, 4),
  make("sm-seq-lesson-19", "Récurrence difficile", "u0=2 et u(n+1)=√(1+u_n). Montrer que la suite reste dans [φ,2], où φ=(1+√5)/2, puis qu'elle est décroissante.", "φ≤u_n≤2 et (u_n) décroissante", "φ vérifie φ²=φ+1, donc f(φ)=√(1+φ)=φ et f(2)=√3<2. Comme f est croissante, [φ,2] est stable. Pour x≥φ, f(x)≤x car x²−x−1≥0. La suite est donc décroissante et minorée par φ.", "Le bon intervalle stable est [φ,2], pas [1,2].", 5, 9, "proof"),
  make("sm-seq-lesson-20", "Synthèse Bac", "u0=1 et u(n+1)=2−1/(u_n+1). Montrer que la suite reste dans [1,2], étudier sa monotonie et déterminer sa limite.", "lim u_n=(1+√5)/2", "Pour x∈[1,2], f(x)=2−1/(x+1) appartient à [3/2,5/3]⊂[1,2]. On a f(x)−x=−(x²−x−1)/(x+1). Comme u0=1<φ et f(1)=3/2, puis la dynamique reste sous φ et la suite croît vers φ. La limite vérifie l²−l−1=0 et appartient à [1,2], donc l=φ=(1+√5)/2.", "Étudie le signe de f(x)−x autour de φ.", 5, 10, "multi-step"),
];
