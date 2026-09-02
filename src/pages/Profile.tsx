import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import {
  useAccount,
} from "../context/AccountContext";

import {
  uploadProfileImage,
  getUserProfile,
} from "../features/focus/supabase";

export default function Profile() {
  const {
    userId,
  } = useParams();

  const {
    user,
  } = useAuth();

  const {
    profile: currentProfile,
    schoolPreferences,
    refreshProfile,
  } = useAccount();

  const isOwnProfile =
    !userId ||
    userId === user?.id;

  const [otherUserProfile, setOtherUserProfile] =
    useState<{
      id: string;
      display_name: string | null;
      avatar_url: string | null;
    } | null>(null);

  const [loading, setLoading] =
    useState(!!userId);

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  // Load other user's profile
  useEffect(() => {
    if (
      !userId ||
      userId === user?.id
    ) {
      setOtherUserProfile(null);
      setLoading(false);
      return;
    }

    const effectUserId = userId;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        console.log("🚀 Profile.tsx - Loading profile for userId:", effectUserId);

        const data =
          await getUserProfile(
            effectUserId
          );

        console.log("✅ Profile.tsx - Profile data received:", data);
        setOtherUserProfile(data);
        
        if (!data) {
          setError(`Profil non trouvé.`);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Impossible de charger le profil.";
        console.error("❌ Profile.tsx - error:", errorMsg, err);
        setError(errorMsg);
        setOtherUserProfile(null);
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, [userId, user?.id]);

  // Ensure own profile is loaded when viewing own profile
  useEffect(() => {
    if (
      isOwnProfile &&
      !currentProfile
    ) {
      void refreshProfile();
    }
  }, [isOwnProfile, currentProfile, refreshProfile]);

  const profile =
    isOwnProfile
      ? currentProfile
      : otherUserProfile;

  const name =
    profile?.display_name ||
    (isOwnProfile
      ? user?.email
          ?.split("@")[0]
      : "Utilisateur") ||
    "Élève";

  const initials =
    name
      .split(/\s+/)
      .map(
        (part) =>
          part.charAt(0)
      )
      .join("")
      .slice(0, 2)
      .toUpperCase();

  const track =
    isOwnProfile
      ? schoolPreferences?.track
      : undefined;

  const section =
    isOwnProfile
      ? schoolPreferences?.section
      : undefined;

  async function upload(
    file: File
  ) {
    try {
      setUploading(true);
      setError("");

      await uploadProfileImage(
        file
      );

      await refreshProfile();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'importer la photo."
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="app-page">
        <div className="group-loading">
          Chargement...
        </div>
      </div>
    );
  }

  if (!isOwnProfile && !profile) {
    return (
      <div className="app-page">
        <div className="preferences-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="app-page">
      <header className="profile-hero">
        {isOwnProfile ? (
          <button
            type="button"
            className="profile-avatar-button"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={uploading}
            title="Changer la photo"
          >
            <div
              className="profile-avatar profile-avatar--large"
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={name}
                />
              ) : (
                initials
              )}
            </div>

            <span className="profile-avatar-edit">
              {uploading
                ? "..."
                : "Modifier"}
            </span>
          </button>
        ) : (
          <div
            className="profile-avatar profile-avatar--large"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={name}
              />
            ) : (
              initials
            )}
          </div>
        )}

        {isOwnProfile && (
          <input
            ref={inputRef}
            hidden
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(event) => {
              const file =
                event.target.files?.[0];

              if (file) {
                void upload(file);
              }
            }}
          />
        )}

        <div>
          <span className="section-eyebrow">
            Profil
          </span>

          <h1>
            {name}
          </h1>

          {isOwnProfile && (
            <>
              <p>
                {user?.email}
              </p>

              <p>
                {track === "SPC"
                  ? "Sciences Physiques"
                  : track === "SM"
                    ? `Sciences Mathématiques${
                        section
                          ? ` · Section ${section}`
                          : ""
                      }`
                    : "Parcours non configuré"}
              </p>
            </>
          )}
        </div>

        {isOwnProfile && (
          <Link
            to="/preferences"
            className="btn btn-ghost"
          >
            Modifier mes choix
          </Link>
        )}
      </header>

      {error && (
        <div className="preferences-error">
          {error}
        </div>
      )}

      {isOwnProfile && (
        <>
          <div className="profile-stats-grid">
            <div className="card">
              <span>XP</span>
              <strong>1 120</strong>
            </div>

            <div className="card">
              <span>Série</span>
              <strong>5 jours</strong>
            </div>

            <div className="card">
              <span>Exercices</span>
              <strong>186</strong>
            </div>

            <div className="card">
              <span>Tests</span>
              <strong>12</strong>
            </div>
          </div>

          <section className="profile-achievements">
            <div className="section-heading-row">
              <div>
                <span className="section-eyebrow">
                  Récompenses
                </span>

                <h2 className="section-title">
                  Tes badges
                </h2>
              </div>
            </div>

            <div className="badge-grid">
              <div className="achievement-card">
                <span>🏆</span>
                <strong>
                  Premier exercice
                </strong>
                <small>
                  Débloqué
                </small>
              </div>

              <div className="achievement-card">
                <span>🔥</span>
                <strong>
                  7 jours de série
                </strong>
                <small>
                  En progression
                </small>
              </div>

              <div className="achievement-card">
                <span>⚡</span>
                <strong>
                  50 exercices
                </strong>
                <small>
                  Débloqué
                </small>
              </div>

              <div className="achievement-card achievement-card--locked">
                <span>◆</span>
                <strong>
                  Maître d'une matière
                </strong>
                <small>
                  À débloquer
                </small>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
