import type { LessonDocument } from "../../types/academic";

export const limiteSuiteLesson: LessonDocument = {
  id: "2bac-maths-limit-suite",
  title: "Limite d'une suite numérique",
  language: "fr",
  source: "APPROVED",
  subjectId: "maths",
  chapter: "Suites numériques",
  topic: "Limite d'une suite numérique",
  blocks: [
    {
      type: "title",
      title: "Limite d'une suite numérique",
    },
    {
      type: "intro",
      text: "Une suite numérique peut être bornée, monotone et convergente. L'étude de sa limite repose sur des résultats de comparaison, d'encadrement et sur les suites de référence.",
    },
    {
      type: "concept",
      title: "A. Rappel sur les suites",
      text: "Une suite est majorée s'il existe M tel que u_n ≤ M pour tout n. Elle est minorée s'il existe m tel que m ≤ u_n pour tout n. Elle est bornée lorsqu'elle est à la fois majorée et minorée. Une suite est croissante si u_n ≤ u_{n+1}, décroissante si u_n ≥ u_{n+1}, et constante si u_n = u_{n+1}.",
    },
    {
      type: "concept",
      title: "Suites arithmétiques",
      text: "Pour une suite arithmétique de raison r, u_{n+1}=u_n+r et u_n=u_p+(n-p)r. La somme de u_{n_0} à u_n vaut (n-n_0+1)(u_{n_0}+u_n)/2.",
    },
    {
      type: "formula",
      latex: "u_n=u_p+(n-p)r\\qquad ;\\qquad \\sum_{k=n_0}^{n}u_k=\\frac{n-n_0+1}{2}(u_{n_0}+u_n)",
    },
    {
      type: "concept",
      title: "Suites géométriques",
      text: "Pour une suite géométrique de raison q, u_{n+1}=q u_n et u_n=u_p q^{n-p}. Pour q≠1, la somme se calcule avec la formule géométrique. Ces suites servent ensuite de références pour les limites.",
    },
    {
      type: "formula",
      latex: "u_n=u_p q^{n-p}\\qquad ;\\qquad \\sum_{k=n_0}^{n}u_k=u_{n_0}\\frac{1-q^{n-n_0+1}}{1-q}",
    },
    {
      type: "concept",
      title: "B. Limite finie",
      text: "On dit que la suite (u_n) converge vers l si, à partir d'un certain rang, tous ses termes sont aussi proches de l que souhaité. La limite, lorsqu'elle existe, est unique.",
    },
    {
      type: "formula",
      latex: "\\lim_{n\\to+\\infty}u_n=l\\quad\\Longleftrightarrow\\quad\\forall\\varepsilon>0,\\;\\exists N_0,\\;n\\ge N_0\\Rightarrow |u_n-l|<\\varepsilon",
    },
    {
      type: "concept",
      title: "Limites de référence",
      text: "Les limites de référence essentielles sont 1/n → 0, 1/n^k → 0 pour k∈N*, 1/√n → 0, n^k → +∞ pour k>0 et √n → +∞.",
    },
    {
      type: "concept",
      title: "Limite infinie",
      text: "Une suite diverge vers +∞ lorsque ses termes deviennent arbitrairement grands à partir d'un certain rang. De façon analogue, elle diverge vers -∞ lorsque ses termes deviennent arbitrairement négatifs.",
    },
    {
      type: "formula",
      latex: "\\lim_{n\\to+\\infty}n^k=+\\infty\\;(k>0)\\qquad ;\\qquad \\lim_{n\\to+\\infty}\\sqrt n=+\\infty",
    },
    {
      type: "concept",
      title: "C. Opérations sur les limites",
      text: "On additionne les limites lorsque les expressions sont déterminées. Pour un produit ou un quotient, on utilise les règles de signe et la limite de l'inverse. Les formes indéterminées classiques sont +∞−∞, 0×∞, ∞/∞ et 0/0.",
    },
    {
      type: "formula",
      latex: "\\lim(u_n+v_n)=l+l'\\qquad ;\\qquad \\lim(u_nv_n)=ll'\\qquad ;\\qquad \\lim\\frac1{u_n}=\\frac1l\\;(l\\ne0)",
    },
    {
      type: "concept",
      title: "Relation d'ordre",
      text: "Si une suite convergente est finalement majorée par a, sa limite est ≤ a. Si elle est finalement minorée par b, sa limite est ≥ b. Le même principe fonctionne pour comparer deux suites convergentes.",
    },
    {
      type: "concept",
      title: "Théorème d'encadrement",
      text: "Si w_n ≤ u_n ≤ v_n à partir d'un certain rang et que w_n et v_n ont la même limite l, alors u_n converge vers l. Le théorème de comparaison permet aussi de conclure vers +∞ ou -∞.",
    },
    {
      type: "formula",
      latex: "w_n\\le u_n\\le v_n,\\quad \\lim w_n=\\lim v_n=l\\quad\\Longrightarrow\\quad\\lim u_n=l",
    },
    {
      type: "concept",
      title: "Suites monotones",
      text: "Une suite croissante et majorée est convergente. Une suite décroissante et minorée est convergente. Ce théorème prouve l'existence d'une limite finie mais ne donne pas sa valeur à lui seul.",
    },
    {
      type: "concept",
      title: "D. Cas de q^n",
      text: "Pour une suite q^n : si q>1, elle tend vers +∞ ; si q=1, elle vaut 1 ; si |q|<1, elle tend vers 0 ; si q≤-1, elle n'admet pas de limite finie en général.",
    },
    {
      type: "formula",
      latex: "|q|<1\\Rightarrow\\lim q^n=0\\qquad ;\\qquad q>1\\Rightarrow\\lim q^n=+\\infty",
    },
    {
      type: "concept",
      title: "Suite composée",
      text: "Si u_n → l et si f est continue en l, alors f(u_n) → f(l). Cette propriété permet de traiter directement les expressions construites à partir d'une suite déjà connue.",
    },
    {
      type: "formula",
      latex: "u_n\\to l\\;\\land\\;f\\text{ continue en }l\\;\\Longrightarrow\\;f(u_n)\\to f(l)",
    },
    {
      type: "concept",
      title: "Suite récurrente u_{n+1}=f(u_n)",
      text: "Pour une suite définie par récurrence, on cherche souvent un intervalle stable f(I)⊆I, puis la monotonie et la bornitude. Si la suite converge vers l et si f est continue, alors sa limite vérifie f(l)=l.",
    },
    {
      type: "method",
      title: "Méthode Bac",
      text: "1. Déterminer le domaine et la nature de la suite. 2. Chercher une formule connue, une comparaison ou un encadrement. 3. Pour une suite récurrente, étudier d'abord l'intervalle stable puis les variations. 4. Justifier la convergence avant de calculer la limite. 5. Pour une fraction, traiter séparément numérateur et dénominateur et surveiller les formes indéterminées.",
    },
    {
      type: "common-mistake",
      title: "Erreurs fréquentes",
      text: "Confondre convergence et monotonie, conclure qu'une suite majorée converge sans étudier sa monotonie, remplacer directement u_n par sa limite sans vérifier la continuité, ou oublier de lever une forme indéterminée.",
    },
    {
      type: "exam-tip",
      title: "Réflexe Bac",
      text: "Quand la limite n'est pas immédiate, cherche d'abord une suite de référence ou un encadrement. Une bonne justification vaut mieux qu'un résultat jeté depuis la calculatrice.",
    },
    {
      type: "recap",
      title: "À retenir",
      items: [
        "Une suite croissante et majorée converge.",
        "Une suite décroissante et minorée converge.",
        "1/n, 1/n^k et 1/√n tendent vers 0.",
        "Le théorème des gendarmes donne une limite par encadrement.",
        "|q|<1 entraîne q^n→0.",
        "Pour u_{n+1}=f(u_n), une limite éventuelle l vérifie f(l)=l si f est continue.",
      ],
    },
  ],
};
