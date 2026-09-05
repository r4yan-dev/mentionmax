import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = () => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Calcul intégral", topic: "Intégrales, aires, valeurs moyennes et volumes" });
const make = (id: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "multi-step"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(), type, difficulty, title, statement, expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Commence par identifier la technique d'intégration. Pour une aire ou un volume, étudie d'abord le signe et les bornes.", estimatedMinutes: minutes, xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "calcul intégral"],
});

export const base2BacSMIntegralExercises: Exercise[] = [
  make("sm-int-01", "Primitive directe", "Déterminer une primitive de f(x)=4x^3−2x+1.", "F(x)=x^4−x^2+x+C", "On intègre terme à terme.", "Utilise ∫x^n dx=x^(n+1)/(n+1).", 1, 3, "calculation"),
  make("sm-int-02", "Intégrale simple", "Calculer ∫_0^2 3x^2 dx.", "8", "Une primitive est x^3, donc [x^3]_0^2=8.", "Trouve une primitive puis applique les bornes.", 1, 3, "calculation"),
  make("sm-int-03", "Exponentielle", "Calculer ∫_0^1 e^x dx.", "e−1", "Une primitive de e^x est e^x. L'intégrale vaut e−1.", "Applique F(1)−F(0).", 1, 3, "calculation"),
  make("sm-int-04", "Forme logarithmique", "Calculer ∫_0^1 2x/(x^2+1) dx.", "ln2", "Avec u=x^2+1, du=2x dx. On obtient [ln(x^2+1)]_0^1=ln2.", "Reconnais u'/u.", 2, 4),
  make("sm-int-05", "Exponentielle composée", "Calculer ∫_0^1 3e^(3x+1) dx.", "e^4−e", "Une primitive est e^(3x+1). Aux bornes, on obtient e^4−e.", "Le coefficient 3 est déjà présent.", 2, 4),
  make("sm-int-06", "Chasles", "On sait ∫_0^2 f=5 et ∫_2^6 f=−2. Calculer ∫_0^6 f.", "3", "Par Chasles : ∫_0^6 f=5−2=3.", "Découpe au point 2.", 1, 2, "calculation"),
  make("sm-int-07", "Linéarité", "Calculer ∫_0^1 (3x^2−2x+4) dx.", "4", "L'intégrale vaut [x^3−x^2+4x]_0^1=1−1+4=4.", "Intègre terme à terme.", 2, 4, "calculation"),
  make("sm-int-08", "Intégration par parties", "Calculer ∫_0^1 xe^x dx.", "1", "Avec u=x et dv=e^x dx, I=[xe^x]_0^1−∫_0^1e^x dx=e−(e−1)=1.", "Dérive x et intègre e^x.", 3, 6),
  make("sm-int-09", "Intégration par parties", "Calculer ∫_1^e ln x dx.", "1", "I=[xlnx−x]_1^e=0−(−1)=1.", "Choisis u=ln x et dv=dx.", 3, 6),
  make("sm-int-10", "Aire sous une courbe", "Calculer l'aire limitée par y=2x et l'axe des abscisses entre 0 et 3.", "9", "2x≥0 sur [0,3], donc A=∫_0^3 2x dx=[x²]_0^3=9.", "Vérifie que la fonction est positive.", 2, 4),
  make("sm-int-11", "Aire entre courbes", "Calculer l'aire comprise entre y=x et y=x^2 sur [0,1].", "1/6", "Sur [0,1], x≥x². A=∫_0^1(x−x²)dx=1/6.", "Détermine quelle courbe est au-dessus.", 3, 5),
  make("sm-int-12", "Valeur absolue", "Calculer ∫_0^2 |x−1| dx.", "1", "On découpe en 0,1,2 : ∫_0^1(1−x)dx+∫_1^2(x−1)dx=1.", "Repère le zéro de x−1.", 3, 5),
  make("sm-int-13", "Valeur moyenne", "Déterminer la valeur moyenne de f(x)=x² sur [0,1].", "1/3", "m=1/(1−0)∫_0^1x²dx=1/3.", "Utilise m=1/(b−a)∫_a^b f.", 2, 4),
  make("sm-int-14", "Volume de révolution", "Déterminer le volume engendré par y=x sur [0,1] autour de l'axe Ox.", "π/3", "V=π∫_0^1x²dx=π/3.", "Utilise la méthode des disques.", 3, 5),
  make("sm-int-15", "Changement de variable", "Calculer ∫_0^1 2x(1+x²)^3 dx.", "15/4", "Poser u=1+x². On obtient ∫_1^2u^3du=[u^4/4]_1^2=15/4.", "Pose u=1+x².", 3, 5),
  make("sm-int-16", "Comparaison", "Montrer que ∫_0^1(1+x²)dx≥1 puis calculer sa valeur exacte.", "4/3", "Comme 1+x²≥1, l'intégrale est ≥1. Exactement, ∫_0^1(1+x²)dx=1+1/3=4/3.", "Utilise d'abord une comparaison, puis calcule.", 2, 4, "proof"),
  make("sm-int-17", "Paramètre", "Pour a>0, calculer I(a)=∫_0^a x(a−x)dx.", "a^3/6", "Développer : ax−x². Alors I=a·a²/2−a³/3=a³/6.", "Développe puis intègre.", 4, 6),
  make("sm-int-18", "Aire avec paramètre", "Pour a>0, calculer l'aire comprise entre y=ax et y=x² sur [0,a].", "a^3/6", "Sur [0,a], ax−x²≥0. A=∫_0^a(ax−x²)dx=a^3/2−a^3/3=a^3/6.", "Compare les deux courbes sur [0,a].", 4, 7),
  make("sm-int-19", "Volume par sections", "Un solide a pour aire de section S(t)=t²+2t sur [0,3]. Calculer son volume.", "18", "V=∫_0^3(t²+2t)dt=[t³/3+t²]_0^3=18.", "Le volume est l'intégrale de l'aire des sections.", 3, 5),
  make("sm-int-20", "Synthèse Bac", "Pour f(x)=xe^(−x), calculer ∫_0^2 f(x)dx et en déduire sa valeur moyenne sur [0,2].", "∫_0^2xe^(−x)dx=1−3e^(−2) ; m=(1−3e^(−2))/2", "Par parties, ∫xe^(−x)dx=−(x+1)e^(−x). Entre 0 et 2, on obtient 1−3e^(−2), puis on divise par 2 pour la moyenne.", "Intègre par parties puis applique la définition de la moyenne.", 5, 8),
];
