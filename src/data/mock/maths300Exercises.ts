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

const types: ExerciseType[] = ["calculation", "short-answer", "multi-step", "proof", "numeric"];
const leadIns = ["On considère", "Soit", "On pose", "Dans tout l’exercice,", "Pour tout réel x,", "On étudie"];

function parameters(chapterIndex: number, exerciseIndex: number) {
  const n = exerciseIndex + 2 + chapterIndex;
  const a = (n % 7) + 2;
  const b = (n % 5) + 1;
  const c = (n % 9) - 4;
  return { n, a, b, c };
}

function buildStatement(chapter: Chapter, ci: number, ei: number): { statement: string; correction: string; hint: string; type: ExerciseType } {
  const p = parameters(ci, ei);
  const topic = chapter.topics[ei];
  const style = ei % 5;
  if (ci === 0) {
    const templates = [
      [`${leadIns[style]} f(x)=(${p.a}x^2-${p.b}x-${p.a})/(x-1). Déterminer D_f. Calculer lim(x→1) f(x). En déduire si un prolongement par continuité est possible.`, "Déterminer le point interdit, factoriser si possible, puis calculer la limite au voisinage du point critique. Si la limite est finie, le prolongement est obtenu en donnant cette valeur au point.", "Commence par le domaine, puis regarde si le numérateur s’annule au même point."],
      [`${leadIns[style]} f(x)=(${p.a}x^3+2x-${p.b})/(x^2+${p.a}). Étudier lim(x→+∞) f(x) et préciser le comportement affine éventuel.`, "Comparer les degrés puis, si le degré du numérateur dépasse de un celui du dénominateur, effectuer une division polynomiale afin d’identifier l’asymptote oblique.", "Commence par les termes dominants, puis fais une division si nécessaire."],
      [`${leadIns[style]} la fonction g définie sur un intervalle contient sin(${p.a}x)/x. Ramener la limite en 0 à une limite de référence puis traiter un terme en 1-cos(x).`, "Utiliser sin(t)/t→1 et une identité trigonométrique adaptée pour le terme en 1-cos(x).", "Ramène chaque expression à une limite fondamentale."],
      [`${leadIns[style]} h(x)=sqrt(x+${p.a})-sqrt(x). Transformer l’expression par quantité conjuguée et calculer sa limite à l’infini.`, "Multiplier par la quantité conjuguée, simplifier, puis diviser par le terme dominant.", "La quantité conjuguée élimine la différence de racines."],
      [`${leadIns[style]} une fonction continue prend des valeurs de signes opposés aux extrémités d’un intervalle. Montrer que l’équation f(x)=0 admet une solution puis discuter son unicité à l’aide de la monotonie.`, "La continuité donne l’existence par le TVI; une stricte monotonie sur l’intervalle donne l’unicité.", "Sépare clairement existence et unicité."]
    ][style];
    return { statement: `${templates[0]}\n\n${topic}. Justifier chaque étape utile et rédiger la conclusion.`, correction: templates[1], hint: templates[2], type: types[style] };
  }
  if (ci === 1) {
    const templates = [
      [`${leadIns[style]} f(x)=x²-${p.a}x+${p.b}. Calculer f'(x), déterminer les variations puis les extremums.`, "Dériver, résoudre f'(x)=0, construire le tableau de signe de la dérivée, puis en déduire les variations et les valeurs extrêmes.", "Le signe de la dérivée commande les variations."],
      [`${leadIns[style]} f(x)=x+${p.a}/x sur ]0,+∞[. Étudier les variations et déterminer le minimum.`, `f'(x)=1-${p.a}/x². L’annulation fournit x=sqrt(${p.a}); vérifier le changement de signe pour obtenir le minimum.`, "Calcule la dérivée puis étudie son signe sur l’intervalle."],
      [`${leadIns[style]} h(x)=e^(-x)(x+${p.a}). Étudier le signe de h' et dresser le tableau de variations.`, "Utiliser la dérivée d’un produit et e^(-x)>0 pour ramener le signe à un facteur affine.", "Factorise le signe en utilisant la positivité de l’exponentielle."],
      [`${leadIns[style]} une courbe de f admet une tangente au point d’abscisse ${p.a}. Déterminer l’équation de cette tangente puis vérifier le point de contact.`, "Appliquer y=f(a)+f'(a)(x-a) puis vérifier que le point de contact satisfait l’équation.", "Écris d’abord le nombre dérivé au point demandé."],
      [`${leadIns[style]} une fonction dépend d’un paramètre m. Déterminer m pour qu’elle possède un extremum en x=${p.a}, puis caractériser cet extremum.`, "L’extremum impose l’annulation de la dérivée au point; examiner ensuite le signe de la dérivée de part et d’autre.", "Commence par traduire extremum en condition sur f'."]
    ][style];
    return { statement: `${templates[0]}\n\n${topic}. Toute conclusion doit être justifiée par le calcul ou le signe obtenu.`, correction: templates[1], hint: templates[2], type: types[style] };
  }
  if (ci === 2) {
    const templates = [
      [`${leadIns[style]} une fonction dérivable sur [${p.a},${p.a + 2}]. Écrire le taux de variation entre les extrémités et relier ce résultat au théorème des accroissements finis.`, "Le taux de variation est (f(b)-f(a))/(b-a). Le TAF garantit l’existence de c dans ]a,b[ tel que f'(c) égale ce taux.", "Écris la forme exacte du TAF avant de remplacer a et b."],
      [`${leadIns[style]} f(x)=ln x sur [${p.a},${p.a + 1}]. Utiliser le TAF pour majorer |f(x)-f(${p.a})|.`, "Le TAF permet de borner l’écart par une borne supérieure de |f'| sur l’intervalle.", "Cherche une borne simple de 1/x sur l’intervalle."],
      [`${leadIns[style]} une fonction polynomiale vérifie f(${p.a})=0 et f(${p.a + 2})=1. Montrer qu’il existe c tel que f'(c)=1/2.`, "Appliquer Rolle ou le TAF suivant les hypothèses; le quotient (1-0)/2 vaut 1/2.", "Le nombre 1/2 est exactement un taux de variation."],
      [`${leadIns[style]} deux valeurs numériques d’une même grandeur sont séparées de ${p.a} unités. Utiliser une borne sur la dérivée pour contrôler l’erreur maximale entre elles.`, "Le TAF donne |f(x)-f(y)|≤M|x-y| si |f'|≤M sur l’intervalle considéré.", "Transforme la borne sur la dérivée en borne sur l’écart."],
      [`${leadIns[style]} f_m dépend d’un paramètre m. Déduire, par le TAF, une condition suffisante pour sa monotonie sur un intervalle donné.`, "Si la dérivée garde un signe strict sur l’intervalle, la fonction est strictement monotone; le TAF permet de relier les différences de valeurs au signe de la dérivée.", "Le TAF sert ici à passer du local au global."]
    ][style];
    return { statement: `${templates[0]}\n\n${topic}. Rédiger une conclusion explicite.`, correction: templates[1], hint: templates[2], type: style === 2 ? "proof" : "multi-step" };
  }

  const generic: Record<number, [string,string,string,ExerciseType]> = {
    3: [`${leadIns[style]} u_0=${p.a} et u_(n+1)=({a}\,u_n+{b})/(${p.a + 1}) avec une constante adaptée. Calculer les premiers termes, étudier la monotonie et chercher une limite éventuelle.`.replace("{a}", String(p.a)).replace("{b}", String(p.b)), "Calculer plusieurs termes pour conjecturer, puis établir par récurrence l’intervalle de stabilité et utiliser la relation de récurrence pour déterminer la limite si la suite converge.", "Calcule d’abord u_1 et u_2."],
    4: [`${leadIns[style]} simplifier une expression logarithmique puis résoudre l’équation obtenue sur son domaine de définition.`, "Utiliser les propriétés du logarithme sur un domaine correctement déterminé, puis revenir à l’équation initiale pour vérifier les solutions.", "Le domaine vient avant toute transformation."],
    5: [`${leadIns[style]} une équation exponentielle de la forme e^(ax+b)=c doit être résolue puis interprétée. Comparer ensuite deux valeurs de même nature.`, "Prendre le logarithme lorsque le second membre est strictement positif, isoler l’inconnue puis vérifier le résultat.", "Vérifie toujours que le second membre est positif avant de prendre ln."],
    6: [`${leadIns[style]} déterminer une primitive de la fonction proposée, puis utiliser une condition initiale pour fixer la constante.`, "Chercher une primitive par lecture des formes usuelles, dériver pour vérifier, puis appliquer la condition initiale.", "Dérive ta primitive pour éviter les erreurs de signe."],
    7: [`${leadIns[style]} calculer une intégrale sur [${p.a},${p.a + 1}], puis interpréter le résultat comme une aire lorsque l’intégrande est positive.`, "Déterminer une primitive F puis calculer F(b)-F(a). Pour une fonction positive, l’intégrale représente l’aire sous la courbe.", "Cherche une primitive simple avant de penser à l’aire."],
    8: [`${leadIns[style]} résoudre une équation différentielle linéaire puis déterminer la solution vérifiant une condition initiale.`, "Écrire la solution générale, puis utiliser la condition initiale pour déterminer la constante et vérifier par substitution.", "Commence par la solution générale."],
    9: [`${leadIns[style]} z=a+ib. Calculer |z| et un argument, puis passer à la forme trigonométrique. Utiliser cette forme pour interpréter une transformation géométrique.`, "Le module vaut sqrt(a²+b²), l’argument est un angle dont la tangente vaut b/a avec le bon quadrant. La forme trigonométrique facilite l’interprétation géométrique.", "Repère d’abord le quadrant du point (a,b)."],
    10: [`${leadIns[style]} dans un repère orthonormé, on considère les points A(${p.a},${p.b},${p.c}), B(${p.a+1},${p.b+2},${p.c+1}) et C(${p.a-1},${p.b+1},${p.c+2}). Déterminer un vecteur, une distance et une équation de plan adaptée.`, "Calculer les vecteurs par différence de coordonnées, puis utiliser le produit scalaire ou un vecteur normal pour caractériser le plan.", "Écris les vecteurs de base avant toute équation."],
    11: [`${leadIns[style]} une expérience comporte ${p.a + 2} issues élémentaires équiprobables. Déterminer une probabilité demandée, puis construire une probabilité conditionnelle avant d’interpréter le résultat.`, "Définir l’univers et les événements, compter les cas favorables ou utiliser la formule conditionnelle, puis vérifier que la probabilité est comprise entre 0 et 1.", "Nommer clairement les événements A et B."],
    12: [`${leadIns[style]} un entier N est soumis à une division euclidienne par ${p.a}. Déterminer le quotient et le reste, puis exploiter une congruence pour résoudre une condition de divisibilité.`, "Écrire N=${p.a}q+r avec 0≤r<p.a, puis traduire la divisibilité en congruence modulo ${p.a}.", "Commence par la division euclidienne exacte."],
    13: [`${leadIns[style]} une loi interne * est définie sur un ensemble E par une expression algébrique simple. Vérifier la fermeture, rechercher un neutre et étudier l’existence des inverses.`, "Vérifier que a*b appartient à E, rechercher e tel que a*e=e*a=a, puis résoudre a*x=e pour l’inverse lorsque cela est possible.", "Traite les trois propriétés séparément."],
    14: [`${leadIns[style]} une famille de trois vecteurs de R³ dépend d’un paramètre t. Déterminer les valeurs de t pour lesquelles la famille est libre, puis étudier la dimension du sous-espace engendré.`, "Former la matrice des coordonnées et étudier son déterminant ou résoudre la combinaison linéaire nulle selon le cas.", "La liberté se traduit par une seule combinaison linéaire nulle."],
  };
  const selected = generic[ci] ?? [`${leadIns[style]} résoudre un problème de type ${topic} en reliant calcul, justification et conclusion.\n1. Établir les données utiles.\n2. Utiliser la propriété adaptée.\n3. En déduire le résultat final.`, "Identifier la propriété du cours, appliquer proprement les calculs, puis relier explicitement le résultat à la question posée.", "Écris d’abord la propriété que tu comptes utiliser."];
  return { statement: `${selected[0]}\n\n${topic}.`, correction: selected[1], hint: selected[2], type: selected[3] };
}

export const maths300Exercises: Exercise[] = chapters.flatMap((chapter, ci) => chapter.topics.map((topic, ei) => {
  const { statement, correction, hint, type } = buildStatement(chapter, ci, ei);
  const difficulty = Math.min(5, 1 + Math.floor(ei / 5)) as ContentDifficulty;
  const id = `sm-300-d${String(ci + 1).padStart(2, "0")}-e${String(ei + 1).padStart(2, "0")}`;
  return {
    id,
    mode: "BASE",
    source: "APPROVED",
    target: { trackIds: ["SMA", "SMB"], subjectId: "maths", chapter: chapter.name, topic },
    type,
    difficulty,
    title: `${topic} ${String(ei + 1).padStart(2, "0")}`,
    statement,
    correction,
    hint,
    examTip: "Rédige les étapes utiles et réutilise les résultats précédents lorsque l’énoncé le permet.",
    estimatedMinutes: difficulty <= 2 ? 8 : difficulty === 3 ? 12 : difficulty === 4 ? 16 : 22,
    xpValue: 10 + difficulty * 5,
    tags: ["MATHS_SM", "MOROCCAN_BAC_STYLE", "EXAM_STYLE", ci >= 9 && ci <= 13 ? "NATIONAL_FAMILY" : "LESSON_SPECIFIC", ei === 19 ? "SYNTHESIS" : "EXERCISE"],
  } satisfies Exercise;
}));

if (import.meta.env.DEV && maths300Exercises.length !== 300) {
  console.error(`Normal SM maths bank must contain exactly 300 exercises. Found ${maths300Exercises.length}.`);
}
