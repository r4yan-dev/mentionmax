export type MoroccanMathsGenerationProfile = {
  subject: "maths";
  track: "SMA" | "SMB" | "ALL_MATH_TRACKS";
  version: number;
  coreRules: string[];
  instructionPatterns: Record<string, string>;
  exerciseArchitectures: Record<string, string[]>;
  difficultySignals: Record<string, string[]>;
};

export const moroccanMathsGenerationProfile: MoroccanMathsGenerationProfile = {
  subject: "maths",
  track: "ALL_MATH_TRACKS",
  version: 1,
  coreRules: [
    "Generate connected mathematical problems, not a pile of unrelated questions.",
    "Later questions should reuse earlier results whenever the source pattern supports it.",
    "Difficulty should come primarily from reasoning, deduction and representation changes, not ugly coefficients.",
    "Keep wording concise, formal and appropriate for Moroccan 2BAC mathematical assessment.",
    "Build the barème together with the questions and avoid double-counting the same mathematical evidence.",
    "Do not introduce concepts that are absent from the supplied source or selected curriculum.",
    "Use French mathematical instruction conventions and preserve standard notation.",
    "Use LaTeX for mathematical expressions and never place raw delimiter wrappers inside JSON strings.",
  ],
  instructionPatterns: {
    "Montrer que": "Proof of a stated mathematical result; the following question may depend on it.",
    "Vérifier que": "Short direct verification or calculation, usually lower cognitive load.",
    "En déduire": "Mandatory dependency on a previously established result.",
    "Déduire": "Infer a consequence from an already proven property.",
    "Étudier": "Carry out a structured mathematical study such as sign, variation, continuity or concavity.",
    "Dresser le tableau": "Organize previously established sign/variation information into a formal table.",
    "Interpréter géométriquement": "Translate an analytic result into a geometric meaning.",
    "Construire / Tracer": "Final representation step based on previously established properties.",
  },
  exerciseArchitectures: {
    functions: [
      "domain",
      "continuity",
      "limits",
      "infinite branch",
      "derivative",
      "sign of derivative",
      "variation table",
      "zeros or equation",
      "relative position",
      "tangent or asymptote",
      "concavity",
      "graph",
      "integral",
    ],
    sequences: [
      "initial terms",
      "invariant interval or bounds",
      "positivity",
      "monotonicity",
      "convergence",
      "limit",
      "estimate or inequality",
      "optional transformation to an auxiliary sequence",
    ],
    complexNumbers: [
      "equation in C",
      "algebraic form",
      "module and argument",
      "trigonometric form",
      "affixes",
      "rotation, translation or homothety",
      "geometric conclusion such as alignment, angle or triangle property",
    ],
    integrals: [
      "recognize or determine a primitive",
      "integration by parts when appropriate",
      "calculate a definite integral",
      "deduce another integral",
      "calculate an area",
    ],
    probabilities: [
      "define the sample space",
      "calculate event probability",
      "define random variable values",
      "determine the probability law",
      "expectation",
      "standard deviation",
    ],
    differentialEquations: [
      "solve the general equation",
      "apply initial conditions",
      "identify the particular solution",
      "verify",
    ],
    reciprocalFunctions: [
      "continuity",
      "strict monotonicity",
      "image/domain",
      "existence of reciprocal",
      "evaluate inverse values",
      "compare inverse values using monotonicity",
      "derive the inverse formula",
    ],
    auxiliaryFunction: [
      "study an auxiliary function",
      "prove a sign property",
      "relate it to the derivative of the main function",
      "deduce monotonicity",
      "continue with equation, graph or application",
    ],
    geometry3D: [
      "sphere center/radius",
      "vectors and cross product",
      "plane equation",
      "distance",
      "section circle",
      "perpendicular line",
      "intersection and center/contact point",
    ],
    independentShortQuestions: [
      "Use a short independent block only when explicitly requested or when matching a source pattern.",
      "Keep each item self-contained and do not create artificial dependencies.",
    ],
  },
  difficultySignals: {
    easy: ["direct calculation", "standard formula", "short verification", "single concept"],
    medium: ["multi-step application", "standard proof", "sign analysis", "use of a previous result"],
    hard: ["non-obvious deduction", "auxiliary function", "multiple dependent steps", "analytic/geometric translation", "synthesis", "sharp estimate"],
  },
};
