import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Clock3, Filter, FlaskConical, Sparkles, Target } from "lucide-react";
import { Link, useSearchParams, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { tracks, getTrackSubjects } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { contentCatalogService } from "../services/content/contentCatalogService";
import type { HeliosExerciseMeta } from "../data/mock/helios300MathExercises";
import { LatexText } from "../components/ui/LatexText";
import type { Exercise, ExerciseType } from "../types/content";
import type { SubjectId, TrackId } from "../types/academic";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import "./Exercises.css";

const typeLabels: Record<ExerciseType, string> = { mcq: "QCM", numeric: "Numérique", "short-answer": "Réponse courte", proof: "Démonstration", calculation: "Calcul", "document-analysis": "Analyse de document", "multi-step": "Problème guidé" };
const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];
const subjectLabels: Record<SubjectId, string> = { maths: "Mathématiques", "physique-chimie": "Physique-Chimie", svt: "SVT", anglais: "Anglais", philosophie: "Philosophie" };
type Collection = "all" | "existing" | "helios";

function resolveTrack(track: "SPC" | "SM" | null, section: "A" | "B" | null): TrackId { return resolveUserPath(track, section); }

function getHeliosMeta(exercise: Exercise) {
  const candidate = exercise as Exercise & Partial<HeliosExerciseMeta>;
  return exercise.tags.includes("MISSION_HELIOS") ? candidate : null;
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const helios = getHeliosMeta(exercise);
  return <article className="exercise-library-card"><div className="exercise-library-card__top"><span className="exercise-pill">{helios?.missionDay ? <><FlaskConical size={13} /> Helios J{String(helios.missionDay).padStart(2,"0")}</> : <>Base 2BAC</>}</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div><div className="exercise-library-card__icon"><Target size={20} /></div><div className="exercise-library-card__body"><span className="exercise-library-card__chapter">{exercise.target.chapter}</span><h3>{exercise.title}</h3><p><LatexText>{helios?.context || exercise.statement}</LatexText></p></div><div className="exercise-library-card__footer"><span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span><Link to={`/exercices/${exercise.id}`} className="exercise-open-link">Ouvrir <ArrowRight size={15} /></Link></div></article>;
}

function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const [answer, setAnswer] = useState("");
  const helios = getHeliosMeta(exercise);
  return <main className="exercises-page exercises-detail-page"><Link to="/exercices" className="exercises-back"><ArrowLeft size={16} /> Retour aux exercices</Link><div className="exercise-detail-layout"><article className="exercise-detail-card"><div className="exercise-library-card__top"><span className="exercise-pill">{typeLabels[exercise.type]}</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div><span className="exercise-library-card__chapter">{exercise.target.chapter} · {exercise.target.topic}</span><h1>{exercise.title}</h1>{helios?.missionDay ? <div className="card" style={{ margin: "16px 0", padding: "16px" }}><span className="section-eyebrow">MISSION HELIOS · JOUR {String(helios.missionDay).padStart(2,"0")}</span><strong style={{ display: "block", marginTop: 6 }}>{helios.missionObjective}</strong><p style={{ margin: "8px 0 0", lineHeight: 1.7 }}>{helios.context}</p></div> : null}{helios?.parts?.length ? <section className="card" style={{ margin: "16px 0", padding: "18px" }}><span className="section-eyebrow">TRAVAIL À EFFECTUER</span><ol style={{ margin: "12px 0 0", paddingLeft: 24, lineHeight: 1.8 }}>{helios.parts.map((part, i) => <li key={`${exercise.id}-part-${i}`}><LatexText>{part}</LatexText></li>)}</ol></section> : <p className="exercise-detail-statement"><LatexText>{exercise.statement}</LatexText></p>}{helios?.animation ? <div style={{ margin: "16px 0", padding: "12px 14px", borderRadius: 12, background: "var(--seafoam, #DDF5F1)" }}><strong>Animation :</strong> {helios.animation}</div> : null}{exercise.type === "mcq" && exercise.options ? <div className="exercise-options">{exercise.options.map((option) => <label key={option.id} className="exercise-option"><input type="radio" name="answer" value={option.id} /><span><LatexText>{option.label}</LatexText></span></label>)}</div> : <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} className="exercise-answer-box" placeholder="Écris ton raisonnement ou ta réponse ici..." rows={8} />}<div className="exercise-detail-actions"><button type="button" className="btn btn-primary" onClick={() => setShowCorrection(true)}>Voir la correction</button><span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span></div></article><aside className="exercise-detail-side"><div className="exercise-side-card"><span className="section-eyebrow">Objectif</span><h2>Travaille ce chapitre</h2><p>{exercise.examTip || "Consolide la méthode avant de passer à un exercice plus difficile."}</p></div><div className="exercise-side-card exercise-side-card--mint"><Sparkles size={18} /><div><strong>Personnalisé</strong><p>Le mode personnalisé sera branché sur tes erreurs une fois l’API IA disponible.</p></div></div></aside></div>{showCorrection && <section className="exercise-correction-card"><div className="exercise-correction-card__icon"><CheckCircle2 size={20} /></div><div><span className="section-eyebrow">CORRECTION</span><h2>Solution guidée</h2><p><LatexText>{exercise.correction}</LatexText></p>{exercise.hint && <p className="exercise-hint"><strong>Réflexe :</strong> <LatexText>{exercise.hint}</LatexText></p>}</div></section>}</main>;
}

export default function Exercises() {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const { schoolPreferences } = useAccount();
  const trackId = resolveTrack(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const allowedSubjects = getTrackSubjects(trackId).map((subject) => subject.id);
  const requestedSubject = searchParams.get("subject") as SubjectId | null;
  const requestedCollection = searchParams.get("collection");
  const [mode, setMode] = useState<"base" | "personalized">("base");
  const [collection, setCollection] = useState<Collection>(requestedCollection === "helios" ? "helios" : requestedCollection === "existing" ? "existing" : "all");
  const [subject, setSubject] = useState<SubjectId>(requestedSubject && allowedSubjects.includes(requestedSubject) ? requestedSubject : allowedSubjects[0]);
  const [chapter, setChapter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  useEffect(() => { const nextRequested = searchParams.get("subject") as SubjectId | null; const nextCollection = searchParams.get("collection"); if (nextRequested && allowedSubjects.includes(nextRequested)) setSubject(nextRequested); else if (!allowedSubjects.includes(subject)) setSubject(allowedSubjects[0]); if (nextCollection === "helios" || nextCollection === "existing") setCollection(nextCollection); else if (!nextCollection) setCollection("all"); setChapter("all"); }, [trackId, searchParams, allowedSubjects.join(",")]);

  const allExercises = useMemo(() => contentCatalogService.getBaseExercises(trackId, subject), [subject, trackId]);
  const existingExercises = useMemo(() => allExercises.filter((exercise) => !exercise.tags.includes("MISSION_HELIOS")), [allExercises]);
  const heliosExercises = useMemo(() => allExercises.filter((exercise) => exercise.tags.includes("MISSION_HELIOS")), [allExercises]);
  const exercises = collection === "helios" ? heliosExercises : collection === "existing" ? existingExercises : allExercises;
  const chapters = useMemo(() => [...new Set(exercises.map((exercise) => exercise.target.chapter))], [exercises]);
  const selectedExercise = exerciseId ? allExercises.find((exercise) => exercise.id === exerciseId) : undefined;
  const filtered = useMemo(() => exercises.filter((exercise) => (chapter === "all" || exercise.target.chapter === chapter) && (difficulty === "all" || String(exercise.difficulty) === difficulty)), [chapter, difficulty, exercises]);

  if (exerciseId && selectedExercise) return <ExerciseDetail exercise={selectedExercise} />;

  return <main className="exercises-page"><header className="exercises-header"><div><span className="section-eyebrow">BANQUE D’EXERCICES · 2BAC</span><h1>Travaille vraiment le cours.</h1><p>{tracks[trackId].label} · {filtered.length} exercice{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} pour {subjectLabels[subject]}.</p></div><div className="exercises-header__right"><PathSwitcher /><div className="exercises-header__stats"><span><BookOpen size={17} /> {allExercises.length} au total</span><span><FlaskConical size={17} /> {heliosExercises.length} Helios</span></div></div></header><section className="exercise-collection-switch" aria-label="Collection d’exercices"><button type="button" className={collection === "all" ? "active" : ""} onClick={() => setCollection("all")}><BookOpen size={16} /> Tout <span>{allExercises.length}</span></button><button type="button" className={collection === "helios" ? "active" : ""} onClick={() => setCollection("helios")}><FlaskConical size={16} /> Mission Helios <span>{heliosExercises.length}</span></button><button type="button" className={collection === "existing" ? "active" : ""} onClick={() => setCollection("existing")}><BrainCircuit size={16} /> Exercices existants <span>{existingExercises.length}</span></button></section><section className="exercise-mode-switch" aria-label="Source des exercices"><button type="button" className={mode === "base" ? "active" : ""} onClick={() => setMode("base")}><BookOpen size={16} /> Base</button><button type="button" className={mode === "personalized" ? "active" : ""} onClick={() => setMode("personalized")}><Sparkles size={16} /> Personnalisé <span>Bientôt</span></button></section><section className="exercise-filters card"><div className="exercise-filter-heading"><Filter size={16} /><strong>Filtrer</strong></div><label><span>Matière</span><select value={subject} onChange={(event) => { setSubject(event.target.value as SubjectId); setChapter("all"); }}>{allowedSubjects.map((subjectId) => <option key={subjectId} value={subjectId}>{subjectLabels[subjectId]}</option>)}</select></label><label><span>Chapitre</span><select value={chapter} onChange={(event) => setChapter(event.target.value)}><option value="all">Tous les chapitres</option>{chapters.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span>Difficulté</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option value="all">Toutes</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{difficultyLabels[value]}</option>)}</select></label></section>{mode === "personalized" ? <section className="exercises-empty card"><div className="exercises-empty__icon"><Sparkles size={20} /></div><div><span className="section-eyebrow">MODE IA</span><h2>Le contenu personnalisé viendra en dernier.</h2><p>Le catalogue de base reste totalement utilisable sans API.</p></div><Link to="/preferences" className="btn btn-secondary">Modifier le parcours <ArrowRight size={15} /></Link></section> : <section className="exercise-grid">{filtered.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)}</section>}</main>;
}
