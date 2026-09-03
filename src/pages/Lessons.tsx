import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import LessonRenderer from "../features/lessons/LessonRenderer";
import { lessonService } from "../services/lesson/lessonService";

function subjectSlug(subjectId: string) {
  if (subjectId === "maths") return "mathematics";
  if (subjectId === "physique-chimie") return "physics";
  if (subjectId === "svt") return "svt";
  if (subjectId === "anglais") return "english";
  return "philosophy";
}

function subjectLabel(subjectId: string) {
  if (subjectId === "maths") return "Mathématiques";
  if (subjectId === "physique-chimie") return "Physique-Chimie";
  if (subjectId === "svt") return "SVT";
  if (subjectId === "anglais") return "Anglais";
  return "Philosophie";
}

export default function Lessons() {
  const { lessonId } = useParams<{ subjectId?: string; lessonId?: string }>();
  const lesson = lessonService.getById(lessonId ?? "lesson-maths-tvi");
  const relatedLessons = lesson ? lessonService.list(lesson.subjectId) : [];
  const currentIndex = lesson ? relatedLessons.findIndex((item) => item.id === lesson.id) : -1;
  const previous = currentIndex > 0 ? relatedLessons[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < relatedLessons.length - 1 ? relatedLessons[currentIndex + 1] : null;

  if (!lesson) {
    return (
      <main className="app-page foundation-page">
        <h1 className="page-title">Leçon introuvable.</h1>
        <Link className="btn btn-secondary" to="/subjects"><ArrowLeft size={16} /> Retour aux matières</Link>
      </main>
    );
  }

  return (
    <main className="app-page foundation-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 22 }}>
        <Link className="foundation-back" to={`/subjects/${subjectSlug(lesson.subjectId)}`}><ArrowLeft size={16} /> {subjectLabel(lesson.subjectId)}</Link>
        <span className="foundation-source"><BookOpen size={13} /> Leçon {currentIndex + 1}/{relatedLessons.length}</span>
      </div>

      <div className="foundation-lesson-meta">
        <span className="section-eyebrow">{subjectLabel(lesson.subjectId)} · {lesson.chapter}</span>
        <span className="foundation-source">{lesson.source === "OFFICIAL" ? "Contenu officiel" : "Cours rédigé pour MentionMax"}</span>
      </div>
      <LessonRenderer lesson={lesson} />

      <nav aria-label="Navigation des leçons" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12, maxWidth: 860, margin: '0 auto 72px' }}>
        {previous ? <Link to={`/lecons/${previous.subjectId}/${previous.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: 18 }}><span className="section-eyebrow">PRÉCÉDENTE</span><strong style={{ display: 'block', marginTop: 6 }}>{previous.title}</strong><span className="text-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12 }}><ArrowLeft size={14} /> Revenir</span></Link> : <div />}
        {next ? <Link to={`/lecons/${next.subjectId}/${next.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', padding: 18, textAlign: 'right' }}><span className="section-eyebrow">SUIVANTE</span><strong style={{ display: 'block', marginTop: 6 }}>{next.title}</strong><span className="text-brand" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 12 }}>Continuer <ArrowRight size={14} /></span></Link> : <div />}
      </nav>
    </main>
  );
}
