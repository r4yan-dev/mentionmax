import { useState } from "react";

export default function FocusExercise() {
  const [selected, setSelected] =
    useState<string | null>(null);

  const choices = [
    "La fonction est strictement croissante.",
    "La fonction est strictement décroissante.",
    "La fonction est constante.",
    "La fonction n'est pas définie.",
  ];

  return (
    <div className="focus-exercise-page">
      <div className="focus-exercise-header">
        <span className="badge badge--brand">
          Mathématiques
        </span>

        <span className="text-muted">
          Question 1 sur 10
        </span>
      </div>

      <section className="focus-question-card">
        <p className="focus-question-card__eyebrow">
          Fonctions · Dérivation
        </p>

        <h1>
          Étudie le sens de variation de la
          fonction proposée.
        </h1>

        <div className="focus-problem-box">
          <strong>
            f(x) = x² + 2x - 3
          </strong>

          <span>
            Détermine la variation de f sur son
            domaine de définition.
          </span>
        </div>

        <div className="focus-answer-list">
          {choices.map((choice, index) => {
            const letter =
              String.fromCharCode(65 + index);

            return (
              <button
                key={choice}
                type="button"
                className={`focus-answer${
                  selected === choice
                    ? " selected"
                    : ""
                }`}
                onClick={() =>
                  setSelected(choice)
                }
              >
                <span className="focus-answer__letter">
                  {letter}
                </span>

                <span>{choice}</span>
              </button>
            );
          })}
        </div>

        <div className="focus-question-footer">
          <span>
            {selected
              ? "Réponse sélectionnée"
              : "Sélectionne une réponse"}
          </span>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!selected}
          >
            Valider
          </button>
        </div>
      </section>
    </div>
  );
}
