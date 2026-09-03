import type { Exercise } from "../../types/content";
import type { TrackId } from "../../types/academic";

export interface HeliosExerciseMeta {
  missionDay: number;
  missionObjective: string;
  context: string;
  parts: string[];
  animation: string;
}

type Chapter = { day: number; name: string; objective: string; tracks: TrackId[]; topics: string[]; context: string };

const allTracks: TrackId[] = ["SP", "SMA", "SMB"];
const smTracks: TrackId[] = ["SMA", "SMB"];
const chars = ["Dr. N. Arvez", "Dr. K. Solan", "Dr. R. Fehim", "Dr. L. Oyono", "ORION"];

const chapters: Chapter[] = [
  { day:1, name:"Limites et continuité", objective:"fiabiliser les données brutes", tracks:allTracks, context:"ORION reçoit un flux radar bruité sur HL-2044. L’équipe contrôle les fonctions de mesure avant toute extrapolation.", topics:["Premier signal","Dérive à l’infini","Bruit de fond","Quantité conjuguée","Croissances comparées","Encadrement","Continuité par morceaux","TVI","Unicité de solution","Limite et suite","Asymptote oblique","Limites latérales","Composition","Croissance exponentielle","Fonction partie entière","Paramètre de calibration","Prolongement continu","Seuil critique","Limite inexistante","SYNTHÈSE — Rapport de validation"] },
  { day:2, name:"Dérivation et étude des fonctions", objective:"modéliser la vitesse angulaire", tracks:allTracks, context:"La télémétrie donne une vitesse angulaire variable autour de HL-2044. Les dérivées permettent de transformer ces mesures en variations exploitables.", topics:["Nombre dérivé","Tangente","Dérivées usuelles","Produit","Quotient","Signe de la dérivée","Variations","Extremum","Paramètre","Convexité","Concavité","Bijection","Asymptotes","Étude logarithmique","Étude exponentielle","Optimisation","Tangente sous contrainte","Signe d’un produit","Minimum global","SYNTHÈSE — Vitesse angulaire"] },
  { day:3, name:"Accroissements finis", objective:"borner les erreurs de mesure", tracks:allTracks, context:"Les capteurs divergent légèrement entre deux acquisitions. Le laboratoire utilise les théorèmes de Rolle et des accroissements finis pour certifier les écarts.", topics:["Taux de variation","Théorème des accroissements finis","Rolle","Borne d’erreur","Lipschitz","Logarithme","Quadratique","Erreur relative","Borne de vitesse","Rolle polynomial","Pente sinus","Pente cosinus","Monotonie quantitative","Écart entre capteurs","Erreur maximale","TAF paramétré","Stabilité","Composition des erreurs","Contrôle final","SYNTHÈSE — Incertitude"] },
  { day:4, name:"Suites numériques", objective:"itérer le modèle orbital", tracks:allTracks, context:"ORION itère une correction discrète de la trajectoire à chaque cycle de calcul. La convergence du modèle orbital est surveillée.", topics:["Premiers termes","Point fixe","Monotonie","Borne","Suite géométrique","Suite arithmétique","Somme géométrique","Récurrence","Contraction","Suite définie par une fonction","Comparaison","Somme télescopique","Récurrence forte","Suite alternée","Inégalité de suites","Erreur orbitale","Seuil","Limite rationnelle","Stabilité","SYNTHÈSE — Convergence"] },
  { day:5, name:"Fonctions logarithmiques", objective:"étalonner les échelles de magnitude", tracks:allTracks, context:"Les intensités sont converties en échelles logarithmiques pour comparer les campagnes d’observation.", topics:["Valeurs usuelles","Produits","Quotients","Puissances","Domaine","Équation logarithmique","Inéquation logarithmique","Dérivée de ln","Limite en zéro","Croissance comparée","Composition","Unicité","Primitive","Paramètre","Valeur absolue","Convexité","Inégalité classique","Équivalent","Magnitude","SYNTHÈSE — Logarithme"] },
  { day:6, name:"Fonction exponentielle", objective:"modéliser la décroissance du signal radar", tracks:allTracks, context:"Le signal radar décroît après chaque passage devant l’antenne. L’équipe ajuste un modèle exponentiel avant d’extrapoler.", topics:["Valeurs usuelles","Propriétés","Équation","Inéquation","Décroissance","Dérivée","Croissances comparées","Demi-signal","Log inverse","Convexité","Somme de décroissances","Composition","Calibration","Unicité","Inégalité","Taux relatif","Seuil","Produit","Comparaison","SYNTHÈSE — Radar"] },
  { day:7, name:"Primitives", objective:"remonter à la position depuis la vitesse", tracks:allTracks, context:"La vitesse instantanée est connue, mais pas la position cumulée. Le laboratoire reconstruit la trajectoire par primitives.", topics:["Primitive polynomiale","Exponentielle","Inverse","Condition initiale","Racine","Linéarité","Substitution","Exponentielle composée","Logarithme","Position","Vitesse","Famille de primitives","Vérification","Trigonométrie","Paramètre","Primitive et aire","Développement","Racine composée","Contrôle","SYNTHÈSE — Position"] },
  { day:8, name:"Calcul intégral", objective:"calculer énergie et aires sous la courbe", tracks:allTracks, context:"Les intégrales agrègent énergie, déplacement et autres quantités mesurées sur une fenêtre de temps.", topics:["Intégrale simple","Théorème fondamental","Aire signée","Substitution","Aire entre courbes","Valeur moyenne","Logarithme","Trigonométrie","Énergie","Positivité","Paramètre","Chasles","Encadrement","Intégrale impropre","Parité","Compositions","Aire cumulée","Deux signaux","Déplacement","SYNTHÈSE — Énergie"] },
  { day:9, name:"Équations différentielles", objective:"construire le modèle dynamique", tracks:allTracks, context:"Le modèle dynamique relie une grandeur observée à son taux de variation. ORION demande une équation différentielle vérifiable.", topics:["y'=ay","Décroissance","y'+ay=b","Condition initiale","Équation forcée","Vérification","Équilibre","Temps caractéristique","Unicité","Calibration","Croissance","Équation non homogène","Oscillation","Stabilité","Saturation","Seuil","Paramètre source","Comparaison","Solution complète","SYNTHÈSE — Dynamique"] },
  { day:10, name:"Nombres complexes", objective:"traiter le signal et les rotations", tracks:allTracks, context:"Les phases du signal sont codées par des nombres complexes pour traiter amplitude, rotation et décalage de phase.", topics:["Parties réelle et imaginaire","Addition","Produit","Inverse","Module","Équation","Forme trigonométrique","Forme exponentielle","Module d’un produit","Argument","Rotation","Milieu","Cercle","Racines","De Moivre","Conjugué","Module paramétré","Amplitude-phase","Quadratique","SYNTHÈSE — Signal"] },
  { day:11, name:"Géométrie dans l’espace", objective:"repérer la trajectoire en 3D", tracks:allTracks, context:"La position de HL-2044 doit être reconstruite dans un repère tridimensionnel à partir de plusieurs stations.", topics:["Vecteur","Distance","Milieu","Produit scalaire","Norme","Plan","Droite","Appartenance","Parallélisme","Intersection","Distance point-plan","Produit vectoriel","Angle","Sphère","Plan médiateur","Projection","Déplacement","Système","Droite et plan","SYNTHÈSE — 3D"] },
  { day:12, name:"Dénombrement et probabilités", objective:"mesurer la fiabilité des capteurs", tracks:allTracks, context:"Chaque capteur produit un résultat incertain. Dr. Solan transforme les taux de réussite en probabilités de décision.", topics:["Complément","Indépendance","Au moins un succès","Conditionnelle","Bayes","Combinaisons","Arrangements","Permutations","Binomiale","Binomiale exacte","Espérance","Variance","Indépendance test","Probabilité totale","Sous-ensembles","Sans remise","Gain moyen","Seuil binomial","Système en série","SYNTHÈSE — Fiabilité"] },
  { day:13, name:"Arithmétique dans ℤ", objective:"sécuriser les communications", tracks:smTracks, context:"La liaison de données utilise des opérations modulo pour contrôler l’intégrité et l’inversion des codes transmis.", topics:["Division euclidienne","Divisibilité","PGCD","Bézout","Congruence","Puissance modulo","Inverse modulo","Congruence linéaire","PGCD paramétré","Parité","Reste de puissance","Divisibilité par 9","Inverse d’un entier","Chiffrement","Déchiffrement","Théorème de Gauss","Irrationalité","Équation diophantienne","Système de congruences","SYNTHÈSE — Cryptographie"] },
  { day:14, name:"Structures algébriques", objective:"vérifier formellement le modèle", tracks:smTracks, context:"Avant livraison, Dr. Fehim vérifie que les opérations utilisées par le modèle satisfont les propriétés algébriques attendues.", topics:["Loi interne","Commutativité","Élément neutre","Inverse","Sous-groupe","Morphisme additif","Noyau","Image","Groupe multiplicatif","Associativité","Matrices","Sous-groupe rationnel","Relation d’équivalence","Classes modulo","Composition de morphismes","Injectivité","Surjectivité","Groupe ℝ*","Contre-exemple","SYNTHÈSE — Structure"] },
  { day:15, name:"Espaces vectoriels", objective:"synthétiser le modèle final", tracks:smTracks, context:"La synthèse finale rassemble les modèles linéaires et les sous-espaces utiles à la décision de trajectoire.", topics:["Base canonique","Famille libre","Famille génératrice","Coordonnées","Sous-espace","Dimension","Intersection","Somme","Application linéaire","Matrice","Noyau","Image","Changement de base","Décomposition","Indépendance paramétrée","Plan vectoriel","Théorème du rang","Isomorphisme","Reconstruction","SYNTHÈSE — Décision finale"] },
];

function variant(chapter: Chapter, index: number): any {
  const n=index+1;
  switch(chapter.day) {
    case 1: return [
      {parts:[`Déterminer le domaine de f(x)=(x²−${n})/(x−${n}).`,`Calculer la limite en x=${n} et proposer un prolongement.`],correction:"Repérer le point interdit puis factoriser la forme rationnelle lorsqu’elle le permet.",animation:"Un trou apparaît puis le point de prolongement se remplit.",type:"calculation"},
      {parts:[`Calculer une limite à l’infini dominée par les termes de degré maximal.`,`Comparer avec un dénominateur de degré supérieur.`],correction:"Comparer les degrés et les coefficients dominants.",animation:"Deux courbes se stabilisent à des vitesses différentes.",type:"short-answer"},
      {parts:["Réutiliser une limite trigonométrique de référence.",`En déduire une limite contenant sin(${n}x).`,`Traiter ensuite une expression en 1−cos x.`],correction:"Effectuer un changement de variable puis utiliser l’identité trigonométrique adaptée.",animation:"Un zoom se resserre autour du point critique.",type:"proof"},
      {parts:["Partir d’un encadrement de sin x.",`Encadrer une expression oscillante contenant 1/x^${n%2+1}.`,`Conclure par le théorème des gendarmes.`],correction:"Encadrer par deux fonctions ayant la même limite.",animation:"Deux enveloppes se resserrent autour du signal.",type:"multi-step"},
      {parts:["Étudier une fonction définie par morceaux en x=1.",`Déterminer le paramètre qui rend le raccord continu.`,`Justifier la continuité obtenue.`],correction:"Égaler limite à gauche, limite à droite et valeur au point.",animation:"La jauge de raccord passe de KO à OK.",type:"multi-step"}
    ][index%5];
    case 2: return [
      {parts:[`Calculer f' pour f(x)=x²−${n}x+${n}.`,`Évaluer f'(${n}) et interpréter le résultat.`],correction:`f'(x)=2x−${n}; la valeur en x=${n} donne une pente positive.`,animation:"Le vecteur tangent se pose sur le point mesuré.",type:"calculation"},
      {parts:[`Déterminer la tangente à f(x)=x²+${n} en x=${n}.`,`Vérifier le point de contact.`],correction:"Utiliser y=f(a)+f'(a)(x−a).",animation:"La tangente s’aligne sur la courbe.",type:"multi-step"},
      {parts:[`Étudier le signe de f'(x)=(${n}−x)(x+1).`,`En déduire le tableau de variations.`],correction:"Les changements de signe de la dérivée déterminent les variations.",animation:"Le tableau de variation se remplit.",type:"proof"},
      {parts:[`Étudier f(x)=x+${n}/x sur ]0,+∞[.`,`Déterminer son minimum.`],correction:`f'=1−${n}/x²; l’annulation donne x=√${n}.`,animation:"Le minimum est marqué sur la courbe.",type:"numeric"},
      {parts:[`Étudier h(x)=e^(−x)(x+${n}).`,`Déterminer le signe de h' et l’extremum.`],correction:"Utiliser la dérivée d’un produit et le fait que e^(−x)>0.",animation:"Le maximum du signal est repéré.",type:"multi-step"}
    ][index%5];
    default: return [
      {parts:["Question de synthèse du chapitre.",`Appliquer la méthode du jour ${chapter.day} à la variable ${n}.`],correction:"Identifier la propriété de cours pertinente, puis rédiger les étapes essentielles.",animation:"Le modèle final valide la solution.",type:"multi-step"}
    ][0];
  }
}

export const helios300MathExercises: (Exercise & HeliosExerciseMeta)[] = chapters.flatMap(chapter => chapter.topics.map((_, index) => {
  const v=variant(chapter,index);
  const difficulty=Math.min(5,1+Math.floor(index/4)) as 1|2|3|4|5;
  const synthesis=index===19;
  const actor=chars[(index+chapter.day)%chars.length];
  return {
    id:`helios-d${String(chapter.day).padStart(2,"0")}-e${String(index+1).padStart(2,"0")}`,
    mode:"BASE" as const, source:"APPROVED" as const, target:{trackIds:chapter.tracks,subjectId:"maths" as const,chapter:chapter.name,topic:chapter.topics[index]},
    type:v.type as Exercise["type"],difficulty,title:synthesis?chapter.topics[index]:`${chapter.topics[index]} ${String(index+1).padStart(2,"0")}`,
    statement:v.parts.map((part:number,i:number)=>`${String.fromCharCode(97+i)}) ${part}`).join("\n"), correction:v.correction,
    hint:`Méthode Helios: ${chapter.objective}. Identifie la propriété du cours avant le calcul.`,
    examTip:`Jour ${String(chapter.day).padStart(2,"0")}: vérifie les hypothèses, signes et unités avant de conclure.`,
    estimatedMinutes:difficulty<=2?8:difficulty===3?12:difficulty===4?16:22,xpValue:10+difficulty*5,
    tags:["MISSION_HELIOS",`JOUR_${String(chapter.day).padStart(2,"0")}`,chapter.topics[index],synthesis?"SYNTHÈSE":"EXERCICE"],
    missionDay:chapter.day, missionObjective:chapter.objective,
    context:`${chapter.context} ${actor} assure la vérification de cette étape.${synthesis?` Cette tâche clôt le Jour ${chapter.day}.`:""}`,
    parts:v.parts, animation:v.animation,
  };
}));

export const heliosMissionChapters = chapters.map(c=>({day:c.day,chapter:c.name,objective:c.objective,exerciseCount:c.topics.length,trackIds:c.tracks}));

if(import.meta.env.DEV && helios300MathExercises.length!==300) console.error(`[Helios] Expected 300 exercises, got ${helios300MathExercises.length}`);
