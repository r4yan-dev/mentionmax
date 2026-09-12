import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Filter, Sparkles, Target } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { tracks, getTrackSubjects } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { contentCatalogService } from "../services/content/contentCatalogService";
import { LatexText } from "../components/ui/LatexText";
import { ExerciseVisual } from "../components/ui/ExerciseVisual";
import type { Exercise, ExerciseType } from "../types/content";
import type { SubjectId, TrackId } from "../types/academic";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import PeopleFeature from "../components/ui/PeopleFeature";
import "./Exercises.css";

const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];
const typeLabels: Record<ExerciseType, string> = { mcq: "QCM", numeric: "Numérique", "short-answer": "Réponse courte", proof: "Démonstration", calculation: "Calcul", "document-analysis": "Analyse de document", "multi-step": "Problème guidé" };
const subjectLabels: Record<SubjectId, string> = { maths: "Mathématiques", "physique-chimie": "Physique-Chimie", svt: "SVT", anglais: "Anglais", philosophie: "Philosophie" };
type DisplayExercise = Exercise;

function resolveTrack(track: "SPC" | "SM" | null, section: "A" | "B" | null): TrackId {
  const path = resolveUserPath(track, section);
  return path === "SP" ? "SP" : path === "SMA" ? "SMA" : "SMB";
}
function exerciseTypeLabel(type?: ExerciseType) { return typeLabels[type ?? "multi-step"]; }

function ExerciseCard({ exercise }: { exercise: DisplayExercise }) {
  return <article className="exercise-library-card"><div className="exercise-library-card__top"><span className="exercise-pill">{exerciseTypeLabel(exercise.type)}</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div><div className="exercise-library-card__icon"><Target size={20} /></div><div className="exercise-library-card__body"><span className="exercise-library-card__chapter">{exercise.target.chapter} · {exercise.target.topic}</span><h3>{exercise.title}</h3><p><LatexText>{exercise.statement}</LatexText></p>{exercise.examTip && <div className="exercise-goal"><Target size={14} /><span><strong>Objectif</strong>{exercise.examTip}</span></div>}</div><div className="exercise-library-card__footer"><span><Clock3 size={14} /> {exercise.estimatedMinutes} min · +{exercise.xpValue} XP</span><Link to={`/exercices/${exercise.id}`} className="exercise-open-link">Ouvrir <ArrowRight size={15} /></Link></div></article>;
}

function ExerciseDetail({ exercise }: { exercise: DisplayExercise }) {
  const [showCorrection, setShowCorrection] = useState(false);
  return <main className="exercises-page exercises-detail-page"><Link to="/exercices" className="exercises-back"><ArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> Retour</Link><article className="exercise-detail-card"><div className="exercise-library-card__top"><span className="exercise-pill">{exerciseTypeLabel(exercise.type)}</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div><span className="exercise-library-card__chapter">{exercise.target.chapter} · {exercise.target.topic}</span><h1>{exercise.title}</h1>{exercise.examTip && <div className="exercise-goal exercise-goal--detail"><Target size={17} /><div><strong>Objectif</strong><span>{exercise.examTip}</span></div></div>}<section className="exercise-detail-work"><span className="section-eyebrow">TRAVAIL À EFFECTUER</span><div className="exercise-detail-statement"><LatexText>{exercise.statement}</LatexText><ExerciseVisual visual={exercise.visual} /></div></section><div className="exercise-detail-actions"><Link to={`/exercices/${exercise.id}`} className="btn btn-primary">Ouvrir le runner <ArrowRight size={15} /></Link><button type="button" className="btn btn-secondary" onClick={() => setShowCorrection((value) => !value)}><CheckCircle2 size={15} /> {showCorrection ? "Masquer" : "Voir"} la correction</button></div>{showCorrection && <section className="exercise-correction-card"><span className="section-eyebrow">CORRECTION</span><h2>Solution guidée</h2><div className="exercise-correction-text"><LatexText>{exercise.correction}</LatexText></div>{exercise.hint && <div className="exercise-correction-hint"><Sparkles size={15} /><div><strong>Point de vigilance</strong><LatexText>{exercise.hint}</LatexText></div></div>}</section>}</article></main>;
}

export default function Exercises() {
  const { exerciseId } = useParams();
  const [searchParams] = useSearchParams();
  const { schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackId = resolveTrack(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const allowedSubjects = getTrackSubjects(path).map((item) => item.id);
  const requestedSubject = searchParams.get("subject") as SubjectId | null;
  const initialSubject = requestedSubject && allowedSubjects.includes(requestedSubject) ? requestedSubject : allowedSubjects[0];
  const [subject, setSubject] = useState<SubjectId>(initialSubject);
  const [chapter, setChapter] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    const requested = searchParams.get("subject") as SubjectId | null;
    setSubject(requested && allowedSubjects.includes(requested) ? requested : allowedSubjects[0]);
    setChapter("all");
    setDifficulty("all");
    setVisibleCount(12);
  }, [trackId, searchParams, allowedSubjects.join(",")]);

  const exercises = useMemo<DisplayExercise[]>(() => contentCatalogService.getBaseExercises(trackId, subject), [trackId, subject]);
  const chapters = useMemo(() => [...new Set(exercises.map((exercise) => exercise.target.chapter))], [exercises]);
  const selected = exerciseId ? exercises.find((exercise) => exercise.id === exerciseId) : undefined;
  const filtered = exercises.filter((exercise) => (chapter === "all" || exercise.target.chapter === chapter) && (difficulty === "all" || String(exercise.difficulty) === difficulty));
  if (selected) return <ExerciseDetail exercise={selected} />;

  const peopleVariant = subject === "maths" ? "maths" : subject === "physique-chimie" ? "physics" : subject === "anglais" ? "english" : subject === "philosophie" ? "philosophy" : "svt";
  const visible = filtered.slice(0, visibleCount);

  return <main className="exercises-page"><header className="exercises-header"><div><span className="section-eyebrow">BANQUE D’EXERCICES · 2BAC</span><h1>Travaille vraiment le cours.</h1><p>{tracks[trackId].label} · {filtered.length} exercice{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""} pour {subjectLabels[subject]}.</p></div><div className="exercises-header__right"><PathSwitcher /><div className="exercises-header__stats"><span><BookOpen size={17} /> {exercises.length} exercices</span><span><Sparkles size={17} /> Style Bac marocain</span></div></div></header><PeopleFeature variant={peopleVariant} compact title={`Travaille ${subjectLabels[subject]}, exercice après exercice.`} text="Comprends la méthode, applique-la, puis utilise la correction pour repérer ce qui bloque."/><section className="exercise-filters card"><div className="exercise-filter-heading"><Filter size={16} /><strong>Filtrer</strong></div><label><span>Matière</span><select value={subject} onChange={(event) => { const nextSubject = event.target.value as SubjectId; setSubject(nextSubject); setChapter("all"); setVisibleCount(12); }}>{allowedSubjects.map((id) => <option key={id} value={id}>{subjectLabels[id]}</option>)}</select></label><label><span>Chapitre</span><select value={chapter} onChange={(event) => { setChapter(event.target.value); setVisibleCount(12); }}><option value="all">Tous les chapitres</option>{chapters.map((value) => <option key={value}>{value}</option>)}</select></label><label><span>Difficulté</span><select value={difficulty} onChange={(event) => { setDifficulty(event.target.value); setVisibleCount(12); }}><option value="all">Toutes</option>{[1,2,3,4,5].map((value) => <option key={value} value={value}>{difficultyLabels[value]}</option>)}</select></label></section><section className="exercise-grid">{visible.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} />)}</section>{visibleCount < filtered.length && <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}><button type="button" className="btn btn-secondary" onClick={() => setVisibleCount((count) => Math.min(count + 12, filtered.length))}>Charger plus · {filtered.length - visibleCount} restants</button></div>}</main>;
}
