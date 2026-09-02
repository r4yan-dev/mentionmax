import {
  useState,
  type FormEvent,
} from "react";

import { Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

type Mode = "login" | "signup";

export default function Auth() {
  const {
    user,
    loading,
    signIn,
    signUp,
  } = useAuth();

  const [mode, setMode] =
    useState<Mode>("login");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [displayName, setDisplayName] =
    useState("");

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-loading">
          Chargement...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <Navigate
        to="/accueil"
        replace
      />
    );
  }

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setMessage("");
    setSubmitting(true);

    if (mode === "signup") {
      if (!displayName.trim()) {
        setError(
          "Entre ton nom."
        );
        setSubmitting(false);
        return;
      }

      const result =
        await signUp(
          email,
          password,
          displayName
        );

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(
          "Compte créé. Vérifie ton email si la confirmation est activée."
        );
        setMode("login");
      }
    } else {
      const result =
        await signIn(
          email,
          password
        );

      if (result.error) {
        setError(result.error);
      }
    }

    setSubmitting(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="sidebar-logo__mark">
            M
          </span>

          <span className="sidebar-logo__text">
            MentionMax
          </span>
        </div>

        <div className="auth-heading">
          <span className="section-eyebrow">
            {mode === "login"
              ? "Bienvenue"
              : "Créer un compte"}
          </span>

          <h1>
            {mode === "login"
              ? "Connecte-toi."
              : "Rejoins MentionMax."}
          </h1>

          <p>
            {mode === "login"
              ? "Retrouve ta progression et tes préférences sur n'importe quel appareil."
              : "Ton compte synchronisera ton profil, ton parcours et ta progression."}
          </p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          {mode === "signup" && (
            <label className="field">
              <span className="field__label">
                Nom
              </span>

              <input
                className="input"
                type="text"
                value={displayName}
                onChange={(event) =>
                  setDisplayName(
                    event.target.value
                  )
                }
                placeholder="Rayan"
                autoComplete="name"
              />
            </label>
          )}

          <label className="field">
            <span className="field__label">
              Email
            </span>

            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="ton@email.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            <span className="field__label">
              Mot de passe
            </span>

            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="••••••••"
              autoComplete={
                mode === "login"
                  ? "current-password"
                  : "new-password"
              }
              minLength={6}
              required
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={submitting}
          >
            {submitting
              ? "Chargement..."
              : mode === "login"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {mode === "login"
              ? "Pas encore de compte ?"
              : "Tu as déjà un compte ?"}
          </span>

          <button
            type="button"
            onClick={() => {
              setMode(
                mode === "login"
                  ? "signup"
                  : "login"
              );
              setError("");
              setMessage("");
            }}
          >
            {mode === "login"
              ? "Créer un compte"
              : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
