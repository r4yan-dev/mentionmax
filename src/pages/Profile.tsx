import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { getUserProfile, uploadProfileImage } from "../features/focus/supabase";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const {
    profile: currentProfile,
    schoolPreferences,
    refreshProfile,
    updateProfileName,
  } = useAccount();

  const isOwnProfile = !userId || userId === user?.id;
  const [otherUserProfile, setOtherUserProfile] = useState<{
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const inputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentProfile?.display_name ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState({ completedExercises: 0, streak: 0, focusMinutes: 0 });

  useEffect(() => {
    if (!editingName) {
      setNameDraft(currentProfile?.display_name ?? "");
    }
  }, [currentProfile?.display_name, editingName]);

  useEffect(() => {
    if (!userId || userId === user?.id) {
      setOtherUserProfile(null);
      setLoading(false);
      return;
    }

    const effectUserId = userId;
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const data = await getUserProfile(effectUserId);
        setOtherUserProfile(data);
        if (!data) setError("Profil non trouvé.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Impossible de charger le profil.");
        setOtherUserProfile(null);
      } finally {
        setLoading(false);
      }
    }
    void loadProfile();
  }, [userId, user?.id]);

  useEffect(() => {
    if (isOwnProfile && !currentProfile) {
      void refreshProfile();
    }
  }, [isOwnProfile, currentProfile, refreshProfile]);

  useEffect(() => {
    if (!editingName) return;
    requestAnimationFrame(() => nameInputRef.current?.select());
  }, [editingName]);

  const profileId = currentProfile?.id;

  useEffect(() => {
    if (!isOwnProfile || !profileId) return;
    let mounted = true;

    async function loadStats() {
      const [progressResult, focusResult] = await Promise.all([
        supabase
          .from("mission_helios_progress")
          .select("completed, completed_at")
          .eq("user_id", profileId),
        supabase
          .from("focus_sessions")
          .select("actual_seconds, started_at, status")
          .eq("user_id", profileId)
          .eq("status", "completed"),
      ]);

      if (!mounted) return;

      const progressRows = progressResult.data ?? [];
      const focusRows = focusResult.data ?? [];
      const completedExercises = progressRows.filter((row) => row.completed).length;
      const focusMinutes = Math.round(
        focusRows.reduce((sum, row) => sum + Number(row.actual_seconds ?? 0), 0) / 60,
      );

      const activityDates = [
        ...focusRows.map((row) => row.started_at),
        ...progressRows
          .filter((row) => row.completed && row.completed_at)
          .map((row) => row.completed_at as string),
      ];
      const activeDays = new Set(
        activityDates.map((value) => {
          const date = new Date(value);
          return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        }),
      );
      let streak = 0;
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);
      while (activeDays.has(cursor.getTime())) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }
      if (streak === 0) {
        const yesterday = new Date();
        yesterday.setHours(0, 0, 0, 0);
        yesterday.setDate(yesterday.getDate() - 1);
        while (activeDays.has(yesterday.getTime())) {
          streak += 1;
          yesterday.setDate(yesterday.getDate() - 1);
        }
      }

      setStats({ completedExercises, streak, focusMinutes });
    }

    void loadStats();
    return () => {
      mounted = false;
    };
  }, [isOwnProfile, profileId]);

  const profile = isOwnProfile ? currentProfile : otherUserProfile;
  const name =
    profile?.display_name ||
    (isOwnProfile ? user?.email?.split("@")[0] : "Utilisateur") ||
    "Élève";
  const initials = name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const track = isOwnProfile ? schoolPreferences?.track : undefined;
  const section = isOwnProfile ? schoolPreferences?.section : undefined;

  async function upload(file: File) {
    try {
      if (!user) {
        throw new Error("Utilisateur non connecté.");
      }

      setUploading(true);
      setError("");
      const avatarUrl = await uploadProfileImage(file);

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );

      if (profileError) {
        throw new Error(`Profil: ${profileError.message}`);
      }

      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'importer la photo.");
    } finally {
      setUploading(false);
    }
  }

  function beginNameEdit() {
    setError("");
    setSaved(false);
    setNameDraft(currentProfile?.display_name ?? name);
    setEditingName(true);
  }

  function cancelNameEdit() {
    setEditingName(false);
    setNameDraft(currentProfile?.display_name ?? name);
  }

  async function saveName() {
    const nextName = nameDraft.trim();
    const currentName = (currentProfile?.display_name ?? name).trim();

    if (!nextName || nextName === currentName) {
      cancelNameEdit();
      return;
    }

    try {
      setSavingName(true);
      setError("");
      await updateProfileName(nextName);
      setSaved(true);
      setEditingName(false);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier le nom.");
    } finally {
      setSavingName(false);
    }
  }

  if (loading) {
    return (
      <div className="app-page">
        <div className="group-loading">Chargement...</div>
      </div>
    );
  }

  if (!isOwnProfile && !profile) {
    return (
      <div className="app-page">
        <div className="preferences-error">{error}</div>
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
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            title="Changer la photo"
          >
            <div className="profile-avatar profile-avatar--large">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt={name} /> : initials}
            </div>
            <span className="profile-avatar-edit">{uploading ? "..." : "Modifier"}</span>
          </button>
        ) : (
          <div className="profile-avatar profile-avatar--large">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt={name} /> : initials}
          </div>
        )}

        {isOwnProfile && (
          <input
            ref={inputRef}
            hidden
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = "";
            }}
          />
        )}

        <div>
          <span className="section-eyebrow">Profil</span>
          {isOwnProfile && editingName ? (
            <div className="profile-name-editor-inline">
              <input
                ref={nameInputRef}
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (!savingName) void saveName();
                  }
                  if (event.key === "Escape") {
                    event.preventDefault();
                    cancelNameEdit();
                  }
                }}
                maxLength={40}
                aria-label="Nom affiché"
                className="profile-name-input"
                disabled={savingName}
              />
            </div>
          ) : (
            <h1 className="profile-name-heading">
              {name}
              {isOwnProfile && (
                <button
                  type="button"
                  className="profile-name-edit-button"
                  onClick={beginNameEdit}
                  aria-label="Modifier le nom"
                  title="Modifier le nom"
                >
                  ✎
                </button>
              )}
            </h1>
          )}
          {isOwnProfile && (
            <>
              <p>{user?.email}</p>
              <p>
                {track === "SPC"
                  ? "Sciences Physiques"
                  : track === "SM"
                    ? `Sciences Mathématiques${section ? ` · Section ${section}` : ""}`
                    : "Parcours non configuré"}
              </p>
            </>
          )}
        </div>

        {isOwnProfile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Link to="/preferences" className="btn btn-ghost">Modifier mes choix</Link>
          </div>
        )}
      </header>

      {saved && <div className="preferences-saved">✓ Nom mis à jour</div>}
      {error && <div className="preferences-error">{error}</div>}

      {isOwnProfile && (
        <>
          <div className="profile-stats-grid">
            <div className="card">
              <span>XP</span>
              <strong>—</strong>
            </div>
            <div className="card">
              <span>Série</span>
              <strong>{stats.streak} {stats.streak === 1 ? "jour" : "jours"}</strong>
            </div>
            <div className="card">
              <span>Exercices</span>
              <strong>{stats.completedExercises}</strong>
            </div>
            <div className="card">
              <span>Temps Focus</span>
              <strong>{stats.focusMinutes} min</strong>
            </div>
          </div>

          <section className="profile-achievements">
            <div className="section-heading-row">
              <div>
                <span className="section-eyebrow">ACTIVITÉ</span>
                <h2 className="section-title">Ton parcours</h2>
              </div>
            </div>
            <div className="badge-grid">
              <div className="achievement-card">
                <span>✓</span>
                <strong>Profil connecté</strong>
                <small>Données enregistrées</small>
              </div>
              <div className="achievement-card">
                <span>◷</span>
                <strong>{stats.focusMinutes} min de Focus</strong>
                <small>Temps de travail réel</small>
              </div>
              <div className="achievement-card">
                <span>⚡</span>
                <strong>{stats.completedExercises} exercices</strong>
                <small>Terminés</small>
              </div>
              <div className="achievement-card achievement-card--locked">
                <span>◆</span>
                <strong>Maître d'une matière</strong>
                <small>À débloquer</small>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
