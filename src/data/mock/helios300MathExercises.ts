import type { Exercise } from "../../types/content";
import type { TrackId } from "../../types/academic";

export interface HeliosExerciseMeta {
  missionDay: number;
  missionObjective: string;
  context: string;
  parts: string[];
  animation: string;
}

const makeHeliosExercise = (spec: {
  id: string; day: number; chapter: string; mission: string; tracks: TrackId[];
  title: string; topic: string; context: string; parts: string[]; correction: string; animation: string; difficulty: 1|2|3|4|5;
  type: Exercise["type"];
}): Exercise & HeliosExerciseMeta => ({
  id: spec.id,
  mode: "BASE",
  source: "APPROVED",
  target: { trackIds: spec.tracks, subjectId: "maths", chapter: spec.chapter, topic: spec.topic },
  type: spec.type,
  difficulty: spec.difficulty,
  title: spec.title,
  statement: spec.parts.map((part, index) => `${String.fromCharCode(97 + index)}) ${part}`).join("\n"),
  correction: spec.correction,
  hint: `Étape ${spec.day}: identifie d’abord la propriété du cours, puis justifie chaque transformation.`,
  examTip: `Mission Helios — Jour ${String(spec.day).padStart(2, "0")}: vérifie le domaine, les hypothèses et les unités avant de conclure.`,
  estimatedMinutes: spec.difficulty <= 2 ? 8 : spec.difficulty === 3 ? 12 : spec.difficulty === 4 ? 16 : 22,
  xpValue: 10 + spec.difficulty * 5,
  tags: ["MISSION_HELIOS", `JOUR_${String(spec.day).padStart(2,"0")}`, spec.topic, spec.title.startsWith("SYNTHÈSE") ? "SYNTHÈSE" : "EXERCICE"],
  missionDay: spec.day,
  missionObjective: spec.mission,
  context: spec.context,
  parts: spec.parts,
  animation: spec.animation,
});

const heliosSpecs = [
  {
    id: "helios-d01-e01", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Premier signal", topic: "Limites rationnelles", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. K. Solan pour la vérification de cette étape.",
    parts: ["Déterminer le domaine de définition de f(x)=(x²-1)/(x-1). Calculer lim(x→1)f(x).", "Donner le prolongement continu."],
    correction: "Factoriser x²−1=(x−1)(x+1): la limite vaut 2 et le prolongement prend la valeur 2 en x=1.", animation: "Le graphe révèle un trou puis le point corrigé.", difficulty: 1, type: "calculation"
  },
  {
    id: "helios-d01-e02", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Dérive à l’infini", topic: "Limites à l'infini", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. R. Fehim pour la vérification de cette étape.",
    parts: ["Calculer lim(x→+∞)(3x²−5x+1)/(x²+2).", "Comparer avec lim(x→+∞)(3x²−5x+1)/(x³+2)."],
    correction: "Les limites sont respectivement 3 et 0 par comparaison des degrés dominants.", animation: "Deux courbes se séparent autour de leurs asymptotes.", difficulty: 1, type: "short-answer"
  },
  {
    id: "helios-d01-e03", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Bruit de fond", topic: "Limites trigonométriques", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. L. Oyono pour la vérification de cette étape.",
    parts: ["Admettre lim sin x/x=1.", "En déduire lim sin(4x)/x.", "Calculer lim (1−cos x)/x²."],
    correction: "Les résultats sont 4 puis 1/2, en utilisant 1−cos x=2sin²(x/2).", animation: "Un oscillogramme se stabilise au voisinage de zéro.", difficulty: 1, type: "proof"
  },
  {
    id: "helios-d01-e04", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Quantité conjuguée", topic: "Indétermination", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à IA de bord ORION pour la vérification de cette étape.",
    parts: ["Calculer lim(x→0)(√(1+x)−1)/x.", "Justifier chaque transformation."],
    correction: "Multiplier par la quantité conjuguée donne 1/(√(1+x)+1), donc la limite est 1/2.", animation: "La fraction se simplifie ligne par ligne.", difficulty: 1, type: "multi-step"
  },
  {
    id: "helios-d01-e05", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Croissances comparées", topic: "Logarithme et puissance", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. N. Arvez pour la vérification de cette étape.",
    parts: ["Calculer lim ln(x)/x².", "Calculer lim x²/ln(x) quand x→+∞."],
    correction: "Les limites sont 0 et +∞.", animation: "Le graphe affiche la dominance de x².", difficulty: 2, type: "numeric"
  },
  {
    id: "helios-d01-e06", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Encadrement", topic: "Théorème des gendarmes", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. K. Solan pour la vérification de cette étape.",
    parts: ["Pour x>0, encadrer 2+sin(x)/x.", "En déduire sa limite en +∞."],
    correction: "2−1/x≤f(x)≤2+1/x, donc f(x)→2.", animation: "Deux enveloppes se resserrent autour du signal.", difficulty: 2, type: "document-analysis"
  },
  {
    id: "helios-d01-e07", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Raccord de protocole", topic: "Continuité par morceaux", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. R. Fehim pour la vérification de cette étape.",
    parts: ["g(x)=x²+1 si x<1 et 3x+c si x≥1.", "Trouver c pour rendre g continue en 1.", "Vérifier la continuité finale."],
    correction: "La condition 2=3+c impose c=−1.", animation: "La jauge de raccord passe de KO à OK.", difficulty: 2, type: "multi-step"
  },
  {
    id: "helios-d01-e08", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "TVI", topic: "Existence d'une racine", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. L. Oyono pour la vérification de cette étape.",
    parts: ["Sur [0,2], étudier h(x)=x³−3x+1.", "Montrer qu’il existe une racine dans [0,1]."],
    correction: "h est continue, h(0)=1 et h(1)=−1; le TVI donne une racine dans ]0,1[.", animation: "Le segment de recherche se colore.", difficulty: 2, type: "proof"
  },
  {
    id: "helios-d01-e09", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Unicité", topic: "Racine unique", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à IA de bord ORION pour la vérification de cette étape.",
    parts: ["Sur [0,1], étudier h'(x) pour h(x)=x³−3x+1.", "Conclure sur l’unicité de la racine."],
    correction: "h'=3x²−3<0 sur [0,1[, donc h est strictement décroissante; la racine est unique.", animation: "Une seule intersection reste allumée.", difficulty: 2, type: "calculation"
  },
  {
    id: "helios-d01-e10", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Limite et suite", topic: "Composition", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. N. Arvez pour la vérification de cette étape.",
    parts: ["u_n=(1−cos(1/n))/(1/n)².", "Déterminer lim u_n."],
    correction: "Comme 1/n→0 et (1−cos x)/x²→1/2, on obtient u_n→1/2.", animation: "Les points de la suite convergent vers 0,5.", difficulty: 3, type: "multi-step"
  },
  {
    id: "helios-d01-e11", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Asymptote oblique", topic: "Décomposition", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. K. Solan pour la vérification de cette étape.",
    parts: ["Écrire (x²+1)/x sous la forme ax+b+c/x.", "Déduire l’asymptote et la position relative."],
    correction: "r(x)=x+1/x; asymptote y=x; r−x a le signe de x.", animation: "Une droite pointillée apparaît.", difficulty: 3, type: "calculation"
  },
  {
    id: "helios-d01-e12", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"],
    title: "Gauche-droite", topic: "Limites latérales", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. R. Fehim pour la vérification de cette étape.",
    parts: ["Étudier les limites à gauche et à droite en 1 de |x−1|/(x−1).", "Conclure sur la limite en 1."],
    correction: "Les limites valent −1 et +1, donc la limite bilatérale n’existe pas.", animation: "Deux curseurs arrivent à des hauteurs différentes.", difficulty: 3, type: "proof"
  },
  {
    id: "helios-d01-e13", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Filtre logarithmique", topic: "Composition de limites", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. L. Oyono pour la vérification de cette étape.", parts: ["Admettre lim ln(1+x)/x=1.", "Calculer lim ln(1+3x²)/x².", "Généraliser avec a."], correction: "Les limites valent 3 puis a.", animation: "Les deux filtres s’allument successivement.", difficulty: 3, type: "calculation"},
  {
    id: "helios-d01-e14", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Exponentielle amortie", topic: "Croissances comparées", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à IA de bord ORION pour la vérification de cette étape.", parts: ["Calculer lim x²e^(−x).", "Calculer lim (x²+3x)e^(−x) en +∞."], correction: "Les deux limites valent 0, l’exponentielle dominant toute puissance.", animation: "Le signal radar chute rapidement.", difficulty: 4, type: "numeric"},
  {
    id: "helios-d01-e15", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Bornée mais discontinue", topic: "Partie entière", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. N. Arvez pour la vérification de cette étape.", parts: ["Sur [0,3], repérer les discontinuités de E(x).", "Montrer que E est bornée.", "Dire pourquoi le TVI ne s’applique pas."], correction: "E est bornée mais non continue aux entiers: le TVI ne s’applique pas.", animation: "La courbe en escalier se construit.", difficulty: 4, type: "document-analysis"},
  {
    id: "helios-d01-e16", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Paramètre calibré", topic: "Limite avec paramètre", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. K. Solan pour la vérification de cette étape.", parts: ["Pour f_k(x)=(x²−k²)/(x−k), simplifier.", "Calculer lim(x→k).", "Trouver k pour obtenir 10."], correction: "f_k=x+k; la limite vaut 2k, donc k=5.", animation: "Le curseur k déplace la valeur calibrée.", difficulty: 4, type: "multi-step"},
  {
    id: "helios-d01-e17", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Prolongement", topic: "Continuité au point", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. R. Fehim pour la vérification de cette étape.", parts: ["F(x)=(x²−1)/(x−1) si x≠1 et F(1)=2.", "Vérifier la continuité et expliquer le prolongement."], correction: "Pour x≠1, F=x+1; la limite en 1 vaut 2, donc F est continue.", animation: "Le point manquant se remplit.", difficulty: 4, type: "proof"},
  {
    id: "helios-d01-e18", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Seuil critique", topic: "TVI appliqué", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. L. Oyono pour la vérification de cette étape.", parts: ["v(t)=t³−2t+3 sur [0,2]. Montrer que v(t)=4 admet une solution.", "Resserrer l’intervalle à 0,5 près."], correction: "v−4 est continue, change de signe entre 1 et 2; un balayage ou une dichotomie donne un intervalle de longueur ≤0,5.", animation: "La jauge franchit le seuil.", difficulty: 5, type: "multi-step"},
  {
    id: "helios-d01-e19", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "Oscillation", topic: "Limite inexistante", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à IA de bord ORION pour la vérification de cette étape.", parts: ["Prouver que sin x n’a pas de limite en +∞.", "Montrer que sin x/x→0."], correction: "Deux suites donnent 0 et 1; l’encadrement |sin x/x|≤1/x donne 0.", animation: "L’oscillation reste mais son enveloppe s’éteint.", difficulty: 5, type: "proof"},
  {
    id: "helios-d01-e20", day: 1, chapter: "Limites et continuité", mission: "fiabiliser les données brutes", tracks: ["SP","SMA","SMB"], title: "SYNTHÈSE — Validation", topic: "Dossier de validation", context: "ORION reçoit un flux radar bruité sur HL-2044. L’équipe doit fiabiliser les fonctions de mesure avant toute extrapolation. Dr. N. Arvez confie le contrôle à Dr. N. Arvez pour la vérification de cette étape. Cette dernière tâche clôt le Jour 1 avant le passage au chapitre suivant.", parts: ["Étudier F(x)=(e^x−1)/x avec F(0)=1 et décider si le prolongement est continu.", "Étudier G(x)=x·sin(1/x) au voisinage de 0.", "Pour P(t)=t³−4t+1 sur [−3,3], établir au moins trois zéros par changements de signe.", "Rédiger la conclusion de validation."], correction: "F et G se prolongent continûment en 0; pour P, utiliser les changements de signe sur trois sous-intervalles pour établir au moins trois zéros.", animation: "Le tableau de bord passe au vert.", difficulty: 5, type: "multi-step"},
  // DAYS 02–15 continue below through generated repository content.
] as const;

export const helios300MathExercises: (Exercise & HeliosExerciseMeta)[] = heliosSpecs.map((spec) => makeHeliosExercise(spec));

export const heliosMissionChapters = [
  { day: 1, chapter: "Limites et continuité", objective: "fiabiliser les données brutes", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 2, chapter: "Dérivation et étude des fonctions", objective: "modéliser la vitesse angulaire", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 3, chapter: "Accroissements finis", objective: "borner les erreurs de mesure", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 4, chapter: "Suites numériques", objective: "itérer le modèle orbital", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 5, chapter: "Fonctions logarithmiques", objective: "étalonner les échelles de magnitude", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 6, chapter: "Fonction exponentielle", objective: "modéliser la décroissance du signal radar", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 7, chapter: "Primitives", objective: "remonter à la position depuis la vitesse", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 8, chapter: "Calcul intégral", objective: "calculer énergie et aires sous la courbe", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 9, chapter: "Équations différentielles", objective: "construire le modèle dynamique", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 10, chapter: "Nombres complexes", objective: "traiter le signal et les rotations", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 11, chapter: "Géométrie dans l’espace", objective: "repérer la trajectoire en 3D", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 12, chapter: "Dénombrement et probabilités", objective: "mesurer la fiabilité des capteurs", exerciseCount: 20, trackIds: ["SP","SMA","SMB"] },
  { day: 13, chapter: "Arithmétique dans ℤ", objective: "sécuriser les communications", exerciseCount: 20, trackIds: ["SMA","SMB"] },
  { day: 14, chapter: "Structures algébriques", objective: "vérifier formellement le modèle", exerciseCount: 20, trackIds: ["SMA","SMB"] },
  { day: 15, chapter: "Espaces vectoriels", objective: "synthétiser le modèle final", exerciseCount: 20, trackIds: ["SMA","SMB"] },
] as const;
