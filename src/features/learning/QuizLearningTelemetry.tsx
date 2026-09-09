import { useEffect } from "react";
import { recordLearningEvent } from "../../services/learning/weakPointsService";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function getQuizRoot(target: HTMLElement) {
  return target.closest<HTMLElement>(".generator-quiz");
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

      const label = root.querySelector<HTMLElement>(".generator-result__label")?.textContent ?? "";
      const match = label.match(/Question\s+(\d+)\s*\/\s*(\d+)/i);
      const itemIndex = match ? Number(match[1]) - 1 : 0;
      const totalItems = match ? Number(match[2]) : 1;
      const question = root.querySelector<HTMLElement>(".generator-quiz-card h3")?.textContent?.trim() ?? "";
      const quizTitle = root.closest<HTMLElement>(".generator-result")?.querySelector("h2")?.textContent?.trim() ?? "Quiz";
      const correct = choice.classList.contains("is-correct");
      const conceptId = `quiz-${slugify(quizTitle)}-q${itemIndex + 1}`;

      void recordLearningEvent({
        source: "quiz",
        outcome: correct ? "correct" : "incorrect",
        subjectId: "unknown",
        chapter: quizTitle,
        topic: question.slice(0, 180),
        conceptId,
        pointsEarned: correct ? 1 : 0,
        pointsPossible: 1,
        metadata: {
          quizTitle,
          question,
          itemIndex,
          totalItems,
          answerCorrect: correct,
          telemetry: "generator-dom-v1",
        },
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
