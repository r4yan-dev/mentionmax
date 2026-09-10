import { useEffect } from "react";
import { recordLearningEvent } from "../../services/learning/weakPointsService";

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
        const conceptIds = generated?.conceptIds?.length ? generated.conceptIds : [`quiz-question-${slugify(question)}`];
        const topic = generated?.topic || question.slice(0, 180);
        const difficultyMap: Record<string, number> = { easy: 2, medium: 3, hard: 5 };

        void Promise.all(conceptIds.map((conceptId) => recordLearningEvent({
          source: "quiz",
          outcome: correct ? "correct" : "incorrect",
          subjectId: context?.subject ?? "unknown",
          trackId: context?.track ?? undefined,
          chapter: context?.chapter || quizTitle,
          topic,
          conceptId,
          pointsEarned: correct ? 1 : 0,
          pointsPossible: 1,
          weaknessPoints: correct ? 0 : 2,
          difficulty: difficultyMap[generated?.difficulty ?? "medium"] ?? 3,
          metadata: {
            quizTitle,
            question,
            itemIndex,
            totalItems,
            answerCorrect: correct,
            weaknessSignal: correct ? "none" : "quiz_mistake",
            generationContext: context ?? null,
            generatedConcept: generated ?? null,
            telemetry: "generator-concept-v1",
          },
        })));
      }, 0);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  return null;
}
