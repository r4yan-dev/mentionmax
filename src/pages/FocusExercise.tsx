import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, FlaskConical, Lightbulb, Loader2, Sparkles, Target } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { useAuth } from "../context/AuthContext";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { contentCatalogService } from "../services/content/contentCatalogService";
import { getMissionHeliosProgress, saveMissionHeliosProgress } from "../features/exercises/missionHeliosProgress";
import { missionHeliosByDay, missionHeliosById } from "../data/mock/missionHeliosBank";
import { LatexText } from "../components/ui/LatexText";
import type { Exercise } from "../types/content";
import "./FocusExercise.css";

const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];

type RunnerExercise = Exercise & { missionDay?: number; missionObjective?: string; context?: string; parts?: string[]; animation?: string };

function trackIdForPath(path: ReturnType<typeof resolveUserPath>) { return path === "SP" ? "SP" : path === "SMA" ? "SMA" : "SMB"; }

export default function FocusExercise() {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackId = trackIdForPath(path);
  const exercise = useMemo<RunnerExercise | undefined>(() => {
    if (!exerciseId) return undefined;
    if (exerciseId.startsWith("helios-")) return missionHeliosById.get(exerciseId);
    return contentCatalogService.getBaseExercises(trackId, "maths").find((item) => item.id === exerciseId) as RunnerExercise | undefined;
  }, [exerciseId, trackId]);

  const isHelios = Boolean(exercise?.tags.includes("MISSION_HELIOS"));
  const parts = exercise?.parts?.length ? exercise.parts : exercise ? [exercise.statement] : [];
  const [answers, setAnswers] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setError(null);
      setDone(false);
      setAnswers(parts.map(() => ""));
      if (!exercise || !isHelios || !user) return;
      try {
        const progress = await getMissionHeliosProgress(exercise.id);
        if (!active) return;
        setAnswers(parts.map((_, index) => progress?.answers[index] ?? ""));
        setDone(Boolean(progress?.completed));
      } catch (loadError) {
        console.error(loadError);
        if (active) setError("La progression locale n’a pas pu être chargée.");
      }
    }
    void load();
    return () => { active = false; };
  }, [exercise, isHelios, user, parts.length]);

  if (!exercise) return <main className="focus-exercise-page"><section className="focus-question-card"><span className="section-eyebrow">EXERCICE</span><h1>Ressource introuvable.</h1><p>Ce contenu n’existe pas dans ton parcours actuel.</p><Link to="/exercices" className="btn btn-primary">Retour aux exercices</Link></section></main>;

  const dayExercises = isHelios ? missionHeliosByDay.get(exercise.missionDay ?? 1) ?? [] : [];
  const index = isHelios ? dayExercises.findIndex((item) => item.id === exercise.id) : -1;
  const previous = index > 0 ? dayExercises[index - 1] : undefined;
  const next = index >= 0 ? dayExercises[index + 1] : undefined;
  const answered = answers.filter((value) => value.trim()).length;

  async function complete() {
    if (!isHelios || !user || !answered || busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveMissionHeliosProgress(exercise.id, answers, true);
      setDone(true);
    } catch (saveError) {
      console.error(saveError);
      setError("La correction est disponible, mais la progression n’a pas pu être enregistrée.");
    } finally {
      setBusy(false);
    }
  }

  async function saveDraft() {
    if (!isHelios || !user || !answered || busy || done) return;
    try { await saveMissionHeliosProgress(exercise.id, answers, false); } catch (saveError) { console.error(saveError); }
  }

  return <main className="focus-exercise-page helios-runner-page"><div className="helios-runner-shell">
    <header className="helios-runner-header"><button className="runner-back" onClick={() => navigate(isHelios ? "/exercices?collection=helios&subject=maths" : "/exercices")}><ArrowLeft size={16} /> Exercices</button>{isHelios ? <div className="helios-runner-progress"><div className="helios-runner-progress__top"><span>MISSION HELIOS · JOUR {String(exercise.missionDay).padStart(2,"0")}</span><strong>Exercice {index + 1}/20</strong></div><div className="helios-progress-track"><div style={{ width: `${((index + 1) / 20) * 100}%` }} /></div></div> : <div className="helios-runner-progress"><div className="helios-runner-progress__top"><span>{path}</span><strong>Exercice</strong></div></div>}<span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></header>

    <section className="helios-mission-banner"><div className="helios-mission-banner__icon"><FlaskConical size={21} /></div><div><span className="section-eyebrow">{isHelios ? "OBJECTIF DU JOUR" : "PROGRAMME"}</span><strong>{exercise.missionObjective ?? "Maîtriser la notion et rédiger une solution propre."}</strong></div><div className="helios-mission-banner__chapter"><span>CHAPITRE</span><strong>{exercise.target.chapter}</strong></div></section>

    <section className="focus-question-card helios-question-card"><div className="helios-question-meta"><span><Sparkles size={14} /> {isHelios ? "MISSION HELIOS" : "EXERCICE"}</span><span><Clock3 size={14} /> {exercise.estimatedMinutes} min</span>{done ? <span className="helios-complete-badge"><CheckCircle2 size={14} /> Terminé</span> : null}</div><h1>{exercise.title}</h1><div className="helios-context-box"><span className="section-eyebrow">CONTEXTE</span><LatexText>{exercise.context ?? exercise.statement}</LatexText></div><div className="helios-objective-box"><Target size={17} /><div><span>Objectif</span><strong>{exercise.missionObjective ?? "Résoudre et justifier."}</strong></div></div>

      <div className="helios-parts"><div className="helios-parts__header"><div><span className="section-eyebrow">TRAVAIL À EFFECTUER</span><h2>{parts.length} partie{parts.length > 1 ? "s" : ""}</h2></div><span>{answered}/{parts.length} remplie{answered > 1 ? "s" : ""}</span></div>{parts.map((part, indexPart) => <label className="helios-part" key={`${exercise.id}-${indexPart}`}><span className="helios-part__number">{String.fromCharCode(97 + indexPart)}</span><div className="helios-part__content"><LatexText>{part}</LatexText><textarea value={answers[indexPart] ?? ""} rows={5} disabled={done} onBlur={() => void saveDraft()} onChange={(event) => { setDone(false); setAnswers((current) => current.map((value, index) => index === indexPart ? event.target.value : value)); }} placeholder="Écris ton raisonnement ici..." /></div></label>)}</div>

      <div className="helios-work-footer"><div className="helios-animation-note"><Sparkles size={15} /> <span>{exercise.animation ?? "Visualisation du raisonnement prévue dans l’interface."}</span></div>{isHelios ? <button className="btn btn-primary" disabled={!user || !answered || busy || done} onClick={() => void complete()}>{busy ? <><Loader2 size={16} /> Enregistrement...</> : done ? <><CheckCircle2 size={16} /> Exercice terminé</> : <>Terminer <CheckCircle2 size={16} /></>}</button> : <Link to="/exercices" className="btn btn-primary">Valider ma session <ArrowRight size={16} /></Link>}</div>
      <div className="helios-runner-tools"><button className="runner-tool-button" onClick={() => setHint((value) => !value)}><Lightbulb size={16} /> {hint ? "Masquer le rappel" : "Afficher un rappel"}</button>{isHelios && busy ? <span>Enregistrement...</span> : null}</div>{hint ? <div className="helios-hint-box"><strong>Rappel de méthode</strong><p>{exercise.hint ?? "Identifie la notion, écris la propriété utilisée, puis avance étape par étape avant de vérifier le résultat."}</p></div> : null}{error ? <div className="helios-save-error">{error}</div> : null}{done ? <section className="helios-correction-panel"><div className="helios-correction-panel__icon"><CheckCircle2 size={21} /></div><div><span className="section-eyebrow">CORRECTION</span><h2>Compare ton raisonnement</h2><p><LatexText>{exercise.correction}</LatexText></p></div></section> : null}
    </section>

    {isHelios ? <nav className="helios-runner-nav"><button className="runner-nav-button" disabled={!previous} onClick={() => previous && navigate(`/exercices/${previous.id}`)}><ArrowLeft size={18} /><span><small>Précédent</small><strong>{previous?.title ?? "Premier exercice"}</strong></span></button><span className="runner-day-status">J{String(exercise.missionDay).padStart(2,"0")} · {index + 1}/20</span><button className="runner-nav-button runner-nav-button--next" disabled={!next} onClick={() => next && navigate(`/exercices/${next.id}`)}><span><small>Suivant</small><strong>{next?.title ?? "Fin de la journée"}</strong></span><ArrowRight size={18} /></button></nav> : null}
  </div></main>;
}
