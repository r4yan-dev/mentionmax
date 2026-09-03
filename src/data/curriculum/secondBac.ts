import type { LessonDocument, SubjectId, TrackId } from "../../types/academic";

export type UserPath = "SP" | "SMA" | "SMB";

export const pathLabels: Record<UserPath, string> = {
  SP: "2BAC Sciences Physiques",
  SMA: "2BAC Sciences Mathématiques A",
  SMB: "2BAC Sciences Mathématiques B",
};

export const pathSubjects: Record<UserPath, SubjectId[]> = {
  SP: ["maths", "physique-chimie", "svt", "anglais", "philosophie"],
  SMA: ["maths", "physique-chimie", "svt", "anglais", "philosophie"],
  SMB: ["maths", "physique-chimie", "anglais", "philosophie"],
};

export function resolveUserPath(track: "SPC" | "SM" | null, section: "A" | "B" | null): UserPath {
  if (track === "SM") return section === "B" ? "SMB" : "SMA";
  return "SP";
}

export function hasSubject(path: UserPath, subjectId: SubjectId) {
  return pathSubjects[path].includes(subjectId);
}

const allMathTracks: TrackId[] = ["SMA", "SMB"];
const allScienceTracks: TrackId[] = ["SP", "SMA"];
const allPcTracks: TrackId[] = ["SP", "SMA", "SMB"];

const mathLesson = (id: string, title: string, chapter: string, topic: string, intro: string, formula: string, method: string, mistake: string, recap: string[]): LessonDocument => ({
  id,
  title,
  language: "fr",
  source: "APPROVED",
  subjectId: "maths",
  chapter,
  topic,
  blocks: [
    { type: "title", title },
    { type: "intro", text: intro },
    { type: "concept", title: "Idée clé", text: intro },
    { type: "formula", latex: formula },
    { type: "method", title: "Méthode Bac", text: method },
    { type: "common-mistake", title: "Erreur fréquente", text: mistake },
    { type: "exam-tip", title: "Réflexe Bac", text: "Écris d'abord la propriété utilisée, puis applique-la proprement avant de remplacer les valeurs." },
    { type: "recap", title: "À retenir", items: recap },
  ],
});

const pcLesson = (id: string, title: string, chapter: string, topic: string, intro: string, formula: string, method: string, mistake: string, recap: string[]): LessonDocument => ({
  id,
  title,
  language: "fr",
  source: "APPROVED",
  subjectId: "physique-chimie",
  chapter,
  topic,
  blocks: [
    { type: "title", title },
    { type: "intro", text: intro },
    { type: "definition", title: "Définition / principe", text: intro },
    { type: "formula", latex: formula },
    { type: "method", title: "Méthode Bac", text: method },
    { type: "common-mistake", title: "Erreur fréquente", text: mistake },
    { type: "exam-tip", title: "Réflexe Bac", text: "Donne l'expression littérale avant toute application numérique et contrôle systématiquement les unités." },
    { type: "recap", title: "À retenir", items: recap },
  ],
});

export const secondBacMathLessons: LessonDocument[] = [
  mathLesson("2bac-maths-limits", "Limites et continuité", "Limites et continuité", "Limites, continuité, TVI et bijection", "On étudie le comportement d'une fonction au voisinage d'un réel ou à l'infini, puis on utilise la continuité pour établir existence et unicité.", "\\lim_{x\\to a}f(x)=L", "Identifier la forme de la limite, utiliser une limite de référence ou une transformation adaptée, puis conclure avec les hypothèses du théorème utilisé.", "Appliquer le théorème des valeurs intermédiaires sans vérifier la continuité sur l'intervalle.", ["Limites finies et infinies", "Continuité", "Théorème des valeurs intermédiaires", "Bijection et fonction réciproque"]),
  mathLesson("2bac-maths-derivation", "Dérivation et étude des fonctions", "Dérivation et étude des fonctions", "Dérivée, variations et extrema", "La dérivée traduit la variation locale d'une fonction et permet de construire son tableau de variations et d'étudier ses extrema.", "f'(x)=\\lim_{h\\to0}\\frac{f(x+h)-f(x)}h", "Déterminer l'ensemble de définition, calculer f', étudier son signe, dresser les variations puis exploiter les limites et valeurs particulières.", "Confondre le signe de f avec le signe de f'.", ["Calculer une dérivée", "Étudier le signe de f'", "Dresser les variations", "Interpréter les extrema"]),
  mathLesson("2bac-maths-sequences", "Suites numériques", "Suites numériques", "Convergence et suites récurrentes", "Les suites permettent de modéliser des évolutions discrètes et d'étudier convergence, monotonie et limites.", "u_{n+1}=f(u_n)", "Montrer la stabilité dans un intervalle, étudier la monotonie et la bornitude, puis identifier la limite avec la continuité de f.", "Annoncer directement la limite d'une suite récurrente sans établir sa convergence.", ["Suites usuelles", "Monotonie et bornitude", "Suites adjacentes", "Suites récurrentes"]),
  mathLesson("2bac-maths-primitives", "Primitives et calcul intégral", "Primitives et calcul intégral", "Primitives et intégrales", "Une primitive permet de reconstruire une fonction à partir de sa dérivée et de calculer des aires orientées.", "\\int_a^b f(x)dx=F(b)-F(a)", "Chercher une primitive, déterminer la constante avec une condition, puis appliquer la relation de Chasles ou la formule fondamentale.", "Oublier la constante dans une famille de primitives ou mélanger aire et aire algébrique.", ["Familles de primitives", "Intégrale sur un intervalle", "Aires", "Lien dérivée/primitive"]),
  mathLesson("2bac-maths-log", "Fonctions logarithmiques", "Fonctions logarithmiques", "Logarithme népérien", "Le logarithme transforme les produits en sommes et intervient dans les équations, limites et études de fonctions.", "(\\ln x)'=\\frac1x", "Commencer par x>0, utiliser les propriétés algébriques de ln, puis étudier signe, dérivée et limites.", "Écrire ln(a+b)=ln a+ln b, ce qui est faux.", ["Domaine x>0", "Propriétés de ln", "Dérivée", "Équations et limites"]),
  mathLesson("2bac-maths-exp", "Fonction exponentielle", "Fonctions exponentielles", "Exponentielle népérienne", "L'exponentielle est strictement positive, strictement croissante et sa dérivée est elle-même.", "(e^x)'=e^x", "Transformer les équations avec ln et exp, puis exploiter monotonie et limites pour les problèmes d'existence.", "Oublier que e^x>0 pour tout réel x.", ["e^x>0", "(e^x)'=e^x", "Croissance", "Équations exponentielles"]),
  mathLesson("2bac-maths-complexes", "Nombres complexes", "Nombres complexes", "Formes algébrique et trigonométrique", "Les complexes prolongent les réels et permettent de traiter équations, géométrie et transformations du plan.", "z=a+ib\\quad ;\\quad z=r(\\cos\\theta+i\\sin\\theta)", "Passer à la forme adaptée au calcul demandé, utiliser module et argument, puis interpréter géométriquement lorsque nécessaire.", "Perdre le signe de i²=-1 ou confondre module et argument.", ["Forme algébrique", "Module et argument", "Forme trigonométrique", "Équations complexes"]),
  mathLesson("2bac-maths-differential", "Équations différentielles", "Équations différentielles", "Équations linéaires du premier ordre", "On cherche une fonction dont la dérivée satisfait une relation donnée avec la fonction elle-même ou une fonction source.", "y'+ay=b(x)", "Identifier la forme, écrire la solution générale puis utiliser la condition initiale pour déterminer la constante.", "Donner une seule solution sans déterminer la constante imposée par la condition initiale.", ["Solution générale", "Condition initiale", "Équations linéaires", "Vérification"]),
  mathLesson("2bac-maths-arithmetic", "Arithmétique dans ℤ", "Arithmétique dans ℤ", "Divisibilité, congruences et Bézout", "L'arithmétique étudie les propriétés des entiers avec divisibilité, PGCD, congruences et relations de Bézout.", "au+ bv=\\operatorname{pgcd}(a,b)", "Réduire par le PGCD, utiliser Euclide et travailler modulo n lorsque cela simplifie la démonstration.", "Confondre congruence et égalité ordinaire.", ["Division euclidienne", "PGCD", "Bézout", "Congruences"]),
  mathLesson("2bac-maths-algebra", "Structures algébriques", "Structures algébriques", "Lois, groupes et sous-structures", "Une structure algébrique organise une loi de composition et ses propriétés afin de raisonner de façon générale.", "a\\star b\\in E", "Vérifier fermeture, associativité, élément neutre et inverse selon la structure étudiée.", "Utiliser le mot groupe sans vérifier les axiomes nécessaires.", ["Lois de composition", "Groupes", "Sous-groupes", "Morphismes"]),
  mathLesson("2bac-maths-vector", "Espaces vectoriels", "Espaces vectoriels", "Sous-espaces, bases et dimension", "Les espaces vectoriels permettent d'exprimer les problèmes linéaires avec des combinaisons, bases et coordonnées.", "v=\\lambda_1e_1+\\cdots+\\lambda_ne_n", "Montrer qu'un ensemble est un sous-espace puis déterminer une famille génératrice libre et enfin la dimension.", "Confondre famille génératrice et base.", ["Sous-espaces", "Familles libres/génératrices", "Bases", "Dimension"]),
  mathLesson("2bac-maths-probabilities", "Dénombrement et probabilités", "Dénombrement et probabilités", "Combinatoire et variables aléatoires", "Le dénombrement fournit les cardinalités nécessaires au calcul probabiliste et à l'étude de lois discrètes.", "P(A)=\\frac{card(A)}{card(\\Omega)}", "Définir clairement l'univers, reconnaître indépendance ou conditionnement, puis choisir la formule de dénombrement adaptée.", "Multiplier des probabilités sans vérifier l'indépendance.", ["Combinaisons", "Probabilités conditionnelles", "Indépendance", "Variables aléatoires"]),
];

export const secondBacPcLessons: LessonDocument[] = [
  pcLesson("2bac-pc-waves", "Ondes mécaniques progressives", "Ondes mécaniques progressives", "Célérité et retard", "Une onde mécanique progressive transporte une perturbation de proche en proche sans transport global de matière.", "v=\\frac{d}{\\Delta t}", "Identifier deux points et le retard, puis relier distance et durée par la célérité.", "Confondre célérité et fréquence.", ["Propagation", "Célérité", "Retard"]),
  pcLesson("2bac-pc-periodic", "Ondes mécaniques progressives périodiques", "Ondes mécaniques progressives périodiques", "Période et longueur d'onde", "Une onde périodique possède une répétition temporelle et spatiale caractérisée par T, f et λ.", "v=\\lambda f=\\frac{\\lambda}{T}", "Passer entre période, fréquence et longueur d'onde avec les unités SI.", "Utiliser λ=vT et v=λf simultanément avec une mauvaise unité de fréquence.", ["Période", "Fréquence", "Longueur d'onde"]),
  pcLesson("2bac-pc-light", "Propagation d'une onde lumineuse", "Propagation d'une onde lumineuse", "Indice, diffraction et dispersion", "La lumière est une onde électromagnétique dont la propagation dépend du milieu transparent.", "n=\\frac{c}{v}", "Relier vitesse et indice, puis interpréter diffraction et dispersion à partir des observations expérimentales.", "Prendre n=c dans tous les milieux.", ["Indice", "Vitesse de la lumière", "Diffraction", "Dispersion"]),
  pcLesson("2bac-pc-radioactivity", "Décroissance radioactive", "Décroissance radioactive", "Loi de décroissance et demi-vie", "La désintégration radioactive est aléatoire au niveau microscopique mais décrite statistiquement par une loi exponentielle.", "N(t)=N_0e^{-\\lambda t}\\quad ;\\quad T_{1/2}=\\frac{\\ln2}{\\lambda}", "Choisir la grandeur suivie, utiliser la loi exponentielle ou le nombre de demi-vies, puis vérifier les unités de temps.", "Confondre constante radioactive λ et longueur d'onde.", ["Décroissance", "Activité", "Demi-vie", "Datation"]),
  pcLesson("2bac-pc-mass-energy", "Noyaux, masse et énergie", "Noyaux, masse et énergie", "Défaut de masse et énergie", "La transformation nucléaire s'accompagne d'un bilan de masse et d'énergie.", "E=mc^2", "Calculer un défaut de masse, convertir les unités puis interpréter le signe du bilan énergétique.", "Mélanger unités u, kg, J et MeV sans conversion.", ["Défaut de masse", "Énergie de liaison", "Équivalence masse-énergie"]),
  pcLesson("2bac-pc-rc", "Dipôle RC", "Dipôle RC", "Charge et décharge", "Le condensateur stocke de l'énergie électrique et sa charge évolue progressivement dans un circuit RC.", "q=Cu\\quad ;\\quad \\tau=RC", "Identifier τ, écrire l'évolution temporelle puis exploiter la valeur à t=τ.", "Prendre τ=R/C.", ["Constante de temps", "Charge", "Décharge"]),
  pcLesson("2bac-pc-rl", "Dipôle RL", "Dipôle RL", "Établissement du courant", "Une bobine s'oppose aux variations rapides du courant et introduit une dynamique temporelle.", "\\tau=\\frac{L}{R}", "Repérer le régime transitoire puis relier τ aux paramètres R et L.", "Utiliser la formule du circuit RC.", ["Bobine", "Constante de temps", "Régime transitoire"]),
  pcLesson("2bac-pc-rlc", "Circuit RLC série", "Oscillations libres dans un circuit RLC série", "Oscillations et résonance", "L'association bobine-condensateur échange de l'énergie et peut produire des oscillations électriques amorties.", "\\omega_0=\\frac1{\\sqrt{LC}}", "Identifier les échanges d'énergie et caractériser la période ou pulsation propre.", "Oublier l'effet de R sur l'amortissement.", ["LC", "Pulsation propre", "Amortissement"]),
  pcLesson("2bac-pc-modulation", "Transmission d'information", "Transmission d'information / modulation d'amplitude", "Modulation d'amplitude", "La modulation permet de transporter une information basse fréquence sur une onde porteuse.", "m=\\frac{U_{max}-U_{min}}{U_{max}+U_{min}}", "Lire l'enveloppe, calculer le taux de modulation et distinguer porteuse et signal modulant.", "Inverser Umax et Umin dans la relation du taux de modulation.", ["Porteuse", "Modulation", "Taux de modulation"]),
  pcLesson("2bac-pc-newton", "Lois de Newton", "Lois de Newton", "Bilan des forces", "Le mouvement d'un système se relie à la résultante des forces extérieures par la deuxième loi de Newton.", "\\sum\\vec F=m\\vec a", "Définir le système, choisir le référentiel, faire le bilan des forces puis projeter l'équation.", "Écrire les forces sans préciser le système étudié.", ["Référentiel", "Bilan des forces", "Deuxième loi"]),
  pcLesson("2bac-pc-fall", "Chute verticale d'un solide", "Chute verticale d'un solide", "Mouvement sous pesanteur", "En l'absence d'autres forces significatives, la pesanteur impose une accélération verticale constante.", "v=v_0+gt\\quad ;\\quad y=y_0+v_0t+\\frac12gt^2", "Choisir l'axe et son orientation avant de déterminer les signes des composantes.", "Changer de convention de signe au milieu du calcul.", ["Accélération g", "Vitesse", "Position"]),
  pcLesson("2bac-pc-plan", "Mouvements plans", "Mouvements plans", "Projectile", "Le mouvement dans un plan se traite par projection indépendante selon les axes lorsque les composantes de l'accélération sont connues.", "v_{0x}=v_0\\cos\\alpha\\quad ;\\quad v_{0y}=v_0\\sin\\alpha", "Séparer les équations selon x et y puis éliminer t lorsque l'équation de trajectoire est demandée.", "Oublier de projeter la vitesse initiale.", ["Composantes", "Trajectoire", "Portée"]),
  pcLesson("2bac-pc-orbit", "Satellites artificiels et planètes", "Satellites artificiels et planètes", "Mouvement circulaire", "Un satellite en orbite circulaire est soumis à une interaction gravitationnelle fournissant l'accélération centripète.", "v=\\sqrt{\\frac{GM}{r}}", "Égaler force gravitationnelle et terme centripète puis isoler la grandeur demandée.", "Utiliser le rayon de la surface au lieu du rayon orbital.", ["Gravitation", "Orbite circulaire", "Vitesse orbitale"]),
  pcLesson("2bac-pc-rotation", "Dynamique de rotation", "Relation quantitative entre moments et accélération angulaire", "Moment dynamique", "La rotation autour d'un axe fixe se décrit par le moment résultant et le moment d'inertie.", "\\sum M_\\Delta=J_\\Delta\\alpha", "Choisir l'axe, déterminer le signe des moments puis appliquer la relation fondamentale.", "Mélanger force, bras de levier et moment sans convention de signe.", ["Moment", "Moment d'inertie", "Accélération angulaire"]),
];

export const secondBacSvtLessons: LessonDocument[] = [
  { id: "2bac-svt-genetics", title: "Expression du patrimoine génétique", language: "fr", source: "APPROVED", subjectId: "svt", chapter: "Expression du patrimoine génétique", topic: "Expression des gènes", blocks: [
    { type: "title", title: "Expression du patrimoine génétique" },
    { type: "intro", text: "L'information génétique portée par l'ADN s'exprime par la synthèse d'ARN puis de protéines." },
    { type: "concept", title: "Du gène à la protéine", text: "La transcription produit un ARN messager à partir d'un gène, puis la traduction permet l'assemblage d'une chaîne polypeptidique." },
    { type: "recap", title: "À retenir", items: ["ADN → ARN", "Transcription", "Traduction", "Protéine"] },
  ]},
  { id: "2bac-svt-immunity", title: "Réponse immunitaire", language: "fr", source: "APPROVED", subjectId: "svt", chapter: "Immunité", topic: "Défenses immunitaires", blocks: [
    { type: "title", title: "Réponse immunitaire" },
    { type: "intro", text: "Le système immunitaire reconnaît des éléments étrangers et met en place des réponses innées et adaptatives." },
    { type: "concept", title: "Spécificité", text: "La réponse adaptative repose notamment sur la reconnaissance spécifique des antigènes par des récepteurs appropriés." },
    { type: "exam-tip", title: "Réflexe Bac", text: "Dans un document, distingue toujours observation, interprétation et conclusion biologique." },
    { type: "recap", title: "À retenir", items: ["Immunité innée", "Immunité adaptative", "Antigène", "Anticorps / lymphocytes"] },
  ]},
  { id: "2bac-svt-physiology", title: "Régulation physiologique", language: "fr", source: "APPROVED", subjectId: "svt", chapter: "Physiologie", topic: "Homéostasie", blocks: [
    { type: "title", title: "Régulation physiologique" },
    { type: "intro", text: "Les organismes maintiennent certaines grandeurs internes dans des intervalles compatibles avec le fonctionnement des cellules." },
    { type: "method", title: "Méthode document", text: "Identifier la variable régulée, le capteur, le centre intégrateur et les effecteurs avant de conclure sur la boucle de régulation." },
    { type: "recap", title: "À retenir", items: ["Homéostasie", "Boucle de régulation", "Rétrocontrôle", "Effecteurs"] },
  ]},
];

export const secondBacLanguageLessons: LessonDocument[] = [
  { id: "2bac-eng-reading", title: "Reading comprehension", language: "fr", source: "APPROVED", subjectId: "anglais", chapter: "Reading", topic: "Comprehension", blocks: [
    { type: "title", title: "Reading comprehension" },
    { type: "intro", text: "Lire efficacement un texte consiste à identifier l'idée globale, les informations précises et les relations entre les idées." },
    { type: "method", title: "Méthode Bac", text: "Lire d'abord le titre et les questions, repérer les mots-clés puis justifier chaque réponse avec une partie identifiable du texte." },
    { type: "recap", title: "À retenir", items: ["Skimming", "Scanning", "Context clues", "Justification"] },
  ]},
  { id: "2bac-eng-writing", title: "Argumentative writing", language: "fr", source: "APPROVED", subjectId: "anglais", chapter: "Writing", topic: "Essay", blocks: [
    { type: "title", title: "Argumentative writing" },
    { type: "intro", text: "Une production argumentative présente une position claire, des arguments organisés et des exemples pertinents." },
    { type: "method", title: "Structure", text: "Introduction avec position, paragraphes argumentatifs, exemples et conclusion qui répond directement à la problématique." },
    { type: "common-mistake", title: "Common mistake", text: "Changer de temps ou de point de vue sans raison et empiler des idées sans connecteurs logiques." },
    { type: "recap", title: "À retenir", items: ["Thesis", "Arguments", "Examples", "Linking words", "Conclusion"] },
  ]},
];

export const secondBacPhiloLessons: LessonDocument[] = [
  { id: "2bac-philo-consciousness", title: "La conscience", language: "fr", source: "APPROVED", subjectId: "philosophie", chapter: "La conscience", topic: "Conscience de soi", blocks: [
    { type: "title", title: "La conscience" },
    { type: "intro", text: "La conscience renvoie notamment à la capacité de se représenter soi-même et son rapport au monde." },
    { type: "method", title: "Méthode dissertation", text: "Définir précisément les termes, faire apparaître une tension dans la question, puis construire une progression argumentative." },
    { type: "recap", title: "À retenir", items: ["Définir", "Problématiser", "Argumenter", "Illustrer", "Nuancer"] },
  ]},
  { id: "2bac-philo-freedom", title: "La liberté", language: "fr", source: "APPROVED", subjectId: "philosophie", chapter: "La liberté", topic: "Liberté et déterminisme", blocks: [
    { type: "title", title: "La liberté" },
    { type: "intro", text: "La réflexion sur la liberté oppose notamment pouvoir choisir, agir sans contrainte et déterminations qui influencent nos décisions." },
    { type: "common-mistake", title: "Erreur fréquente", text: "Réduire la liberté à l'absence totale de contraintes sans examiner les distinctions conceptuelles." },
    { type: "recap", title: "À retenir", items: ["Choix", "Contrainte", "Autonomie", "Déterminisme"] },
  ]},
];

export const secondBacLessons: LessonDocument[] = [
  ...secondBacMathLessons,
  ...secondBacPcLessons,
  ...secondBacSvtLessons,
  ...secondBacLanguageLessons,
  ...secondBacPhiloLessons,
];

export const secondBacTracks = { allMathTracks, allScienceTracks, allPcTracks };
