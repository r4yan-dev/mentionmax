import type { ExerciseQuestion } from "./ExerciseEngine";

export const exerciseBank: ExerciseQuestion[] = [
  {
    id: 101,
    subject: "Mathematics",
    chapter: "Functions",
    title: "Simple derivative",
    statement: "Let f(x) = x² + 3x. Calculate f'(2).",
    acceptedAnswers: ["7"],
    explanation: "f'(x) = 2x + 3, so f'(2) = 7.",
    hint: "Differentiate first, then substitute x = 2.",
    difficulty: "Easy",
    duration: 8,
  },
  {
    id: 102,
    subject: "Mathematics",
    chapter: "Sequences",
    title: "Arithmetic sequence",
    statement:
      "An arithmetic sequence has first term 5 and common difference 3. What is its sixth term?",
    acceptedAnswers: ["20"],
    explanation: "u₆ = u₁ + 5r = 5 + 5(3) = 20.",
    hint: "Use uₙ = u₁ + (n − 1)r.",
    difficulty: "Medium",
    duration: 10,
  },
  {
    id: 103,
    subject: "Physics-Chemistry",
    chapter: "Electric circuits",
    title: "Ohm's law",
    statement:
      "A resistor of 4 Ω is connected to a 12 V source. Calculate the current in amperes.",
    acceptedAnswers: ["3"],
    explanation: "Ohm's law gives I = U/R = 12/4 = 3 A.",
    hint: "Use I = U/R.",
    difficulty: "Easy",
    duration: 8,
  },
  {
    id: 104,
    subject: "Physics-Chemistry",
    chapter: "Mechanics",
    title: "Speed calculation",
    statement:
      "A car travels 120 m in 10 s. Calculate its average speed in m/s.",
    acceptedAnswers: ["12"],
    explanation: "Average speed = distance/time = 120/10 = 12 m/s.",
    hint: "Divide distance by time.",
    difficulty: "Easy",
    duration: 7,
  },
  {
    id: 105,
    subject: "SVT",
    chapter: "Genetics",
    title: "DNA bases",
    statement: "How many different nitrogenous bases are found in DNA?",
    acceptedAnswers: ["4", "four"],
    explanation:
      "DNA contains four nitrogenous bases: adenine, thymine, cytosine and guanine.",
    hint: "Think of A, T, C and G.",
    difficulty: "Easy",
    duration: 6,
  },
  {
    id: 106,
    subject: "Français",
    chapter: "Argumentation",
    title: "Central position",
    statement:
      "In an argumentative essay, what is the name of the central position the writer defends?",
    acceptedAnswers: ["thesis", "la thèse", "thèse"],
    explanation:
      "The thesis is the central position or claim that the writer develops and supports.",
    hint: "It is the central claim of the argument.",
    difficulty: "Medium",
    duration: 10,
  },
  {
    id: 107,
    subject: "English",
    chapter: "Writing",
    title: "Formal structure",
    statement:
      "Which should normally come first in a formal argumentative paragraph: evidence or the main claim?",
    acceptedAnswers: ["claim", "main claim", "the claim", "the main claim"],
    explanation:
      "The main claim establishes the point before evidence is used to support it.",
    hint: "State the point before proving it.",
    difficulty: "Easy",
    duration: 7,
  },
];
