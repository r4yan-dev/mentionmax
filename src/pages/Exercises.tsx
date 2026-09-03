import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Clock3, Filter, FlaskConical, Sparkles, Target } from "lucide-react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { tracks, getTrackSubjects } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { contentCatalogService } from "../services/content/contentCatalogService";
import { helios300MathExercises, type HeliosExerciseMeta } from "../data/mock/helios300MathExercises";
import { LatexText } from "../components/ui/LatexText";
import type { Exercise, ExerciseType } from "../types/content";
import type { SubjectId, TrackId } from "../types/academic";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import "./Exercises.css";

const typeLabels: Record<ExerciseType, string> = { mcq: "QCM", numeric: "Numérique", "short-answer": "Réponse courte", proof: "Démonstration", calculation: "Calcul", "document-analysis": "Analyse de document", "multi-step": "Problème guidé" };
const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];
const subjectLabels: Record<SubjectId, string> = { maths: "Mathématiques", "physique-chimie": "Physique-Chimie", svt: "SVT", anglais: "Anglais", philosophie: "Philosophie" };
type Collection = "all" | "existing" | "helios";
type DisplayExercise = Exercise & HeliosExerciseMeta;

function resolveTrack(track: "SPC" | "SM" | null, section: "A" | "B" | null): TrackId { return resolveUserPath(track, section); }

function HeliosExerciseWidget({ exercise }: { exercise: DisplayExercise }) {
  const exerciseNumber = exercise.id.match(/-e(\d+)$/)?.[1] ?? "01";
  return <article className="helios-exercise-widget">
    <div className="helios-widget__top">
      <div className="helios-widget__mission"><FlaskConical size={15} /><span>MISSION HELIOS</span><b>J{String(exercise.missionDay).padStart(2, "0")}</b></div>
      <span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span>
    </div>
    <div className="helios-widget__identity"><span>EXERCICE {exerciseNumber}/20</span><span>{exercise.target.chapter}</span></div>
    <h3>{exercise.title}</h3>
    <p className="helios-widget__context"><LatexText>{exercise.context}</LatexText></p>
    <div className="helios-widget__objective"><Target size={15} /><span>MISSION</span><strong>{exercise.missionObjective}</strong></div>
    <div className="helios-widget__parts">{exercise.parts.map((part, index) => <div key={`${exercise.id}-part-${index}`}><b>{String.fromCharCode(97 + index)}</b><LatexText>{part}</LatexText></div>)}</div>
    <div className="helios-widget__bottom"><span><Sparkles size={14} /> {exercise.animation}</span><Link to={`/exercices/${exercise.id}`} className="helios-widget__open">Commencer <ArrowRight size={15} /></Link></div>
  </article>;
}

function ExerciseCard({ exercise }: { exercise: DisplayExercise }) {
  if (exercise.tags.includes("MISSION_HELIOS")) return <HeliosExerciseWidget exercise={exercise} />;
  return <article className="exercise-library-card"><div className="exercise-library-card__top"><span className="exercise-pill">Base 2BAC</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div><div className="exercise-library-card__icon"><Target size={20} /></div><div className="exercise-library-card__body"><span className="exercise-library-card__chapter">{exercise.target.chapter}</span><h3>{exercise.title}</h3><p><LatexText>{exercise.statement}</LatexText></p></div><div className="exercise-library-card__footer"><span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span><Link to={`/exercices/${exercise.id}`} className="exercise-open-link">Ouvrir <ArrowRight size={15} /></Link></div></article>;
}

function ExerciseDetail({ exercise }: { exercise: DisplayExercise }) {
  const [showCorrection, setShowCorrection] = useState(false); const [answer, setAnswer] = useState(""); const helios = exercise.tags.includes("MISSION_HELIOS");
  return <main className="exercises-page exercises-detail-page"><Link to="/exercices" className="exercises-back"><ArrowLeft size={16} /> Retour aux exercices</Link><div className="exercise-detail-layout"><article className="exercise-detail-card"><div className="exercise-library-card__top"><span className="exercise-pill">{helios ? <><FlaskConical size={13} /> Mission Helios</> : typeLabels[exercise.type]}</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div><span className="exercise-library-card__chapter">{exercise.target.chapter} · {exercise.target.topic}</span><h1>{exercise.title}</h1>{helios ? <div className="helios-detail-banner"><span className="section-eyebrow">MISSION HELIOS · JOUR {String(exercise.missionDay).padStart(2,"0")}</span><strong>{exercise.missionObjective}</strong><p>{exercise.context}</p></div> : null}{helios && exercise.parts.length ? <section className="helios-detail-parts"><span className="section-eyebrow">TRAVAIL À EFFECTUER</span><ol>{exercise.parts.map((part, i) => <li key={`${exercise.id}-part-${i}`}><LatexText>{part}</LatexText></li>)}</ol></section> : <p className="exercise-detail-statement"><LatexText>{exercise.statement}</LatexText></p>}{helios && exercise.animation ? <div className="helios-detail-animation"><strong>Animation</strong><span>{exercise.animation}</span></div> : null}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="exercise-answer-box" placeholder="Écris ton raisonnement ou ta réponse ici..." rows={8} /><div className="exercise-detail-actions"><button type="button" className="btn btn-primary" onClick={() => setShowCorrection(true)}>Voir la correction</button><span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span></div></article><aside className="exercise-detail-side"><div className="exercise-side-card"><span className="section-eyebrow">Objectif</span><h2>Travaille ce chapitre</h2><p>{exercise.hint || "Consolide la méthode avant de passer à un exercice plus difficile."}</p></div></aside></div>{showCorrection && <section className="exercise-correction-card"><div className="exercise-correction-card__icon"><CheckCircle2 size={20} /></div><div><span className="section-eyebrow">CORRECTION</span><h2>Solution guidée</h2><p><LatexText>{exercise.correction}</LatexText></p></div></section>}</main>;
}

export default function Exercises() {
  const { exerciseId } = useParams(); const [searchParams] = useSearchParams(); const { schoolPreferences } = useAccount();
  const trackId = resolveTrack(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null); const allowedSubjects = getTrackSubjects(trackId).map((subject) => subject.id); const requestedSubject = searchParams.get("subject") as SubjectId | null; const requestedCollection = searchParams.get("collection");
  const [mode, setMode] = useState<"base" | "personalized">("base"); const [collection, setCollection] = useState<Collection>(requestedCollection === "helios" ? "helios" : requestedCollection === "existing" ? "existing" : "all"); const [subject, setSubject] = useState<SubjectId>(requestedSubject && allowedSubjects.includes(requestedSubject) ? requestedSubject : allowedSubjects[0]); const [chapter, setChapter] = useState("all"); const [difficulty, setDifficulty] = useState("all");

  useEffect(() => { const nextRequested = searchParams.get("subject") as SubjectId | null; const nextCollection = searchParams.get("collection"); if (nextRequested && allowedSubjects.includes(nextRequested)) setSubject(nextRequested); else if (!allowedSubjects.includes(subject)) setSubject(allowedSubjects[0]); if (nextCollection === "helios" || nextCollection === "existing") setCollection(nextCollection); else if (!nextCollection) setCollection("all"); setChapter("all"); }, [trackId, searchParams, allowedSubjects.join(",")]);

  const existingExercises = useMemo(() => contentCatalogService.getBaseExercises(trackId, subject).filter((exercise) => !exercise.tags.includes("MISSION_HELIOS")), [subject, trackId]);
  const heliosExercises = useMemo<DisplayExercise[]>(() => subject === "maths" ? helios300MathExercises.filter((exercise) => exercise.target.trackIds.includes(trackId)) : [], [subject, trackId]);
  const allExercises = useMemo<DisplayExercise[]>(() => [...existingExercises, ...heliosExercises], [existingExercises, heliosExercises]);
  const exercises = collection === "helios" ? heliosExercises : collection === "existing" ? existingExercises : allExercises;
  const chapters = useMemo(() => [...new Set(exercises.map((exercise) => exercise.target.chapter))], [exercises]);
  const selectedExercise = exerciseId ? allExercises.find((exercise) => exercise.id === exerciseId) : undefined;
  const filtered = useMemo(() => exercises.filter((exercise) => (chapter === "all" || exercise.target.chapter === chapter) && (difficulty === "all" || String(exercise.difficulty) === difficulty)), [chapter, difficulty, exercises]);
  if (exerciseId && selectedExercise) return <ExerciseDetail exercise={selectedExercise} />;
  return <main className="exercises-page"><header className="exercises-header"><div><span className="section-eyebrow">BANQUE D’EXERCICES · 2BAC</span><h1>Travaille vraiment le cours.</h1><p>{tracks[trackId].label} · {filtered.length} exercice{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} pour {subjectLabels[subject]}.</p></div><div className="exercises-header__right"><PathSwitcher /><div className="exercises-header__stats"><span><BookOpen size={17} /> {allExercises.length} au total</span><span><FlaskConical size={17} /> {heliosExercises.length} Helios</span></div></div></header><section className="exercise-collection-switch" aria-label="Collection d’exercices"><button type="button" className={collection === "all" ? "active" : ""} onClick={() => setCollection("all")}><BookOpen size={16} /> Tout <span>{allExercises.length}</span></button><button type="button" className={collection === "helios" ? "active" : ""} onClick={() => setCollection("helios")}><FlaskConical size={16} /> Mission Helios <span>{heliosExercises.length}</span></button><button type="button" className={collection === "existing" ? "active" : ""} onClick={() => setCollection("existing")}><BrainCircuit size={16} /> Exercices existants <span>{existingExercises.length}</span></button></section><section className="exercise-mode-switch" aria-label="Source des exercices"><button type="button" className={mode === "base" ? "active" : ""} onClick={() => setMode("base")}><BookOpen size={16} /> Base</button><button type="button" className={mode === "personalized" ? "active" : ""} onClick={() => setMode("personalized")}><Sparkles size={16} /> Personnalisé <span>Bientôt</span></button></section><section className="exercise-filters card"><div className="exercise-filter-heading"><Filter size={16} /><strong>Filtrer</strong></div><label><span>Matière</span><select value={subject} onChange={(event) => { setSubject(event.target.value as SubjectId); setChapter("all"); }}>{allowedSubjects.map((subjectId) => <option key={subjectId} value={subjectId}>{subjectLabels[subjectId]}</option>)}</select></label><label><span>Chapitre</span><select value={chapter} onChange={(event) => setChapter(event.target.value)}><option value="all">Tous les chapitres</option>{chapters.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span>Difficulté</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">Toutes</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{difficultyLabels[value]}</option>)}</select></label></section>{mode === "personalized" ? <section className="exercises-empty card"><div className="exercises-empty__icon"><Sparkles size={20} /></div><div><span className="section-eyebrow">MODE IA</span><h2>Le contenu personnalisé viendra en dernier.</h2><p>Le catalogue de base reste totalement utilisable sans API.</p></div><Link to="/preferences" className="btn btn-secondary">Modifier le parcours <ArrowRight size={15} /></Link></section> : <section className="exercise-grid">{filtered.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)}</section>}</main>;
}
