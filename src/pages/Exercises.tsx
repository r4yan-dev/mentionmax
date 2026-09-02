import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Clock3, Filter, Sparkles, Target } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { tracks } from "../data/curriculum/tracks";
import { contentCatalogService } from "../services/content/contentCatalogService";
import physicsPerson from "../assets/people/student-physics.webp";
import physicsBg from "../assets/people-bg/student-physics-bg.webp";
import type { Exercise, ExerciseType } from "../types/content";
import type { TrackId } from "../types/academic";
import "./Exercises.css";

const typeLabels: Record<ExerciseType, string> = {
  mcq: "QCM",
  numeric: "Numérique",
  "short-answer": "Réponse courte",
  proof: "Démonstration",
  calculation: "Calcul",
  "document-analysis": "Analyse de document",
  "multi-step": "Problème composé",
};

const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];

function resolveTrack(track: "SPC" | "SM" | null, section: "A" | "B" | null): TrackId {
  if (track === "SM") return section === "B" ? "SMB" : "SMA";
  return "SP";
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const isHard = exercise.difficulty >= 4;
  return (
    <article className={`exercise-library-card${isHard ? " exercise-library-card--hard" : ""}`}>
      <div className="exercise-library-card__top">
        <span className="exercise-pill">{typeLabels[exercise.type]}</span>
        <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>
          {difficultyLabels[exercise.difficulty]}
        </span>
      </div>
      <div className="exercise-library-card__icon"><Target size={20} /></div>
      <div className="exercise-library-card__body">
        <span className="exercise-library-card__chapter">{exercise.target.chapter}</span>
        <h3>{exercise.title}</h3>
        <p>{exercise.statement}</p>
      </div>
      <div className="exercise-library-card__footer">
        <span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span>
        <Link to={`/exercices/${exercise.id}`} className="exercise-open-link">
          Ouvrir <ArrowRight size={15} />
        </Link>
      </div>
    </article>
  );
}

function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [answer, setAnswer] = useState("");

  return (
    <main className="exercises-page exercises-detail-page">
      <Link to="/exercices" className="exercises-back"><ArrowLeft size={16} /> Retour aux exercices</Link>
      <div className="exercise-detail-layout">
        <article className="exercise-detail-card">
          <div className="exercise-library-card__top">
            <span className="exercise-pill">{typeLabels[exercise.type]}</span>
            <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span>
          </div>
          <span className="exercise-library-card__chapter">{exercise.target.chapter} · {exercise.target.topic}</span>
          <h1>{exercise.title}</h1>
          <p className="exercise-detail-statement">{exercise.statement}</p>
          {exercise.type === "mcq" && exercise.options ? (
            <div className="exercise-options">
              {exercise.options.map((option) => (
                <label key={option.id} className="exercise-option">
                  <input type="radio" name="answer" value={option.id} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              className="exercise-answer-box"
              placeholder="Écris ton raisonnement ou ta réponse ici..."
              rows={8}
            />
          )}
          <div className="exercise-detail-actions">
            <button type="button" className="btn btn-primary" onClick={() => setShowCorrection(true)}>
              Voir la correction
            </button>
            <span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span>
          </div>
        </article>

        <aside className="exercise-detail-side">
          <div className="exercise-side-card">
            <span className="section-eyebrow">Objectif</span>
            <h2>Travaille ce chapitre</h2>
            <p>{exercise.examTip || "Consolide la méthode avant de passer à un exercice plus difficile."}</p>
          </div>
          <div className="exercise-side-card exercise-side-card--mint">
            <Sparkles size={18} />
            <div>
              <strong>Personnalisé</strong>
              <p>Plus tard, l’IA construira une variante adaptée à tes erreurs et à ton niveau.</p>
            </div>
          </div>
        </aside>
      </div>

      {showCorrection && (
        <section className="exercise-correction-card">
          <div className="exercise-correction-card__icon"><CheckCircle2 size={20} /></div>
          <div>
            <span className="section-eyebrow">CORRECTION</span>
            <h2>Solution guidée</h2>
            <p>{exercise.correction}</p>
            {exercise.hint && <p className="exercise-hint"><strong>Réflexe :</strong> {exercise.hint}</p>}
          </div>
        </section>
      )}
    </main>
  );
}

export default function Exercises() {
  const { exerciseId } = useParams();
  const { schoolPreferences } = useAccount();
  const trackId = resolveTrack(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const [mode, setMode] = useState<"base" | "personalized">("base");
  const [subject, setSubject] = useState<"physique-chimie" | "maths" | "svt" | "anglais" | "philosophie">("physique-chimie");
  const [chapter, setChapter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const exercises = useMemo(
    () => mode === "base" ? contentCatalogService.getBaseExercises(trackId, subject) : [],
    [mode, subject, trackId],
  );

  const chapters = useMemo(() => [...new Set(exercises.map((exercise) => exercise.target.chapter))], [exercises]);
  const selectedExercise = exerciseId ? exercises.find((exercise) => exercise.id === exerciseId) : undefined;

  const filtered = useMemo(() => exercises.filter((exercise) => {
    const chapterMatch = chapter === "all" || exercise.target.chapter === chapter;
    const difficultyMatch = difficulty === "all" || String(exercise.difficulty) === difficulty;
    return chapterMatch && difficultyMatch;
  }), [chapter, difficulty, exercises]);

  if (exerciseId && selectedExercise) return <ExerciseDetail exercise={selectedExercise} />;

  return (
    <main className="exercises-page">
      <header className="exercises-header">
        <div>
          <span className="section-eyebrow">BANQUE D’EXERCICES</span>
          <h1>Travaille vraiment le cours.</h1>
          <p>{tracks[trackId].label} · exercices classés par matière, chapitre et difficulté.</p>
        </div>
        <div className="exercises-header__stats">
          <span><BookOpen size={17} /> {filtered.length} exercices</span>
          <span><BrainCircuit size={17} /> Base structurée</span>
        </div>
      </header>

      <section className="physics-exercise-feature" style={{ backgroundImage: `url(${physicsBg})` }}>
        <div className="physics-exercise-feature__content">
          <span className="physics-exercise-feature__eyebrow">DÉFI PHYSIQUE</span>
          <h2>Des problèmes qui mélangent vraiment les chapitres.</h2>
          <p>Projectile, énergie, rotation, circuits, gravitation et chimie : les exercices composés te demandent de choisir toi-même les bons outils, comme au vrai Bac.</p>
          <button type="button" className="btn btn-primary" onClick={() => setDifficulty("4")}>
            Voir les exercices composés <ArrowRight size={15} />
          </button>
        </div>
        <div className="physics-exercise-feature__person" aria-hidden="true">
          <img src={physicsPerson} alt="" />
        </div>
      </section>

      <section className="exercise-mode-switch" aria-label="Source des exercices">
        <button type="button" className={mode === "base" ? "active" : ""} onClick={() => setMode("base")}>
          <BookOpen size={16} /> Base
        </button>
        <button type="button" className={mode === "personalized" ? "active" : ""} onClick={() => setMode("personalized")}>
          <Sparkles size={16} /> Personnalisé <span>Bientôt</span>
        </button>
      </section>

      <section className="exercise-filters card">
        <div className="exercise-filter-heading"><Filter size={16} /><strong>Filtrer</strong></div>
        <label>
          <span>Matière</span>
          <select value={subject} onChange={(event) => { setSubject(event.target.value as typeof subject); setChapter("all"); }}>
            {tracks[trackId].subjects.map((subjectId) => (
              <option key={subjectId} value={subjectId}>
                {subjectId === "physique-chimie" ? "Physique-Chimie" : subjectId === "maths" ? "Mathématiques" : subjectId === "svt" ? "SVT" : subjectId === "anglais" ? "Anglais" : "Philosophie"}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Chapitre</span>
          <select value={chapter} onChange={(event) => setChapter(event.target.value)}>
            <option value="all">Tous les chapitres</option>
            {chapters.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label>
          <span>Difficulté</span>
          <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
            <option value="all">Toutes</option>
            {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{difficultyLabels[value]}</option>)}
          </select>
        </label>
      </section>

      {mode === "personalized" ? (
        <section className="exercises-empty card">
          <div className="exercises-empty__icon"><Sparkles size={20} /></div>
          <div>
            <span className="section-eyebrow">MODE IA</span>
            <h2>Les exercices personnalisés arrivent après le diagnostic.</h2>
            <p>Le catalogue est déjà séparé entre contenu de base et contenu personnalisé. La génération IA sera branchée sur les faiblesses réelles de chaque élève, pas sur un bouton qui invente des exercices au hasard.</p>
          </div>
          <Link to="/ai-help" className="btn btn-secondary">Ouvrir l’IA <ArrowRight size={15} /></Link>
        </section>
      ) : (
        <section className="exercise-grid">
          {filtered.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)}
        </section>
      )}
    </main>
  );
}
