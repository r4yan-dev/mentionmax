import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import LessonRenderer from "../features/lessons/LessonRenderer";
import { lessonService } from "../services/lesson/lessonService";

export default function Lessons() {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const lesson = lessonService.getById(lessonId ?? "lesson-maths-tvi");

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
      <Link className="foundation-back" to={`/subjects/${lesson.subjectId}`}><ArrowLeft size={16} /> Matière</Link>
      <div className="foundation-lesson-meta">
        <span className="section-eyebrow">{lesson.subjectId} · {lesson.chapter}</span>
        <span className="foundation-source">{lesson.source === "OFFICIAL" ? "Contenu officiel" : lesson.source}</span>
      </div>
      <LessonRenderer lesson={lesson} />
    </main>
  );
}
