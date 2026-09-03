import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;

const target = (chapter: string, topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter, topic });

export const baseSMMathExercises: Exercise[] = [
  {
    id: "sm-math-logique-01", mode: "BASE", source: "APPROVED",
    target: target("Logique et raisonnement", "Récurrence"), type: "proof", difficulty: 2,
    title: "Une identité par récurrence", statement: "Montrer par récurrence que, pour tout n∈N, 1 + 3 + 5 + … + (2n−1) = n².",
    expectedAnswer: "Démonstration par récurrence", correction: "Initialisation : pour n=1, 1=1². Hérédité : si la somme vaut n², alors elle vaut n²+(2n+1)=(n+1)². La propriété est donc vraie pour tout n.",
    hint: "Traite séparément l'initialisation et l'hérédité.", examTip: "Une récurrence doit contenir une base et une implication clairement rédigée.", estimatedMinutes: 5, xpValue: 20, tags: ["logique", "récurrence"],
  },
  {
    id: "sm-math-ensembles-01", mode: "BASE", source: "APPROVED",
    target: target("Ensembles et applications", "Bijection"), type: "proof", difficulty: 2,
    title: "Reconnaître une bijection", statement: "Soit f: ℝ→ℝ définie par f(x)=2x−5. Montrer que f est bijective et déterminer f⁻¹.",
    expectedAnswer: "f⁻¹(y)=(y+5)/2", correction: "f est injective car f(x)=f(y) implique 2x−5=2y−5, donc x=y. Pour tout y réel, x=(y+5)/2 donne f(x)=y, donc f est surjective. Ainsi f est bijective et f⁻¹(y)=(y+5)/2.",
    hint: "Traite injection et surjection séparément.", examTip: "Pour une fonction affine de coefficient directeur non nul, l'inverse se trouve en isolant x.", estimatedMinutes: 5, xpValue: 20, tags: ["applications", "bijection"],
  },
  {
    id: "sm-math-fonctions-01", mode: "BASE", source: "APPROVED",
    target: target("Fonctions numériques", "Domaine"), type: "short-answer", difficulty: 2,
    title: "Domaine d'une fonction rationnelle", statement: "Déterminer le domaine de définition de f(x)=(x+1)/(x²−9).",
    acceptedAnswers: ["R\\{-3,3}", "[-3,3] exclu", "R sauf -3 et 3"], expectedAnswer: "ℝ \ {-3, 3}",
    correction: "Le dénominateur ne doit pas être nul : x²−9=(x−3)(x+3)≠0. Donc x≠−3 et x≠3.", hint: "Cherche quand le dénominateur s'annule.", examTip: "Le domaine se détermine avant toute étude de variation.", estimatedMinutes: 3, xpValue: 10, tags: ["fonctions", "domaine"],
  },
  {
    id: "sm-math-barycentre-01", mode: "BASE", source: "APPROVED",
    target: target("Géométrie affine", "Barycentre"), type: "calculation", difficulty: 2,
    title: "Coordonnées d'un barycentre", statement: "A(1,2), B(5,−2). G est le barycentre de (A,2) et (B,1). Déterminer G.",
    expectedAnswer: "(7/3,2/3)", correction: "G=((2A+B)/3)=((2×1+5)/3,(2×2−2)/3)=(7/3,2/3).", hint: "Utilise la moyenne pondérée des coordonnées.", examTip: "Les coefficients du barycentre pondèrent chaque coordonnée de la même façon.", estimatedMinutes: 3, xpValue: 12, tags: ["barycentre", "géométrie"] ,
  },
  {
    id: "sm-math-ps-plan-01", mode: "BASE", source: "APPROVED",
    target: target("Produit scalaire", "Orthogonalité"), type: "calculation", difficulty: 2,
    title: "Tester l'orthogonalité", statement: "On donne u=(2,−1) et v=(1,2). Les vecteurs sont-ils orthogonaux ?",
    acceptedAnswers: ["oui", "true"], expectedAnswer: "Oui", correction: "u·v=2×1+(−1)×2=0. Les vecteurs sont donc orthogonaux.", hint: "Calcule u·v.", examTip: "Produit scalaire nul ⇔ orthogonalité.", estimatedMinutes: 2, xpValue: 8, tags: ["produit scalaire", "orthogonalité"] ,
  },
  {
    id: "sm-math-trig-01", mode: "BASE", source: "APPROVED",
    target: target("Trigonométrie", "Équation trigonométrique"), type: "multi-step", difficulty: 3,
    title: "Équation avec le cosinus", statement: "Résoudre sur [0,2π] : cos(x)=1/2.",
    expectedAnswer: "π/3 et 5π/3", correction: "Sur [0,2π], cos(x)=1/2 aux angles π/3 et 5π/3. Ce sont les deux solutions de l'intervalle.", hint: "Place 1/2 sur le cercle trigonométrique.", examTip: "Toujours tenir compte de l'intervalle imposé.", estimatedMinutes: 4, xpValue: 16, tags: ["trigonométrie", "équations"] ,
  },
  {
    id: "sm-math-suites-01", mode: "BASE", source: "APPROVED",
    target: target("Suites", "Suite arithmétique"), type: "calculation", difficulty: 2,
    title: "Terme et somme d'une suite", statement: "Une suite arithmétique vérifie u₀=4 et r=3. Calculer u₁₂ puis S₁₂= u₀+…+u₁₂.",
    acceptedAnswers: ["40 et 286", "40;286", "u12=40"], expectedAnswer: "u₁₂=40 et S₁₂=286",
    correction: "u₁₂=4+12×3=40. Il y a 13 termes, donc S₁₂=13(4+40)/2=286.", hint: "Utilise les formules d'une suite arithmétique.", examTip: "Compte bien le nombre de termes dans une somme allant de u₀ à u₁₂.", estimatedMinutes: 4, xpValue: 16, tags: ["suites", "arithmétique", "somme"] ,
  },
  {
    id: "sm-math-rotation-01", mode: "BASE", source: "APPROVED",
    target: target("Transformations", "Rotation"), type: "short-answer", difficulty: 2,
    title: "Invariant d'une rotation", statement: "Une rotation de centre O envoie A sur A'. Si OA=7 cm, quelle est la longueur OA' ?",
    acceptedAnswers: ["7", "7 cm"], expectedAnswer: "7 cm", correction: "Une rotation conserve les distances au centre : OA'=OA=7 cm.", hint: "Pense aux invariants d'une rotation.", examTip: "Avant de calculer, cherche une propriété conservée par la transformation.", estimatedMinutes: 2, xpValue: 8, tags: ["rotation", "géométrie"] ,
  },
  {
    id: "sm-math-limites-01", mode: "BASE", source: "APPROVED",
    target: target("Limites", "Terme dominant"), type: "calculation", difficulty: 2,
    title: "Limite à l'infini", statement: "Calculer lim(x→+∞) (3x²−5x+1)/(x²+2).",
    acceptedAnswers: ["3", "3.0"], expectedAnswer: "3", correction: "En divisant numérateur et dénominateur par x², la limite devient (3−5/x+1/x²)/(1+2/x²)→3.", hint: "Compare les termes de plus haut degré.", examTip: "Pour un quotient de polynômes de même degré, la limite est le rapport des coefficients dominants.", estimatedMinutes: 3, xpValue: 12, tags: ["limites", "polynômes"] ,
  },
  {
    id: "sm-math-derivation-01", mode: "BASE", source: "APPROVED",
    target: target("Dérivation", "Tangente"), type: "calculation", difficulty: 2,
    title: "Équation d'une tangente", statement: "Pour f(x)=x²−3x+1, déterminer l'équation de la tangente au point d'abscisse 2.",
    expectedAnswer: "y=x−3", correction: "f'(x)=2x−3, donc f'(2)=1 et f(2)=−1. La tangente est y=−1+1(x−2)=x−3.", hint: "Utilise y=f(a)+f'(a)(x−a).", examTip: "Calcule toujours f(a) et f'(a) séparément avant d'écrire la tangente.", estimatedMinutes: 4, xpValue: 16, tags: ["dérivation", "tangente"] ,
  },
  {
    id: "sm-math-etude-01", mode: "BASE", source: "APPROVED",
    target: target("Étude complète", "Variations"), type: "multi-step", difficulty: 3,
    title: "Étude d'une fonction cubique", statement: "Étudier les variations de f(x)=x³−3x sur ℝ.",
    expectedAnswer: "f'=3(x²−1), croissante sur ]−∞,−1] et [1,+∞[, décroissante sur [−1,1]", correction: "f'(x)=3x²−3=3(x−1)(x+1). Elle est positive hors de [−1,1] et négative dans [−1,1]. Donc f est croissante sur ]−∞,−1], décroissante sur [−1,1], puis croissante sur [1,+∞[.", hint: "Commence par factoriser f'(x).", examTip: "Le tableau de signes de f' doit précéder le tableau de variations.", estimatedMinutes: 6, xpValue: 24, tags: ["étude de fonctions", "variations"] ,
  },
  {
    id: "sm-math-vecteurs-espace-01", mode: "BASE", source: "APPROVED",
    target: target("Géométrie de l'espace", "Colinéarité"), type: "calculation", difficulty: 2,
    title: "Colinéarité dans l'espace", statement: "u=(2,−4,6) et v=(−1,2,−3). Sont-ils colinéaires ?",
    acceptedAnswers: ["oui", "yes"], expectedAnswer: "Oui", correction: "u=−2v, donc les vecteurs sont colinéaires.", hint: "Cherche un même coefficient multiplicatif sur les trois coordonnées.", examTip: "Le coefficient doit fonctionner sur toutes les coordonnées.", estimatedMinutes: 2, xpValue: 8, tags: ["vecteurs", "espace", "colinéarité"] ,
  },
  {
    id: "sm-math-geometrie-espace-01", mode: "BASE", source: "APPROVED",
    target: target("Droites et plans", "Plan"), type: "multi-step", difficulty: 3,
    title: "Équation d'un plan", statement: "Déterminer une équation du plan passant par A(1,0,0) et de vecteur normal n=(2,−1,3).",
    expectedAnswer: "2x−y+3z−2=0", correction: "Un plan de normale n s'écrit 2(x−1)−(y−0)+3(z−0)=0, soit 2x−y+3z−2=0.", hint: "Utilise n·(X−A)=0.", examTip: "Un vecteur normal donne directement les coefficients a,b,c de l'équation cartésienne.", estimatedMinutes: 5, xpValue: 20, tags: ["plans", "géométrie analytique"] ,
  },
  {
    id: "sm-math-denombrement-01", mode: "BASE", source: "APPROVED",
    target: target("Combinatoire", "Combinaisons"), type: "calculation", difficulty: 2,
    title: "Choisir sans ordre", statement: "Combien de comités de 3 élèves peut-on former parmi 10 élèves ?",
    acceptedAnswers: ["120", "120 comités"], expectedAnswer: "120", correction: "L'ordre ne compte pas : C(10,3)=10×9×8/(3×2×1)=120.", hint: "Un comité n'a pas de président par défaut, donc l'ordre ne compte pas.", examTip: "Ordre ignoré → combinaison ; ordre pris en compte → arrangement ou permutation.", estimatedMinutes: 3, xpValue: 12, tags: ["dénombrement", "combinaisons"] ,
  },
  {
    id: "sm-math-scalaire-espace-01", mode: "BASE", source: "APPROVED",
    target: target("Produit scalaire 3D", "Orthogonalité"), type: "calculation", difficulty: 2,
    title: "Produit scalaire en 3D", statement: "u=(1,2,−1) et v=(2,−1,0). Calculer u·v.",
    acceptedAnswers: ["0"], expectedAnswer: "0", correction: "u·v=1×2+2×(−1)+(−1)×0=0. Les vecteurs sont orthogonaux.", hint: "Multiplie coordonnée par coordonnée puis additionne.", examTip: "Ne pas oublier la troisième coordonnée en dimension 3.", estimatedMinutes: 2, xpValue: 8, tags: ["produit scalaire", "3D"] ,
  },
  {
    id: "sm-math-arithmetique-01", mode: "BASE", source: "APPROVED",
    target: target("Divisibilité et congruences", "PGCD"), type: "calculation", difficulty: 2,
    title: "PGCD par Euclide", statement: "Calculer PGCD(252,105).",
    acceptedAnswers: ["21"], expectedAnswer: "21", correction: "252=2×105+42, 105=2×42+21, 42=2×21+0. Donc PGCD=21.", hint: "Applique l'algorithme d'Euclide.", examTip: "Continue les divisions jusqu'au reste nul : le dernier reste non nul est le PGCD.", estimatedMinutes: 3, xpValue: 12, tags: ["arithmétique", "PGCD"] ,
  },
  {
    id: "sm-math-vectoriel-01", mode: "BASE", source: "APPROVED",
    target: target("Produit vectoriel", "Aire"), type: "calculation", difficulty: 3,
    title: "Aire d'un parallélogramme", statement: "u=(1,0,0) et v=(0,3,4). Calculer l'aire du parallélogramme engendré par u et v.",
    acceptedAnswers: ["5", "5 unités²"], expectedAnswer: "5", correction: "L'aire vaut ||u×v||. Comme u est perpendiculaire à v et ||u||=1, ||v||=5, on obtient 5 unités².", hint: "Aire = ||u||||v||sinθ.", examTip: "Le produit vectoriel transforme directement un problème d'aire en norme d'un vecteur.", estimatedMinutes: 4, xpValue: 16, tags: ["produit vectoriel", "aire"] ,
  },
];
