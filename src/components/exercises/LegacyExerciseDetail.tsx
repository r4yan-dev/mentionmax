import { useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { LatexText } from "../ui/LatexText";
import type { Exercise } from "../../types/content";
import { tracks } from "../../data/curriculum/tracks";

const difficultyLabels = ["", "Très facile", "Facile", "Intermédiaire", "Difficile", "Très difficile"];

export default function LegacyExerciseDetail({ exercise }: { exercise: Exercise }) {
  const [showCorrection, setShowCorrection] = useState(false);
  const match = exercise.id.match(/(\d{1,4})$/);
  const number = match?.[1] ? Number(match[1]) : null;
  return <main className="exercises-page exercises-detail-page">
    <Link to="/exercices" className="exercises-back"><ArrowRight size={16} style={{ transform: "rotate(180deg)" }} /> Retour à la banque</Link>
    <article className="exercise-detail-card exercise-detail-card--document">
      <header className="exercise-document-header"><div className="exercise-document-header__brand"><span className="exercise-document-kicker">MENTIONMAX · 2BAC</span><span className="exercise-document-mode">ENTRAÎNEMENT</span></div><div className="exercise-document-header__rule"/><div className="exercise-document-meta"><span>{exercise.target.subjectId}</span><span>{tracks[exercise.target.trackIds[0]].label}</span>{number !== null && <span>Exercice {number}</span>}</div></header>
      <section className="exercise-document-title"><div className="exercise-document-title__line"><span className="exercise-document-section">SUJET</span><div className="exercise-document-badges"><span className="exercise-pill">{exercise.type}</span><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></div></div><span className="exercise-library-card__chapter">{exercise.target.chapter} · {exercise.target.topic}</span><h1>{exercise.title}</h1>{exercise.examTip && <div className="exercise-goal exercise-goal--detail"><Target size={17}/><div><strong>Compétence visée</strong><span>{exercise.examTip}</span></div></div>}</section>
      <section className="exercise-document-section-block"><div className="exercise-document-section-heading"><span className="exercise-document-section-number">1</span><div><span className="section-eyebrow">ÉNONCÉ</span><h2>Travail à effectuer</h2></div></div><div className="exercise-document-copy"><LatexText>{exercise.statement}</LatexText></div></section>
      <section className="exercise-document-section-block exercise-document-response"><div className="exercise-document-section-heading"><span className="exercise-document-section-number">2</span><div><span className="section-eyebrow">RÉPONSE</span><h2>Rédiger la solution</h2></div></div><p className="exercise-document-note">Présente les calculs, les unités et les justifications nécessaires.</p></section>
      <div className="exercise-detail-actions exercise-document-actions"><Link to={`/exercices/${exercise.id}`} className="btn btn-primary">Ouvrir le runner <ArrowRight size={15}/></Link><button type="button" className="btn btn-secondary" onClick={()=>setShowCorrection(v=>!v)}><CheckCircle2 size={15}/> {showCorrection?"Masquer":"Voir"} la correction</button></div>
      {showCorrection&&<section className="exercise-correction-card exercise-document-correction"><span className="section-eyebrow">CORRECTION</span><h2>Solution guidée</h2><div className="exercise-correction-text"><LatexText>{exercise.correction}</LatexText></div>{exercise.hint&&<div className="exercise-correction-hint"><Sparkles size={15}/><div><strong>Point de vigilance</strong><LatexText>{exercise.hint}</LatexText></div></div>}</section>}
    </article>
  </main>;
}
