import { useEffect } from "react";
import { recordLearningEvent } from "../../services/learning/weakPointsService";
import { spotWeakPoint } from "../../services/learning/weakPointsSpot";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100);
}

function getQuizRoot(target: HTMLElement) {
  return target.closest<HTMLElement>(".generator-quiz");
}

function getQuestionIndex(root: HTMLElement) {
  const label = root.querySelector<HTMLElement>(".generator-result__label")?.textContent ?? "";
  const match = label.match(/Question\s+(\d+)\s*\/\s*(\d+)/i);
  return { itemIndex: match ? Number(match[1]) - 1 : 0, totalItems: match ? Number(match[2]) : 1 };
}

function getContext() {
  return typeof window !== "undefined" ? window.__mentionmaxLearningContext : undefined;
}

function getGeneratedConcepts(title: string, question: string) {
  if (typeof window === "undefined") return undefined;
  return window.__mentionmaxGeneratedQuizConcepts?.[`${slugify(title)}::${slugify(question)}`];
}

export default function QuizLearningTelemetry() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const rawTarget = event.target;
      if (!(rawTarget instanceof Element)) return;
      const choice = rawTarget.closest<HTMLButtonElement>(".generator-quiz-choice");
      if (!choice) return;
      const root = getQuizRoot(choice);
      if (!root) return;

      const context = getContext();
      const quizTitle = root.closest<HTMLElement>(".generator-result")?.querySelector("h2")?.textContent?.trim() ?? "Quiz";
      const question = root.querySelector<HTMLElement>(".generator-quiz-card h3")?.textContent?.trim() ?? "";
      const { itemIndex, totalItems } = getQuestionIndex(root);

      window.setTimeout(() => {
        const correct = choice.classList.contains("is-correct");
        const wrong = choice.classList.contains("is-wrong");
        if (!correct && !wrong && !root.querySelector(".generator-quiz-feedback")) return;

        const generated = getGeneratedConcepts(quizTitle, question);
        const difficultyMap: Record<string, number> = { easy: 2, medium: 3, hard: 5 };
        const baseMetadata = {
          quizTitle,
          question,
          itemIndex,
          totalItems,
          answerCorrect: correct,
          generationContext: context ?? null,
          generatedConcept: generated ?? null,
          telemetry: "generator-concept-v2",
        };

        if (correct) {
          const conceptIds = generated?.conceptIds?.length ? generated.conceptIds : [`quiz-question-${slugify(question)}`];
          const topic = generated?.topic || question.slice(0, 180);
          void Promise.all(conceptIds.map((conceptId) => recordLearningEvent({
            source: "quiz",
            outcome: "correct",
            subjectId: context?.subject ?? "unknown",
            trackId: context?.track ?? undefined,
            chapter: context?.chapter || quizTitle,
            topic,
            conceptId,
            pointsEarned: 1,
            pointsPossible: 1,
            weaknessPoints: 0,
            difficulty: difficultyMap[generated?.difficulty ?? "medium"] ?? 3,
            metadata: { ...baseMetadata, weaknessSignal: "none" },
          })));
          return;
        }

        if (!wrong) return;

        const selectedAnswer = choice.textContent?.trim() || "Réponse incorrecte";
        const correctChoice = root.querySelector<HTMLButtonElement>(".generator-quiz-choice.is-correct");
        const correctAnswer = correctChoice?.textContent?.trim() || root.querySelector<HTMLElement>(".generator-quiz-feedback")?.textContent?.trim() || "Voir la correction du quiz";

        void (async () => {
          try {
            const spotted = await spotWeakPoint({
              subjectId: context?.subject ?? generated?.subjectId ?? "unknown",
              trackId: context?.track ?? undefined,
              chapter: context?.chapter || generated?.chapter || quizTitle,
              topic: generated?.topic || question.slice(0, 180),
              question,
              selectedAnswer,
              correctAnswer,
              quizTitle,
            });

            await recordLearningEvent({
              source: "quiz",
              outcome: "incorrect",
              subjectId: spotted.subjectId || context?.subject || generated?.subjectId || "unknown",
              trackId: spotted.trackId || context?.track || undefined,
              chapter: spotted.chapter || context?.chapter || generated?.chapter || quizTitle,
              topic: spotted.topic || generated?.topic || question.slice(0, 180),
              conceptId: spotted.conceptId,
              pointsEarned: 0,
              pointsPossible: 1,
              weaknessPoints: spotted.weaknessPoints,
              difficulty: difficultyMap[generated?.difficulty ?? "medium"] ?? 3,
              mistakeType: spotted.mistakeType,
              metadata: {
                ...baseMetadata,
                weaknessSignal: "ai_spotted_quiz_mistake",
                weakPointAnalysis: spotted,
              },
            });
          } catch (error) {
            const conceptIds = generated?.conceptIds?.length ? generated.conceptIds : [`quiz-question-${slugify(question)}`];
            const topic = generated?.topic || question.slice(0, 180);
            await Promise.all(conceptIds.map((conceptId) => recordLearningEvent({
              source: "quiz",
              outcome: "incorrect",
              subjectId: context?.subject ?? "unknown",
              trackId: context?.track ?? undefined,
              chapter: context?.chapter || quizTitle,
              topic,
              conceptId,
              pointsEarned: 0,
              pointsPossible: 1,
              weaknessPoints: 2,
              difficulty: difficultyMap[generated?.difficulty ?? "medium"] ?? 3,
              metadata: {
                ...baseMetadata,
                weaknessSignal: "quiz_mistake_fallback",
                weakPointSpotterError: error instanceof Error ? error.message : String(error),
              },
            })));
          }
        })();
      }, 0);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  return null;
}
