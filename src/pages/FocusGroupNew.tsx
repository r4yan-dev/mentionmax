import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  BadgePicker,
} from "../components/focus/BadgePicker";

import {
  useFocus,
} from "../context/FocusContext";

import type {
  GroupBadge,
  GroupType,
} from "../features/focus/types";

export default function FocusGroupNew() {
  const navigate =
    useNavigate();

  const {
    createGroup,
  } = useFocus();

  const [name, setName] =
    useState("");

  const [type, setType] =
    useState<GroupType>(
      "class"
    );

  const [badge, setBadge] =
    useState<GroupBadge>({
      emoji: "📚",
      color: "#0FA3A3",
    });

  const [error, setError] =
    useState("");

  async function submit() {
    if (!name.trim()) {
      return;
    }

    try {
      setError("");

      const group =
        await createGroup({
          name,
          type,
          badge,
        });

      navigate(
        `/focus/groups/${group.id}`
      );
    } catch (error) {
      console.error(
        "Failed to create group:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Impossible de créer le groupe."
      );
    }
  }

  return (
    <div className="app-page narrow-page">
      <header className="page-header">
        <Link
          to="/focus"
          className="text-link"
        >
          ← Focus
        </Link>

        <span className="section-eyebrow">
          Nouveau groupe
        </span>

        <h1 className="page-title">
          Créer ton groupe.
        </h1>

        <p className="page-lead">
          Crée un espace pour ta classe,
          ton école ou ton groupe privé.
        </p>
      </header>

      <section className="card group-form-card">
        <label className="field">
          <span className="field__label">
            Nom du groupe
          </span>

          <input
            className="input"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="2BAC SM A — Groupe Maths"
            autoFocus
          />
        </label>

        <div className="field">
          <span className="field__label">
            Type
          </span>

          <div className="group-type-grid">
            {[
              [
                "school",
                "École",
                "Pour ton établissement.",
              ],
              [
                "class",
                "Classe",
                "Pour ta classe ou section.",
              ],
              [
                "private",
                "Privé",
                "Pour ton groupe d'amis.",
              ],
            ].map(
              ([value, title, description]) => (
                <button
                  type="button"
                  key={value}
                  className={`group-type-card${
                    type === value
                      ? " selected"
                      : ""
                  }`}
                  onClick={() =>
                    setType(
                      value as GroupType
                    )
                  }
                >
                  <strong>
                    {title}
                  </strong>

                  <span>
                    {description}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        <BadgePicker
          value={badge}
          onChange={setBadge}
        />

        {error && (
          <div className="group-form-error">
            {error}
          </div>
        )}

        <div className="group-form-actions">
          <Link
            to="/focus"
            className="btn btn-ghost"
          >
            Annuler
          </Link>

          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !name.trim()
            }
            onClick={submit}
          >
            Créer le groupe
          </button>
        </div>
      </section>
    </div>
  );
}
