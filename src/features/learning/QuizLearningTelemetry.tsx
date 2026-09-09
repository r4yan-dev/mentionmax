import { useEffect } from "react";
import { recordLearningEvent } from "../../services/learning/weakPointsService";
import { spotWeakPoint } from "../../services/learning/weakPointsSpot";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
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

function addActionButtons(root: HTMLElement, context: ReturnType<typeof getContext>, question: string, quizTitle: string, itemIndex: number, totalItems: number, conceptId: string) {
  const feedback = root.querySelector<HTMLElement>(".generator-quiz-feedback.is-wrong");
  if (!feedback || feedback.querySelector(".quiz-learning-actions")) return;

  const actions = document.createElement("div");
  actions.className = "quiz-learning-actions";
  actions.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;margin-top:12px";

  const addWeakness = document.createElement("button");
  addWeakness.type = "button";
  addWeakness.textContent = "Ajouter à mes points faibles";
  addWeakness.style.cssText = "border:1px solid #d6e7e2;border-radius:9px;padding:8px 10px;background:#fff;color:#28645d;font:inherit;font-size:8px;font-weight:800;cursor:pointer";

  const askAI = document.createElement("button");
  askAI.type = "button";
  askAI.textContent = "Pourquoi je me suis trompé ?";
  askAI.style.cssText = "border:1px solid #cde7e2;border-radius:9px;padding:8px 10px;background:#eaf9f6;color:#0b817d;font:inherit;font-size:8px;font-weight:800;cursor:pointer";

  const status = document.createElement("span");
  status.style.cssText = "display:block;width:100%;color:#66817b;font-size:8px;font-weight:700";

  addWeakness.addEventListener("click", () => {
    addWeakness.disabled = true;
    addWeakness.textContent = "✓ Ajouté";
    void recordLearningEvent({
      source: "quiz",
      outcome: "incorrect",
      subjectId: context?.subject ?? "unknown",
      trackId: context?.track ?? undefined,
      chapter: context?.chapter || quizTitle,
      topic: question.slice(0, 180),
      conceptId,
      pointsEarned: 0,
      pointsPossible: 1,
      weaknessPoints: 3,
      metadata: { quizTitle, question, itemIndex, totalItems, confirmedByStudent: true, weaknessSignal: "student_confirmed_quiz_mistake", telemetry: "generator-dom-v4" },
    });
  });

  askAI.addEventListener("click", async () => {
    askAI.disabled = true;
    askAI.textContent = "Analyse…";
    status.textContent = "L’IA cherche la notion précise derrière l’erreur…";
    try {
      const result = await spotWeakPoint({
        subjectId: context?.subject ?? "unknown",
        trackId: context?.track,
        chapter: context?.chapter || quizTitle,
        topic: question,
        question,
        selectedAnswer: "Réponse incorrecte",
        correctAnswer: "Réponse affichée comme correcte dans le quiz",
        quizTitle,
      });
      status.textContent = result.message;
      askAI.textContent = "✓ Analyse terminée";
      void recordLearningEvent({
        source: "quiz",
        outcome: "incorrect",
        subjectId: result.subjectId || context?.subject || "unknown",
        trackId: result.trackId || context?.track,
        chapter: result.chapter || context?.chapter || quizTitle,
        topic: result.topic || question.slice(0, 180),
        conceptId: result.conceptId || conceptId,
        weaknessPoints: Math.max(3, Math.min(10, result.weaknessPoints ?? 4)),
        pointsEarned: 0,
        pointsPossible: 1,
        mistakeType: result.mistakeType || "quiz_mistake",
        metadata: { quizTitle, question, itemIndex, totalItems, confirmedByStudent: true, aiSpot: result },
      });
    } catch (error) {
      askAI.disabled = false;
      askAI.textContent = "Pourquoi je me suis trompé ?";
      status.textContent = error instanceof Error ? error.message : "Analyse IA indisponible.";
    }
  });

  actions.append(addWeakness, askAI, status);
  feedback.appendChild(actions);
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
      const conceptId = `quiz-${slugify(quizTitle)}-q${itemIndex + 1}`;

      window.setTimeout(() => {
        const correct = choice.classList.contains("is-correct");
        const wrong = choice.classList.contains("is-wrong");
        if (!correct && !wrong && !root.querySelector(".generator-quiz-feedback")) return;

        void recordLearningEvent({
          source: "quiz",
          outcome: correct ? "correct" : "incorrect",
          subjectId: context?.subject ?? "unknown",
          trackId: context?.track ?? undefined,
          chapter: context?.chapter || quizTitle,
          topic: question.slice(0, 180),
          conceptId,
          pointsEarned: correct ? 1 : 0,
          pointsPossible: 1,
          weaknessPoints: correct ? 0 : 2,
          metadata: {
            quizTitle,
            question,
            itemIndex,
            totalItems,
            answerCorrect: correct,
            weaknessSignal: correct ? "none" : "ai_quiz_mistake",
            generationContext: context ?? null,
            telemetry: "generator-dom-v4",
          },
        });

        if (!correct) addActionButtons(root, context, question, quizTitle, itemIndex, totalItems, conceptId);
      }, 0);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
  return null;
}
