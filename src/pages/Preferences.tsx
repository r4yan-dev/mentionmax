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

  useEffect(() => {
    setTrack(schoolPreferences?.track ?? "");
    setSection(schoolPreferences?.section ?? null);
  }, [schoolPreferences]);

  function chooseTrack(value: Track) { setTrack(value); setSaved(false); setSaveError(""); setSection(null); }
  function chooseSection(value: "A" | "B") { setSection(value); setSaved(false); setSaveError(""); }

  async function handleSave() {
    if (!track || (track === "SM" && !section)) return;
    try {
      setSaving(true); setSaveError("");
      await saveSchoolProfile({ track, section: track === "SPC" ? null : section });
      await refreshSchoolPreferences();
      setSaved(true);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Erreur inconnue.");
    } finally { setSaving(false); }
  }

  const canSave = Boolean(track) && (track === "SPC" || Boolean(section));
  const name = profile?.display_name || "ton profil";

  return <div className="app-page">
    <header className="page-header"><span className="section-eyebrow">Choix</span><h1 className="page-title">Personnalise ton espace.</h1><p className="page-lead">Ton parcours 2BAC pilote les matières, les cours et les exercices affichés.</p></header>
    <section className="settings-list">
      <div className="settings-row"><div className="settings-row__content"><h3>Personnalité</h3><p>Découvre ton profil d'apprentissage, {name}.</p></div><Link to="/preferences/personality" className="btn btn-secondary">Passer le test</Link></div>
      <div className="preferences-section">
        <div className="preferences-section__header"><div><span className="section-eyebrow">Parcours 2BAC</span><h2>Quel est ton parcours ?</h2><p>Choisis Sciences Physiques ou Sciences Mathématiques A/B. Le choix modifie réellement le contenu.</p></div>{track && <span className="badge badge--brand">{track === "SPC" ? pathLabels.SP : `Sciences Mathématiques ${section || ""}`}</span>}</div>
        <div className="track-grid">
          <button type="button" className={`track-card${track === "SPC" ? " selected" : ""}`} onClick={() => chooseTrack("SPC")}><span className="track-card__code">SP</span><span className="track-card__title">Sciences Physiques</span><span className="track-card__description">Maths · Physique-Chimie · SVT · Anglais · Philosophie</span><span className="track-card__indicator">{track === "SPC" ? "✓" : "→"}</span></button>
          <button type="button" className={`track-card${track === "SM" ? " selected" : ""}`} onClick={() => chooseTrack("SM")}><span className="track-card__code">SM</span><span className="track-card__title">Sciences Mathématiques</span><span className="track-card__description">Section A ou B · contenu adapté</span><span className="track-card__indicator">{track === "SM" ? "✓" : "→"}</span></button>
        </div>
        {track === "SM" && <div className="section-choice"><div className="section-choice__title"><strong>Section</strong><span>La section B n'affiche pas la SVT.</span></div><div className="section-choice__grid"><button type="button" className={`section-choice__card${section === "A" ? " selected" : ""}`} onClick={() => chooseSection("A")}><span>A</span><small>SM-A · Maths · PC · SVT · Anglais · Philo</small></button><button type="button" className={`section-choice__card${section === "B" ? " selected" : ""}`} onClick={() => chooseSection("B")}><span>B</span><small>SM-B · Maths · PC · Anglais · Philo</small></button></div></div>}
        <div className="preferences-save"><button type="button" className="btn btn-primary" disabled={!canSave || saving} onClick={() => void handleSave()}>{saving ? "Enregistrement..." : "Enregistrer mon parcours"}</button>{saved && <span className="preferences-saved">✓ Synchronisé</span>}{saveError && <span className="preferences-save-error">{saveError}</span>}</div>
      </div>
    </section>
  </div>;
}
