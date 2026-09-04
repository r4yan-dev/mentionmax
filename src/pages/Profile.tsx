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
  const [uploading, setUploading] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(currentProfile?.display_name ?? "");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setNameDraft(currentProfile?.display_name ?? "");
  }, [currentProfile?.display_name]);

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

  const profile = isOwnProfile ? currentProfile : otherUserProfile;
  const name = profile?.display_name || (isOwnProfile ? user?.email?.split("@")[0] : "Utilisateur") || "Élève";
  const initials = name.split(/\s+/).map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase();
  const track = isOwnProfile ? schoolPreferences?.track : undefined;
  const section = isOwnProfile ? schoolPreferences?.section : undefined;

  async function upload(file: File) {
    try {
      setUploading(true);
      setError("");
      await uploadProfileImage(file);
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'importer la photo.");
    } finally {
      setUploading(false);
    }
  }

  async function saveName() {
    const nextName = nameDraft.trim();
    if (!nextName || nextName === (currentProfile?.display_name ?? "")) return;
    try {
      setSavingName(true);
      setSaved(false);
      setError("");
      await updateProfileName(nextName);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de modifier le nom.");
    } finally {
      setSavingName(false);
    }
  }

  if (loading) {
    return <div className="app-page"><div className="group-loading">Chargement...</div></div>;
  }

  if (!isOwnProfile && !profile) {
    return <div className="app-page"><div className="preferences-error">{error}</div></div>;
  }

  return (
    <div className="app-page">
      <header className="profile-hero">
        {isOwnProfile ? (
          <button type="button" className="profile-avatar-button" onClick={() => inputRef.current?.click()} disabled={uploading} title="Changer la photo">
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
          <input ref={inputRef} hidden type="file" accept=".jpg,.jpeg,.png,.webp,.svg,image/jpeg,image/png,image/webp,image/svg+xml" onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
            event.target.value = "";
          }} />
        )}

        <div>
          <span className="section-eyebrow">Profil</span>
          <h1>{name}</h1>
          {isOwnProfile && (
            <>
              <p>{user?.email}</p>
              <p>
                {track === "SPC" ? "Sciences Physiques" : track === "SM" ? `Sciences Mathématiques${section ? ` · Section ${section}` : ""}` : "Parcours non configuré"}
              </p>
            </>
          )}
        </div>

        {isOwnProfile && <Link to="/preferences" className="btn btn-ghost">Modifier mes choix</Link>}
      </header>

      {error && <div className="preferences-error">{error}</div>}

      {isOwnProfile && (
        <>
          <section className="card profile-edit-card">
            <div>
              <span className="section-eyebrow">IDENTITÉ</span>
              <h2>Nom affiché</h2>
              <p>Ce nom apparaît dans ton profil, la navigation et les espaces Focus.</p>
            </div>
            <div className="profile-name-editor">
              <input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void saveName();
                }}
                maxLength={40}
                aria-label="Nom affiché"
              />
              <button type="button" className="btn btn-primary" disabled={savingName || !nameDraft.trim() || nameDraft.trim() === (currentProfile?.display_name ?? "")} onClick={() => void saveName()}>
                {savingName ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
            {saved && <small className="preferences-saved">✓ Nom mis à jour</small>}
          </section>

          <section className="profile-achievements">
            <div className="section-heading-row">
              <div>
                <span className="section-eyebrow">COMPTE</span>
                <h2 className="section-title">Ton profil</h2>
              </div>
            </div>
            <div className="profile-detail-grid">
              <div className="card"><span>Parcours</span><strong>{track === "SM" ? `SM ${section ?? ""}` : track === "SPC" ? "SP" : "Non configuré"}</strong></div>
              <div className="card"><span>Photo</span><strong>{profile?.avatar_url ? "Personnalisée" : "Initiales"}</strong></div>
              <div className="card"><span>Compte</span><strong>Actif</strong></div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
