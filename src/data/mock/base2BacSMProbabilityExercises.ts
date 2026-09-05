import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = (topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Dénombrement et probabilités", topic });

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
  examTip: "Commence par identifier le modèle : ordre, répétition, remise, événement ou variable aléatoire.",
  estimatedMinutes: minutes,
  xpValue: difficulty * 6 + 6,
  tags: ["2BAC SM", "probabilités", "dénombrement"],
});

export const base2BacSMProbabilityExercises: Exercise[] = [
  make("sm-prob-01", "Principe multiplicatif", "Composer un menu", "Un restaurant propose 2 plats et 3 desserts. Combien de repas différents peut-on composer ?", "6", "Le choix du plat et celui du dessert sont successifs et indépendants pour le dénombrement : 2×3=6.", "Multiplie le nombre de choix à chaque étape.", 1, 2),
  make("sm-prob-02", "Arrangements", "Voitures dans un parking", "Un parking possède 7 places libres. De combien de façons peut-on garer 3 voitures distinctes ?", "210", "L'ordre des places occupées compte : A₇³=7×6×5=210.", "Ici les 3 voitures sont distinctes et les places sont ordonnées.", 1, 3),
  make("sm-prob-03", "Arrangements", "Mots de trois lettres", "Combien de mots à trois lettres distinctes peut-on former avec A, B, C, D, E et F ?", "120", "Il s'agit de choisir puis ordonner 3 lettres parmi 6 : A₆³=6×5×4=120.", "L'ordre des lettres compte.", 1, 2),
  make("sm-prob-04", "Combinaisons", "Comité de trois", "Dans un groupe de 4 personnes, combien de comités de 3 personnes peut-on former ?", "4", "L'ordre des membres ne compte pas : C₄³=4!/(3!1!)=4.", "Un comité n'est pas une liste ordonnée.", 1, 2),
  make("sm-prob-05", "Combinaisons", "Classe de 10 élèves", "Une classe contient 4 filles et 6 garçons. Combien de groupes de 3 élèves peut-on former ?", "120", "On choisit 3 élèves parmi 10 : C₁₀³=120.", "Le sexe n'intervient pas pour le total.", 1, 2),
  make("sm-prob-06", "Combinaisons", "Deux filles exactement", "Dans la même classe de 4 filles et 6 garçons, combien de groupes de 3 contiennent exactement 2 filles ?", "36", "Choisir 2 filles parmi 4 et 1 garçon parmi 6 : C₄²C₆¹=6×6=36.", "Sépare le choix des filles et des garçons.", 2, 3),
  make("sm-prob-07", "Tirage", "Tirage simultané", "Une urne contient 4 boules rouges et 3 vertes. On tire simultanément 3 boules. Combien de tirages sont possibles ?", "35", "Le tirage est simultané : l'ordre ne compte. Il y a C₇³=35 tirages équiprobables.", "Simultané signifie combinaison.", 1, 2),
  make("sm-prob-08", "Tirage", "Exactement une rouge", "Dans la même urne, quelle est la probabilité d'obtenir exactement une boule rouge lors d'un tirage simultané de 3 boules ?", "12/35", "Choisir 1 rouge parmi 4 et 2 vertes parmi 3 : C₄¹C₃²=12. Donc P=12/C₇³=12/35.", "Compte les cas favorables avec deux combinaisons.", 2, 3),
  make("sm-prob-09", "Événements", "Dé à douze faces", "On lance un dé à 12 faces. A est 'obtenir un nombre pair' et B est 'obtenir un multiple de 3'. Déterminer A, B, Ā, A∪B et A∩B.", "A={2,4,6,8,10,12}; B={3,6,9,12}; Ā={1,3,5,7,9,11}; A∪B={2,3,4,6,8,9,10,12}; A∩B={6,12}", "On énumère les issues de Ω={1,…,12}, puis on applique directement les définitions d'intersection, réunion et contraire.", "Écris d'abord l'univers.", 2, 4, "multi-step"),
  make("sm-prob-10", "Probabilité", "Événement contraire", "Si P(A)=0,37, calculer P(Ā).", "0,63", "P(Ā)=1−P(A)=1−0,37=0,63.", "Utilise la formule du contraire.", 1, 1, "short-answer"),
  make("sm-prob-11", "Probabilité conditionnelle", "Gobelets", "Un gobelet est cassé avec probabilité 2/7 au premier lavage. Sachant qu'il est cassé, le second l'est avec probabilité 1/5. Calculer P(A∩B).", "2/35", "Par multiplication sur un arbre : P(A∩B)=P(A)P(B|A)=(2/7)(1/5)=2/35.", "Multiplie les probabilités le long du chemin A puis B.", 2, 3),
  make("sm-prob-12", "Probabilités totales", "Gobelet intact", "Dans la situation précédente, P(B|A)=1/5 et P(B|Ā)=3/7. Calculer P(B).", "13/35", "P(B)=P(A)P(B|A)+P(Ā)P(B|Ā)=(2/7)(1/5)+(5/7)(3/7)=2/35+15/49=13/35.", "Décompose B selon A et Ā.", 3, 4),
  make("sm-prob-13", "Bayes", "Choix d'un sac", "On choisit au hasard U1 contenant 4 blanches et 1 noire, ou U2 contenant 2 blanches et 3 noires. Sachant que la boule tirée est noire, calculer P(U1|Noire).", "2/5", "P(U1∩N)=1/2×1/5=1/10. P(N)=1/10+1/2×3/5=2/5. Donc P(U1|N)=(1/10)/(2/5)=1/4.", "Calcule d'abord P(N), puis utilise la définition de la conditionnelle.", 3, 5, "multi-step"),
  make("sm-prob-14", "Indépendance", "Dé et nombre impair", "On lance un dé équilibré. A='nombre impair' et B='obtenir 3'. Les événements A et B sont-ils indépendants ?", "Oui", "P(A)=1/2, P(B)=1/6 et A∩B={3}, donc P(A∩B)=1/6=(1/2)(1/6). Ils sont indépendants.", "Compare P(A∩B) et P(A)P(B).", 2, 3, "short-answer"),
  make("sm-prob-15", "Indépendance", "Test d'indépendance", "Deux événements vérifient P(A)=0,4, P(B)=0,5 et P(A∩B)=0,18. Sont-ils indépendants ?", "Non", "Le produit P(A)P(B)=0,4×0,5=0,20, différent de 0,18. Ils ne sont donc pas indépendants.", "L'indépendance impose une égalité exacte.", 1, 2, "short-answer"),
  make("sm-prob-16", "Variable aléatoire", "Gain d'un jeu", "Un jeu donne +1 DH par boule blanche et −1 DH par boule noire. On tire 3 boules d'un sac contenant 4 blanches et 2 noires. Quelles valeurs peut prendre le gain X ?", "X(Ω)={−3,−1,1,3}", "Avec k boules blanches, le gain vaut k−(3−k)=2k−3 pour k=0,1,2,3. On obtient −3,−1,1,3.", "Exprime le gain en fonction du nombre de blanches.", 2, 4),
  make("sm-prob-17", "Loi d'une variable", "Nombre de boules blanches", "Un sachet contient 6 boules blanches et 2 noires. On tire successivement sans remise 2 boules. Soit X le nombre de blanches. Déterminer X(Ω).", "X(Ω)={0,1,2}", "Avec 2 tirages, on peut obtenir 0, 1 ou 2 boules blanches, et aucun autre nombre.", "Le nombre de succès ne peut pas dépasser le nombre de tirages.", 1, 2, "short-answer"),
  make("sm-prob-18", "Espérance", "Espérance d'une loi", "Une variable X prend 1, 2 et 3 avec probabilités 1/4, 1/4 et 1/2. Calculer E(X).", "9/4", "E(X)=1×1/4+2×1/4+3×1/2=1/4+1/2+3/2=9/4.", "Multiplie chaque valeur par sa probabilité puis additionne.", 2, 3),
  make("sm-prob-19", "Variance", "Variance d'une loi", "Une variable X prend 1, 2 et 3 avec probabilités 1/4, 1/4 et 1/2. Calculer V(X).", "11/16", "E(X)=9/4 et E(X²)=1/4+4/4+9/2=23/4. Donc V(X)=23/4−(9/4)²=92/16−81/16=11/16.", "Calcule d'abord E(X), puis E(X²).", 3, 4),
  make("sm-prob-20", "Loi binomiale", "Cible", "Un archer touche une cible avec probabilité 2/3 à chaque tir et effectue 10 tirs indépendants. Quelle est la probabilité de toucher exactement 6 fois ?", "C₁₀⁶(2/3)⁶(1/3)⁴", "Le nombre de réussites X suit B(10,2/3). Donc P(X=6)=C₁₀⁶(2/3)⁶(1/3)⁴.", "Identifie n, p et k.", 2, 3),
  make("sm-prob-21", "Loi binomiale", "Trois réussites", "Un jeu a une probabilité de gain 3/5 à chaque partie. Si Ahmed joue 4 fois indépendamment, calculer la probabilité de gagner exactement 3 fois.", "108/625", "X∼B(4,3/5). P(X=3)=C₄³(3/5)³(2/5)=4×27/125×2/5=216/625.", "Utilise C₄³p³(1−p).", 2, 3),
  make("sm-prob-22", "Loi binomiale", "Dé et succès", "On lance un dé équilibré. A est 'obtenir un diviseur de 3'. On répète 3 fois. Quelle est la loi du nombre X de réalisations de A ?", "X∼B(3,1/3)", "Les diviseurs de 3 sur {1,…,6} sont 1 et 3, donc p=2/6=1/3. Les 3 lancers sont indépendants, donc X∼B(3,1/3).", "Calcule p avant d'identifier la loi.", 2, 3, "short-answer"),
  make("sm-prob-23", "Loi binomiale", "Espérance et variance", "Si X∼B(5,1/2), calculer E(X) et V(X).", "E(X)=5/2 et V(X)=5/4", "Pour une loi binomiale, E(X)=np=5/2 et V(X)=np(1−p)=5×1/2×1/2=5/4.", "Utilise directement les deux formules binomiales.", 1, 2),
  make("sm-prob-24", "Dénombrement et probabilité", "Trois couleurs", "Un sac contient 4 rouges, 3 vertes et 2 blanches. On tire simultanément 3 boules. Quelle est la probabilité d'obtenir trois couleurs distinctes ?", "2/7", "Il faut choisir 1 boule de chaque couleur : C₄¹C₃¹C₂¹=24. Le total est C₉³=84. Donc P=24/84=2/7.", "Choisis une boule dans chacune des trois couleurs.", 2, 3),
  make("sm-prob-25", "Probabilité conditionnelle", "Élève redoublant", "Dans une classe de 23 élèves, 15 sont des garçons dont 8 redoublants. Sachant que l'élève choisi est un garçon, donner la probabilité qu'il soit redoublant.", "8/15", "La condition réduit l'univers aux 15 garçons. Parmi eux, 8 sont redoublants : P(I|G)=P(I∩G)/P(G)=(8/23)/(15/23)=8/15.", "Travaille dans l'univers conditionné aux garçons.", 2, 3),
  make("sm-prob-26", "Loi d'une variable", "Nombre de succès sur trois lancers", "On lance une pièce équilibrée 3 fois. X est le nombre de fois où face F apparaît. Donner P(X=1) et P(X=2).", "P(X=1)=3/8 et P(X=2)=3/8", "X∼B(3,1/2). Ainsi P(X=1)=C₃¹(1/2)^3=3/8 et P(X=2)=C₃²(1/2)^3=3/8.", "Utilise la loi binomiale ou l'arbre des 8 issues.", 1, 3),
  make("sm-prob-27", "Permutation avec répétitions", "Jetons indiscernables", "On veut ordonner 3 jetons verts, 2 rouges et 1 bleu. Combien de suites de couleurs distinctes peut-on former ?", "60", "Il y a 6 positions avec répétitions : 6!/(3!2!1!)=60.", "Divise par les factorielles des répétitions.", 2, 3),
  make("sm-prob-28", "Synthèse", "Urne complète", "Une urne contient 3 blanches, 4 rouges et 5 vertes. On tire simultanément 3 boules. Calculer la probabilité d'obtenir exactement 2 rouges.", "6/55", "Favorables : C₄²C₈¹=6×8=48. Total : C₁₂³=220. Donc P=48/220=12/55.", "Le troisième tirage doit être non rouge.", 2, 4, "multi-step"),
];
