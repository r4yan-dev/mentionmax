import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  previewFocusGroup,
} from "../features/focus/supabase";

import {
  useFocus,
} from "../context/FocusContext";

export default function FocusGroupJoin() {
  const navigate =
    useNavigate();

  const {
    joinGroup,
  } = useFocus();

  const [code, setCode] =
    useState("");

  const [preview, setPreview] =
    useState<Awaited<
      ReturnType<
        typeof previewFocusGroup
      >
    >>(null);

  const [loading, setLoading] =
    useState(false);

  const [joining, setJoining] =
    useState(false);

  const [error, setError] =
    useState("");

  const normalized =
    code.trim().toUpperCase();

  const validFormat =
    /^MTMX-[A-Z0-9]{4,32}$/.test(
      normalized
    );

  useEffect(() => {
    let cancelled = false;

    async function findGroup() {
      setError("");
      setPreview(null);

      if (!validFormat) {
        return;
      }

      try {
        setLoading(true);

        const result =
          await previewFocusGroup(
            normalized
          );

        if (!cancelled) {
          setPreview(result);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Impossible de rechercher le groupe."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    const timeout =
      window.setTimeout(
        findGroup,
        250
      );

    return () =>
      window.clearTimeout(
        timeout
      );
  }, [normalized, validFormat]);

  function handleCodeChange(
    value: string
  ) {
    const cleaned =
      value
        .toUpperCase()
        .replace(
          /[^A-Z0-9-]/g,
          ""
        )
        .slice(0, 32);

    setCode(cleaned);
    setError("");
  }

  async function confirmJoin() {
    if (!preview) {
      return;
    }

    try {
      setJoining(true);
      setError("");

      const group =
        await joinGroup(
          normalized
        );

      navigate(
        `/focus/groups/${group.id}`
      );
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de rejoindre le groupe."
      );
    } finally {
      setJoining(false);
    }
  }

  const statusText =
    useMemo(() => {
      if (loading) {
        return "Recherche du groupe...";
      }

      if (!validFormat) {
        return "";
      }

      if (!preview) {
        return "Aucun groupe trouvé avec ce code.";
      }

      return "";
    }, [
      loading,
      validFormat,
      preview,
    ]);

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
          Rejoindre
        </span>

        <h1 className="page-title">
          Rejoins un groupe.
        </h1>

        <p className="page-lead">
          Entre le code d'invitation fourni
          par ton groupe.
        </p>
      </header>

      <section className="card join-group-card">
        <label className="field">
          <span className="field__label">
            Code d'invitation
          </span>

          <input
            className="input invite-code-input"
            value={code}
            onChange={(event) =>
              handleCodeChange(
                event.target.value
              )
            }
            placeholder="MTMX-7F2K"
            maxLength={32}
            inputMode="text"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {statusText && (
          <div className="join-invalid">
            {statusText}
          </div>
        )}

        {error && (
          <div className="join-invalid">
            {error}
          </div>
        )}

        {preview && (
          <div className="join-preview">
            <div
              className="join-preview__badge"
              style={{
                backgroundColor:
                  preview.badge.color,
                backgroundImage:
                  preview.badge.imageUrl
                    ? `url(${preview.badge.imageUrl})`
                    : undefined,
                backgroundSize:
                  "cover",
                backgroundPosition:
                  "center",
              }}
            >
              {!preview.badge.imageUrl &&
                (preview.badge.emoji ??
                  "📚")}
            </div>

            <div>
              <span>
                Groupe trouvé
              </span>

              <h2>
                {preview.name}
              </h2>

              <p>
                {preview.memberCount} membre
                {preview.memberCount !==
                1
                  ? "s"
                  : ""}{" "}
                ·{" "}
                {preview.type ===
                "school"
                  ? "École"
                  : preview.type ===
                    "class"
                    ? "Classe"
                    : "Privé"}
              </p>
            </div>
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
              !preview ||
              joining
            }
            onClick={
              confirmJoin
            }
          >
            {joining
              ? "Connexion..."
              : "Rejoindre le groupe"}
          </button>
        </div>
      </section>
    </div>
  );
}
