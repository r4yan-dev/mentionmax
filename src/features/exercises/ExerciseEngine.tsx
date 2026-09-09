import { useState } from "react";
import { recordLearningEvent } from "../../services/learning/weakPointsService";

export type ExerciseQuestion = {
  id: number;
  subject: string;
  chapter: string;
  title: string;
  statement: string;
  acceptedAnswers: string[];
  explanation: string;
  hint: string;
  difficulty: "Easy" | "Medium" | "Hard";
  duration: number;
  topic?: string;
  conceptId?: string;
};

type Props = {
  exercise: ExerciseQuestion;
  completed: boolean;
  onComplete: () => void;
  onBack: () => void;
  onNext: () => void;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(",", ".");
}

function difficultyValue(value: ExerciseQuestion["difficulty"]) {
  if (value === "Easy") return 1;
  if (value === "Hard") return 4;
  return 3;
}

function subjectIdFromLabel(value: string) {
  const normalized = value.toLowerCase();
  if (normalized.includes("math")) return "maths";
  if (normalized.includes("phys") || normalized.includes("chim")) return "physique-chimie";
  if (normalized.includes("svt")) return "svt";
  if (normalized.includes("anglais") || normalized.includes("english")) return "anglais";
  if (normalized.includes("philo")) return "philosophie";
  return value;
}

export default function ExerciseEngine({
  exercise,
  completed,
  onComplete,
  onBack,
  onNext,
}: Props) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(completed);
  const [showHint, setShowHint] = useState(false);

  async function checkAnswer() {
    const value = normalize(answer);
    if (!value) return;

    const valid = exercise.acceptedAnswers.some(
      (accepted) => normalize(accepted) === value,
    );

    setCorrect(valid);
    setSubmitted(true);

    void recordLearningEvent({
      source: "exercise",
      subjectId: subjectIdFromLabel(exercise.subject),
      chapter: exercise.chapter,
      topic: exercise.topic ?? exercise.title,
      conceptId: exercise.conceptId ?? exercise.topic ?? exercise.chapter,
      outcome: valid ? "correct" : "incorrect",
      pointsEarned: valid ? 1 : 0,
      pointsPossible: 1,
      difficulty: difficultyValue(exercise.difficulty),
      mistakeType: valid ? null : "answer_mismatch",
      metadata: {
        exerciseId: exercise.id,
        durationMinutes: exercise.duration,
        usedHint: showHint,
      },
    });

    if (valid) onComplete();
  }

  return (
    <section className="engine">
      <button className="back-button" onClick={onBack}>
        ← Exercise library
      </button>

      <div className="engine-meta">
        <span>{exercise.subject}</span>
        <span>·</span>
        <span>{exercise.chapter}</span>
        <span>·</span>
        <span>{exercise.difficulty}</span>
        <span>·</span>
        <span>{exercise.duration} min</span>
      </div>

      <h1>{exercise.title}</h1>

      <div className="statement">
        <span className="eyebrow">QUESTION</span>
        <p>{exercise.statement}</p>
      </div>

      <div className="answer-section">
        <label htmlFor="exercise-answer">Your answer</label>

        <input
          id="exercise-answer"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              void checkAnswer();
            }
          }}
          placeholder="Enter your answer..."
          disabled={correct}
        />

        <div className="engine-actions">
          <button
            className="button secondary"
            onClick={() => setShowHint((value) => !value)}
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>

          {!correct && (
            <button
              className="button primary"
              disabled={!answer.trim()}
              onClick={() => void checkAnswer()}
            >
              Check answer
            </button>
          )}
        </div>
      </div>

      {showHint && (
        <div className="hint-box">
          <strong>Hint</strong>
          <p>{exercise.hint}</p>
        </div>
      )}

      {submitted && (
        <div className={correct ? "result correct" : "result incorrect"}>
          <div className="result-icon">{correct ? "✓" : "!"}</div>

          <div>
            <strong>{correct ? "Correct." : "Not quite."}</strong>

            {!correct && (
              <p>
                Your answer does not match the expected answer. Try again.
              </p>
            )}

            {correct && (
              <>
                <p>{exercise.explanation}</p>
                <button className="button primary" onClick={onNext}>
                  Next exercise →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
