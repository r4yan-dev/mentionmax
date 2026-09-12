import type { ContentDifficulty, Exercise, ExerciseVisual } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;

type Draft = Pick<Exercise, "title" | "statement" | "expectedAnswer" | "correction" | "hint" | "examTip" | "type">;

type P = { a:number; b:number; c:number; d:number; m:number; n:number; r:number; v:number };

const chapterTopics = [
  ["Limite à l’infini","Forme indéterminée","Asymptote oblique","Limite trigonométrique","Suite rationnelle"],
  ["Dérivée d’un polynôme","Tangente","Optimisation","Convexité","Nombre de solutions"],
  ["Taux de variation","TAF","Borne d’erreur","Rolle","Erreur relative"],
  ["Suite arithmétique","Suite géométrique","Point fixe","Sommes","Approximation"],
  ["Domaine","Équations","Logarithmes","Dérivée","Inéquations"],
  ["Équations exponentielles","Comparaisons","Dérivée","Demi-vie","Seuils"],
  ["Primitives polynomiales","Primitives exponentielles","Primitive de 1/x","Mouvement","Vérification"],
  ["Intégrales simples","Aires","Valeur moyenne","Chasles","Positivité"],
  ["Équations homogènes","Décroissance","Équilibre","Condition initiale","Temps caractéristique"],
  ["Module et argument","Produit","Conjugué","Argument","Racines"],
  ["Distances","Milieux","Plans","Orthogonalité","Sphères"],
  ["Binomiale","Événement complémentaire","Combinaisons","Conditionnelle","Espérance"],
  ["Division euclidienne","PGCD","Congruences","Inverses modulo","Bézout"],
  ["Lois internes","Commutativité","Inverses","Morphismes","Compositions"],
  ["Familles libres","Coordonnées","Noyaux","Images","Rang"],
];

const chapterNames = [
  "Limites et continuité","Dérivation et étude des fonctions","Accroissements finis","Suites numériques","Fonctions logarithmiques",
  "Fonction exponentielle","Primitives","Calcul intégral","Équations différentielles","Nombres complexes",
  "Géométrie dans l’espace","Dénombrement et probabilités","Arithmétique dans ℤ","Structures algébriques","Espaces vectoriels",
];

function p(local:number, chapter:number):P {
  const r=Math.floor(local/5), v=local%5;
  return {
    a:2+((chapter*3+r)%5), b:1+((chapter+local)%6), c:1+((chapter*2+local)%5),
    d:2+((chapter+r)%4), m:2+((local+chapter)%7), n:3+((local*2+chapter)%8), r, v,
  };
}

function base(draft:Draft, chapter:number, local:number):Exercise {
  const difficulty=(1+Math.min(4,Math.floor(local/4))) as ContentDifficulty;
  return {
    id:`new-${chapter+1}-${local+1}`,
    mode:"BASE", source:"APPROVED", target:{trackIds:tracks,subjectId:"maths",chapter:chapterNames[chapter],topic:chapterTopics[chapter][local%5]},
    ...draft, difficulty, acceptedAnswers:draft.expectedAnswer?[draft.expectedAnswer]:[], estimatedMinutes:4+difficulty, xpValue:8+difficulty*3,
    tags:[chapterNames[chapter].toLowerCase(),chapterTopics[chapter][local%5].toLowerCase(),"bac","nouvelle-banque"],
    visual:visualFor(chapter,local),
  };
}

function draft(chapter:number, local:number):Draft {
  const {a,b,c,d,m,n,r,v}=p(local,chapter);
  const commonHint=[
    "Commence par identifier la propriété à utiliser avant de remplacer les valeurs.",
    "Écris la formule littérale avant toute application numérique.",
    "Rédige chaque étape utile; une réponse sans justification perd vite sa valeur au bac.",
  ][local%3];
  switch(chapter){
    case 0:
      if(v===0) return {type:"calculation",title:`Quotient à l’infini ${r+1}`,statement:`Calculer lim(x→+∞) f(x) avec f(x)=(${a}x²+${b}x+${c})/(x²−${d}).`,expectedAnswer:String(a),correction:`Les termes dominants sont ${a}x² et x². Le quotient tend donc vers ${a}.`,hint:commonHint,examTip:"Commencer par comparer les degrés du numérateur et du dénominateur."};
      if(v===1) return {type:"numeric",title:`Forme 0/0 près de ${d}`,statement:`Calculer lim(x→${d}) (x²−${d*d})/(x−${d}).`,expectedAnswer:String(2*d),correction:`Factoriser x²−${d*d}=(x−${d})(x+${d}), puis la limite vaut ${2*d}.`,hint:commonHint,examTip:"Une factorisation peut supprimer immédiatement une forme indéterminée."};
      if(v===2){const q=a*d+b,rem=c+q*d;return {type:"multi-step",title:`Division et asymptote ${r+1}`,statement:`Effectuer la division de (${a}x²+${b}x+${c}) par x−${d}, puis donner l’asymptote à l’infini.`,expectedAnswer:`f(x)=${a}x+${q}+${rem}/(x−${d}) ; asymptote y=${a}x+${q}`,correction:`La division donne ${a}x+${q}+${rem}/(x−${d}). Le dernier terme tend vers 0.`,hint:commonHint,examTip:"La division polynomiale rend l’étude à l’infini immédiate."};}
      if(v===3) return {type:"short-answer",title:`Limite trigonométrique ${m}`,statement:`Calculer lim(x→0) sin(${m}x)/x.`,expectedAnswer:String(m),correction:`Poser t=${m}x et utiliser sin(t)/t→1. La limite vaut ${m}.`,hint:commonHint,examTip:"Ramener la limite à une limite remarquable."};
      return {type:"calculation",title:`Suite rationnelle ${r+1}`,statement:`Pour u_n=(${a}n+${b})/(n+${d}), déterminer lim(n→∞)u_n.`,expectedAnswer:String(a),correction:"Diviser numérateur et dénominateur par n puis passer à la limite.",hint:commonHint,examTip:"À l’infini, les termes de degré dominant gouvernent le quotient."};
    case 1:
      if(v===0)return {type:"calculation",title:`Dérivée d’un polynôme ${r+1}`,statement:`Pour f(x)=x³−${a}x²+${b}x−${c}, calculer f'(x).`,expectedAnswer:`3x²−${2*a}x+${b}`,correction:"Dériver terme à terme.",hint:commonHint,examTip:"Connaître les dérivées usuelles accélère toute l’étude."};
      if(v===1){const s=2*d+a, k=b-d*d;return {type:"multi-step",title:`Tangente en ${d}`,statement:`Pour f(x)=x²+${a}x+${b}, déterminer la tangente au point d’abscisse ${d}.`,expectedAnswer:`y=${s}x+${k}`,correction:`La pente est f'(${d})=${s}. Puis utiliser y=f(${d})+${s}(x−${d}).`,hint:commonHint,examTip:"Une tangente se construit avec un point et une pente."};}
      if(v===2){const h=a+4,x=h/2,area=h*h/4;return {type:"multi-step",title:`Optimisation d’un rectangle ${r+1}`,statement:`Un rectangle a pour demi-périmètre ${h}. Exprimer son aire en fonction de x et trouver l’aire maximale.`,expectedAnswer:`x=${x}, Amax=${area}`,correction:`A(x)=x(${h}−x) est une parabole concave. Son sommet est atteint en x=${x}.`,hint:commonHint,examTip:"Transformer un problème géométrique en fonction puis chercher son extremum."};}
      if(v===3)return {type:"proof",title:`Convexité de x³−${a}x`,statement:`Étudier la convexité de f(x)=x³−${a}x.`,expectedAnswer:"f''(x)=6x; changement de convexité en 0",correction:"f''(x)=6x est négative avant 0 et positive après 0.",hint:commonHint,examTip:"Le signe de la dérivée seconde donne la convexité."};
      return {type:"document-analysis",title:`Lecture graphique et solutions ${r+1}`,statement:`Le graphique fourni représente f. Expliquer comment déterminer le nombre de solutions de f(x)=${a}.`,expectedAnswer:`Compter les intersections avec y=${a}.`,correction:`Chaque intersection de la courbe avec la droite y=${a} correspond à une solution.`,hint:commonHint,examTip:"Lire graphiquement une équation, c’est chercher des intersections."};
    case 2:
      if(v===0)return {type:"calculation",title:`Taux de variation ${r+1}`,statement:`Calculer le taux de variation de f(x)=x² entre ${a} et ${a+2}.`,expectedAnswer:String(2*a+2),correction:`[( ${a+2})²−${a}²]/2=${2*a+2}.`,hint:commonHint,examTip:"Le taux de variation compare deux images sur un intervalle."};
      if(v===1)return {type:"proof",title:`TAF et point intermédiaire ${r+1}`,statement:`Pour f(x)=x² sur [${a};${a+1}], déterminer c donné par le TAF.`,expectedAnswer:`c=${a+.5}`,correction:`Le taux de variation vaut ${2*a+1}; comme f'(c)=2c, c=${a+.5}.`,hint:commonHint,examTip:"Le TAF fournit un point où la pente locale égale la pente moyenne."};
      if(v===2){const M=2*(a+2);return {type:"proof",title:`Borne d’erreur ${r+1}`,statement:`Montrer que |x²−y²|≤${M}|x−y| pour x,y∈[−${a+2};${a+2}].`,expectedAnswer:`Constante M=${M}`,correction:`x²−y²=(x−y)(x+y) et |x+y|≤${M}.`,hint:commonHint,examTip:"Factoriser avant de majorer."};}
      if(v===3)return {type:"proof",title:`Rolle et existence ${r+1}`,statement:`g est continue sur [−${a};${a}], dérivable sur l’intérieur et vérifie g(−${a})=g(${a}). Que conclure ?`,expectedAnswer:`Il existe c∈(−${a};${a}) tel que g'(c)=0.`,correction:"C’est la conclusion du théorème de Rolle.",hint:commonHint,examTip:"Vérifier les hypothèses avant d’invoquer un théorème."};
      return {type:"numeric",title:`Erreur relative ${r+1}`,statement:`Pour une mesure x=${m}±0,1, donner l’erreur relative en pourcentage.`,expectedAnswer:`${(100/m).toFixed(2)} %`,correction:`Erreur relative=(0,1/${m})×100=${(100/m).toFixed(2)} %.`,hint:commonHint,examTip:"Une erreur relative se compare à la valeur mesurée."};
    case 3:
      if(v===0)return {type:"calculation",title:`Suite arithmétique ${r+1}`,statement:`u_0=${a} et u_(n+1)=u_n+${b}. Donner u_n.`,expectedAnswer:`u_n=${a}+${b}n`,correction:"Suite arithmétique: u_n=u_0+nr.",hint:commonHint,examTip:"Reconnaître la raison d’une suite permet d’éviter une récurrence inutile."};
      if(v===1)return {type:"calculation",title:`Suite géométrique ${r+1}`,statement:`u_0=${a} et u_(n+1)=${c}u_n. Donner u_n.`,expectedAnswer:`u_n=${a}·${c}^n`,correction:"Suite géométrique: u_n=u_0q^n.",hint:commonHint,examTip:"Identifier une suite géométrique dès la relation de récurrence."};
      if(v===2)return {type:"multi-step",title:`Point fixe ${r+1}`,statement:`u_(n+1)=(u_n+${b})/${d+2}. Déterminer le point fixe ℓ.`,expectedAnswer:`ℓ=${b}/${d+1}`,correction:`Résoudre ℓ=(ℓ+${b})/${d+2}, donc ${d+1}ℓ=${b}.`,hint:commonHint,examTip:"Le point fixe donne souvent la limite d’une suite affine convergente."};
      if(v===3){const s=m*(m+1)/2;return {type:"numeric",title:`Somme des entiers ${m}`,statement:`Calculer S=1+2+…+${m}.`,expectedAnswer:String(s),correction:`S=${m}(${m+1})/2=${s}.`,hint:commonHint,examTip:"Utiliser une formule de somme plutôt qu’additionner terme à terme."};}
      const N=Math.ceil(Math.log(b/.01)/Math.log(2));return {type:"multi-step",title:`Contrôle d’approximation ${r+1}`,statement:`Pour u_n=${a}+${b}(1/2)^n, donner le plus petit n entier tel que |u_n−${a}|<0,01.`,expectedAnswer:`n≥${N}`,correction:`Il faut ${b}(1/2)^n<0,01, ce qui donne n≥${N}.`,hint:commonHint,examTip:"Pour une suite convergente, contrôler explicitement l’erreur."};
    case 4:
      if(v===0)return {type:"short-answer",title:`Domaine d’un logarithme ${r+1}`,statement:`Déterminer le domaine de f(x)=ln(x−${a}).`,expectedAnswer:`]${a};+∞[`,correction:`x−${a}>0, donc x>${a}.`,hint:"Écrire l’argument du logarithme et imposer sa positivité.",examTip:"Le domaine est toujours prioritaire avec ln."};
      if(v===1)return {type:"calculation",title:`Équation logarithmique ${r+1}`,statement:`Résoudre ln(x)=${b}.`,expectedAnswer:`x=e^${b}`,correction:"Appliquer l’exponentielle aux deux membres.",hint:commonHint,examTip:"ln et exp sont des fonctions réciproques."};
      if(v===2)return {type:"calculation",title:`Somme de logarithmes ${r+1}`,statement:`Résoudre ln(x)+ln(${c})=ln(${c*m}).`,expectedAnswer:`x=${m}`,correction:`ln(cx)=ln(cm), donc x=m.`,hint:commonHint,examTip:"Regrouper les logarithmes avant de résoudre."};
      if(v===3)return {type:"calculation",title:`Dérivée d’un logarithme ${r+1}`,statement:`Calculer f'(x) pour f(x)=ln(x²+${a}x+${b}).`,expectedAnswer:`(2x+${a})/(x²+${a}x+${b})`,correction:"Utiliser (ln g)'=g'/g.",hint:commonHint,examTip:"Reconnaître la forme ln(g(x))."};
      return {type:"calculation",title:`Inéquation logarithmique ${r+1}`,statement:`Résoudre ln(x)≤${b}.`,expectedAnswer:`0<x≤e^${b}`,correction:"ln est strictement croissante sur ]0;+∞[.",hint:commonHint,examTip:"La monotonie du logarithme conserve l’ordre."};
    case 5:
      if(v===0)return {type:"calculation",title:`Équation exponentielle ${r+1}`,statement:`Résoudre e^x=${m}.`,expectedAnswer:`x=ln(${m})`,correction:"Prendre ln des deux côtés.",hint:commonHint,examTip:"Passer de l’exponentielle au logarithme pour isoler l’inconnue."};
      if(v===1)return {type:"short-answer",title:`Comparer deux exponentielles ${r+1}`,statement:`Comparer e^(x+${a}) et e^x.`,expectedAnswer:`e^(x+${a})=e^${a}e^x>e^x`,correction:`e^${a}>1, donc e^(x+${a})>e^x.`,hint:commonHint,examTip:"Utiliser e^(u+v)=e^u e^v."};
      if(v===2)return {type:"calculation",title:`Dérivée exponentielle ${r+1}`,statement:`Calculer f'(x) pour f(x)=e^x−${a}x.`,expectedAnswer:`e^x−${a}`,correction:"Dériver terme à terme.",hint:commonHint,examTip:"La dérivée de e^x est e^x."};
      if(v===3)return {type:"numeric",title:`Temps de demi-vie ${r+1}`,statement:`Une quantité suit N(t)=${m}e^(−0,1t). Déterminer son temps de demi-vie.`,expectedAnswer:"10 ln(2)",correction:"Résoudre N(t)=N(0)/2, donc e^(−0,1t)=1/2.",hint:commonHint,examTip:"Une demi-vie correspond à une division par deux."};
      return {type:"multi-step",title:`Seuil exponentiel ${r+1}`,statement:`Résoudre ${m}e^(0,2t)≥${m*5}.`,expectedAnswer:"t≥5 ln(5)",correction:"Diviser par m, prendre ln puis diviser par 0,2.",hint:commonHint,examTip:"Faire apparaître ln pour isoler t."};
    case 6:
      if(v===0)return {type:"calculation",title:`Primitive polynomiale ${r+1}`,statement:`Donner une primitive de f(x)=3x²+${a}.`,expectedAnswer:`F(x)=x³+${a}x+C`,correction:"Intégrer chaque terme.",hint:commonHint,examTip:"Toujours ajouter la constante C dans une famille de primitives."};
      if(v===1)return {type:"calculation",title:`Primitive mixte ${r+1}`,statement:`Donner une primitive de f(x)=e^x+${a}x.`,expectedAnswer:`F(x)=e^x+${a}x²/2+C`,correction:"Intégrer séparément e^x et ax.",hint:commonHint,examTip:"Vérifier une primitive par dérivation."};
      if(v===2)return {type:"calculation",title:`Primitive de 1/x ${r+1}`,statement:`Donner une primitive de f(x)=${m}/x sur ]0;+∞[.`,expectedAnswer:`F(x)=${m}ln(x)+C`,correction:"Utiliser une primitive de 1/x.",hint:commonHint,examTip:"Le domaine accompagne toujours la primitive de 1/x."};
      if(v===3)return {type:"multi-step",title:`Position à partir de la vitesse ${r+1}`,statement:`v(t)=2t+${a} et x(0)=${b}. Déterminer x(t).`,expectedAnswer:`x(t)=t²+${a}t+${b}`,correction:"Intégrer v puis utiliser la condition initiale.",hint:commonHint,examTip:"La constante d’intégration est fixée par la position initiale."};
      return {type:"proof",title:`Reconnaître une primitive ${r+1}`,statement:`Quelle propriété permet de vérifier qu’une fonction F est une primitive de f(x)=x²−${a}x ?`,expectedAnswer:"F'(x)=f(x)",correction:"Il suffit de vérifier l’égalité des dérivées sur l’intervalle considéré.",hint:commonHint,examTip:"La définition d’une primitive est une identité de dérivées."};
    case 7:
      if(v===0)return {type:"calculation",title:`Intégrale affine ${r+1}`,statement:`Calculer ∫_0^1 (${a}x+${b}) dx.`,expectedAnswer:`${a}/2+${b}`,correction:`Une primitive est ${a}x²/2+${b}x.`,hint:commonHint,examTip:"Trouver une primitive avant d’évaluer les bornes."};
      if(v===1){const A=a**3/3;return {type:"numeric",title:`Aire sous x² jusqu’à ${a}`,statement:`Calculer l’aire sous y=x² entre x=0 et x=${a}.`,expectedAnswer:String(A),correction:`∫_0^${a}x²dx=${a}³/3=${A}.`,hint:commonHint,examTip:"Une fonction positive permet d’interpréter directement l’intégrale comme une aire."};}
      if(v===2){const avg=a/2+b;return {type:"calculation",title:`Valeur moyenne ${r+1}`,statement:`Calculer la valeur moyenne de f(x)=x+${b} sur [0;${a}].`,expectedAnswer:String(avg),correction:`La moyenne vaut (1/${a})∫_0^${a}(x+${b})dx=${avg}.`,hint:commonHint,examTip:"Ne pas confondre intégrale et valeur moyenne."};}
      if(v===3){const val=a+b;return {type:"calculation",title:`Relation de Chasles ${r+1}`,statement:`Si ∫_0^4 f=${a} et ∫_4^7 f=${b}, calculer ∫_0^7 f.`,expectedAnswer:String(val),correction:`Par Chasles, ∫_0^7 f=∫_0^4 f+∫_4^7 f=${val}.`,hint:commonHint,examTip:"Découper une intégrale sur des intervalles adjacents."};}
      return {type:"short-answer",title:`Positivité d’une intégrale ${r+1}`,statement:`Si f(x)≥0 sur [0;${a}], quel est le signe de ∫_0^${a}f(x)dx ?`,expectedAnswer:">=0",correction:"L’intégrale d’une fonction positive est non négative.",hint:commonHint,examTip:"Le signe de la fonction donne le signe de l’aire algébrique."};
    case 8:
      if(v===0)return {type:"calculation",title:`Équation différentielle homogène ${r+1}`,statement:`Résoudre y'=${a}y avec y(0)=${b}.`,expectedAnswer:`y(t)=${b}e^(${a}t)`,correction:"La solution générale est Ce^(at), puis C=b.",hint:commonHint,examTip:"Identifier immédiatement l’équation y'=ay."};
      if(v===1)return {type:"calculation",title:`Décroissance exponentielle ${r+1}`,statement:`Résoudre y'=−${b}y avec y(0)=${a}.`,expectedAnswer:`y(t)=${a}e^(−${b}t)`,correction:"Même méthode avec un coefficient négatif.",hint:commonHint,examTip:"Le signe du coefficient indique croissance ou décroissance."};
      if(v===2)return {type:"multi-step",title:`Équilibre d’une équation ${r+1}`,statement:`Résoudre y'+${a}y=${b}.`,expectedAnswer:`y=${b}/${a}+Ce^(−${a}t)`,correction:"Solution particulière constante b/a plus solution homogène.",hint:commonHint,examTip:"Séparer l’équilibre et le terme transitoire."};
      if(v===3)return {type:"multi-step",title:`Condition initiale ${r+1}`,statement:`Résoudre y'+${a}y=${b} avec y(0)=${c}.`,expectedAnswer:`y=${b}/${a}+(${c}−${b}/${a})e^(−${a}t)`,correction:`Utiliser y(0)=${c} pour déterminer la constante.`,hint:commonHint,examTip:"La condition initiale sélectionne une seule solution."};
      return {type:"numeric",title:`Temps de réduction ${r+1}`,statement:`Pour y(t)=y_0e^(−${a}t), déterminer t lorsque y(t)=0,1y_0.`,expectedAnswer:`t=ln(10)/${a}`,correction:"Résoudre e^(−at)=0,1.",hint:commonHint,examTip:"Isoler l’exponentielle avant de prendre ln."};
    case 9:
      if(v===0){const mod=Math.sqrt(a*a+b*b);return {type:"numeric",title:`Module d’un complexe ${r+1}`,statement:`Calculer |z| pour z=${a}+${b}i.`,expectedAnswer:`√(${a*a+b*b})≈${mod.toFixed(3)}`,correction:"|z|=√(a²+b²).",hint:commonHint,examTip:"Le module correspond à la distance à l’origine."};}
      if(v===1){const real=a*c+b*d, imag=b*c-a*d;return {type:"calculation",title:`Produit complexe ${r+1}`,statement:`Calculer z·w pour z=${a}+${b}i et w=${c}−${d}i.`,expectedAnswer:`${real}${imag>=0?"+":"−"}${Math.abs(imag)}i`,correction:"Développer puis utiliser i²=−1.",hint:commonHint,examTip:"Regrouper séparément parties réelle et imaginaire."};}
      if(v===2)return {type:"short-answer",title:`Conjugué ${r+1}`,statement:`Donner z̄ et z+z̄ pour z=${a}−${b}i.`,expectedAnswer:`z̄=${a}+${b}i ; z+z̄=${2*a}`,correction:"Le conjugué change le signe de la partie imaginaire.",hint:commonHint,examTip:"Le conjugué transforme aussi un calcul complexe en information réelle."};
      if(v===3)return {type:"short-answer",title:`Argument principal ${r+1}`,statement:"Pour un complexe situé sur l’axe réel positif, donner un argument principal.",expectedAnswer:"0",correction:"L’axe réel positif correspond à l’angle nul.",hint:commonHint,examTip:"Lire l’argument à partir de la position géométrique."};
      return {type:"calculation",title:`Équation complexe ${r+1}`,statement:`Résoudre z²=${m*m} dans ℂ.`,expectedAnswer:`z=${m} ou z=−${m}`,correction:"Les racines sont opposées.",hint:commonHint,examTip:"Vérifier les deux racines dans l’équation."};
    case 10:
      if(v===0){const dist=Math.sqrt(a*a+b*b);return {type:"numeric",title:`Distance dans l’espace ${r+1}`,statement:`Calculer AB pour A(${a},0,0) et B(0,${b},0).`,expectedAnswer:`√(${a*a+b*b})≈${dist.toFixed(3)}`,correction:"Appliquer la formule de distance dans ℝ³.",hint:commonHint,examTip:"La norme du vecteur AB donne la distance."};}
      if(v===1)return {type:"calculation",title:`Milieu d’un segment ${r+1}`,statement:`Donner le milieu de A(${a},0,0) et B(0,${b},0).`,expectedAnswer:`M=(${a/2};${b/2};0)`,correction:"Moyenner les coordonnées deux à deux.",hint:commonHint,examTip:"La formule du milieu est une moyenne de coordonnées."};
      if(v===2){const s=a+b+c;return {type:"proof",title:`Appartenance à un plan ${r+1}`,statement:`Vérifier si P(${a},${b},${c}) appartient à x+y+z=${s}.`,expectedAnswer:"Oui",correction:`${a}+${b}+${c}=${s}, donc P satisfait l’équation du plan.`,hint:commonHint,examTip:"Pour une appartenance, substituer directement les coordonnées."};}
      if(v===3)return {type:"calculation",title:`Vecteurs orthogonaux ${r+1}`,statement:`Pour u=(${a},${b},0) et v=(${b},−${a},0), calculer u·v.`,expectedAnswer:"0",correction:"ab−ab=0, donc les vecteurs sont orthogonaux.",hint:commonHint,examTip:"Un produit scalaire nul caractérise l’orthogonalité."};
      return {type:"calculation",title:`Sphère de rayon ${d}`,statement:`Écrire l’équation de la sphère de centre O et de rayon ${d}.`,expectedAnswer:`x²+y²+z²=${d*d}`,correction:"Tous les points de la sphère vérifient OM²=d².",hint:commonHint,examTip:"Reconnaître immédiatement la forme cartésienne d’une sphère."};
    case 11:
      if(v===0)return {type:"calculation",title:`Binomiale : un succès ${r+1}`,statement:`Un succès a une probabilité 0,6. Sur ${n} essais indépendants, écrire P(X=1).`,expectedAnswer:`C(${n};1)·0,6·0,4^${n-1}`,correction:"Appliquer la formule binomiale avec k=1.",hint:commonHint,examTip:"Identifier n, p et k avant de calculer."};
      if(v===1)return {type:"calculation",title:`Au moins un succès ${r+1}`,statement:`Un succès a une probabilité 0,2. Sur ${n} essais, calculer P(X≥1).`,expectedAnswer:`1−0,8^${n}`,correction:"Utiliser l’événement complémentaire X=0.",hint:commonHint,examTip:"Le complément est souvent le chemin le plus court."};
      if(v===2){const comb=n*(n-1)/2;return {type:"numeric",title:`Combinaisons par paires ${r+1}`,statement:`Combien de groupes de 2 peut-on former parmi ${n} élèves ?`,expectedAnswer:String(comb),correction:`C(${n};2)=${comb}.`,hint:commonHint,examTip:"Une combinaison ignore l’ordre des personnes choisies."};}
      if(v===3)return {type:"numeric",title:`Probabilité conditionnelle ${r+1}`,statement:"Si P(A)=0,4 et P(B|A)=0,5, calculer P(A∩B).",expectedAnswer:"0,2",correction:"P(A∩B)=P(A)P(B|A)=0,2.",hint:commonHint,examTip:"Lire la conditionnelle comme une probabilité dans le scénario A."};
      return {type:"numeric",title:`Espérance binomiale ${r+1}`,statement:`Pour X~B(${n},0,25), calculer E(X).`,expectedAnswer:`${n*0.25}`,correction:"Pour une binomiale, E(X)=np.",hint:commonHint,examTip:"Connaître les paramètres permet de donner immédiatement l’espérance."};
    case 12:
      if(v===0){const divisor=n,dividend=m*10+3,q=Math.floor(dividend/divisor),rem=dividend%divisor;return {type:"calculation",title:`Division euclidienne ${r+1}`,statement:`Effectuer la division euclidienne de ${dividend} par ${divisor}.`,expectedAnswer:`q=${q}, r=${rem}`,correction:`${dividend}=${divisor}×${q}+${rem}, avec 0≤${rem}<${divisor}.`,hint:commonHint,examTip:"Toujours vérifier l’inégalité sur le reste."};}
      if(v===1){const aa=a*6,bb=b*4;return {type:"calculation",title:`PGCD ${r+1}`,statement:`Calculer PGCD(${aa},${bb}).`,expectedAnswer:String(__gcd(aa,bb)),correction:"Appliquer l’algorithme d’Euclide jusqu’au reste nul.",hint:commonHint,examTip:"Écrire les divisions successives plutôt que donner seulement le résultat."};}
      if(v===2){const mod=d+3,rem=(m*m)%mod;return {type:"calculation",title:`Congruence d’une puissance ${r+1}`,statement:`Calculer ${m}² modulo ${mod}.`,expectedAnswer:String(rem),correction:`${m}²=${m*m}, puis réduire modulo ${mod}.`,hint:commonHint,examTip:"Réduire tôt simplifie les puissances modulaires."};}
      if(v===3){const aa=a%7,inv=[1,2,3,4,5,6].find(k=>(aa*k)%7===1);return {type:"calculation",title:`Inverse modulo 7 ${r+1}`,statement:`Chercher un inverse de ${a} modulo 7.`,expectedAnswer:inv?String(inv):"Aucun inverse",correction:inv?`${a}×${inv}≡1 (mod 7).`:"Le PGCD avec 7 n’est pas égal à 1.",hint:commonHint,examTip:"Un inverse modulo m existe si et seulement si le PGCD vaut 1."};}
      return {type:"proof",title:`Critère de Bézout ${r+1}`,statement:`Pour l’équation ${m}x+${n}y=1, expliquer quand des solutions entières existent.`,expectedAnswer:"Il existe des solutions si et seulement si PGCD(m,n)=1.",correction:"C’est précisément le théorème de Bézout.",hint:commonHint,examTip:"Relier équation diophantienne et PGCD."};
    case 13:
      if(v===0)return {type:"proof",title:`Élément neutre d’une loi ${r+1}`,statement:`Sur ℤ, a*b=a+b+${a}. Trouver l’élément neutre.`,expectedAnswer:`e=−${a}`,correction:`Résoudre a*e=a, donc e=−${a}.`,hint:commonHint,examTip:"Écrire l’identité x*e=x avant de manipuler la loi."};
      if(v===1)return {type:"proof",title:`Commutativité d’une loi ${r+1}`,statement:`Pour a*b=a+b+${b}, la loi est-elle commutative ?`,expectedAnswer:"Non en général",correction:"a*b=a+2b alors que b*a=2a+b.",hint:commonHint,examTip:"Comparer explicitement a*b et b*a."};
      if(v===2)return {type:"calculation",title:`Inverse pour l’addition ${r+1}`,statement:"Pour a*b=a+b sur ℤ, trouver l’inverse de a.",expectedAnswer:"−a",correction:"Chercher b tel que a+b=0.",hint:commonHint,examTip:"L’inverse dépend de l’élément neutre."};
      if(v===3)return {type:"proof",title:`Morphisme additif ${r+1}`,statement:`Vérifier que f(x)=${a}x est un morphisme additif sur ℝ.`,expectedAnswer:"Oui",correction:`f(x+y)=${a}(x+y)=${a}x+${a}y=f(x)+f(y).`,hint:commonHint,examTip:"Tester la conservation de l’opération suffit ici."};
      return {type:"calculation",title:`Composition de fonctions ${r+1}`,statement:`Avec f(x)=x+${a} et g(x)=${b}x, calculer g∘f.`,expectedAnswer:`g(f(x))=${b}x+${a*b}`,correction:"Substituer f(x) dans g.",hint:commonHint,examTip:"Composition = appliquer la fonction intérieure puis l’extérieure."};
    default:
      if(v===0)return {type:"proof",title:`Liberté dans ℝ² ${r+1}`,statement:"La famille ((1,0),(0,1)) de ℝ² est-elle libre ?",expectedAnswer:"Oui",correction:"Une combinaison nulle impose les deux coefficients nuls.",hint:commonHint,examTip:"Pour tester la liberté, résoudre la combinaison linéaire nulle."};
      if(v===1)return {type:"calculation",title:`Coordonnées dans la base canonique ${r+1}`,statement:`Exprimer (${a},${b}) dans la base canonique de ℝ².`,expectedAnswer:`${a}e₁+${b}e₂`,correction:"Les coordonnées sont directement les coefficients de la base canonique.",hint:commonHint,examTip:"Lire les coordonnées comme coefficients de la base."};
      if(v===2)return {type:"multi-step",title:`Noyau d’une application ${r+1}`,statement:"Pour f(x,y)=(x+y,0), décrire Ker f.",expectedAnswer:"{(t,−t): t∈ℝ}",correction:"f(x,y)=(0,0) impose x+y=0.",hint:commonHint,examTip:"Le noyau est l’ensemble des antécédents du vecteur nul."};
      if(v===3)return {type:"short-answer",title:`Image d’une application ${r+1}`,statement:"Pour f(x,y)=(x+y,x+y), donner Im f.",expectedAnswer:"{(t,t): t∈ℝ}",correction:"Les deux coordonnées de l’image sont toujours égales.",hint:commonHint,examTip:"Décrire l’image à partir de la forme générale f(x)."};
      return {type:"numeric",title:`Théorème du rang ${r+1}`,statement:"Une application linéaire ℝ³→ℝ² a un noyau de dimension 1. Donner le rang.",expectedAnswer:"2",correction:"3=dim Ker(f)+rang(f), donc rang(f)=2.",hint:commonHint,examTip:"Appliquer directement le théorème du rang."};
  }
}

function __gcd(x:number,y:number):number { while(y!==0){const t=x%y;x=y;y=t;} return Math.abs(x); }

function visualFor(chapter:number, local:number):ExerciseVisual {
  if(chapter===9) return {kind:"scheme",title:"Plan complexe",ariaLabel:"Schéma du plan complexe",nodes:[{id:"O",label:"O",x:200,y:110},{id:"Z",label:"z",x:105,y:55},{id:"W",label:"w",x:300,y:165}],links:[{from:"O",to:"Z",label:"z"},{from:"O",to:"W",label:"w"}]};
  if(chapter===10) return {kind:"scheme",title:"Schéma géométrique",ariaLabel:"Schéma de géométrie dans l’espace",nodes:[{id:"A",label:"A",x:85,y:145},{id:"B",label:"B",x:310,y:145},{id:"M",label:"M",x:200,y:60},{id:"P",label:"P",x:200,y:185}],links:[{from:"A",to:"B",label:"AB"},{from:"A",to:"M",label:"AM"},{from:"B",to:"M",label:"BM"},{from:"M",to:"P",label:"hauteur",dashed:true}]};
  if(chapter===11) return {kind:"scheme",title:"Arbre de probabilités",ariaLabel:"Arbre de probabilités à deux étapes",nodes:[{id:"S",label:"Départ",x:55,y:105},{id:"A",label:"Succès",x:180,y:55},{id:"B",label:"Échec",x:180,y:155},{id:"AA",label:"SS",x:330,y:30},{id:"AB",label:"SE",x:330,y:100},{id:"BB",label:"EE",x:330,y:170}],links:[{from:"S",to:"A",label:"p"},{from:"S",to:"B",label:"1−p"},{from:"A",to:"AA"},{from:"A",to:"AB"},{from:"B",to:"AB"},{from:"B",to:"BB"}]};
  if(chapter===12) return {kind:"scheme",title:"Classes modulo",ariaLabel:"Cycle des classes modulo",nodes:[{id:"0",label:"0",x:65,y:105},{id:"1",label:"1",x:135,y:45},{id:"2",label:"2",x:265,y:45},{id:"3",label:"3",x:335,y:105},{id:"4",label:"4",x:265,y:165},{id:"5",label:"5",x:135,y:165}],links:[{from:"0",to:"1",label:"+1"},{from:"1",to:"2",label:"+1"},{from:"2",to:"3",label:"+1"},{from:"3",to:"4",label:"+1"},{from:"4",to:"5",label:"+1"},{from:"5",to:"0",label:"+1"}]};
  if(chapter>=13) return {kind:"scheme",title:"Application linéaire",ariaLabel:"Schéma d'une application",nodes:[{id:"u",label:"u",x:80,y:105},{id:"v",label:"v",x:200,y:55},{id:"w",label:"w",x:320,y:105},{id:"F",label:"f",x:200,y:165}],links:[{from:"u",to:"F",label:"f"},{from:"v",to:"F",label:"f"},{from:"w",to:"F",label:"f"}]};
  const curves=[
    [[-4,2],[-3,2.4],[-2,2.9],[-1,3.6],[0,4.2],[1,3.6],[2,2.8],[3,2.3],[4,2.1]],
    [[-3,4],[-2,1],[-1,-1],[0,0],[1,3],[2,4],[3,1]],
    [[-3,-2],[-2,-1],[-1,0],[0,1],[1,2],[2,3],[3,4]],
    [[0,5],[1,4],[2,3.2],[3,2.6],[4,2.2]],
    [[-3,0.2],[-2,0.35],[-1,0.6],[0,1],[1,1.7],[2,2.9],[3,4.8]],
  ][(chapter+local)%5] as number[][];
  return {kind:"graph",title:"Graphique associé à l’exercice",ariaLabel:"Graphique associé à l’exercice",xLabel:chapter===3?"n":"x",yLabel:"y",xMin:-4,xMax:4,yMin:-3,yMax:6,curves:[{points:curves.map(([x,y])=>({x,y})),label:"courbe"}]};
}

export const maths300Exercises:Exercise[] = Array.from({length:300},(_,index)=>{
  const chapter=Math.floor(index/20), local=index%20;
  return base(draft(chapter,local),chapter,local);
});

if(maths300Exercises.length!==300) throw new Error(`Maths exercise bank expected 300 items, got ${maths300Exercises.length}.`);
