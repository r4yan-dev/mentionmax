import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  saveSchoolProfile,
  type SchoolSection,
  type Track,
} from "../features/schoolProfile";

import { useAccount } from "../context/AccountContext";

export default function Preferences() {
  const {
    profile,
    schoolPreferences,
  } = useAccount();

  const [track, setTrack] =
    useState<Track | "">("");

  const [section, setSection] =
    useState<SchoolSection>(null);

  const [saved, setSaved] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [saveError, setSaveError] =
    useState("");

  useEffect(() => {
    if (!schoolPreferences) {
      setTrack("");
      setSection(null);
      return;
    }

    setTrack(
      schoolPreferences.track
    );

    setSection(
      schoolPreferences.section
    );
  }, [schoolPreferences]);

  function chooseTrack(
    value: Track
  ) {
    setTrack(value);
    setSaved(false);
    setSaveError("");

    setSection(null);
  }

  function chooseSection(
    value: "A" | "B"
  ) {
    setSection(value);
    setSaved(false);
    setSaveError("");
  }

  async function handleSave() {
    if (!track) {
      return;
    }

    if (
      track === "SM" &&
      !section
    ) {
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      await saveSchoolProfile({
        track,
        section:
          track === "SPC"
            ? null
            : section,
      });

      setSaved(true);
    } catch (error) {
      console.error(
        "Failed to save:",
        error
      );

      setSaveError(
        error instanceof Error
          ? error.message
          : "Erreur inconnue."
      );
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    Boolean(track) &&
    (
      track === "SPC" ||
      Boolean(section)
    );

  const name =
    profile?.display_name ||
    "ton profil";

  return (
    <div className="app-page">
      <header className="page-header">
        <span className="section-eyebrow">
          Choix
        </span>

        <h1 className="page-title">
          Personnalise ton espace.
        </h1>

        <p className="page-lead">
          Ces informations sont synchronisées avec
          ton compte MentionMax.
        </p>
      </header>

      <section className="settings-list">

        <div className="settings-row">
          <div className="settings-row__content">
            <h3>
              Personnalité
            </h3>

            <p>
              Découvre ton profil d'apprentissage,
              {` ${name}`}.
            </p>
          </div>

          <Link
            to="/preferences/personality"
            className="btn btn-secondary"
          >
            Passer le test
          </Link>
        </div>

        <div className="preferences-section">
          <div className="preferences-section__header">
            <div>
              <span className="section-eyebrow">
                Niveau et programme
              </span>

              <h2>
                Quel est ton parcours ?
              </h2>

              <p>
                SPC n'a pas de section.
                SM possède les sections A et B.
              </p>
            </div>

            {track && (
              <span className="badge badge--brand">
                {track}
                {track === "SM" &&
                section
                  ? ` · ${section}`
                  : ""}
              </span>
            )}
          </div>

          <div className="track-grid">
            <button
              type="button"
              className={`track-card${
                track === "SPC"
                  ? " selected"
                  : ""
              }`}
              onClick={() =>
                chooseTrack("SPC")
              }
            >
              <span className="track-card__code">
                SPC
              </span>

              <span className="track-card__title">
                Sciences Physiques
              </span>

              <span className="track-card__description">
                Une seule section.
              </span>

              <span className="track-card__indicator">
                {track === "SPC"
                  ? "✓"
                  : "→"}
              </span>
            </button>

            <button
              type="button"
              className={`track-card${
                track === "SM"
                  ? " selected"
                  : ""
              }`}
              onClick={() =>
                chooseTrack("SM")
              }
            >
              <span className="track-card__code">
                SM
              </span>

              <span className="track-card__title">
                Sciences Mathématiques
              </span>

              <span className="track-card__description">
                Section A ou B.
              </span>

              <span className="track-card__indicator">
                {track === "SM"
                  ? "✓"
                  : "→"}
              </span>
            </button>
          </div>

          {track === "SM" && (
            <div className="section-choice">
              <div className="section-choice__title">
                <strong>
                  Section
                </strong>

                <span>
                  Choisis A ou B.
                </span>
              </div>

              <div className="section-choice__grid">
                <button
                  type="button"
                  className={`section-choice__card${
                    section === "A"
                      ? " selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseSection("A")
                  }
                >
                  <span>A</span>
                  <small>
                    Section A
                  </small>
                </button>

                <button
                  type="button"
                  className={`section-choice__card${
                    section === "B"
                      ? " selected"
                      : ""
                  }`}
                  onClick={() =>
                    chooseSection("B")
                  }
                >
                  <span>B</span>
                  <small>
                    Section B
                  </small>
                </button>
              </div>
            </div>
          )}

          <div className="preferences-save">
            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !canSave ||
                saving
              }
              onClick={
                handleSave
              }
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer mon parcours"}
            </button>

            {saved && (
              <span className="preferences-saved">
                ✓ Synchronisé
              </span>
            )}

            {saveError && (
              <span className="preferences-save-error">
                {saveError}
              </span>
            )}
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-row__content">
            <h3>
              Notifications
            </h3>

            <p>
              Rappels de révision et objectifs
              quotidiens.
            </p>
          </div>

          <button
            type="button"
            className="toggle active"
          >
            <span />
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row__content">
            <h3>
              Apparence
            </h3>

            <p>
              Choisis le thème de l'application.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
          >
            Système
          </button>
        </div>

        <div className="settings-row">
          <div className="settings-row__content">
            <h3>
              Inviter des amis
            </h3>

            <p>
              Partage MentionMax avec ton groupe.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
          >
            Inviter
          </button>
        </div>
      </section>
    </div>
  );
}
