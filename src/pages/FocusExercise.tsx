import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock3, FlaskConical, Lightbulb, Loader2, Sparkles, Target } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { contentCatalogService } from "../services/content/contentCatalogService";
import { getMissionHeliosProgress, saveMissionHeliosProgress } from "../features/exercises/missionHeliosProgress";
import { helios300MathExercises } from "../data/mock/helios300MathExercises";
import ExerciseEngine, { type ExerciseQuestion } from "../features/exercises/ExerciseEngine";
import { LatexText } from "../components/ui/LatexText";
import type { Exercise } from "../types/content";
import "./FocusExercise.css";

const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];

function difficultyName(value: number) {
  return difficultyLabels[value] ?? "Intermédiaire";
}

function toEngineExercise(exercise: Exercise): ExerciseQuestion {
  const acceptedAnswers = exercise.acceptedAnswers ?? (exercise.expectedAnswer ? [exercise.expectedAnswer] : []);
  return {
    id: Number(exercise.id.replace(/\D/g, "").slice(-9)) || 0,
    subject: exercise.target.subjectId === "maths" ? "Mathématiques" : exercise.target.subjectId,
    chapter: exercise.target.chapter,
    title: exercise.title,
    statement: exercise.statement,
    acceptedAnswers,
    explanation: exercise.correction,
    hint: exercise.hint ?? "Relis les hypothèses et identifie la propriété du cours à utiliser.",
    difficulty: exercise.difficulty <= 2 ? "Easy" : exercise.difficulty === 3 ? "Medium" : "Hard",
    duration: exercise.estimatedMinutes,
  };
}

function HeliosRunner({ exerciseId }: { exerciseId: string }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const exercise = useMemo(() => helios300MathExercises.find((item) => item.id === exerciseId), [exerciseId]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [savingProgress, setSavingProgress] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      setLoadingProgress(true);
      setSaveError(null);
      setSubmitted(false);
      setShowHint(false);

      try {
        if (!exercise || !user) {
          if (active) setAnswers(exercise?.parts.map(() => "") ?? []);
          return;
        }

        const progress = await getMissionHeliosProgress(exercise.id);
        if (!active) return;

        const nextAnswers = exercise.parts.map((_, index) => progress?.answers[index] ?? "");
        setAnswers(nextAnswers);
        setSubmitted(Boolean(progress?.completed));
      } catch (error) {
        console.error("Failed to load Mission Helios progress:", error);
        if (active) {
          setAnswers(exercise?.parts.map(() => "") ?? []);
          setSaveError("Impossible de charger ta progression. Tes réponses restent disponibles pour cette session.");
        }
      } finally {
        if (active) setLoadingProgress(false);
      }
    }

    loadProgress();
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });

    return () => {
      active = false;
    };
  }, [exerciseId, exercise, user]);

  if (!exercise) {
    return (
      <main className="focus-exercise-page">
        <section className="focus-question-card">
          <span className="section-eyebrow">MISSION HELIOS</span>
          <h1>Exercice introuvable.</h1>
          <button className="btn btn-primary" onClick={() => navigate("/exercices?collection=helios")}>Retour à Mission Helios</button>
        </section>
      </main>
    );
  }

  const exerciseNumber = Number(exercise.id.match(/-e(\d+)$/)?.[1] ?? 1);
  const missionExercises = helios300MathExercises.filter((item) => item.missionDay === exercise.missionDay);
  const currentIndex = missionExercises.findIndex((item) => item.id === exercise.id);
  const previous = missionExercises[currentIndex - 1];
  const next = missionExercises[currentIndex + 1];
  const answeredCount = answers.filter((answer) => answer.trim().length > 0).length;

  async function finishExercise() {
    if (!user || answeredCount === 0 || savingProgress) return;

    setSavingProgress(true);
    setSaveError(null);

    try {
      await saveMissionHeliosProgress(exercise.id, answers, true);
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to save Mission Helios progress:", error);
      setSaveError("La correction s'affiche, mais la progression n'a pas pu être enregistrée. Réessaie une fois connecté.");
    } finally {
      setSavingProgress(false);
    }
  }

  async function saveDraft() {
    if (!user || answeredCount === 0 || savingProgress || submitted) return;

    setSavingProgress(true);
    setSaveError(null);
    try {
      await saveMissionHeliosProgress(exercise.id, answers, false);
    } catch (error) {
      console.error("Failed to save Mission Helios draft:", error);
      setSaveError("Brouillon non enregistré.");
    } finally {
      setSavingProgress(false);
    }
  }

  return (
    <main className="focus-exercise-page helios-runner-page">
      <div className="helios-runner-shell">
        <header className="helios-runner-header">
          <button className="runner-back" onClick={() => navigate("/exercices?collection=helios")}><ArrowLeft size={16} /> Exercices</button>
          <div className="helios-runner-progress">
            <div className="helios-runner-progress__top"><span>MISSION HELIOS · JOUR {String(exercise.missionDay).padStart(2, "0")}</span><strong>Exercice {exerciseNumber}/20</strong></div>
            <div className="helios-progress-track"><div style={{ width: `${(exerciseNumber / 20) * 100}%` }} /></div>
          </div>
          <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyName(exercise.difficulty)}</span>
        </header>

        <section className="helios-mission-banner">
          <div className="helios-mission-banner__icon"><FlaskConical size={21} /></div>
          <div><span className="section-eyebrow">OBJECTIF DU JOUR</span><strong>{exercise.missionObjective}</strong></div>
          <div className="helios-mission-banner__chapter"><span>CHAPITRE</span><strong>{exercise.target.chapter}</strong></div>
        </section>

        <section className="focus-question-card helios-question-card">
          <div className="helios-question-meta"><span><Sparkles size={15} /> MISSION HELIOS</span><span><Clock3 size={14} /> {exercise.estimatedMinutes} min</span>{submitted ? <span className="helios-complete-badge"><CheckCircle2 size={14} /> Terminé</span> : null}</div>
          <h1>{exercise.title}</h1>
          <div className="helios-context-box"><span className="section-eyebrow">CONTEXTE</span><LatexText>{exercise.context}</LatexText></div>
          <div className="helios-objective-box"><Target size={17} /><div><span>Mission</span><strong>{exercise.missionObjective}</strong></div></div>

          {loadingProgress ? (
            <div className="helios-loading-state"><Loader2 size={18} className="helios-spin" /> Chargement de ta progression...</div>
          ) : (
            <div className="helios-parts">
              <div className="helios-parts__header"><div><span className="section-eyebrow">TRAVAIL À EFFECTUER</span><h2>{exercise.parts.length} partie{exercise.parts.length > 1 ? "s" : ""}</h2></div><span>{answeredCount}/{exercise.parts.length} commencée{answeredCount > 1 ? "s" : ""}</span></div>
              {exercise.parts.map((part, index) => (
                <label className="helios-part" key={`${exercise.id}-part-${index}`}>
                  <span className="helios-part__number">{String.fromCharCode(97 + index)}</span>
                  <div className="helios-part__content"><LatexText>{part}</LatexText><textarea value={answers[index] ?? ""} onBlur={saveDraft} onChange={(event) => { setSaveError(null); setSubmitted(false); setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? event.target.value : answer)); }} placeholder="Écris ton raisonnement ici..." rows={4} disabled={loadingProgress || submitted} /></div>
                </label>
              ))}
            </div>
          )}

          <div className="helios-work-footer"><div className="helios-animation-note"><Sparkles size={15} /><span>{exercise.animation}</span></div><button type="button" className="btn btn-primary" disabled={loadingProgress || answeredCount === 0 || savingProgress || submitted} onClick={finishExercise}>{savingProgress ? <><Loader2 size={16} className="helios-spin" /> Enregistrement...</> : submitted ? <><CheckCircle2 size={16} /> Exercice terminé</> : <>Terminer l'exercice <CheckCircle2 size={16} /></>}</button></div>
          <div className="helios-runner-tools"><button type="button" className="runner-tool-button" onClick={() => setShowHint((value) => !value)}><Lightbulb size={16} /> {showHint ? "Masquer l'aide" : "Afficher un rappel"}</button>{savingProgress ? <span className="helios-saving-status">Enregistrement...</span> : submitted ? <span className="helios-saving-status helios-saving-status--done"><CheckCircle2 size={14} /> Progression enregistrée</span> : null}</div>
          {showHint && <div className="helios-hint-box"><strong>Rappel de méthode</strong><p>Identifie d'abord la notion du chapitre, écris les étapes avant de calculer, puis vérifie les hypothèses.</p></div>}
          {saveError && <div className="helios-save-error">{saveError}</div>}
          {submitted && <section className="helios-correction-panel"><div className="helios-correction-panel__icon"><CheckCircle2 size={21} /></div><div><span className="section-eyebrow">CORRECTION GUIDÉE</span><h2>Compare ton raisonnement</h2><p><LatexText>{exercise.correction}</LatexText></p></div></section>}
        </section>

        <nav className="helios-runner-nav" aria-label="Navigation entre les exercices">
          <button type="button" className="runner-nav-button" disabled={!previous} onClick={() => previous && navigate(`/exercices/${previous.id}`)}><ChevronLeft size={18} /><span><small>Précédent</small><strong>{previous?.title ?? "Premier exercice"}</strong></span></button>
          <div className="runner-day-status">J{String(exercise.missionDay).padStart(2, "0")} · {exerciseNumber}/20</div>
          <button type="button" className="runner-nav-button runner-nav-button--next" disabled={!next} onClick={() => next && navigate(`/exercices/${next.id}`)}><span><small>Suivant</small><strong>{next?.title ?? "Fin de la journée"}</strong></span><ChevronRight size={18} /></button>
        </nav>
      </div>
    </main>
  );
}

export default function FocusExercise() {
  const { exerciseId } = useParams();
  const baseExercise = useMemo(() => {
    if (!exerciseId) return undefined;
    return contentCatalogService.getBaseExercises("SMA", "maths").find((exercise) => exercise.id === exerciseId);
  }, [exerciseId]);
  const [completed, setCompleted] = useState(false);
  if (exerciseId?.startsWith("helios-")) return <HeliosRunner exerciseId={exerciseId} />;
  if (baseExercise) {
    return <main className="focus-exercise-page"><div className="focus-exercise-shell"><ExerciseEngine exercise={toEngineExercise(baseExercise)} completed={completed} onComplete={() => setCompleted(true)} onBack={() => window.history.back()} onNext={() => window.history.back()} /></div></main>;
  }
  return <main className="focus-exercise-page"><section className="focus-question-card"><span className="section-eyebrow">EXERCICES</span><h1>Exercice introuvable.</h1><p>Cette ressource n'existe plus dans le catalogue local.</p></section></main>;
}
