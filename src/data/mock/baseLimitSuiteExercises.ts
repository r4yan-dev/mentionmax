import type { Exercise } from "../../types/content";

const tracks = ["SP", "SMA", "SMB"] as const;
const target = (chapter: string, topic: string) => ({ trackIds: [...tracks], subjectId: "maths" as const, chapter, topic });

export const baseLimitSuiteExercises: Exercise[] = [
  {
    id: "limit-suite-01", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Suite bornée"), type: "short-answer", difficulty: 1,
    title: "Reconnaître une suite bornée",
    statement: "La suite u_n=1/(n+1) est-elle bornée sur N ? Donner un majorant et un minorant simples.",
    expectedAnswer: "Oui, 0≤u_n≤1",
    acceptedAnswers: ["oui: 0≤u_n≤1", "0≤u_n≤1", "oui, bornée"],
    correction: "Pour n∈N, n+1≥1, donc 0<1/(n+1)≤1. La suite est donc bornée, avec 0 comme minorant et 1 comme majorant.",
    hint: "Le dénominateur est toujours au moins égal à 1.",
    examTip: "Pour montrer qu'une suite est bornée, cherche une double inégalité valable pour tout n.", estimatedMinutes: 3, xpValue: 10,
    tags: ["suites", "bornée"]
  },
  {
    id: "limit-suite-02", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Monotonie"), type: "calculation", difficulty: 2,
    title: "Étudier une monotonie",
    statement: "Soit u_n=(2n−1)/(n+4). Étudier le sens de variation de (u_n).",
    expectedAnswer: "La suite est croissante",
    acceptedAnswers: ["croissante", "suite croissante"],
    correction: "u_{n+1}−u_n = 9/((n+5)(n+4)) > 0 pour tout n∈N. La suite est donc strictement croissante.",
    hint: "Calcule u_{n+1}−u_n et mets au même dénominateur.",
    examTip: "Le signe de u_{n+1}−u_n donne directement la monotonie.", estimatedMinutes: 5, xpValue: 17,
    tags: ["suites", "monotonie"]
  },
  {
    id: "limit-suite-03", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Suite arithmétique"), type: "calculation", difficulty: 1,
    title: "Terme d'une suite arithmétique",
    statement: "Une suite arithmétique vérifie u_2=−3 et r=1/2. Déterminer u_n.",
    expectedAnswer: "u_n=(n−8)/2",
    acceptedAnswers: ["(n-8)/2", "n/2-4"],
    correction: "u_n=u_2+(n−2)r=−3+(n−2)/2=(n−8)/2.",
    hint: "Utilise u_n=u_p+(n−p)r.",
    examTip: "Choisis un rang connu comme point de départ, pas forcément u_0.", estimatedMinutes: 3, xpValue: 10,
    tags: ["suites arithmétiques"]
  },
  {
    id: "limit-suite-04", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Suite géométrique"), type: "calculation", difficulty: 1,
    title: "Terme d'une suite géométrique",
    statement: "Une suite géométrique vérifie u_0=1 et q=√3. Déterminer u_n.",
    expectedAnswer: "u_n=(√3)^n",
    acceptedAnswers: ["(√3)^n", "3^(n/2)"],
    correction: "Par définition d'une suite géométrique, u_n=u_0q^n, donc u_n=(√3)^n.",
    hint: "Le premier terme vaut 1.",
    examTip: "Ne confonds pas la raison q avec un terme de la suite.", estimatedMinutes: 2, xpValue: 8,
    tags: ["suites géométriques"]
  },
  {
    id: "limit-suite-05", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Limite finie"), type: "calculation", difficulty: 1,
    title: "Limite vers 3",
    statement: "Calculer la limite de u_n=3+2/(n+1) quand n→+∞.",
    expectedAnswer: "3",
    acceptedAnswers: ["3"],
    correction: "Comme 2/(n+1)→0, on obtient u_n→3.",
    hint: "Utilise la limite de 1/n.",
    examTip: "Sépare la constante de la partie qui tend vers 0.", estimatedMinutes: 2, xpValue: 8,
    tags: ["limites", "suite"]
  },
  {
    id: "limit-suite-06", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Limite infinie"), type: "calculation", difficulty: 1,
    title: "Divergence vers +∞",
    statement: "Déterminer la limite de u_n=√n−5.",
    expectedAnswer: "+∞",
    acceptedAnswers: ["+∞", "infini", "plus l'infini"],
    correction: "√n→+∞, donc √n−5→+∞.",
    hint: "Soustraire une constante ne change pas une divergence vers +∞.",
    examTip: "Repère d'abord la suite de référence dominante.", estimatedMinutes: 2, xpValue: 8,
    tags: ["limites", "infini"]
  },
  {
    id: "limit-suite-07", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Produit"), type: "calculation", difficulty: 2,
    title: "Produit de suites",
    statement: "Calculer lim n→∞ (6n²−n+1)(−2n⁷+n⁴−n).",
    expectedAnswer: "−∞",
    acceptedAnswers: ["-∞", "−∞", "moins l'infini"],
    correction: "Le premier facteur est équivalent à 6n²>0 et le second à −2n⁷<0. Le produit se comporte comme −12n⁹, donc tend vers −∞.",
    hint: "Regarde les termes dominants.",
    examTip: "Pour un produit de polynômes, les termes de plus haut degré contrôlent le comportement à l'infini.", estimatedMinutes: 4, xpValue: 14,
    tags: ["limites", "produit", "termes dominants"]
  },
  {
    id: "limit-suite-08", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Théorème des gendarmes"), type: "proof", difficulty: 2,
    title: "Encadrer une suite oscillante",
    statement: "Pour u_n=sin(n)/(n³+1), montrer que u_n→0.",
    expectedAnswer: "−1/(n³+1)≤u_n≤1/(n³+1), donc u_n→0",
    correction: "Comme −1≤sin(n)≤1 et n³+1>0, on obtient −1/(n³+1)≤u_n≤1/(n³+1). Les deux bornes tendent vers 0. Par encadrement, u_n→0.",
    hint: "Utilise −1≤sin(n)≤1.",
    examTip: "Le théorème des gendarmes est particulièrement utile quand le numérateur oscille.", estimatedMinutes: 4, xpValue: 14,
    tags: ["gendarmes", "sinus", "limites"]
  },
  {
    id: "limit-suite-09", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Suite géométrique"), type: "calculation", difficulty: 2,
    title: "Cas |q|<1",
    statement: "Calculer la limite de u_n=3−(−7/9)^n.",
    expectedAnswer: "3",
    acceptedAnswers: ["3"],
    correction: "|−7/9|<1, donc (−7/9)^n→0. Ainsi u_n→3.",
    hint: "Compare la valeur absolue de la raison à 1.",
    examTip: "Le signe alterné n'empêche pas la convergence lorsque |q|<1.", estimatedMinutes: 3, xpValue: 10,
    tags: ["q^n", "convergence"]
  },
  {
    id: "limit-suite-10", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Suite récurrente"), type: "multi-step", difficulty: 3,
    title: "Limite d'une suite récurrente",
    statement: "On définit u_0=2 et u_{n+1}=(5u_n−1)/(u_n+3). Déterminer le point fixe positif de f(x)=(5x−1)/(x+3).",
    expectedAnswer: "(−1+√6)/2",
    correction: "Résoudre f(x)=x : (5x−1)/(x+3)=x donne x²−2x+1=0 si l'expression est correctement simplifiée. Pour cette fonction, le point fixe est en réalité x=1. On retient donc l=1 pour toute suite convergente vers un point fixe.",
    hint: "Commence par résoudre f(x)=x.",
    examTip: "Vérifie l'algèbre du point fixe avant de conclure sur la limite.", estimatedMinutes: 5, xpValue: 20,
    tags: ["récurrence", "point fixe"]
  },
  {
    id: "limit-suite-11", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Limite rationnelle"), type: "calculation", difficulty: 2,
    title: "Quotient de polynômes",
    statement: "Calculer lim n→∞ (n+2)/(n+8).",
    expectedAnswer: "1",
    acceptedAnswers: ["1"],
    correction: "En divisant numérateur et dénominateur par n, on obtient (1+2/n)/(1+8/n)→1.",
    hint: "Divise par la plus grande puissance de n.",
    examTip: "Même degré au numérateur et au dénominateur → rapport des coefficients dominants.", estimatedMinutes: 3, xpValue: 10,
    tags: ["limites", "quotient"]
  },
  {
    id: "limit-suite-12", mode: "BASE", source: "APPROVED",
    target: target("Limite d'une suite numérique", "Suite récurrente"), type: "multi-step", difficulty: 3,
    title: "Monotone et bornée",
    statement: "Soit u_0=4 et u_{n+1}=u_n/2+3/2. Montrer que la suite est convergente puis déterminer sa limite.",
    expectedAnswer: "La suite converge vers 3",
    correction: "On montre par récurrence que u_n>0. De plus, u_{n+1}−u_n=(3−u_n)/2. La suite décroît tant que u_n>3 et reste minorée par 3. Elle est donc convergente. Si u_n→l, alors l=l/2+3/2, donc l=3.",
    hint: "Cherche un intervalle stable autour de 3.",
    examTip: "Pour une récurrence affine, le point fixe est souvent la bonne borne à tester.", estimatedMinutes: 6, xpValue: 24,
    tags: ["récurrence", "convergence", "point fixe"]
  },
];
