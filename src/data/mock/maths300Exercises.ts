import type { Exercise, ExerciseType, ContentDifficulty } from "../../types/content";

type Chapter = { name: string; topics: string[] };

const chapters: Chapter[] = [
  { name: "Limites et continuité", topics: ["Limite rationnelle", "Limite à l’infini", "Limite trigonométrique", "Quantité conjuguée", "Croissances comparées", "Encadrement", "Continuité", "TVI", "Unicité", "Limite d’une suite", "Asymptote oblique", "Limites latérales", "Composition", "Exponentielle et limite", "Partie entière", "Paramètre", "Prolongement", "Seuil critique", "Limite inexistante", "Synthèse"] },
  { name: "Dérivation et étude des fonctions", topics: ["Nombre dérivé", "Tangente", "Dérivées usuelles", "Produit", "Quotient", "Signe de la dérivée", "Variations", "Extremum", "Paramètre", "Convexité", "Concavité", "Bijection", "Asymptotes", "Fonction logarithmique", "Fonction exponentielle", "Optimisation", "Tangente sous contrainte", "Signe d’un produit", "Minimum global", "Synthèse"] },
  { name: "Accroissements finis", topics: ["Taux de variation", "TAF", "Rolle", "Borne d’erreur", "Lipschitz", "Application au logarithme", "Application quadratique", "Erreur relative", "Borne de variation", "Rolle polynomial", "Pente du sinus", "Pente du cosinus", "Monotonie quantitative", "Écart entre deux valeurs", "Erreur maximale", "TAF paramétré", "Stabilité", "Composition des erreurs", "Contrôle final", "Synthèse"] },
  { name: "Suites numériques", topics: ["Premiers termes", "Point fixe", "Monotonie", "Bornitude", "Suite géométrique", "Suite arithmétique", "Somme géométrique", "Récurrence", "Contraction", "Suite définie par une fonction", "Comparaison", "Somme télescopique", "Récurrence forte", "Suite alternée", "Inégalité de suites", "Erreur d’approximation", "Seuil", "Limite rationnelle", "Stabilité", "Synthèse"] },
  { name: "Fonctions logarithmiques", topics: ["Valeurs usuelles", "Produit", "Quotient", "Puissance", "Domaine", "Équation logarithmique", "Inéquation", "Dérivée", "Limite en zéro", "Croissance comparée", "Composition", "Unicité", "Primitive", "Paramètre", "Valeur absolue", "Convexité", "Inégalité", "Équivalent", "Étude complète", "Synthèse"] },
  { name: "Fonction exponentielle", topics: ["Valeurs usuelles", "Propriétés", "Équation", "Inéquation", "Décroissance", "Dérivée", "Croissances comparées", "Temps de demi-vie", "Logarithme inverse", "Convexité", "Somme de décroissances", "Composition", "Calibration", "Unicité", "Inégalité", "Taux relatif", "Seuil", "Produit", "Comparaison", "Synthèse"] },
  { name: "Primitives", topics: ["Primitive polynomiale", "Primitive exponentielle", "Primitive inverse", "Condition initiale", "Primitive d’une racine", "Linéarité", "Changement de variable", "Exponentielle composée", "Logarithme", "Position", "Vitesse", "Famille de primitives", "Vérification", "Trigonométrie", "Paramètre", "Primitive et aire", "Développement", "Racine composée", "Contrôle", "Synthèse"] },
  { name: "Calcul intégral", topics: ["Intégrale simple", "Théorème fondamental", "Aire algébrique", "Changement de variable", "Aire entre deux courbes", "Valeur moyenne", "Intégrale logarithmique", "Intégrale trigonométrique", "Énergie", "Positivité", "Paramètre", "Relation de Chasles", "Encadrement", "Intégrale impropre simple", "Parité", "Composition", "Aire cumulée", "Deux signaux", "Déplacement", "Synthèse"] },
  { name: "Équations différentielles", topics: ["y'=ay", "Décroissance", "y'+ay=b", "Condition initiale", "Équation avec second membre", "Vérification", "Équilibre", "Temps caractéristique", "Unicité", "Calibration", "Croissance", "Équation non homogène", "Oscillation", "Stabilité", "Saturation", "Seuil", "Paramètre source", "Comparaison", "Solution complète", "Synthèse"] },
  { name: "Nombres complexes", topics: ["Parties réelle et imaginaire", "Addition", "Produit", "Inverse", "Module", "Équation", "Forme trigonométrique", "Forme exponentielle", "Module d’un produit", "Argument", "Rotation", "Milieu", "Cercle", "Racines", "De Moivre", "Conjugué", "Module paramétré", "Amplitude-phase", "Équation quadratique", "Synthèse"] },
  { name: "Géométrie dans l’espace", topics: ["Vecteur", "Distance", "Milieu", "Produit scalaire", "Norme", "Plan", "Droite", "Appartenance", "Parallélisme", "Intersection", "Distance point-plan", "Produit vectoriel", "Angle", "Sphère", "Plan médiateur", "Projection", "Déplacement", "Système", "Droite et plan", "Synthèse"] },
  { name: "Dénombrement et probabilités", topics: ["Complément", "Indépendance", "Au moins un succès", "Probabilité conditionnelle", "Bayes", "Combinaisons", "Arrangements", "Permutations", "Loi binomiale", "Binomiale exacte", "Espérance", "Variance", "Test d’indépendance", "Probabilité totale", "Sous-ensembles", "Tirage sans remise", "Gain moyen", "Seuil binomial", "Système en série", "Synthèse"] },
  { name: "Arithmétique dans ℤ", topics: ["Division euclidienne", "Divisibilité", "PGCD", "Bézout", "Congruence", "Puissance modulo", "Inverse modulo", "Congruence linéaire", "PGCD paramétré", "Parité", "Reste d’une puissance", "Divisibilité par 9", "Inverse d’un entier", "Chiffrement", "Déchiffrement", "Théorème de Gauss", "Irrationalité", "Équation diophantienne", "Système de congruences", "Synthèse"] },
  { name: "Structures algébriques", topics: ["Loi interne", "Commutativité", "Élément neutre", "Inverse", "Sous-groupe", "Morphisme additif", "Noyau", "Image", "Groupe multiplicatif", "Associativité", "Matrices", "Sous-groupe rationnel", "Relation d’équivalence", "Classes modulo", "Composition de morphismes", "Injectivité", "Surjectivité", "Groupe ℝ*", "Contre-exemple", "Synthèse"] },
  { name: "Espaces vectoriels", topics: ["Base canonique", "Famille libre", "Famille génératrice", "Coordonnées", "Sous-espace", "Dimension", "Intersection", "Somme", "Application linéaire", "Matrice", "Noyau", "Image", "Changement de base", "Décomposition", "Indépendance paramétrée", "Plan vectoriel", "Théorème du rang", "Isomorphisme", "Reconstruction", "Synthèse"] },
];

const leadIns = ["On considère", "Soit", "On pose", "Dans tout l’exercice,", "Pour tout réel x,"];
const exerciseTypes: ExerciseType[] = ["calculation", "short-answer", "multi-step", "proof", "numeric"];

function parameters(ci: number, ei: number) {
  const n = ci * 20 + ei + 2;
  return { a: (n % 7) + 2, b: (n % 5) + 1, c: (n % 9) - 4 };
}

function makeExercise(chapter: Chapter, ci: number, ei: number): Exercise {
  const topic = chapter.topics[ei];
  const p = parameters(ci, ei);
  const lead = leadIns[ei % leadIns.length];
  const difficulty = (1 + Math.floor(ei / 5)) as ContentDifficulty;
  const type = exerciseTypes[ei % exerciseTypes.length];
  const id = `sm-300-d${String(ci + 1).padStart(2, "0")}-e${String(ei + 1).padStart(2, "0")}`;
  const synthesis = ei === 19;

  let statement: string;
  let correction: string;
  let hint: string;

  switch (ci) {
    case 0:
      statement = synthesis
        ? `${lead} une fonction rationnelle dont le domaine exclut 1. Étudier une limite en un point critique, une limite à l’infini, puis utiliser la continuité et le TVI pour conclure sur une équation.\n1. Déterminer le domaine.\n2. Calculer les limites utiles.\n3. Étudier la continuité.\n4. Déduire une existence de solution.`
        : `${lead} f(x)=(${p.a}x²-${p.b}x-${p.a})/(x-1). Étudier ${topic.toLowerCase()} puis rédiger une conclusion précise.\n1. Déterminer les conditions de définition.\n2. Calculer la limite ou la valeur demandée.\n3. En déduire le comportement de f.`;
      correction = "Déterminer d’abord le domaine, puis factoriser ou comparer les termes dominants selon la limite. Pour une conclusion d’existence, invoquer explicitement la continuité et le TVI.";
      hint = "Le domaine vient avant les transformations de limite.";
      break;
    case 1:
      statement = synthesis
        ? `${lead} f(x)=e^(-x)(x+${p.a}) et une fonction auxiliaire polynomiale. Réaliser une étude complète en reliant dérivée, signe, variations, extremum et représentation graphique.\n1. Calculer f'.\n2. Étudier son signe.\n3. Dresser le tableau de variations.\n4. Interpréter l’extremum.`
        : `${lead} f(x)=x²-${p.a}x+${p.b}. Étudier ${topic.toLowerCase()} et justifier chaque conclusion.\n1. Calculer f'.\n2. Résoudre f'(x)=0 lorsque nécessaire.\n3. Étudier les variations ou la propriété demandée.`;
      correction = "Calculer la dérivée, factoriser son signe, puis relier ce signe aux variations. Pour un extremum, vérifier le changement de signe ou utiliser la convexité lorsqu’elle est pertinente.";
      hint = "Le signe de la dérivée commande les variations.";
      break;
    case 2:
      statement = `${lead} une fonction dérivable sur [${p.a},${p.a + 2}]. Traiter ${topic.toLowerCase()} en utilisant le théorème des accroissements finis lorsque celui-ci est adapté.\n1. Écrire le taux de variation.\n2. Énoncer les hypothèses du théorème.\n3. En déduire une égalité ou une majoration.`;
      correction = "Vérifier continuité et dérivabilité sur l’intervalle, puis appliquer le TAF. Transformer ensuite l’égalité obtenue en la conclusion demandée.";
      hint = "Écris le TAF avec les bornes exactes avant de calculer.";
      break;
    case 3:
      statement = `${lead} u_0=${p.a} et u_(n+1)=(${p.a}u_n+${p.b})/${p.a + 1}. Étudier ${topic.toLowerCase()} puis rechercher une limite éventuelle.\n1. Calculer u_1 et u_2.\n2. Établir une propriété par récurrence.\n3. Étudier la monotonie ou la bornitude.\n4. Déterminer la limite si elle existe.`;
      correction = "Calculer les premiers termes, identifier le point fixe éventuel, puis utiliser une récurrence pour établir l’intervalle de stabilité. La monotonie et la bornitude permettent ensuite d’utiliser le théorème de convergence des suites monotones.";
      hint = "Commence par u_1 et u_2, puis cherche un point fixe.";
      break;
    case 4:
      statement = `${lead} une expression logarithmique définie sur son domaine naturel. Traiter ${topic.toLowerCase()} puis résoudre la question proposée.\n1. Déterminer le domaine.\n2. Simplifier avec les propriétés de ln.\n3. Résoudre ou étudier le signe demandé.\n4. Vérifier les solutions dans l’expression initiale.`;
      correction = "Le domaine doit être déterminé avant toute propriété logarithmique. Utiliser ln(ab)=ln(a)+ln(b), ln(a/b)=ln(a)-ln(b) et ln(a^r)=r ln(a) uniquement lorsque les conditions de définition sont satisfaites.";
      hint = "Domaine d’abord, logarithmes ensuite.";
      break;
    case 5:
      statement = `${lead} une fonction exponentielle faisant intervenir e^x. Étudier ${topic.toLowerCase()} et relier le calcul à une propriété de l’exponentielle.\n1. Transformer l’expression.\n2. Calculer la dérivée ou résoudre l’équation utile.\n3. Étudier le signe ou les variations.\n4. Conclure.`;
      correction = "Utiliser e^x>0, (e^x)'=e^x et les règles de composition. Pour une équation exponentielle, isoler l’exponentielle puis prendre ln lorsque le membre est strictement positif.";
      hint = "La positivité de e^x simplifie beaucoup de signes.";
      break;
    case 6:
      statement = `${lead} une fonction dont ${topic.toLowerCase()} constitue l’étape principale.\n1. Proposer une primitive adaptée.\n2. La dériver pour vérifier.\n3. Utiliser une condition initiale ou une valeur donnée.\n4. Interpréter le résultat.`;
      correction = "Reconnaître une primitive usuelle, vérifier par dérivation, puis déterminer la constante avec la condition imposée. Garder une écriture exacte jusqu’à la conclusion.";
      hint = "Dérive ta primitive pour contrôler le signe et les coefficients.";
      break;
    case 7:
      statement = `${lead} une fonction positive sur [${p.a},${p.a + 1}]. Étudier ${topic.toLowerCase()} et calculer l’intégrale demandée.\n1. Déterminer une primitive.\n2. Appliquer la formule de Newton-Leibniz.\n3. Interpréter le résultat comme une aire lorsque c’est justifié.\n4. Comparer avec une borne simple.`;
      correction = "Trouver une primitive F puis calculer F(b)-F(a). L’interprétation géométrique comme aire nécessite la positivité de la fonction sur l’intervalle.";
      hint = "Commence par une primitive simple avant de parler d’aire.";
      break;
    case 8:
      statement = `${lead} l’équation différentielle correspondant à ${topic.toLowerCase()}.\n1. Écrire la solution générale.\n2. Utiliser la condition initiale si elle est donnée.\n3. Vérifier la solution par substitution.\n4. Interpréter le comportement lorsque x devient grand.`;
      correction = "Résoudre d’abord l’équation homogène, puis chercher une solution particulière si un second membre apparaît. Déterminer les constantes avec les conditions initiales et vérifier par substitution.";
      hint = "Commence par la solution générale avant la condition initiale.";
      break;
    case 9:
      statement = `${lead} z=${p.a}+${p.b}i et un second complexe construit à partir de z. Étudier ${topic.toLowerCase()}.\n1. Calculer les parties réelle et imaginaire.\n2. Déterminer le module et un argument.\n3. Passer à la forme trigonométrique si nécessaire.\n4. Interpréter géométriquement le résultat.`;
      correction = "Pour z=a+ib, |z|=√(a²+b²). Déterminer l’argument avec le quadrant correct, puis utiliser la forme trigonométrique pour les produits, quotients ou transformations géométriques.";
      hint = "Repère le point (Re(z), Im(z)) avant de choisir l’argument.";
      break;
    case 10:
      statement = `${lead} les points A(${p.a},${p.b},${p.c}), B(${p.a + 1},${p.b + 2},${p.c + 1}) et C(${p.a - 1},${p.b + 1},${p.c + 2}). Traiter ${topic.toLowerCase()}.\n1. Calculer les vecteurs utiles.\n2. Établir une distance, un angle ou une orthogonalité.\n3. Déterminer une équation de droite ou de plan lorsque demandé.\n4. Vérifier l’appartenance d’un point.`;
      correction = "Calculer les vecteurs par différence de coordonnées. Utiliser le produit scalaire pour l’orthogonalité et la distance, puis un vecteur normal pour une équation de plan.";
      hint = "Écris les vecteurs avant toute équation.";
      break;
    case 11:
      statement = `${lead} une expérience aléatoire adaptée à ${topic.toLowerCase()}.\n1. Définir clairement l’univers et les événements.\n2. Calculer une probabilité simple.\n3. Calculer une probabilité conditionnelle ou une probabilité totale.\n4. Interpréter le résultat et vérifier qu’il appartient à [0,1].`;
      correction = "Nommer les événements, utiliser la formule adaptée puis simplifier exactement. Pour une conditionnelle, P(A|B)=P(A∩B)/P(B) avec P(B)>0.";
      hint = "Nomme les événements avant d’écrire les probabilités.";
      break;
    case 12:
      statement = `${lead} un entier N et une divisibilité liée à ${topic.toLowerCase()}.\n1. Effectuer une division euclidienne ou calculer un PGCD.\n2. Traduire la condition en congruence.\n3. Utiliser Bézout ou une propriété de divisibilité.\n4. Conclure sur les entiers recherchés.`;
      correction = "Écrire N=mq+r avec 0≤r<m pour une division euclidienne. Pour une congruence, travailler modulo le diviseur puis utiliser les propriétés de divisibilité et de PGCD.";
      hint = "Passe la question de divisibilité en langage de congruences.";
      break;
    case 13:
      statement = `${lead} une loi interne * sur un ensemble E. Étudier ${topic.toLowerCase()}.\n1. Vérifier la stabilité.\n2. Rechercher un élément neutre.\n3. Étudier l’associativité ou la commutativité selon la question.\n4. Déterminer les éléments inversibles et conclure.`;
      correction = "Traiter chaque propriété séparément avec les quantificateurs corrects. Pour un inverse, résoudre a*x=e puis vérifier aussi x*a=e lorsque la commutativité n’est pas acquise.";
      hint = "Ne mélange pas stabilité, neutre et inverse: ce sont trois vérifications distinctes.";
      break;
    default:
      statement = `${lead} une famille de vecteurs de R³ liée à ${topic.toLowerCase()}.\n1. Écrire les coordonnées.\n2. Tester la liberté ou la génération.\n3. Déterminer une base et une dimension lorsque demandé.\n4. Vérifier le résultat par le théorème du rang ou une combinaison linéaire.`;
      correction = "Traduire la liberté par une combinaison linéaire nulle ou par le déterminant d’une matrice carrée. Pour une application linéaire, relier noyau, image et rang afin de contrôler la dimension obtenue.";
      hint = "La liberté signifie que la combinaison linéaire nulle n’a qu’une solution triviale.";
      break;
  }

  return {
    id,
    mode: "BASE",
    source: "APPROVED",
    target: { trackIds: ["SMA", "SMB"], subjectId: "maths", chapter: chapter.name, topic },
    type,
    difficulty,
    title: `Maths SM — ${topic}`,
    statement,
    expectedAnswer: "Rédaction mathématique complète avec résultat exact et justification.",
    correction,
    hint,
    examTip: "Rédiger les étapes utiles et réutiliser explicitement les résultats précédents, comme dans une épreuve nationale.",
    estimatedMinutes: 8 + difficulty * 3,
    xpValue: 10 + difficulty * 5,
    tags: ["MATHS_SM", "MOROCCAN_BAC_STYLE", "EXAM_STYLE", synthesis ? "SYNTHESIS" : "LESSON_SPECIFIC"],
  };
}

export const maths300Exercises: Exercise[] = chapters.flatMap((chapter, ci) =>
  chapter.topics.map((_, ei) => makeExercise(chapter, ci, ei)),
);

export default maths300Exercises;
