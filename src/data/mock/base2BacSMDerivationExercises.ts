import type { Exercise } from "../../types/content";

const tracks = ["SMA", "SMB"] as const;
const target = (topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter: "Dérivation et étude des fonctions", topic });

const make = (id: string, topic: string, title: string, statement: string, answer: string, correction: string, hint: string, difficulty: 1 | 2 | 3 | 4 | 5, minutes: number, type: Exercise["type"] = "calculation"): Exercise => ({
  id, mode: "BASE", source: "APPROVED", target: target(topic), type, difficulty, title, statement,
  expectedAnswer: answer, acceptedAnswers: [answer], correction, hint,
  examTip: "Pour une étude de fonction, garde l'ordre domaine → dérivée → signe → variations → extrema.",
  estimatedMinutes: minutes, xpValue: difficulty * 6 + 6, tags: ["2BAC SM", "derivation", "fonctions"],
});

export const base2BacSMDerivationExercises: Exercise[] = [
  make("sm-deriv-01", "Nombre dérivé", "Taux de variation", "Calculer lim(x→1) (x²−1)/(x−1).", "2", "On reconnaît le taux de variation de f(x)=x² en a=1. Donc la limite vaut f'(1)=2.", "Reconnais la définition du nombre dérivé.", 1, 2, "short-answer"),
  make("sm-deriv-02", "Tangente", "Équation de la tangente", "Pour f(x)=x²+1, déterminer la tangente au point d'abscisse 2.", "y=4x−3", "f'(x)=2x, donc f'(2)=4 et f(2)=5. La tangente est y=4(x−2)+5=4x−3.", "Utilise y=f'(a)(x−a)+f(a).", 2, 4),
  make("sm-deriv-03", "Dérivabilité", "Valeur absolue", "La fonction f(x)=|x| est-elle dérivable en 0 ?", "Non", "La dérivée à droite en 0 vaut 1 et la dérivée à gauche −1. Elles sont différentes.", "Compare les deux dérivées latérales.", 1, 3, "short-answer"),
  make("sm-deriv-04", "Dérivées usuelles", "Dérivée d'une puissance", "Calculer la dérivée de f(x)=3x⁵−2x²+7x−1.", "f'(x)=15x⁴−4x+7", "On dérive terme à terme.", "Applique (x^n)'=nx^(n−1).", 1, 3),
  make("sm-deriv-05", "Produit", "Règle du produit", "Calculer la dérivée de f(x)=x²sin x.", "f'(x)=2xsin x+x²cos x", "Avec u=x² et v=sin x, (uv)'=u'v+uv'.", "Utilise la règle du produit.", 2, 3),
  make("sm-deriv-06", "Quotient", "Règle du quotient", "Calculer la dérivée de f(x)=x/(x+1).", "f'(x)=1/(x+1)²", "f'=[(x+1)−x]/(x+1)²=1/(x+1)².", "Écris u'v−uv'.", 2, 4),
  make("sm-deriv-07", "Composition", "Dérivée composée", "Calculer la dérivée de f(x)=sin(x²−4x+1).", "f'(x)=(2x−4)cos(x²−4x+1)", "Avec u=x²−4x+1, u'=2x−4 et (sin u)'=u'cos u.", "Ne perds pas la dérivée intérieure.", 2, 3),
  make("sm-deriv-08", "Racine composée", "Dérivée d'une racine", "Calculer la dérivée de f(x)=√(x²+2x+5).", "f'(x)=(x+1)/√(x²+2x+5)", "f'=(2x+2)/(2√(x²+2x+5)).", "Applique la règle de chaîne à √u.", 2, 4),
  make("sm-deriv-09", "Variations", "Étude de signe", "Étudier les variations de f(x)=x²−4x+3 sur ℝ.", "Décroissante sur ]−∞,2], croissante sur [2,+∞[ ; minimum −1", "f'=2(x−2), négative avant 2 et positive après. Le minimum vaut f(2)=−1.", "Étudie le signe de f'.", 2, 5, "multi-step"),
  make("sm-deriv-10", "Extremum", "Maximum", "Déterminer l'extremum de f(x)=−x²+6x−5.", "Maximum 4 en x=3", "f'=−2x+6. Le signe passe de + à − en 3. f(3)=4.", "Résous f'=0 puis étudie le signe.", 2, 4, "multi-step"),
  make("sm-deriv-11", "Réciproque", "Dérivée de la réciproque", "On sait f(2)=5 et f'(2)=3. Calculer (f⁻¹)'(5).", "1/3", "(f⁻¹)'(f(2))=1/f'(2)=1/3.", "Utilise la formule de la fonction réciproque.", 2, 3, "short-answer"),
  make("sm-deriv-12", "Synthèse", "Étude complète", "Pour f(x)=x+3/x sur ]0,+∞[, calculer f'(x) et déterminer ses variations.", "f'=1−3/x² ; décroissante sur ]0,√3], croissante sur [√3,+∞[", "f'=(x²−3)/x². Le dénominateur est positif ; le signe dépend de x²−3.", "Factorise le signe et utilise x²>0.", 4, 6, "multi-step"),
  make("sm-deriv-13", "Convexité", "Dérivée seconde", "Étudier la convexité de f(x)=x³−3x²+2x.", "Concave sur ]−∞,1[, convexe sur ]1,+∞[", "f''=6x−6=6(x−1). Le signe change en 1, donc la convexité change en 1.", "Calcule f'' et étudie son signe.", 3, 5, "multi-step"),
  make("sm-deriv-14", "Tangente", "Parallélisme", "Pour f(x)=x³−2x, déterminer les points où la tangente est parallèle à la droite y=4x+1.", "x=±√2", "La pente cherchée est 4. f'=3x²−2, donc 3x²−2=4, soit x²=2.", "Les pentes doivent être égales.", 3, 5, "multi-step"),
  make("sm-deriv-15", "Dérivée à droite", "Raccordement", "On définit f(x)=x² si x≤1 et f(x)=2x−1 si x>1. Étudier la dérivabilité en 1.", "f est dérivable en 1 et f'(1)=2", "Les deux expressions donnent f(1)=1. La dérivée à gauche vaut 2 et celle à droite vaut 2. Donc f est dérivable en 1.", "Compare les deux dérivées latérales après avoir vérifié la continuité.", 4, 7, "proof"),
  make("sm-deriv-16", "Réciproque", "Calcul inverse", "On sait que f(1)=2, f'(1)=−4 et que f est bijective. Calculer (f⁻¹)'(2).", "−1/4", "(f⁻¹)'(f(1))=1/f'(1)=−1/4.", "La valeur 2 est f(1).", 2, 3),
  make("sm-deriv-17", "Étude rationnelle", "Variations et extremum", "Étudier les variations de f(x)=x²/(x+1) sur ]−1,+∞[.", "Décroissante sur ]−1,0], croissante sur [0,+∞[ ; minimum 0", "f'=[2x(x+1)−x²]/(x+1)²=x(x+2)/(x+1)². Sur ]−1,+∞[, le signe est celui de x(x+2), donc négatif sur ]−1,0[ et positif sur ]0,+∞[.", "Factorise complètement f'.", 4, 7, "multi-step"),
  make("sm-deriv-18", "Paramètre", "Nombre de tangentes", "Déterminer les valeurs de m pour lesquelles f(x)=x³−3x+m possède un extremum égal à 2.", "m=2±2", "Les extremums sont en x=±1, avec valeurs f(1)=m−2 et f(−1)=m+2. On impose l'une égale à 2, d'où m=4 ou m=0.", "Calcule les deux valeurs aux points critiques.", 5, 8, "multi-step"),
  make("sm-deriv-19", "Inégalité", "Minimum par dérivation", "Montrer que x²+1≥2x pour tout x réel et préciser le cas d'égalité.", "x²+1≥2x ; égalité pour x=1", "f(x)=x²−2x+1=(x−1)²≥0. On peut aussi remarquer que le minimum vaut 0 en x=1.", "Transforme en carré parfait ou utilise une étude de fonction.", 3, 5, "proof"),
  make("sm-deriv-20", "Synthèse Bac", "Étude complète", "Pour f(x)=x−2ln(x) sur ]0,+∞[, déterminer les variations, l'extremum et montrer que f(x)≥2−2ln2.", "Minimum 2−2ln2 en x=2", "f'=1−2/x=(x−2)/x. Donc f décroît sur ]0,2] puis croît sur [2,+∞[. Le minimum vaut f(2)=2−2ln2, d'où l'inégalité.", "Étudie le signe de (x−2)/x.", 5, 8, "multi-step"),
];
