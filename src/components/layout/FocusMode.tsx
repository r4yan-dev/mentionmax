import {
  Link,
  Outlet,
  useParams,
} from "react-router-dom";
import { Icon } from "../navigation/Icon";
import { useState } from "react";

export function FocusMode() {
  const [aiOpen, setAiOpen] =
    useState(false);

  const {
    matiere,
    chapitre,
    exerciseId,
  } = useParams();

  const subject =
    matiere
      ? decodeURIComponent(matiere)
      : "Matière";

  const chapter =
    chapitre
      ? decodeURIComponent(chapitre)
      : "Chapitre";

  const exercise =
    exerciseId || "1";

  return (
    <div className="focus-layout">
      <header className="focus-bar">

        <div className="focus-progress-info">
          <div className="focus-breadcrumb">
            <span>{subject}</span>
            <span>›</span>
            <span>{chapter}</span>
            <span>›</span>

            <strong>
              Exercice {exercise}/10
            </strong>
          </div>

          <div className="focus-set-progress">
            <span
              className="focus-set-progress__fill"
              style={{
                width: `${Math.min(
                  Number(exercise) * 10,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <Link
          to="/accueil"
          className="focus-brand"
        >
          <span className="sidebar-logo__mark">
            M
          </span>

          <span className="sidebar-logo__text">
            MentionMax
          </span>
        </Link>
      </header>

      <main className="focus-main">
        <Outlet />
      </main>

      <button
        type="button"
        className="focus-ai-button"
        onClick={() =>
          setAiOpen(true)
        }
      >
        <Icon
          name="sparkles"
          size={18}
        />

        <span>Ask AI</span>
      </button>

      {aiOpen && (
        <div
          className="focus-ai-overlay"
          onMouseDown={() =>
            setAiOpen(false)
          }
        >
          <aside
            className="focus-ai-drawer"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="focus-ai-drawer__header">
              <div>
                <span className="section-eyebrow">
                  AI Help
                </span>

                <h2>
                  Assistant de l’exercice
                </h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() =>
                  setAiOpen(false)
                }
                aria-label="Fermer AI Help"
              >
                <Icon
                  name="close"
                  size={18}
                />
              </button>
            </div>

            <div className="focus-ai-context">
              <span>
                {subject}
              </span>

              <span>·</span>

              <span>
                {chapter}
              </span>

              <span>·</span>

              <span>
                Exercice {exercise}
              </span>
            </div>

            <div className="focus-ai-empty">
              <div className="focus-ai-empty__icon">
                <Icon
                  name="sparkles"
                  size={24}
                />
              </div>

              <h3>
                AI Help est prêt
              </h3>

              <p>
                Le contexte de cet exercice est
                transmis ici pour le futur assistant.
              </p>

              <button
                type="button"
                className="btn btn-secondary"
                disabled
              >
                Demander un indice
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
