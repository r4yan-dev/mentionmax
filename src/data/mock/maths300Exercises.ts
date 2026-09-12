import type { Exercise, ExerciseType, ContentDifficulty } from "../../types/content";

type Chapter = { name: string; topics: string[]; family: string };

const chapters: Chapter[] = [
  { name: "Limites et continuité", family: "Analyse", topics: ["Limite rationnelle", "Limite à l’infini", "Limite trigonométrique", "Quantité conjuguée", "Croissances comparées", "Encadrement", "Continuité", "TVI", "Unicité", "Limite d’une suite", "Asymptote oblique", "Limites latérales", "Composition", "Exponentielle et limite", "Partie entière", "Paramètre", "Prolongement", "Seuil critique", "Limite inexistante", "Synthèse"] },
  { name: "Dérivation et étude des fonctions", family: "Analyse", topics: ["Nombre dérivé", "Tangente", "Dérivées usuelles", "Produit", "Quotient", "Signe de la dérivée", "Variations", "Extremum", "Paramètre", "Convexité", "Concavité", "Bijection", "Asymptotes", "Fonction logarithmique", "Fonction exponentielle", "Optimisation", "Tangente sous contrainte", "Signe d’un produit", "Minimum global", "Synthèse"] },
  { name: "Accroissements finis", family: "Analyse", topics: ["Taux de variation", "TAF", "Rolle", "Borne d’erreur", "Lipschitz", "Application au logarithme", "Application quadratique", "Erreur relative", "Borne de variation", "Rolle polynomial", "Pente du sinus", "Pente du cosinus", "Monotonie quantitative", "Écart entre deux valeurs", "Erreur maximale", "TAF paramétré", "Stabilité", "Composition des erreurs", "Contrôle final", "Synthèse"] },
  { name: "Suites numériques", family: "Analyse", topics: ["Premiers termes", "Point fixe", "Monotonie", "Bornitude", "Suite géométrique", "Suite arithmétique", "Somme géométrique", "Récurrence", "Contraction", "Suite définie par une fonction", "Comparaison", "Somme télescopique", "Récurrence forte", "Suite alternée", "Inégalité de suites", "Erreur d’approximation", "Seuil", "Limite rationnelle", "Stabilité", "Synthèse"] },
  { name: "Fonctions logarithmiques", family: "Analyse", topics: ["Valeurs usuelles", "Produit", "Quotient", "Puissance", "Domaine", "Équation logarithmique", "Inéquation", "Dérivée", "Limite en zéro", "Croissance comparée", "Composition", "Unicité", "Primitive", "Paramètre", "Valeur absolue", "Convexité", "Inégalité", "Équivalent", "Étude complète", "Synthèse"] },
  { name: "Fonction exponentielle", family: "Analyse", topics: ["Valeurs usuelles", "Propriétés", "Équation", "Inéquation", "Décroissance", "Dérivée", "Croissances comparées", "Temps de demi-vie", "Logarithme inverse", "Convexité", "Somme de décroissances", "Composition", "Calibration", "Unicité", "Inégalité", "Taux relatif", "Seuil", "Produit", "Comparaison", "Synthèse"] },
  { name: "Primitives", family: "Analyse", topics: ["Primitive polynomiale", "Primitive exponentielle", "Primitive inverse", "Condition initiale", "Primitive d’une racine", "Linéarité", "Changement de variable", "Exponentielle composée", "Logarithme", "Position", "Vitesse", "Famille de primitives", "Vérification", "Trigonométrie", "Paramètre", "Primitive et aire", "Développement", "Racine composée", "Contrôle", "Synthèse"] },
  { name: "Calcul intégral", family: "Analyse", topics: ["Intégrale simple", "Théorème fondamental", "Aire algébrique", "Changement de variable", "Aire entre deux courbes", "Valeur moyenne", "Intégrale logarithmique", "Intégrale trigonométrique", "Énergie", "Positivité", "Paramètre", "Relation de Chasles", "Encadrement", "Intégrale impropre simple", "Parité", "Composition", "Aire cumulée", "Deux signaux", "Déplacement", "Synthèse"] },
  { name: "Équations différentielles", family: "Analyse", topics: ["y'=ay", "Décroissance", "y'+ay=b", "Condition initiale", "Équation avec second membre", "Vérification", "Équilibre", "Temps caractéristique", "Unicité", "Calibration", "Croissance", "Équation non homogène", "Oscillation", "Stabilité", "Saturation", "Seuil", "Paramètre source", "Comparaison", "Solution complète", "Synthèse"] },
  { name: "Nombres complexes", family: "Nombres complexes", topics: ["Parties réelle et imaginaire", "Addition", "Produit", "Inverse", "Module", "Équation", "Forme trigonométrique", "Forme exponentielle", "Module d’un produit", "Argument", "Rotation", "Milieu", "Cercle", "Racines", "De Moivre", "Conjugué", "Module paramétré", "Amplitude-phase", "Équation quadratique", "Synthèse"] },
  { name: "Géométrie dans l’espace", family: "Géométrie", topics: ["Vecteur", "Distance", "Milieu", "Produit scalaire", "Norme", "Plan", "Droite", "Appartenance", "Parallélisme", "Intersection", "Distance point-plan", "Produit vectoriel", "Angle", "Sphère", "Plan médiateur", "Projection", "Déplacement", "Système", "Droite et plan", "Synthèse"] },
  { name: "Dénombrement et probabilités", family: "Probabilités", topics: ["Complément", "Indépendance", "Au moins un succès", "Probabilité conditionnelle", "Bayes", "Combinaisons", "Arrangements", "Permutations", "Loi binomiale", "Binomiale exacte", "Espérance", "Variance", "Test d’indépendance", "Probabilité totale", "Sous-ensembles", "Tirage sans remise", "Gain moyen", "Seuil binomial", "Système en série", "Synthèse"] },
  { name: "Arithmétique dans ℤ", family: "Arithmétique", topics: ["Division euclidienne", "Divisibilité", "PGCD", "Bézout", "Congruence", "Puissance modulo", "Inverse modulo", "Congruence linéaire", "PGCD paramétré", "Parité", "Reste d’une puissance", "Divisibilité par 9", "Inverse d’un entier", "Chiffrement", "Déchiffrement", "Théorème de Gauss", "Irrationalité", "Équation diophantienne", "Système de congruences", "Synthèse"] },
  { name: "Structures algébriques", family: "Structures algébriques", topics: ["Loi interne", "Commutativité", "Élément neutre", "Inverse", "Sous-groupe", "Morphisme additif", "Noyau", "Image", "Groupe multiplicatif", "Associativité", "Matrices", "Sous-groupe rationnel", "Relation d’équivalence", "Classes modulo", "Composition de morphismes", "Injectivité", "Surjectivité", "Groupe ℝ*", "Contre-exemple", "Synthèse"] },
  { name: "Espaces vectoriels", family: "Algèbre linéaire", topics: ["Base canonique", "Famille libre", "Famille génératrice", "Coordonnées", "Sous-espace", "Dimension", "Intersection", "Somme", "Application linéaire", "Matrice", "Noyau", "Image", "Changement de base", "Décomposition", "Indépendance paramétrée", "Plan vectoriel", "Théorème du rang", "Isomorphisme", "Reconstruction", "Synthèse"] },
];

const leads = ["On considère", "Soit", "On pose", "Dans tout l’exercice,", "Pour tout réel x,"];
const types: ExerciseType[] = ["calculation", "short-answer", "multi-step", "proof", "numeric"];

function params(ci: number, ei: number) { const n = ci * 20 + ei + 2; return { a: (n % 7) + 2, b: (n % 5) + 1, c: (n % 9) - 4 }; }

function makeExercise(chapter: Chapter, ci: number, ei: number): Exercise {
  const topic = chapter.topics[ei];
  const { a, b, c } = params(ci, ei);
  const synthesis = ei === 19;
  const goal = synthesis ? "Mobiliser plusieurs résultats du chapitre dans une démarche de synthèse proche d’un exercice national." : [
    "Maîtriser la méthode et savoir justifier chaque transition.",
    "Passer d’un calcul local à une conclusion globale, comme dans une copie de bac.",
    "Réutiliser un résultat obtenu dans une question suivante au lieu de recalculer.",
    "Construire une rédaction complète : hypothèses, calcul, justification et conclusion.",
    "Développer un réflexe de contrôle pour éviter une réponse correcte obtenue par hasard.",
  ][ei % 5];
  const lead = leads[ei % leads.length];
  let statement: string;
  let correction: string;
  let hint: string;

  switch (ci) {
    case 0:
      statement = `${lead} une fonction rationnelle construite autour de $x=${a}$. On cherche à déterminer son comportement puis à utiliser ce comportement pour étudier une équation.\n\n1. Déterminer le domaine de définition et factoriser l’expression utile.\n2. Calculer les limites aux points critiques et à l’infini.\n3. En déduire les éventuelles asymptotes.\n4. Étudier la continuité sur chaque intervalle du domaine.\n5. En utilisant la continuité et les variations obtenues, justifier l’existence ou l’unicité d’une solution de l’équation associée.\n\nObjectif : ${goal}`;
      correction = "Commencer par le domaine. Factoriser avant une limite indéterminée, puis distinguer limite, asymptote et continuité. Pour l’existence, utiliser le TVI avec des valeurs de signes opposés; pour l’unicité, utiliser une stricte monotonie.";
      hint = "Ne saute pas directement à la limite : le domaine détermine les points où l’étude est possible.";
      break;
    case 1:
      statement = `${lead} $f(x)=x^2-${a}x+${b}$. On veut transformer l’étude de la dérivée en informations géométriques sur la courbe.\n\n1. Calculer $f'(x)$ et déterminer son signe.\n2. Dresser le tableau de variations de $f$.\n3. Déterminer les éventuels extrema et leurs coordonnées.\n4. Déterminer l’équation de la tangente au point d’abscisse $x=${Math.max(1, a - 1)}$.\n5. Expliquer comment le tableau obtenu permet de contrôler le nombre de solutions de $f(x)=k$ selon la valeur de $k$.\n\nObjectif : ${goal}`;
      correction = "La dérivée donne le sens de variation. Les zéros de $f'$ séparent les intervalles où le signe est constant. Les extrema se lisent ensuite dans le tableau. La tangente en $x_0$ est $y=f(x_0)+f'(x_0)(x-x_0)$.";
      hint = "Fais le tableau de signe de $f'$ avant le tableau de variations.";
      break;
    case 2:
      statement = `${lead} une fonction dérivable sur $[${a},${a + 2}]$. Le but est d’obtenir une borne quantitative plutôt qu’une simple approximation.\n\n1. Écrire le taux de variation entre ${a} et ${a + 2}.\n2. Vérifier les hypothèses du théorème des accroissements finis.\n3. En déduire l’existence d’un $c\in]${a},${a + 2}[$ satisfaisant la relation du TAF.\n4. Si $|f'(x)|\le ${b + 2}$ sur l’intervalle, établir une majoration de $|f(x)-f(${a})|$.\n5. Interpréter cette majoration comme une erreur maximale.\n\nObjectif : ${goal}`;
      correction = "Écrire le taux de variation $\frac{f(b)-f(a)}{b-a}$. Les hypothèses du TAF donnent un $c$ tel que $f'(c)=\frac{f(b)-f(a)}{b-a}$. Une borne $|f'|\le M$ donne $|f(x)-f(y)|\le M|x-y|$.";
      hint = "Le TAF transforme une variation globale en information sur une dérivée locale.";
      break;
    case 3:
      statement = `${lead} la suite $(u_n)$ définie par $u_0=${a}$ et $u_{n+1}=\frac{${a}u_n+${b}}{${a + 1}}$. On cherche à comprendre pourquoi une suite définie récursivement peut converger.\n\n1. Calculer $u_1$ et $u_2$.\n2. Déterminer le point fixe $\ell$ vérifiant $\ell=\frac{${a}\ell+${b}}{${a + 1}}$.\n3. Exprimer $u_{n+1}-\ell$ en fonction de $u_n-\ell$.\n4. En déduire une propriété par récurrence, puis étudier la monotonie et la bornitude de $(u_n)$.\n5. Conclure sur la limite.\n\nObjectif : ${goal}`;
      correction = "Le point fixe fournit la valeur candidate pour la limite. La relation $u_{n+1}-\ell=\frac{${a}}{${a + 1}}(u_n-\ell)$ permet de conserver le signe et d’établir une propriété par récurrence. Une suite monotone et bornée converge.";
      hint = "Cherche le point fixe avant de tenter d’étudier directement la monotonie.";
      break;
    case 4:
      statement = `${lead} une expression logarithmique. On veut passer du domaine de définition à une résolution rigoureuse.\n\n1. Déterminer le domaine avant toute transformation.\n2. Réécrire l’expression avec les propriétés de $\ln$.\n3. Résoudre l’équation ou l’inéquation associée.\n4. Étudier la dérivée de la fonction obtenue pour justifier l’unicité lorsque nécessaire.\n5. Vérifier les solutions dans l’expression initiale.\n\nObjectif : ${goal}`;
      correction = "Déterminer d’abord les arguments strictement positifs. Utiliser $\ln(ab)=\ln a+\ln b$, $\ln(a/b)=\ln a-\ln b$ et $\ln(a^r)=r\ln a$ dans leur domaine. La monotonie justifie une unicité.";
      hint = "Le domaine n’est pas une formalité : il élimine les fausses solutions.";
      break;
    case 5:
      statement = `${lead} une fonction contenant $e^x$. L’objectif est de relier calcul exact, variations et interprétation.\n\n1. Simplifier l’expression avec les propriétés de l’exponentielle.\n2. Calculer la dérivée et factoriser son signe.\n3. Dresser le tableau de variations.\n4. Résoudre une équation issue de l’étude en justifiant l’usage éventuel de $\ln$.\n5. Contrôler le résultat par substitution.\n\nObjectif : ${goal}`;
      correction = "Utiliser $e^x>0$ et $(e^x)'=e^x$. Pour une équation, isoler l’exponentielle puis appliquer $\ln$ uniquement à un membre strictement positif. Garder la forme exacte.";
      hint = "La positivité de $e^x$ simplifie les tableaux de signe.";
      break;
    case 6:
      statement = `${lead} une fonction dont une primitive doit être construite puis utilisée.\n\n1. Identifier une primitive adaptée.\n2. Vérifier explicitement par dérivation que $F'=f$.\n3. Utiliser une condition initiale pour déterminer la constante.\n4. Calculer une variation à l’aide de $F$.\n5. Interpréter le résultat.\n\nObjectif : ${goal}`;
      correction = "Reconnaître les primitives usuelles, vérifier par dérivation, puis utiliser la condition initiale pour fixer la constante. Une primitive n’est pas une réponse finale tant que la constante et l’interprétation demandée ne sont pas traitées.";
      hint = "Une dérivation de contrôle évite beaucoup d’erreurs de signe.";
      break;
    case 7:
      statement = `${lead} une fonction positive sur $[${a},${a + 1}]$. On cherche à relier intégrale, primitive et aire.\n\n1. Déterminer une primitive $F$.\n2. Calculer $I=\int_{${a}}^{${a + 1}}f(x)\,dx$.\n3. Justifier l’interprétation géométrique de $I$.\n4. Établir une borne de $I$ à partir d’un encadrement de $f$.\n5. Comparer la valeur exacte et l’encadrement obtenu.\n\nObjectif : ${goal}`;
      correction = "Utiliser $I=F(${a + 1})-F(${a})$. L’aire sous la courbe est égale à l’intégrale lorsque $f\ge0$. Si $m\le f\le M$, alors $m\le I\le M$ sur un intervalle de longueur 1.";
      hint = "Une intégrale donne une valeur exacte; un encadrement donne une information robuste sans primitive.";
      break;
    case 8:
      statement = `${lead} l’équation différentielle $y'+${a}y=${b}$.\n\n1. Résoudre l’équation homogène associée.\n2. Déterminer une solution particulière constante.\n3. Écrire la solution générale.\n4. Utiliser $y(0)=${Math.max(1, b)}$ pour déterminer la constante.\n5. Vérifier la solution par substitution et étudier sa limite en $+\infty$.\n\nObjectif : ${goal}`;
      correction = "La solution homogène est $y_h(x)=Ce^{-${a}x}$. Une solution particulière constante vaut $y_p=\frac{${b}}{${a}}$. Donc $y=y_h+y_p$, puis la condition initiale fixe $C$.";
      hint = "Sépare homogène, particulière, puis condition initiale.";
      break;
    case 9:
      statement = `${lead} $z=${a}${c >= 0 ? "+" : ""}${c}i$. On veut passer de l’écriture algébrique à une lecture géométrique.\n\n1. Déterminer $\Re(z)$ et $\Im(z)$.\n2. Calculer $|z|$ exactement.\n3. Déterminer un argument en tenant compte du quadrant.\n4. Écrire $z$ sous forme trigonométrique puis exponentielle.\n5. Utiliser cette forme pour calculer une puissance de $z$ et interpréter l’opération dans le plan complexe.\n\nObjectif : ${goal}`;
      correction = "Le module est $|z|=\sqrt{${a}^2+${c}^2}$. Le quadrant est déterminé par les signes de la partie réelle et imaginaire. La forme trigonométrique permet d’utiliser la formule de De Moivre pour les puissances.";
      hint = "Détermine le quadrant avant de choisir un argument.";
      break;
    case 10:
      statement = `${lead} dans un repère orthonormé les points $A(${a},${b},${c})$, $B(${a + 1},${b + 2},${c + 1})$ et $C(${a - 1},${b + 1},${c + 2})$.\n\n1. Calculer $\overrightarrow{AB}$ et $\overrightarrow{AC}$.\n2. Déterminer si les trois points sont alignés.\n3. Construire une équation d’un plan contenant $A,B,C$.\n4. Tester l’appartenance d’un point $M$ à ce plan.\n5. Utiliser un produit scalaire pour étudier une orthogonalité ou un angle pertinent.\n\nObjectif : ${goal}`;
      correction = "Calculer les vecteurs par différence de coordonnées. Pour l’alignement, chercher une proportionnalité. Pour le plan, déterminer un vecteur normal puis une équation cartésienne. Le produit scalaire traite ensuite l’orthogonalité et les angles.";
      hint = "Les vecteurs $\overrightarrow{AB}$ et $\overrightarrow{AC}$ sont le point de départ.";
      break;
    case 11:
      statement = `${lead} une expérience aléatoire en plusieurs étapes.\n\n1. Définir précisément l’univers et les événements utiles.\n2. Calculer une probabilité par dénombrement ou complément.\n3. Calculer une probabilité conditionnelle.\n4. Utiliser la formule des probabilités totales pour obtenir une probabilité globale.\n5. Interpréter le résultat et vérifier qu’il appartient à $[0,1]$.\n\nObjectif : ${goal}`;
      correction = "Nommer les événements avant de calculer. Pour $P(A\mid B)$, utiliser $\frac{P(A\cap B)}{P(B)}$. Pour une partition $(B_i)$, $P(A)=\sum_iP(B_i)P(A\mid B_i)$.";
      hint = "Écris les événements et leurs relations avant les calculs numériques.";
      break;
    case 12:
      statement = `${lead} un entier $N$ soumis à une division euclidienne et à des contraintes de divisibilité.\n\n1. Écrire la division euclidienne de $N$ par $${a}$.\n2. Traduire une condition de divisibilité en congruence modulo $${a}$.\n3. Utiliser le PGCD pour étudier l’existence de solutions.\n4. Déterminer la classe des solutions et le plus petit entier positif satisfaisant les contraintes.\n5. Vérifier directement le résultat.\n\nObjectif : ${goal}`;
      correction = "Écrire $N=${a}q+r$ avec $0\le r<${a}$. Traduire la divisibilité par une congruence. Pour $Ax\equiv B\pmod m$, le PGCD de $A$ et $m$ contrôle l’existence de solutions.";
      hint = "La congruence est la traduction algébrique de la divisibilité.";
      break;
    case 13:
      statement = `${lead} une loi interne $*$ définie sur un ensemble $E$.\n\n1. Vérifier la stabilité de $*$.\n2. Étudier la commutativité et l’associativité.\n3. Rechercher un élément neutre $e$.\n4. Déterminer les éléments inversibles.\n5. Conclure précisément sur la structure obtenue et fournir un contre-exemple lorsqu’une propriété échoue.\n\nObjectif : ${goal}`;
      correction = "Traiter chaque propriété séparément. La stabilité exige $a*b\in E$, le neutre vérifie $a*e=e*a=a$, et l’inverse de $a$ vérifie $a*x=x*a=e$. Une propriété manquante empêche la conclusion correspondante.";
      hint = "Ne conclus pas ‘groupe’ avant d’avoir vérifié toutes les propriétés nécessaires.";
      break;
    default:
      statement = `${lead} une famille de vecteurs dans un espace de dimension finie et une application linéaire associée.\n\n1. Écrire les vecteurs dans une base donnée.\n2. Étudier la liberté ou le caractère générateur de la famille.\n3. Déterminer une base et la dimension du sous-espace engendré.\n4. Déterminer le noyau et l’image de l’application lorsque cela est demandé.\n5. Utiliser le théorème du rang pour contrôler le résultat.\n\nObjectif : ${goal}`;
      correction = "Traduire la liberté par une combinaison linéaire nulle et la génération par un système. Une matrice organise ces calculs. Pour une application linéaire, $\dim E=\dim\ker f+\dim\operatorname{Im}f$.";
      hint = "Écris d’abord la matrice des coordonnées : elle révèle la structure du problème.";
  }

  return {
    id: `sm-300-d${String(ci + 1).padStart(2, "0")}-e${String(ei + 1).padStart(2, "0")}`,
    mode: "BASE",
    source: "APPROVED",
    target: { trackIds: ["SMA", "SMB"], subjectId: "maths", chapter: chapter.name, topic },
    type: types[ei % types.length],
    difficulty: Math.min(5, 1 + Math.floor(ei / 4)) as ContentDifficulty,
    title: `${chapter.family} · ${topic}`,
    statement,
    correction,
    hint,
    examTip: goal,
    estimatedMinutes: synthesis ? 25 : 12 + Math.min(12, Math.floor(ei / 2)),
    xpValue: synthesis ? 45 : 20 + Math.min(20, ei),
    tags: ["MATHS_SM", "MOROCCAN_BAC_STYLE", "EXAM_STYLE", "LESSON_SPECIFIC", ...(synthesis ? ["SYNTHESIS"] : [])],
  };
}

export const maths300Exercises: Exercise[] = chapters.flatMap((chapter, ci) => chapter.topics.map((_, ei) => makeExercise(chapter, ci, ei)));
