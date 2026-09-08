import { supabase } from "../../lib/supabase";
import { aiService } from "./aiService";
import type { Exercise } from "../../types/content";
import type { TrackId } from "../../types/academic";

export type CorrectionVerdict = "correct" | "mostly_correct" | "partially_correct" | "incorrect";

export type AICorrectionResult = {
  score: number | null;
  verdict: CorrectionVerdict;
  summary: string;
  strengths: string[];
  errors: Array<{
    location: string;
    expected: string;
    observed: string;
    fix: string;
  }>;
  correctedSolution: string;
  nextStep: string;
  raw?: string;
};

function clampScore(value: unknown) {
  if (typeof value !== "number" || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(20, Math.round(value)));
}

function parseCorrection(raw: string): AICorrectionResult {
  const cleaned = raw.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        parsed = JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        parsed = null;
      }
    }
  }

  if (!parsed || typeof parsed !== "object") {
    return {
      score: null,
      verdict: "partially_correct",
      summary: raw.trim() || "La correction IA n’a pas renvoyé un résultat exploitable.",
      strengths: [],
      errors: [],
      correctedSolution: "",
      nextStep: "Relis ton raisonnement puis compare chaque étape avec le cours.",
      raw,
    };
  }

  const value = parsed as Record<string, unknown>;
  const verdicts: CorrectionVerdict[] = ["correct", "mostly_correct", "partially_correct", "incorrect"];
  const verdict = verdicts.includes(value.verdict as CorrectionVerdict)
    ? (value.verdict as CorrectionVerdict)
    : "partially_correct";

  const strengths = Array.isArray(value.strengths) ? value.strengths.map(String).slice(0, 8) : [];
  const errors = Array.isArray(value.errors)
    ? value.errors.slice(0, 12).map((item) => {
        const error = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
        return {
          location: String(error.location ?? "Étape non précisée"),
          expected: String(error.expected ?? ""),
          observed: String(error.observed ?? ""),
          fix: String(error.fix ?? ""),
        };
      })
    : [];

  return {
    score: clampScore(value.score),
    verdict,
    summary: String(value.summary ?? "Correction terminée."),
    strengths,
    errors,
    correctedSolution: String(value.correctedSolution ?? ""),
    nextStep: String(value.nextStep ?? "Refais l’exercice en corrigeant l’étape signalée."),
    raw,
  };
}

export async function correctExerciseWithAI(params: {
  exercise: Exercise;
  answers: string[];
  trackId: TrackId;
}) {
  const { exercise, answers, trackId } = params;
  const nonEmptyAnswers = answers.map((answer, index) => `Partie ${String.fromCharCode(97 + index)}:\n${answer.trim()}`).filter(Boolean).join("\n\n");

  if (!nonEmptyAnswers.trim()) throw new Error("Écris au moins une réponse avant de lancer la correction.");

  const prompt = [
    "Tu es le correcteur pédagogique de MentionMax pour le programme marocain 2BAC.",
    "Corrige le raisonnement de l’élève, pas seulement le résultat final.",
    "Ne récompense pas une réponse correcte obtenue par une méthode mathématiquement invalide.",
    "Distingue clairement une erreur de calcul, une erreur de méthode, une justification manquante et une conclusion correcte.",
    "Utilise le niveau, le chapitre et la matière indiqués. N’invente aucune propriété ou donnée absente de l’énoncé.",
    "Retourne UNIQUEMENT un objet JSON valide, sans Markdown et sans texte avant ou après.",
    "Le champ score est un entier de 0 à 20. verdict vaut exactement correct, mostly_correct, partially_correct ou incorrect.",
    "Le champ errors est un tableau d’objets {location, expected, observed, fix}.",
    "Le champ correctedSolution doit donner une solution correcte et pédagogique, avec les étapes utiles.",
    "Schéma exact: {score, verdict, summary, strengths, errors, correctedSolution, nextStep}",
    "",
    `Parcours: ${trackId}`,
    `Matière: ${exercise.target.subjectId}`,
    `Chapitre: ${exercise.target.chapter}`,
    `Notion: ${exercise.target.topic}`,
    `Type: ${exercise.type}`,
    `Difficulté: ${exercise.difficulty}/5`,
    `Énoncé: ${exercise.statement}`,
    exercise.expectedAnswer ? `Réponse attendue: ${exercise.expectedAnswer}` : "",
    exercise.correction ? `Correction de référence: ${exercise.correction}` : "",
    `Réponse de l’élève:\n${nonEmptyAnswers}`,
  ].filter(Boolean).join("\n");

  const response = await aiService.run<string>({
    task: "correct",
    input: prompt,
    context: {
      product: "MentionMax",
      level: "2BAC",
      track: trackId,
      subject: exercise.target.subjectId,
      chapter: exercise.target.chapter,
      topic: exercise.target.topic,
      outputFormat: "strict-json",
    },
  });

  const result = parseCorrection(response.data);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("Utilisateur non authentifié.");

  const { error: saveError } = await supabase.from("ai_corrections").insert({
    user_id: userData.user.id,
    exercise_id: exercise.id,
    subject_id: exercise.target.subjectId,
    track_id: trackId,
    statement: exercise.statement,
    student_answers: answers,
    result,
    provider: response.provider,
  });

  if (saveError) throw saveError;

  return result;
}
