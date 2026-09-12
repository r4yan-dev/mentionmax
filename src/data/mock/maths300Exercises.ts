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

const types: ExerciseType[] = ["calculation", "short-answer", "multi-step", "proof", "numeric"];

function params(ci: number, ei: number) {
  const n = ci * 20 + ei + 2;
  return { n, a: (n % 6) + 2, b: (n % 5) + 1, c: (n % 7) - 3, d: (n % 4) + 2 };
}

function makeExercise(chapter: Chapter, ci: number, ei: number): Exercise {
  const topic = chapter.topics[ei];
  const { n, a, b, c, d } = params(ci, ei);
  const synthesis = ei === 19;
  const difficulty = Math.min(5, 1 + Math.floor(ei / 4)) as ContentDifficulty;
  const type = types[ei % types.length];
  let statement = "", correction = "", hint = "", examTip = "";

  switch (ci) {
    case 0:
      statement = `On considère la fonction f définie par f(x)=(x^2+${a}x+${b})/(x-${d}).
1. Déterminer D_f et factoriser le numérateur si possible.
2. Calculer les limites aux bornes de D_f et déterminer les asymptotes.
3. Effectuer la division du numérateur par x-${d} pour obtenir une écriture adaptée à l’étude à l’infini.
4. Calculer f'(x), étudier son signe et dresser le tableau de variations.
5. À l’aide du tableau, déterminer le nombre de solutions de f(x)=${a} et justifier l’existence ou l’unicité.
Objectif : réaliser une étude complète d’une fonction rationnelle et exploiter ses variations.`;
      correction = `Le domaine est R\\{${d}}. On effectue la division polynomiale puis on calcule les limites en ${d} et à ±∞. La dérivée se met sous la forme d’un quotient dont le dénominateur est un carré; son signe se lit donc au numérateur. Le tableau de variations permet enfin de compter les intersections avec la droite y=${a}.`;
      hint = "Commencer par le domaine, puis faire la division polynomiale avant les limites à l’infini.";
      examTip = "Une étude de fonction utile doit aboutir à une conclusion exploitable, pas seulement à un tableau.";
      break;
    case 1:
      statement = `On considère f(x)=x^3-${a}x^2+${b}x+${c}.
1. Calculer f'(x) et factoriser ou étudier son discriminant.
2. Étudier le signe de f' et dresser le tableau de variations.
3. Déterminer les extrema locaux.
4. Écrire l’équation de la tangente en x=${d}.
5. Discuter, selon k, le nombre de solutions de f(x)=k à partir du tableau de variations.
Objectif : passer de la dérivée à la géométrie puis au nombre de solutions.`;
      correction = `On calcule f'(x)=3x²-${2*a}x+${b}. Les zéros de f' découpent R en intervalles de monotonie. Les extrema sont les images des points critiques. La tangente en ${d} est obtenue par y=f(${d})+f'(${d})(x-${d}). La dernière question se traite graphiquement avec les valeurs extrêmes.`;
      hint = "Pour compter les solutions, utilise les variations plutôt que de résoudre l’équation cubique.";
      examTip = "Le tableau de variations est une machine à compter les solutions.";
      break;
    case 2:
      statement = `On considère f(x)=√(x+${a}) sur [${a},${a+2}].
1. Vérifier les conditions de continuité et de dérivabilité nécessaires.
2. Calculer le taux de variation entre ${a} et ${a+2}.
3. Appliquer le théorème des accroissements finis et déterminer c∈]${a},${a+2}[.
4. Montrer que |f'(x)|≤${b} sur l’intervalle.
5. En déduire une majoration de |f(x)-f(y)| pour x,y dans l’intervalle.
Objectif : utiliser le TAF pour transformer une variation globale en borne quantitative.`;
      correction = `f'(x)=1/(2√(x+${a})). Le TAF donne f'(c)=[f(${a+2})-f(${a})]/2. La borne sur f' entraîne |f(x)-f(y)|≤M|x-y| avec une constante M adaptée à l’intervalle.`;
      hint = "Écris d’abord le taux de variation exact, puis seulement après invoque le TAF.";
      examTip = "Le TAF doit produire une information concrète : une valeur intermédiaire ou une borne.";
      break;
    case 3:
      statement = `On considère u_0=${a} et u_{n+1}=((u_n+${b})/${d+2}).
1. Calculer u_1 et u_2.
2. Déterminer le point fixe ℓ de la fonction g(x)=(x+${b})/${d+2}.
3. Exprimer u_{n+1}-ℓ en fonction de u_n-ℓ.
4. En déduire par récurrence une expression de u_n-ℓ puis étudier la monotonie et la convergence.
5. Donner un rang N tel que |u_N-ℓ|<10^{-3}.
Objectif : relier point fixe, récurrence, monotonie et approximation d’une limite.`;
      correction = `Le point fixe vérifie ℓ=(ℓ+${b})/${d+2}. En soustrayant ℓ à la relation de récurrence, on obtient une relation multiplicative sur u_n-ℓ. Sa valeur absolue décroît géométriquement, ce qui permet de contrôler l’erreur et de choisir N.`;
      hint = "Soustraire le point fixe aux deux membres de la relation de récurrence.";
      examTip = "Une suite affine se traite souvent mieux en étudiant u_n-ℓ qu’en développant les premiers termes.";
      break;
    case 4:
      statement = `On considère f(x)=ln(x+${a})-ln(${b}x+${d}).
1. Déterminer D_f.
2. Réduire f à un seul logarithme.
3. Résoudre f(x)=0 puis vérifier les solutions dans l’expression initiale.
4. Calculer f'(x) et étudier son signe.
5. Déduire le nombre de solutions de f(x)=${c}.
Objectif : maîtriser domaine, propriétés du logarithme, dérivée et unicité.`;
      correction = `Le domaine impose x+${a}>0 et ${b}x+${d}>0. Sur ce domaine, f=ln((x+${a})/(${b}x+${d})). La dérivée se calcule terme à terme puis son signe permet d’établir la monotonie et donc l’unicité éventuelle.`;
      hint = "Ne transforme jamais une expression logarithmique avant d’avoir déterminé son domaine.";
      examTip = "Domaine → simplification → résolution → dérivée → unicité.";
      break;
    case 5:
      statement = `On considère f(x)=e^{${a}x}-${b}e^x+${c}.
1. Factoriser par la puissance exponentielle adaptée.
2. Résoudre f(x)=0 en posant t=e^x.
3. Déterminer les solutions réelles acceptables après retour à x.
4. Calculer f'(x) et étudier les variations.
5. Vérifier avec les variations que le nombre de solutions trouvé est cohérent.
Objectif : transformer une équation exponentielle en problème algébrique puis contrôler le résultat par l’étude de fonction.`;
      correction = `On pose t=e^x>0. L’équation devient une équation polynomiale en t. Seules les racines strictement positives donnent des solutions x=ln(t). L’étude de f' fournit ensuite un contrôle indépendant du nombre de solutions.`;
      hint = "Le changement t=e^x est utile uniquement si tu gardes la contrainte t>0.";
      examTip = "Après un changement de variable exponentiel, toujours revenir au domaine réel de la variable initiale.";
      break;
    case 6:
      statement = `On cherche une primitive de f(x)=${a}x^2-${b}x+${c}+${d}e^x.
1. Déterminer une primitive générale F.
2. Vérifier par dérivation que F'=f.
3. Déterminer la primitive F_0 telle que F_0(0)=${a}.
4. Étudier les variations de F_0.
5. Calculer la variation F_0(${d})-F_0(0) et l’interpréter comme une accumulation.
Objectif : construire, contrôler et exploiter une primitive plutôt que seulement appliquer une formule.`;
      correction = `Une primitive est F(x)=${a}x^3/3-${b}x²/2+${c}x+${d}e^x+C. La condition initiale détermine C. On vérifie ensuite par dérivation et on étudie F_0' à l’aide de f.`;
      hint = "La constante C n’est déterminée qu’après utilisation de la condition initiale.";
      examTip = "Toujours vérifier une primitive en dérivant la réponse.";
      break;
    case 7:
      statement = `On considère f(x)=x^2-${a}x+${b} sur [0,${d}].
1. Étudier le signe de f sur l’intervalle.
2. Calculer I=∫_0^${d} f(x)dx.
3. Interpréter I comme une aire algébrique.
4. Si nécessaire, déterminer l’aire géométrique en séparant les intervalles où f change de signe.
5. Calculer la valeur moyenne de f sur [0,${d}].
Objectif : passer de l’intégrale calculée à une interprétation géométrique et quantitative.`;
      correction = `On cherche les zéros de f avant de parler d’aire géométrique. Une primitive est x³/3-${a}x²/2+${b}x. L’intégrale donne l’aire algébrique; si le signe change, on additionne les valeurs absolues des intégrales sur les sous-intervalles.`;
      hint = "Une aire géométrique n’est pas toujours égale à l’intégrale signée.";
      examTip = "Étudier le signe avant d’interpréter une intégrale comme une aire.";
      break;
    case 8:
      statement = `On étudie l’équation différentielle y'+${a}y=${b}.
1. Résoudre l’équation homogène associée.
2. Déterminer une solution particulière constante.
3. Donner la solution générale.
4. Déterminer la solution vérifiant y(0)=${d}.
5. Étudier sa limite et déterminer le temps à partir duquel |y-${b/a}|<10^{-2} lorsque c’est possible.
Objectif : relier résolution, condition initiale, équilibre et comportement asymptotique.`;
      correction = `La solution homogène est Ce^{-(${a})x}. Une solution particulière constante vaut ${b}/${a}. Ainsi y=${b}/${a}+Ce^{-(${a})x}. La condition y(0)=${d} donne C=${d}-${b}/${a}. La limite est l’équilibre ${b}/${a}.`;
      hint = "Pour y'+ay=b, commence par l’équation homogène puis cherche une solution constante.";
      examTip = "Dans une équation différentielle linéaire, l’équilibre est souvent la limite naturelle de la solution.";
      break;
    case 9:
      statement = `On considère z=${a}+${b}i et w=${c}+${d}i.
1. Calculer z+w et zw.
2. Déterminer |z| et un argument de z.
3. Écrire z sous forme trigonométrique puis exponentielle.
4. Résoudre l’équation u^2=z^2 dans C et interpréter géométriquement les solutions.
5. Déterminer l’image de z par la rotation de centre O et d’angle π/${d+1}.
Objectif : passer des calculs algébriques aux formes géométriques et trigonométriques des nombres complexes.`;
      correction = `Les calculs algébriques donnent directement les parties réelle et imaginaire. Le module vaut √(a²+b²) et l’argument est déterminé avec le quadrant. La forme trigonométrique permet ensuite d’utiliser les propriétés des produits, puissances et rotations.`;
      hint = "Pour l’argument, ne te contente pas de tan(θ)=b/a : vérifie le quadrant.";
      examTip = "Module + argument donnent immédiatement une lecture géométrique du complexe.";
      break;
    case 10:
      statement = `Dans l’espace muni d’un repère orthonormé, on considère A(${a};0;${b}), B(0;${d};0) et C(${c};1;${a}).
1. Calculer les vecteurs AB et AC.
2. Calculer AB·AC et en déduire si l’angle BAC est droit.
3. Déterminer une équation paramétrique de (AB).
4. Déterminer une équation cartésienne du plan (ABC) ou vérifier l’appartenance d’un point M(${d};${a};${c}).
5. Étudier l’intersection de (AB) avec le plan x+y+z=${a+b}.
Objectif : enchaîner vecteurs, produit scalaire, droite et plan dans une situation spatiale concrète.`;
      correction = `On calcule les coordonnées des vecteurs par différence. Le produit scalaire permet de tester l’orthogonalité. Une représentation paramétrique de la droite s’obtient à partir de A et du vecteur AB; pour le plan, on cherche un vecteur normal orthogonal à AB et AC puis on utilise l’équation du plan.`;
      hint = "Les coordonnées des vecteurs sont toujours obtenues par point d’arrivée moins point de départ.";
      examTip = "Dans l’espace, les vecteurs servent de pont entre calcul et géométrie.";
      break;
    case 11:
      statement = `Une urne contient ${a} boules rouges et ${b+3} boules blanches. On tire ${d} boules simultanément.
1. Calculer le nombre total de tirages.
2. Calculer la probabilité d’obtenir exactement deux boules rouges lorsque cela est possible.
3. Calculer la probabilité d’obtenir au moins une boule rouge.
4. Définir A = « obtenir une rouge au premier tirage » et B = « obtenir exactement deux rouges ». Étudier P(B|A).
5. Comparer P(B|A) et P(B) et interpréter le résultat.
Objectif : mobiliser dénombrement, complément et probabilité conditionnelle dans une même expérience.`;
      correction = `Les tirages simultanés se comptent avec des combinaisons. Pour « au moins une rouge », on utilise le complément « aucune rouge ». La probabilité conditionnelle se calcule par P(B|A)=P(A∩B)/P(A), puis on compare aux probabilités non conditionnelles.`;
      hint = "Choisis d’abord si l’ordre compte. Ici, le tirage simultané conduit naturellement aux combinaisons.";
      examTip = "En probabilités, définir clairement l’univers et les événements évite la majorité des erreurs de dénombrement.";
      break;
    case 12:
      statement = `On travaille dans Z avec les entiers m=${a*10+b} et n=${d*10+c+4}.
1. Effectuer la division euclidienne de m par n.
2. Calculer PGCD(m,n) par l’algorithme d’Euclide.
3. Déterminer des entiers u,v tels que um+vn=PGCD(m,n).
4. Résoudre la congruence mx≡${b} [n] lorsque cela est possible.
5. Vérifier la solution obtenue et préciser l’ensemble des solutions modulo n.
Objectif : faire circuler une même relation entre division euclidienne, PGCD, Bézout et congruences.`;
      correction = `L’algorithme d’Euclide donne le PGCD. Les remontées successives fournissent une identité de Bézout. Si le coefficient de x est inversible modulo n, on multiplie par son inverse; sinon on vérifie la condition de divisibilité par le PGCD.`;
      hint = "La remontée de l’algorithme d’Euclide est la méthode la plus sûre pour construire Bézout.";
      examTip = "Ne cherche pas un inverse modulo n avant d’avoir vérifié que le PGCD vaut 1.";
      break;
    case 13:
      statement = `Sur E=Z/(${a+3})Z, on définit une loi ⋆ par [x]⋆[y]=[x+y+${b}].
1. Vérifier que ⋆ est une loi interne.
2. Déterminer son élément neutre.
3. Déterminer le symétrique de [x].
4. Vérifier l’associativité et la commutativité.
5. Conclure sur la structure algébrique de (E,⋆) et donner un contre-exemple à toute propriété non satisfaite.
Objectif : ne pas réciter les axiomes, mais les tester sur une loi explicitement définie.`;
      correction = `La loi est bien définie modulo ${a+3}. Le neutre e vérifie [x]⋆e=[x], donc [e]=[-${b}]. L’inverse de [x] vérifie [x]⋆[y]=[-${b}], ce qui donne [y]=[-x-2${b}]. L’associativité et la commutativité se vérifient par calcul modulo ${a+3}.`;
      hint = "Pour chaque axiome, écris l’égalité exacte à vérifier avant de simplifier.";
      examTip = "Une structure algébrique se démontre par une liste d’axiomes vérifiés sur la loi donnée.";
      break;
    case 14:
      statement = `Dans R^3, on considère u=(${a};1;0), v=(0;${b};1) et w=(${c};${d};${a}).
1. Étudier si (u,v,w) est libre.
2. Déterminer une base et la dimension du sous-espace engendré par u et v.
3. Donner les coordonnées de p=(${a+c};${b+1};${d}) dans cette base lorsqu’elles existent.
4. Définir T(x,y,z)=(x+${a}y; y+${b}z) et déterminer Ker(T).
5. Utiliser le théorème du rang pour contrôler le résultat.
Objectif : relier familles libres, coordonnées, application linéaire, noyau et rang dans un seul problème.`;
      correction = `La liberté se teste par au+bv+cw=0 et résolution du système. Pour T, on résout simultanément x+${a}y=0 et y+${b}z=0 afin d’obtenir le noyau, puis le théorème du rang contrôle la dimension de l’image.`;
      hint = "Transforme chaque question de linéarité en un système d’équations sur les coordonnées.";
      examTip = "Le théorème du rang est un outil de contrôle : utilise-le pour vérifier, pas seulement pour conclure.";
      break;
  }

  if (synthesis) {
    statement += `\n\nSynthèse : après les calculs précédents, rédiger une conclusion structurée de 8 à 12 lignes expliquant le lien entre les résultats et le thème « ${topic} ».`;
    examTip += " La dernière question doit réutiliser les résultats précédents, comme dans une vraie partie de synthèse.";
  }

  return {
    id: `maths-sm-${String(ci * 20 + ei + 1).padStart(3, "0")}`,
    mode: "BASE",
    source: "AI_GENERATED",
    target: { trackIds: ["SMA", "SMB"], subjectId: "maths", chapter: chapter.name, topic },
    type,
    difficulty,
    title: `${topic} — exercice ${ei + 1}`,
    statement,
    correction,
    hint,
    examTip,
    estimatedMinutes: 12 + difficulty * 3,
    xpValue: 30 + difficulty * 10,
    tags: ["MATHS_SM", "MOROCCAN_BAC_STYLE", "EXAM_STYLE", "LESSON_SPECIFIC", ...(synthesis ? ["SYNTHESIS"] : [])],
  };
}

export const maths300Exercises: Exercise[] = chapters.flatMap((chapter, ci) =>
  chapter.topics.map((_, ei) => makeExercise(chapter, ci, ei))
);
