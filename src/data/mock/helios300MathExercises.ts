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

function variant(chapter: Chapter, index: number): { parts: string[]; correction: string; animation: string; type: Exercise["type"] } {
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
    case 3: return [
      {parts:[`Appliquer le TAF à f(x)=x² sur [${n},${n+1}].`,`Déterminer le point c.`],correction:`Le taux moyen vaut 2n+1; f'(c)=2c donne c=n+1/2.`,animation:"Un curseur isole c.",type:"calculation"},
      {parts:["Supposer |f'|≤0,8 sur un intervalle.",`Borner |f(y)−f(x)| pour |y−x|≤${n}/10.`],correction:"TAF: |f(y)−f(x)|≤M|y−x|.",animation:"La barre d’incertitude se resserre.",type:"numeric"},
      {parts:[`Vérifier les hypothèses de Rolle pour un polynôme symétrique sur [0,${2*n}].`,`Déterminer un point où f'=0.`],correction:"Continuité et égalité aux bornes permettent d’appliquer Rolle.",animation:"Le point de pente nulle clignote.",type:"proof"},
      {parts:["Utiliser le TAF sur sin.",`Majorare |sin u−sin v| lorsque |u−v|≤${n}/10.`],correction:"Comme |cos c|≤1, l’écart est au plus |u−v|.",animation:"Deux mesures restent dans une enveloppe commune.",type:"multi-step"},
      {parts:["Une dérivée est bornée en valeur absolue.",`Calculer l’écart maximal entre deux lectures séparées de ${n}/10.`],correction:"Multiplier la borne sur |f'| par la distance entre les abscisses.",animation:"Le compteur affiche la marge certifiée.",type:"numeric"}
    ][index%5];
    case 4: return [
      {parts:[`u₀=${n}, uₙ₊₁=0,5uₙ+2. Calculer trois termes.`,`Trouver le point fixe.`],correction:"Calculer les termes puis résoudre L=0,5L+2.",animation:"Le compteur converge vers le point fixe.",type:"numeric"},
      {parts:[`Pour u₀=0 et uₙ₊₁=0,4uₙ+${n}, établir une borne.`,`Étudier ensuite la monotonie.`],correction:"Initialiser, montrer la stabilité de la borne puis étudier uₙ₊₁−uₙ.",animation:"Une bande horizontale contient toute la suite.",type:"proof"},
      {parts:[`Étudier uₙ=${n}(0,7)^n.`,`Déterminer monotonie, bornitude et limite.`],correction:"La suite est positive, décroissante et converge vers 0.",animation:"Les points se rapprochent de zéro.",type:"short-answer"},
      {parts:[`Calculer une somme géométrique de raison 1/2.`,`Déterminer sa limite.`],correction:"Utiliser la formule de somme géométrique puis faire tendre n vers l’infini.",animation:"Le cumul se stabilise progressivement.",type:"calculation"},
      {parts:[`eₙ₊₁=0,25eₙ avec e₀=${n}/10.`,`Donner eₙ et chercher un rang où eₙ<10^-3.`],correction:"eₙ=e₀(0,25)^n; tester les puissances ou utiliser les logarithmes.",animation:"L’erreur passe sous la ligne de sécurité.",type:"multi-step"}
    ][index%5];
    case 5: return [
      {parts:[`Simplifier ln(e^${n}), ln(1/e^${n}) et ln(√e).`,`Vérifier les domaines.`],correction:`Les valeurs sont ${n}, −${n} et 1/2.`,animation:"L’échelle logarithmique se recalibre.",type:"short-answer"},
      {parts:[`Résoudre ln(x)=${n}.`,`Résoudre ln(${n}x−1)=0 en précisant le domaine.`],correction:"Passer à l’exponentielle et imposer l’argument strictement positif.",animation:"ORION remonte de la magnitude vers l’intensité.",type:"calculation"},
      {parts:[`Étudier f(x)=ln x−x/${n}.`,`Déterminer l’extremum.`],correction:`f'=1/x−1/n; l’unique extremum est au point x=n.`,animation:"Le pic de magnitude est repéré.",type:"multi-step"},
      {parts:[`Calculer lim(x→0) ln(1+${n}x)/x.`,`Généraliser avec un paramètre a.`],correction:`Réduire à ln(1+u)/u; la limite générale est a.`,animation:"Le filtre logarithmique zoome sur zéro.",type:"proof"},
      {parts:["Étudier g(x)=x−ln x sur ]0,+∞[.","Montrer que le minimum vaut 1."],correction:"g'=1−1/x; décroissance puis croissance, minimum en x=1.",animation:"Le minimum s’allume.",type:"proof"}
    ][index%5];
    case 6: return [
      {parts:[`Calculer e^0, e^${n} et e^(−${n}).`,`Rappeler le signe de e^x.`],correction:"e^x est strictement positif pour tout réel x.",animation:"Le signal de référence s’affiche.",type:"short-answer"},
      {parts:[`Résoudre e^x=${n+2}.`,`Résoudre e^(2x−1)=${n+2}.`],correction:"Prendre le logarithme des deux membres.",animation:"Le signal devient une échelle logarithmique.",type:"calculation"},
      {parts:["N(t)=100e^(−0,2t). Déterminer le temps où N atteint 50.","Exprimer le résultat avec ln."],correction:"Résoudre e^(−0,2t)=1/2, donc t=ln2/0,2.",animation:"La ligne de demi-signal est franchie.",type:"multi-step"},
      {parts:["Étudier f(t)=te^(−t).","Calculer f' et le maximum."],correction:"f'=e^(−t)(1−t); maximum en t=1.",animation:"Le pic apparaît puis décroît.",type:"proof"},
      {parts:[`Résoudre 4e^(2x)=${n+8}.`,`Vérifier la solution.`],correction:"Isoler l’exponentielle puis prendre ln.",animation:"La solution revient dans le capteur.",type:"numeric"}
    ][index%5];
    case 7: return [
      {parts:[`Trouver une primitive de ${n}x²−2x+1.`,`Vérifier par dérivation.`],correction:"Intégrer chaque terme puis ajouter C.",animation:"La position se reconstruit.",type:"calculation"},
      {parts:[`Trouver une primitive de ${n}e^x.`,`Trouver une primitive de ${n}e^(${n}x).`],correction:"Dans le second cas, tenir compte du coefficient de x.",animation:"Le module reconnaît l’exponentielle composée.",type:"short-answer"},
      {parts:[`Trouver F telle que F'(x)=2x−${n} et F(0)=3.`,`Calculer F(${n}).`],correction:"Déterminer la constante avec la condition initiale.",animation:"La condition initiale fixe la trajectoire.",type:"numeric"},
      {parts:["Trouver une primitive de 2x cos(x²).","Justifier le changement de variable."],correction:"Poser u=x²; du=2x dx, donc une primitive est sin(x²)+C.",animation:"La variable interne est isolée.",type:"proof"},
      {parts:[`v(t)=t²+${n}t. Déterminer s(t) sachant s(0)=5.`,`Vérifier s'(t)=v(t).`],correction:"Intégrer v puis utiliser s(0)=5.",animation:"La courbe de position se trace depuis la vitesse.",type:"multi-step"}
    ][index%5];
    case 8: return [
      {parts:[`Calculer ∫₀^${n} ${n}x dx.`,`Interpréter le résultat comme une accumulation.`],correction:"Chercher une primitive puis appliquer la formule fondamentale.",animation:"La zone sous la courbe se colore.",type:"calculation"},
      {parts:["Calculer ∫₁^e 1/x dx et ∫₀^(π/2) cos x dx.","Comparer les deux valeurs."],correction:"Les deux intégrales valent 1.",animation:"Deux zones d’aire se superposent.",type:"numeric"},
      {parts:["Calculer l’aire entre y=x et y=x² sur [0,1].","Justifier la courbe supérieure."],correction:"Sur [0,1], x≥x²; l’aire vaut 1/6.",animation:"La région entre les courbes se colore.",type:"document-analysis"},
      {parts:["Calculer ∫₀¹ 2x e^(x²) dx.","Effectuer le changement de variable."],correction:"Avec u=x², l’intégrale vaut e−1.",animation:"Le module de substitution réduit l’expression.",type:"multi-step"},
      {parts:[`P(t)=t²+${n}. Calculer l’énergie cumulée sur [0,2].`,`Donner la valeur moyenne de P.`],correction:"Intégrer P puis diviser par la longueur de l’intervalle pour la moyenne.",animation:"La jauge d’énergie et sa moyenne apparaissent.",type:"multi-step"}
    ][index%5];
    case 9: return [
      {parts:[`Résoudre y'=${n}y avec y(0)=2.`,`Vérifier la solution.`],correction:"La solution est une exponentielle avec la constante fixée par la condition initiale.",animation:"La trajectoire exponentielle se trace.",type:"calculation"},
      {parts:["Résoudre y'=−0,2y avec y(0)=100.","Déterminer le temps pour atteindre la moitié."],correction:"y=100e^(−0,2t), puis t=ln2/0,2.",animation:"La décroissance traverse la ligne 50%.",type:"multi-step"},
      {parts:[`Résoudre y'+2y=${n}.`,`Déterminer la valeur d’équilibre.`],correction:`La solution générale est n/2+Ce^(−2x); l’équilibre est n/2.`,animation:"La courbe se rapproche de l’équilibre.",type:"short-answer"},
      {parts:[`Pour y'+y=4 avec y(0)=${n}, déterminer C.`,`Écrire la solution complète.`],correction:`y=4+Ce^(−x) et C=n−4.`,animation:"La condition initiale fixe une trajectoire unique.",type:"numeric"},
      {parts:[`Résoudre y'=−${n}/10(y−3).`,`Étudier la limite à l’infini.`],correction:"Poser z=y−3; la solution converge vers 3.",animation:"L’écart à l’équilibre s’éteint.",type:"proof"}
    ][index%5];
    case 10: return [
      {parts:[`Pour z=${n}−${n+1}i, donner Re(z), Im(z), le conjugué et le module.`],correction:"Lire les composantes et calculer le module par la norme euclidienne.",animation:"Le point complexe apparaît dans le plan.",type:"short-answer"},
      {parts:[`Calculer (${n}+i)(2−i).`,`Mettre sous forme algébrique.`],correction:"Développer puis utiliser i²=−1.",animation:"Le signal complexe se multiplie.",type:"calculation"},
      {parts:[`Écrire z=${n}+${n}i en forme trigonométrique.`,`Donner un argument principal.`],correction:"Le module vaut n√2 et un argument principal est π/4.",animation:"Le module devient rayon et l’argument devient angle.",type:"multi-step"},
      {parts:["Décrire l’effet de multiplier z par i.","Relier l’opération à une rotation."],correction:"Multiplier par i réalise une rotation directe de π/2.",animation:"Le vecteur tourne d’un quart de tour.",type:"proof"},
      {parts:[`Résoudre z²=−${n*n}.`,`Vérifier les deux solutions.`],correction:`Les solutions sont z=±${n}i.`,animation:"Deux racines symétriques s’allument.",type:"numeric"}
    ][index%5];
    case 11: return [
      {parts:[`Pour A(${n},2,−1) et B(4,−1,${n}), déterminer AB.`,`Calculer sa norme.`],correction:"Soustraire les coordonnées puis appliquer la formule de la norme.",animation:"Le vecteur de déplacement apparaît.",type:"calculation"},
      {parts:[`Tester l’orthogonalité de u=(1,${n},−1) et v=(2,0,2).`,`Conclure avec le produit scalaire.`],correction:"Le produit scalaire vaut 0, donc les vecteurs sont orthogonaux.",animation:"L’angle droit est marqué.",type:"proof"},
      {parts:[`Donner une représentation paramétrique de la droite passant par A(1,${n},0) de direction (2,−1,1).`,`Calculer le point pour t=1.`],correction:"Substituer t dans les trois coordonnées paramétriques.",animation:"La trajectoire se dessine en 3D.",type:"multi-step"},
      {parts:[`Étudier le plan 2x+y−z=${n}.`,`Tester P(${n},1,${n}).`],correction:"Remplacer les coordonnées dans l’équation du plan et comparer les deux membres.",animation:"Le point est projeté sur le plan.",type:"document-analysis"},
      {parts:[`Calculer le produit scalaire de u=(1,1,${n}) et v=(2,−1,0).`,`Déduire une information sur l’angle.`],correction:"Le produit scalaire est 1, donc les vecteurs ne sont pas orthogonaux.",animation:"La mesure d’angle s’affiche.",type:"short-answer"}
    ][index%5];
    case 12: return [
      {parts:["Un capteur réussit avec probabilité 0,9. Calculer l’échec.","Pour deux essais indépendants, calculer deux réussites."],correction:"Complément pour l’échec puis produit des probabilités indépendantes.",animation:"Les voyants de fiabilité s’allument.",type:"numeric"},
      {parts:[`Calculer C(${n+5},2).`,`Interpréter le résultat comme choix de deux stations.`],correction:"Utiliser C(n,2)=n(n−1)/2.",animation:"Le compteur de combinaisons tourne.",type:"calculation"},
      {parts:[`Pour X~B(${n%7+3},0,8), exprimer P(X=2).`,`Identifier n, p et 1−p.`],correction:"Utiliser la formule de la loi binomiale.",animation:"La barre binomiale isole le nombre de succès.",type:"multi-step"},
      {parts:["P(A)=0,6 et P(B|A)=0,9.","Calculer P(A∩B)."],correction:"P(A∩B)=P(A)P(B|A)=0,54.",animation:"Le flux conditionnel se sépare puis se rejoint.",type:"short-answer"},
      {parts:["Trois capteurs indépendants ont une fiabilité 0,98.","Calculer la probabilité qu’ils fonctionnent tous."],correction:"Multiplier les trois probabilités: 0,98³≈0,9412.",animation:"Le système complet affiche sa fiabilité.",type:"numeric"}
    ][index%5];
    case 13: return [
      {parts:[`Effectuer la division euclidienne de ${200+n} par 13.`,`Vérifier quotient et reste.`],correction:"Écrire N=13q+r avec 0≤r<13 et vérifier l’égalité.",animation:"Quotient et reste se verrouillent.",type:"calculation"},
      {parts:[`Calculer un PGCD avec l’algorithme d’Euclide.`,`Dérouler les divisions successives.`],correction:"Le dernier reste non nul est le PGCD.",animation:"Le reste diminue jusqu’à zéro.",type:"multi-step"},
      {parts:[`Calculer ${n+3}^4 modulo 7.`,`Chercher un cycle de puissances.`],correction:"Réduire la base modulo 7 puis exploiter les cycles.",animation:"Le cycle modulaire se répète.",type:"numeric"},
      {parts:["Résoudre 3x≡2 mod 7.","Vérifier la classe obtenue."],correction:"L’inverse de 3 modulo 7 est 5, donc x≡3 mod 7.",animation:"La solution modulaire est verrouillée.",type:"proof"},
      {parts:[`Un encodage utilise y≡5x+3 mod 26. Calculer y pour x=${n}.`,`Trouver un inverse de 5 modulo 26.`],correction:"Réduire modulo 26; l’inverse de 5 est 21.",animation:"La clé puis sa clé inverse s’affichent.",type:"multi-step"}
    ][index%5];
    case 14: return [
      {parts:[`Pour x⋆y=x+y+${n}, vérifier fermeture et associativité.`,`Déterminer l’élément neutre.`],correction:"La loi est associative et le neutre e vérifie x+e+n=x.",animation:"Les axiomes de la loi se cochent.",type:"proof"},
      {parts:["Tester si x⋆y=x−y est commutative.","Donner un contre-exemple."],correction:"Non: 2−1≠1−2.",animation:"L’axiome de commutativité passe en rouge.",type:"document-analysis"},
      {parts:["Dans (ℤ,+), montrer que 2ℤ est un sous-groupe.","Identifier l’inverse d’un élément 2k."],correction:"Le neutre est dans 2ℤ et l’opposé d’un multiple de 2 est encore un multiple de 2.",animation:"Le sous-groupe se ferme.",type:"proof"},
      {parts:[`Tester si f(x)=${n}x est un morphisme de (ℝ,+).`,`Déterminer son noyau.`],correction:"f(x+y)=f(x)+f(y); pour n≠0, le noyau est {0}.",animation:"Le morphisme relie les structures.",type:"multi-step"},
      {parts:["Étudier (ℝ*,×): fermeture, associativité, neutre et inverse.","Conclure sur la structure."],correction:"Tous les axiomes sont vérifiés: c’est un groupe commutatif.",animation:"Le certificat de groupe passe au vert.",type:"short-answer"}
    ][index%5];
    default: return [
      {parts:["Vérifier que la base canonique forme une base de ℝ².",`Décomposer v=(${n},−${n}).`],correction:"Utiliser les coordonnées dans la base canonique.",animation:"Les coordonnées apparaissent.",type:"short-answer"},
      {parts:[`Tester si (1,1) et (${n},${n}) sont libres.`,`Justifier par une relation linéaire.`],correction:"Le second vecteur est n fois le premier, donc la famille est liée.",animation:"La dépendance linéaire est signalée.",type:"proof"},
      {parts:["Montrer que H={(x,y,z):x+y+z=0} est un sous-espace.","Donner une base et la dimension."],correction:"Écrire z=−x−y; deux vecteurs indépendants suffisent, donc dimension 2.",animation:"Le plan vectoriel se colore.",type:"multi-step"},
      {parts:["Étudier f(x,y)=(x+y,x−y): noyau, image, injectivité.","Relier la conclusion à la matrice."],correction:"La matrice a un déterminant non nul; f est bijective.",animation:"Le canal linéaire devient réversible.",type:"calculation"},
      {parts:[`Pour u=(1,1) et v=(1,−1), trouver a,b tels que au+bv=(${n},${n-1}).`,`Vérifier la reconstruction.`],correction:"Résoudre le système a+b=n et a−b=n−1.",animation:"Le vecteur cible est reconstruit.",type:"multi-step"}
    ][index%5];
  }
}

export const helios300MathExercises: (Exercise & HeliosExerciseMeta)[] = chapters.flatMap(chapter => chapter.topics.map((_, index) => {
  const v=variant(chapter,index);
  const difficulty=Math.min(5,1+Math.floor(index/4)) as 1|2|3|4|5;
  const synthesis=index===19;
  const actor=chars[(index+chapter.day)%chars.length];
  return {
    id:`helios-d${String(chapter.day).padStart(2,"0")}-e${String(index+1).padStart(2,"0")}`,
    mode:"BASE", source:"APPROVED", target:{trackIds:chapter.tracks,subjectId:"maths",chapter:chapter.name,topic:chapter.topics[index]},
    type:v.type,difficulty,title:synthesis?chapter.topics[index]:`${chapter.topics[index]} ${String(index+1).padStart(2,"0")}`,
    statement:v.parts.map((part,i)=>`${String.fromCharCode(97+i)}) ${part}`).join("\n"), correction:v.correction,
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
