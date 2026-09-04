import type { Exercise } from "../../types/content";
import type { HeliosExerciseMeta } from "./helios300MathExercises";

export type HeliosValidatedMeta = HeliosExerciseMeta & {
  partAnswers?: string[][];
  validationMode?: "exact" | "self";
};

export type HeliosDay01Exercise = Exercise & HeliosValidatedMeta;

const base = {
  mode: "BASE" as const,
  source: "APPROVED" as const,
  target: { trackIds: ["SP", "SMA", "SMB"] as const, subjectId: "maths" as const, chapter: "Limites et continuité", topic: "Mission Helios" },
  tags: ["MISSION_HELIOS", "HELIOS_J01"],
};

const make = (
  number: number,
  title: string,
  context: string,
  parts: string[],
  correction: string,
  hint: string,
  animation: string,
  difficulty: 1 | 2 | 3 | 4 | 5,
  objective: string,
  estimatedMinutes: number,
  partAnswers: string[][] = [],
  validationMode: "exact" | "self" = "self",
  synthesis = false,
): HeliosDay01Exercise => ({
  id: `helios-j01-e${String(number).padStart(2, "0")}`,
  ...base,
  type: "multi-step",
  title,
  statement: parts.join("\\n"),
  difficulty,
  correction,
  hint,
  estimatedMinutes,
  xpValue: difficulty * 10,
  missionDay: 1,
  missionObjective: objective,
  context,
  parts,
  animation,
  partAnswers,
  validationMode,
  ...(synthesis ? { tags: [...base.tags, "SYNTHESIS"] } : {}),
});

export const missionHeliosDay01Exercises: HeliosDay01Exercise[] = [
  make(1, "Premier signal", "ORION reçoit le premier signal exploitable de HL-2044. La mesure est modélisée par une fonction rationnelle qui semble présenter une anomalie en x = 2.", [
    "Déterminer le domaine de définition de f(x) = (2x² − 3x − 2)/(x − 2).",
    "Factoriser le numérateur puis simplifier f lorsque cela est possible.",
    "Calculer lim(x→2) f(x) et conclure sur la nature de l’anomalie.",
  ], "Le domaine exclut x = 2. On factorise 2x² − 3x − 2 = (2x + 1)(x − 2), donc f(x) = 2x + 1 pour x ≠ 2 et la limite en 2 vaut 5. Il s’agit d’une discontinuité amovible.", "Cherche d’abord un facteur x − 2 dans le numérateur.", "Le capteur affiche un point manquant qui se remplit après simplification.", 1, "fiabiliser les données brutes", 8, [["R\\\\{2}"]], "exact"),

  make(2, "Dérive à l’infini", "La même acquisition doit être extrapolée très loin de la zone de calibration. ORION demande si le signal se stabilise ou diverge.", [
    "Calculer lim(x→+∞) (3x² − x + 4)/(x² + 2).",
    "Comparer la limite obtenue avec celle de (3x³ + 1)/(x² + 2).",
  ], "À l’infini, on compare les termes dominants. Le premier rapport tend vers 3, tandis que le second se comporte comme 3x et diverge vers +∞.", "Divise numérateur et dénominateur par la plus grande puissance de x commune.", "La courbe passe d’un plateau stable à une croissance sans borne.", 1, "fiabiliser les données brutes", 6, [["3"]], "exact"),

  make(3, "Bruit de fond", "Le radar produit une oscillation de très faible amplitude près de l’origine. L’équipe doit vérifier que ce bruit disparaît après normalisation.", [
    "Calculer lim(x→0) sin(x)/x.",
    "En déduire lim(x→0) sin(3x)/x.",
    "Traiter ensuite lim(x→0) (1 − cos x)/x.",
  ], "La limite fondamentale donne 1. Avec sin(3x)/x = 3·sin(3x)/(3x), on obtient 3. Enfin 1 − cos x est d’ordre x², donc le quotient par x tend vers 0.", "Ramène chaque expression à une limite de référence connue.", "Les oscillations se rapprochent de l’axe puis disparaissent.", 1, "fiabiliser les données brutes", 8, [["1"], ["3"], ["0"]], "exact"),

  make(4, "Forme indéterminée classique", "Une correction instrumentale donne une différence de racines carrées qui devient numériquement instable près d’un point critique.", [
    "Transformer l’expression à l’aide de la quantité conjuguée.",
    "Calculer la limite obtenue après rationalisation.",
    "Expliquer pourquoi la forme initiale était indéterminée.",
  ], "La quantité conjuguée transforme une différence de racines en quotient sans soustraction dangereuse. La limite se calcule ensuite par simplification. La forme initiale 0/0 est indéterminée.", "Multiplie par la quantité conjuguée du numérateur.", "La forme instable devient une expression lisse dans l’interface.", 2, "fiabiliser les données brutes", 8),

  make(5, "Croissances comparées", "ORION compare une erreur quadratique à une correction logarithmique pour déterminer laquelle domine lorsque le signal augmente fortement.", [
    "Étudier lim(x→+∞) ln(x)/x².",
    "Justifier le résultat par une comparaison de croissances.",
  ], "La puissance x² domine le logarithme : le quotient tend vers 0. On peut le justifier par les croissances comparées usuelles ou deux applications de la règle de l’Hôpital selon le niveau de cours retenu.", "Le terme polynomial finit par dominer le logarithme.", "Une barre de croissance montre le logarithme écrasé par x².", 2, "fiabiliser les données brutes", 6, [["0"]], "exact"),

  make(6, "Encadrement", "Le bruit angulaire est borné par une enveloppe trigonométrique. L’équipe doit certifier que le signal normalisé converge.", [
    "Utiliser un encadrement classique de sin x/x près de 0.",
    "Faire apparaître deux fonctions ayant la même limite.",
    "Conclure par le théorème des gendarmes.",
  ], "On construit un encadrement dont les deux bornes tendent vers la même valeur. Le théorème des gendarmes impose alors la même limite au terme central.", "Cherche des bornes positives qui convergent vers la même valeur.", "Deux courbes enveloppes se resserrent autour du signal central.", 2, "fiabiliser les données brutes", 8),

  make(7, "Continuité par morceaux", "Une calibration fusionne deux lois de mesure au point x = 1. Le raccord ne doit produire aucun saut dans les données.", [
    "Déterminer les limites à gauche et à droite en x = 1.",
    "Choisir le paramètre rendant la fonction continue en 1.",
    "Vérifier la continuité obtenue.",
  ], "Une fonction par morceaux est continue au point de raccord lorsque les deux limites sont égales à la valeur de la fonction. On identifie donc r par égalité des deux expressions au point 1.", "Écris séparément limite à gauche, limite à droite et valeur au point.", "Le raccord passe visuellement de discontinu à parfaitement continu.", 2, "fiabiliser les données brutes", 9),

  make(8, "TVI", "ORION doit garantir qu’un seuil d’observation est effectivement atteint avant de poursuivre l’extrapolation.", [
    "Étudier h(x) = x³ − 3x + 1 sur un intervalle convenable.",
    "Montrer que h s’annule au moins une fois entre deux bornes données.",
    "Indiquer précisément le rôle du théorème des valeurs intermédiaires.",
  ], "Le polynôme est continu. Si ses valeurs aux deux bornes sont de signes opposés, le TVI garantit l’existence d’au moins une solution dans l’intervalle.", "La continuité fournit l’existence, pas l’unicité.", "Le seuil zéro est traversé par la courbe et ORION marque le passage.", 3, "fiabiliser les données brutes", 9),

  make(9, "Unicité de solution", "Après l’existence d’un seuil critique, le laboratoire doit vérifier qu’il n’y a qu’un seul instant de déclenchement.", [
    "Montrer que la fonction étudiée est strictement monotone sur l’intervalle retenu.",
    "En déduire l’unicité de la solution de l’équation h(x) = 0 sur cet intervalle.",
  ], "Une fonction strictement monotone ne peut prendre une même valeur qu’une seule fois. L’existence acquise par le TVI devient donc une existence unique.", "Combine TVI et stricte monotonie.", "Une seule intersection avec l’axe est conservée tandis que les autres sont grisés.", 3, "fiabiliser les données brutes", 9),

  make(10, "Limite et suite couplées", "ORION remplace une variable continue par une suite de valeurs issues des cycles successifs de calibration.", [
    "Montrer que la suite définie par u_n = (2n + 1)/(n + 3) est bien définie pour n ≥ 0.",
    "Calculer lim(n→∞) u_n.",
    "Relier cette limite à lim(x→∞) (2x + 1)/(x + 3).",
  ], "Le quotient de deux polynômes de même degré tend vers le rapport des coefficients dominants : 2. La suite et la fonction partagent ici la même limite.", "Divise numérateur et dénominateur par n ou x.", "Les points de la suite se déposent progressivement sur l’asymptote horizontale.", 3, "fiabiliser les données brutes", 8, [["u_n est définie pour tout n≥0"], ["2"], ["2"]], "exact"),

  make(11, "Asymptote oblique", "La trajectoire calculée ne tend pas vers une constante. Il faut déterminer la droite qui sert de repère à l’extrapolation.", [
    "Effectuer la division euclidienne du quotient rationnel choisi.",
    "Identifier la droite y = ax + b obtenue comme comportement à l’infini.",
    "Justifier qu’elle est une asymptote oblique.",
  ], "Une division donne une partie affine plus un reste dont le quotient tend vers 0. La droite affine est alors l’asymptote oblique.", "Après division, étudie séparément le reste sur le dénominateur.", "La courbe et sa droite-guide deviennent presque confondues à droite de l’écran.", 3, "fiabiliser les données brutes", 9),

  make(12, "Limites latérales", "Un point de calibration divise deux régimes de fonctionnement. ORION doit distinguer les comportements à gauche et à droite du point x = 1.", [
    "Étudier lim(x→1−) |x − 1|/(x − 1).",
    "Étudier lim(x→1+) |x − 1|/(x − 1).",
    "Conclure sur l’existence de la limite en 1.",
  ], "À gauche de 1, |x−1| = −(x−1), donc le quotient vaut −1. À droite, il vaut +1. Les limites latérales sont différentes : la limite en 1 n’existe pas.", "Traite séparément le signe de x − 1 de chaque côté.", "La courbe apparaît avec deux niveaux distincts de part et d’autre du point critique.", 4, "fiabiliser les données brutes", 8, [["-1"], ["1"], ["n'existe pas"]], "exact"),

  make(13, "Composition de limites", "Une conversion logarithmique apparaît dans le prétraitement du signal. L’équipe doit vérifier sa limite locale avant de l’intégrer au modèle.", [
    "Calculer lim(x→0) ln(1 + x)/x.",
    "Utiliser ensuite une composition simple pour traiter ln(1 + 2x)/(2x).",
  ], "La limite fondamentale de ln(1+x)/x en 0 vaut 1. Le changement de variable t = 2x donne la même limite pour ln(1+2x)/(2x).", "Pose t = 2x.", "La transformation logarithmique se replie sur une valeur stable de référence.", 4, "fiabiliser les données brutes", 7, [["1"], ["1"]], "exact"),

  make(14, "Croissance exponentielle", "Une correction exponentielle est comparée au terme polynomial du modèle pour vérifier quelle composante domine à long terme.", [
    "Comparer e^x et x^5 lorsque x → +∞.",
    "En déduire la limite de x^5/e^x.",
    "Interpréter ce résultat dans le contexte du radar.",
  ], "L’exponentielle domine toute puissance de x. Ainsi x^5/e^x tend vers 0 : le terme polynomial devient négligeable devant l’exponentielle.", "Souviens-toi de la hiérarchie des croissances.", "Deux courbes s’éloignent puis la croissance exponentielle prend nettement le dessus.", 4, "fiabiliser les données brutes", 8, [["e^x domine x^5"], ["0"]], "exact"),

  make(15, "Fonction partie entière", "Le système discrétise une mesure continue en paliers avant archivage. ORION vérifie le comportement du signal autour d’un entier.", [
    "Étudier les limites à gauche et à droite de la fonction partie entière en x = 2.",
    "Déterminer si la fonction est continue en 2.",
    "Expliquer l’origine du saut observé.",
  ], "À gauche de 2, la partie entière vaut 1, alors qu’à droite elle vaut 2. Les limites latérales diffèrent de la valeur au point : la fonction n’est pas continue en 2.", "Rappelle-toi que la partie entière avance par paliers.", "Un escalier apparaît avec un saut exactement au seuil entier.", 4, "fiabiliser les données brutes", 8, [["1"], ["2"], ["non"]], "exact"),

  make(16, "Paramètre de calibration", "Le laboratoire introduit un paramètre k pour déplacer un point de singularité. La valeur correcte doit supprimer l’anomalie détectée par ORION.", [
    "Pour f_k(x) = (x² + kx − 2)/(x − 1), déterminer k pour que la limite en x = 1 soit finie.",
    "Factoriser alors le numérateur.",
    "Calculer la valeur de la limite avec ce choix de k.",
  ], "Pour rendre la limite finie, le numérateur doit s’annuler en 1 : 1 + k − 2 = 0, donc k = 1. Le numérateur devient (x−1)(x+2) et la limite vaut 3.", "Impose l’annulation du numérateur au point interdit.", "Un curseur de calibration déplace k jusqu’à faire disparaître la singularité.", 5, "fiabiliser les données brutes", 10, [["1"], ["(x−1)(x+2)"], ["3"]], "exact"),

  make(17, "Prolongement continu", "Le modèle corrigé doit devenir une vraie fonction continue sur son domaine étendu afin que les étapes suivantes puissent exploiter la continuité.", [
    "À partir d’une fonction rationnelle simplifiée, définir sa valeur au point troué pour obtenir une fonction continue.",
    "Justifier la continuité au point ajouté.",
    "Distinguer cette situation d’une discontinuité infinie.",
  ], "On donne au point manquant la valeur de la limite de la fonction simplifiée. La continuité est alors obtenue par raccord. Une discontinuité infinie, elle, ne peut pas être réparée par une simple valeur ponctuelle.", "La valeur ajoutée doit être exactement la limite.", "Le point vide devient un point plein au même niveau que la courbe.", 5, "fiabiliser les données brutes", 10),

  make(18, "Seuil critique", "La vitesse angulaire calculée doit franchir un seuil fixé par l’équipe scientifique. Il faut prouver qu’un instant de franchissement existe dans la fenêtre d’observation.", [
    "Montrer que la fonction de vitesse est continue sur la fenêtre considérée.",
    "Vérifier que le seuil est encadré par deux valeurs prises par la fonction.",
    "Conclure à l’existence d’au moins un instant critique.",
  ], "Par continuité et changement de signe de f(x)−seuil entre les deux bornes, le TVI garantit l’existence d’un instant où la vitesse atteint exactement le seuil.", "Travaille avec la fonction f(x)−seuil.", "Une ligne de seuil traverse la courbe et ORION marque son premier passage.", 5, "fiabiliser les données brutes", 9),

  make(19, "Limite inexistante", "Une composante oscillante du signal ne converge pas malgré l’augmentation de la puissance de calcul. Le modèle doit le détecter plutôt que forcer une valeur artificielle.", [
    "Étudier le comportement d’une expression oscillante bornée mais sans limite unique.",
    "Montrer qu’elle possède au moins deux valeurs d’adhérence différentes.",
    "Conclure que la limite n’existe pas.",
  ], "Une fonction peut rester bornée tout en oscillant indéfiniment. Si deux suites de points conduisent à deux limites différentes, aucune limite unique ne peut exister.", "Cherche deux suites de valeurs donnant des comportements différents.", "La courbe oscille entre deux niveaux pendant que le temps avance.", 5, "fiabiliser les données brutes", 10),

  make(20, "SYNTHÈSE — Rapport de validation", "Le premier cycle Helios est terminé. ORION demande un rapport court qui certifie la fiabilité mathématique des données avant de passer au Jour 02.", [
    "Rappeler les conditions permettant d’utiliser une limite pour prolonger une fonction par continuité.",
    "Expliquer comment distinguer une limite existante, une limite infinie et une limite inexistante.",
    "Donner une méthode générale combinant factorisation, comparaison, encadrement et TVI.",
    "Rédiger la conclusion opérationnelle du Jour 01 en 5 à 8 lignes.",
  ], "Le rapport doit relier les techniques du chapitre : simplification algébrique, limites de référence, comparaisons de croissance, encadrement, continuité, TVI et étude des limites latérales. La conclusion doit distinguer existence, valeur et interprétation de la limite.", "Traite le rapport comme une mini-fiche de méthode, pas comme une simple liste de résultats.", "ORION passe tous les contrôles du Jour 01 en vert et verrouille le rapport.", 5, "fiabiliser les données brutes", 15, [], "self", true),
];

if (import.meta.env.DEV && missionHeliosDay01Exercises.length !== 20) {
  console.error("Mission Helios J01 must contain exactly 20 exercises.");
}
