import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  generateHandnotes,
} from "../features/ai-studio/handnotes/generateHandnotes";

import {
  getSavedHandnotes,
  saveHandnotes,
} from "../features/ai-studio/handnotes/storage";

import type {
  HandnoteSet,
} from "../features/ai-studio/types";

export default function Handnotes() {
  const [text, setText] =
    useState("");

  const [subject, setSubject] =
    useState("");

  const [chapter, setChapter] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [result, setResult] =
    useState<HandnoteSet | null>(
      null
    );

  const [saved, setSaved] =
    useState<HandnoteSet[]>([]);

  const [
    openSection,
    setOpenSection,
  ] = useState(0);

  useEffect(() => {
    setSaved(getSavedHandnotes());
  }, []);

  async function generate() {
    setError("");

    if (!text.trim()) {
      setError(
        "Colle d'abord le contenu du cours."
      );
      return;
    }

    setLoading(true);

    try {
      const handnotes =
        await generateHandnotes(
          text,
          {
            subject:
              subject || undefined,
            chapter:
              chapter || undefined,
          }
        );

      setResult(handnotes);
      setOpenSection(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur de génération."
      );
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!result) {
      return;
    }

    saveHandnotes(result);
    setSaved(getSavedHandnotes());
  }

  return (
    <div className="app-page">
      <header className="page-header">
        <Link
          to="/ai-help"
          className="text-link"
        >
          ← AI Help
        </Link>

        <span className="section-eyebrow">
          AI Studio
        </span>

        <h1 className="page-title">
          Handnotes
        </h1>

        <p className="page-lead">
          Transforme un cours en notes structurées
          pour réviser efficacement.
        </p>
      </header>

      <div className="handnotes-layout">
        <section className="card handnotes-input">
          <div className="source-tabs">
            <button
              type="button"
              className="source-tab active"
            >
              Texte
            </button>

            <button
              type="button"
              className="source-tab disabled"
              disabled
            >
              PDF
            </button>

            <button
              type="button"
              className="source-tab disabled"
              disabled
            >
              YouTube
            </button>
          </div>

          <div className="handnotes-context">
            <label className="field">
              <span className="field__label">
                Matière
              </span>

              <select
                className="input"
                value={subject}
                onChange={(event) =>
                  setSubject(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Automatique
                </option>
                <option>
                  Mathématiques
                </option>
                <option>
                  Physique-Chimie
                </option>
                <option>
                  SVT
                </option>
                <option>
                  Français
                </option>
                <option>
                  Philosophie
                </option>
              </select>
            </label>

            <label className="field">
              <span className="field__label">
                Chapitre
              </span>

              <input
                className="input"
                value={chapter}
                onChange={(event) =>
                  setChapter(
                    event.target.value
                  )
                }
                placeholder="Ex. Dérivation"
              />
            </label>
          </div>

          <label className="field">
            <span className="field__label">
              Contenu du cours
            </span>

            <textarea
              className="handnotes-textarea"
              value={text}
              onChange={(event) =>
                setText(
                  event.target.value
                )
              }
              placeholder="Colle ton cours ici..."
            />
          </label>

          <div className="handnotes-input-footer">
            <span>
              {text.length} caractères
            </span>

            <button
              type="button"
              className="btn btn-primary"
              disabled={
                loading ||
                !text.trim()
              }
              onClick={generate}
            >
              {loading
                ? "Génération..."
                : "Générer"}
            </button>
          </div>

          {error && (
            <div className="handnotes-error">
              {error}
            </div>
          )}
        </section>

        <section className="handnotes-result">
          {!result && (
            <div className="card handnotes-empty">
              <div className="handnotes-empty__icon">
                ✦
              </div>

              <h2>
                Tes handnotes apparaîtront ici.
              </h2>

              <p>
                Colle ton cours à gauche pour
                générer une synthèse structurée.
              </p>
            </div>
          )}

          {result && (
            <>
              <div className="handnotes-result-header">
                <div>
                  <span className="section-eyebrow">
                    Résultat
                  </span>

                  <h2>
                    {result.chapter ||
                      "Handnotes"}
                  </h2>

                  <p>
                    {result.subject ||
                      "Matière non précisée"}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={save}
                >
                  Enregistrer
                </button>
              </div>

              <div className="handnote-sections">
                {result.sections.map(
                  (
                    section,
                    index
                  ) => {
                    const open =
                      openSection ===
                      index;

                    return (
                      <article
                        key={`${section.title}-${index}`}
                        className={`handnote-section${
                          open
                            ? " open"
                            : ""
                        }`}
                      >
                        <button
                          type="button"
                          className="handnote-section__header"
                          onClick={() =>
                            setOpenSection(
                              open
                                ? -1
                                : index
                            )
                          }
                        >
                          <div>
                            <span>
                              Section{" "}
                              {index + 1}
                            </span>

                            <h3>
                              {section.title}
                            </h3>
                          </div>

                          <span>
                            {open
                              ? "−"
                              : "+"}
                          </span>
                        </button>

                        {open && (
                          <div className="handnote-section__body">
                            <NoteList
                              title="Concepts clés"
                              items={
                                section.keyConcepts
                              }
                            />

                            {section.definitions
                              .length >
                              0 && (
                              <section className="note-group">
                                <h4>
                                  Définitions
                                </h4>

                                <div className="definition-list">
                                  {section.definitions.map(
                                    (
                                      item
                                    ) => (
                                      <div
                                        className="definition-item"
                                        key={
                                          item.term
                                        }
                                      >
                                        <strong>
                                          {
                                            item.term
                                          }
                                        </strong>

                                        <span>
                                          {
                                            item.definition
                                          }
                                        </span>
                                      </div>
                                    )
                                  )}
                                </div>
                              </section>
                            )}

                            <NoteList
                              title="Formules"
                              items={
                                section.formulas
                              }
                            />

                            <NoteList
                              title="Exemples"
                              items={
                                section.examples
                              }
                            />

                            <NoteList
                              title="Erreurs fréquentes"
                              items={
                                section.commonMistakes
                              }
                            />

                            <NoteList
                              title="Points d'examen"
                              items={
                                section.examFocusPoints
                              }
                            />
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>

              <div className="handnotes-next-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled
                >
                  Flashcards · bientôt
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled
                >
                  Quiz · bientôt
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {saved.length > 0 && (
        <section className="home-section">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">
                Mes notes
              </span>

              <h2 className="section-title">
                Enregistrées
              </h2>
            </div>
          </div>

          <div className="recommendation-grid">
            {saved.map((item) => (
              <button
                type="button"
                key={item.id}
                className="card recommendation-card"
                onClick={() => {
                  setResult(item);
                  setOpenSection(0);
                }}
              >
                <span className="recommendation-card__arrow">
                  ↗
                </span>

                <h3>
                  {item.chapter ||
                    "Handnotes"}
                </h3>

                <p>
                  {item.subject ||
                    "Cours"}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function NoteList({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="note-group">
      <h4>{title}</h4>

      <ul>
        {items.map((item) => (
          <li key={item}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
