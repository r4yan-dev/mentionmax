import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { saveSchoolProfile, type SchoolSection, type Track } from "../features/schoolProfile";
import { useAccount } from "../context/AccountContext";
import { pathLabels } from "../data/curriculum/secondBac";

export default function Preferences() {
  const { profile, schoolPreferences, refreshSchoolPreferences } = useAccount();
  const [track, setTrack] = useState<Track | "">("");
  const [section, setSection] = useState<SchoolSection>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [transitionMode, setTransitionMode] = useState(false);

  const hasSavedPath = Boolean(schoolPreferences);
  const currentTrack = schoolPreferences?.track ?? null;
  const currentSection = schoolPreferences?.section ?? null;

  useEffect(() => {
    if (transitionMode) return;
    setTrack(schoolPreferences?.track ?? "");
    setSection(schoolPreferences?.section ?? null);
  }, [schoolPreferences, transitionMode]);

  function chooseTrack(value: Track) {
    setTrack(value);
    setSaved(false);
    setSaveError("");
    if (value === "SPC") setSection(null);
  }

  function chooseSection(value: "A" | "B") {
    setSection(value);
    setSaved(false);
    setSaveError("");
  }

  function beginTransition() {
    setSaveError("");
    setSaved(false);
    if (currentTrack === "SPC") {
      setTrack("SM");
      setSection(null);
      setTransitionMode(true);
      return;
    }
    setTrack("SPC");
    setSection(null);
    setTransitionMode(true);
  }

  function cancelTransition() {
    setTransitionMode(false);
    setSaveError("");
    setSaved(false);
    setTrack(schoolPreferences?.track ?? "");
    setSection(schoolPreferences?.section ?? null);
  }

  async function handleSave() {
    if (!track || (track === "SM" && !section)) return;
    try {
      setSaving(true);
      setSaveError("");
      await saveSchoolProfile({ track, section: track === "SPC" ? null : section });
      await refreshSchoolPreferences();
      setSaved(true);
      setTransitionMode(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  }

  const canSave = Boolean(track) && (track === "SPC" || Boolean(section));
  const name = profile?.display_name || "ton profil";
  const currentLabel = currentTrack === "SPC"
    ? pathLabels.SP
    : currentSection === "A"
      ? pathLabels.SMA
      : currentSection === "B"
        ? pathLabels.SMB
        : "Parcours non défini";
  const transitionTargetLabel = track === "SPC"
    ? pathLabels.SP
    : section === "A"
      ? pathLabels.SMA
      : section === "B"
        ? pathLabels.SMB
        : "Sciences Mathématiques";

  return <div className="app-page">
    <header className="page-header"><span className="section-eyebrow">Choix</span><h1 className="page-title">Personnalise ton espace.</h1><p className="page-lead">Ton parcours 2BAC pilote les matières, les cours et les exercices affichés.</p></header>
    <section className="settings-list">
      <div className="settings-row"><div className="settings-row__content"><h3>Personnalité</h3><p>Découvre ton profil d'apprentissage, {name}.</p></div><Link to="/preferences/personality" className="btn btn-secondary">Passer le test</Link></div>
      <div className="preferences-section">
        {!hasSavedPath && !transitionMode && <>
          <div className="preferences-section__header"><div><span className="section-eyebrow">Parcours 2BAC</span><h2>Quel est ton parcours ?</h2><p>Choisis ton parcours. Une fois enregistré, il restera verrouillé sur tout le site.</p></div></div>
          <div className="track-grid">
            <button type="button" className={`track-card${track === "SPC" ? " selected" : ""}`} onClick={() => chooseTrack("SPC")}><span className="track-card__code">SP</span><span className="track-card__title">Sciences Physiques</span><span className="track-card__description">Maths · Physique-Chimie · SVT · Anglais · Philosophie</span><span className="track-card__indicator">{track === "SPC" ? "✓" : "→"}</span></button>
            <button type="button" className={`track-card${track === "SM" ? " selected" : ""}`} onClick={() => chooseTrack("SM")}><span className="track-card__code">SM</span><span className="track-card__title">Sciences Mathématiques</span><span className="track-card__description">Section A ou B · contenu adapté</span><span className="track-card__indicator">{track === "SM" ? "✓" : "→"}</span></button>
          </div>
          {track === "SM" && <div className="section-choice"><div className="section-choice__title"><strong>Section</strong><span>La section B n'affiche pas la SVT.</span></div><div className="section-choice__grid"><button type="button" className={`section-choice__card${section === "A" ? " selected" : ""}`} onClick={() => chooseSection("A")}><span>A</span><small>SM-A · Maths · PC · SVT · Anglais · Philo</small></button><button type="button" className={`section-choice__card${section === "B" ? " selected" : ""}`} onClick={() => chooseSection("B")}><span>B</span><small>SM-B · Maths · PC · Anglais · Philo</small></button></div></div>}
          <div className="preferences-save"><button type="button" className="btn btn-primary" disabled={!canSave || saving} onClick={() => void handleSave()}>{saving ? "Enregistrement..." : "Enregistrer mon parcours"}</button>{saved && <span className="preferences-saved">✓ Synchronisé</span>}{saveError && <span className="preferences-save-error">{saveError}</span>}</div>
        </>}

        {hasSavedPath && !transitionMode && <>
          <div className="preferences-section__header"><div><span className="section-eyebrow">Parcours verrouillé</span><h2>{currentLabel}</h2><p>Ton parcours est utilisé partout dans MentionMax pour filtrer les matières, cours et exercices.</p></div><span className="badge badge--brand">{currentTrack === "SPC" ? "SP" : `SM-${currentSection}`}</span></div>
          <div className="settings-row"><div className="settings-row__content"><h3>{currentTrack === "SPC" ? "Allez plus difficile" : "Plus facile"}</h3><p>{currentTrack === "SPC" ? "Passe de Sciences Physiques à Sciences Mathématiques et choisis ta section A ou B." : "Reviens de Sciences Mathématiques vers Sciences Physiques."}</p></div><button type="button" className="btn btn-secondary" onClick={beginTransition}>{currentTrack === "SPC" ? "Allez plus difficile" : "Plus facile"}</button></div>
        </>}

        {hasSavedPath && transitionMode && <>
          <div className="preferences-section__header"><div><span className="section-eyebrow">Changement de parcours</span><h2>Passer vers {transitionTargetLabel}</h2><p>Le nouveau parcours remplacera l'ancien sur tout le site après enregistrement.</p></div></div>
          {track === "SM" && <div className="section-choice"><div className="section-choice__title"><strong>Choisis ta section</strong><span>La section B n'affiche pas la SVT.</span></div><div className="section-choice__grid"><button type="button" className={`section-choice__card${section === "A" ? " selected" : ""}`} onClick={() => chooseSection("A")}><span>A</span><small>SM-A · Maths · PC · SVT · Anglais · Philo</small></button><button type="button" className={`section-choice__card${section === "B" ? " selected" : ""}`} onClick={() => chooseSection("B")}><span>B</span><small>SM-B · Maths · PC · Anglais · Philo</small></button></div></div>}
          <div className="preferences-save"><button type="button" className="btn btn-primary" disabled={!canSave || saving} onClick={() => void handleSave()}>{saving ? "Enregistrement..." : `Enregistrer · ${transitionTargetLabel}`}</button><button type="button" className="btn btn-secondary" disabled={saving} onClick={cancelTransition}>Annuler</button>{saveError && <span className="preferences-save-error">{saveError}</span>}</div>
        </>}
      </div>
    </section>
  </div>;
}
