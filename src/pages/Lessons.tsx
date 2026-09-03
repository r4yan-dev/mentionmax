import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { useAccount } from "../context/AccountContext";
import { resolveUserPath, pathLabels, type UserPath } from "../data/curriculum/secondBac";
import { lessonService } from "../services/lesson/lessonService";
import { subjects as subjectCatalog } from "../data/curriculum/tracks";
import LessonRenderer from "../features/lessons/LessonRenderer";
import PathSwitcher from "../components/curriculum/PathSwitcher";

function normalizeSubject(value: string): "maths" | "physique-chimie" | "svt" | "anglais" | "philosophie" | null {
  if (["maths", "mathematics", "mathematiques"].includes(value)) return "maths";
  if (["physique-chimie", "physics"].includes(value)) return "physique-chimie";
  if (value === "svt") return "svt";
  if (["anglais", "english"].includes(value)) return "anglais";
  if (["philosophie", "philosophy"].includes(value)) return "philosophie";
  return null;
}

export default function Lessons() {
  const { subjectId, lessonId } = useParams<{ subjectId?: string; lessonId?: string }>();
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const curriculumSubject = normalizeSubject(subjectId ?? "maths");
  const allowed = curriculumSubject !== null && !(path === "SMB" && curriculumSubject === "svt");
  const lessons = useMemo(() => allowed && curriculumSubject ? lessonService.list(curriculumSubject, path) : [], [allowed, curriculumSubject, path]);
  const lesson = lessonId ? lessons.find((item) => item.id === lessonId) : null;

  if (!allowed || !curriculumSubject) {
    return <main className="app-page foundation-page"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}><Link className="foundation-back" to="/subjects"><ArrowLeft size={16} /> Matières</Link><PathSwitcher /></div><h1 className="page-title" style={{ marginTop: 30 }}>Cette matière n'est pas disponible dans ton parcours.</h1><p className="page-lead">{path === "SMB" ? "SM-B affiche Mathématiques, Physique-Chimie, Anglais et Philosophie. La SVT est exclue." : "Le contenu suit le parcours enregistré dans tes préférences."}</p><Link className="btn btn-secondary" to="/subjects"><BookOpen size={16} /> Retour aux matières</Link></main>;
  }

  if (!lesson) {
    return <main className="app-page foundation-page"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}><Link className="foundation-back" to="/subjects"><ArrowLeft size={16} /> Matières</Link><PathSwitcher /></div><div style={{ marginTop: 26 }}><span className="section-eyebrow">{pathLabels[path]}</span><h1 className="page-title">Cours de {subjectCatalog[curriculumSubject].name}</h1><p className="page-lead">{lessons.length} leçons 2BAC disponibles pour ce parcours.</p></div><div className="subject-page-grid" style={{ marginTop: 28 }}>{lessons.map((item, index) => <Link key={item.id} to={`/lecons/${curriculumSubject}/${item.id}`} className="card subject-large-card" style={{ textDecoration: "none" }}><div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}><span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: "#ddf5f1", color: "#0fa3a3", fontWeight: 800, fontSize: 11 }}>{String(index + 1).padStart(2, "0")}</span><span className="section-eyebrow">LEÇON 2BAC</span></div><h2>{item.title}</h2><p>{item.blocks.find((block) => block.type === "intro")?.text}</p><span className="text-brand" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Étudier <ArrowRight size={14} /></span></Link>)}</div></main>;
  }

  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);
  const previous = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const next = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

  return <main className="app-page foundation-page"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}><Link className="foundation-back" to={`/lecons/${curriculumSubject}`}><ArrowLeft size={16} /> Tous les cours</Link><PathSwitcher /></div><div className="foundation-lesson-meta" style={{ marginTop: 22 }}><span className="section-eyebrow">{pathLabels[path]} · {subjectCatalog[curriculumSubject].name} · {lesson.chapter}</span><span className="foundation-source">{lesson.source === "OFFICIAL" ? "Programme" : "Cours MentionMax"}</span></div><LessonRenderer lesson={lesson} /><nav aria-label="Navigation des leçons" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, maxWidth: 860, margin: "12px auto 72px" }}>{previous ? <Link to={`/lecons/${curriculumSubject}/${previous.id}`} className="card" style={{ textDecoration: "none", color: "inherit", padding: 18 }}><span className="section-eyebrow">PRÉCÉDENTE</span><strong style={{ display: "block", marginTop: 6 }}>{previous.title}</strong><span className="text-brand" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12 }}><ArrowLeft size={14} /> Revenir</span></Link> : <div />}{next ? <Link to={`/lecons/${curriculumSubject}/${next.id}`} className="card" style={{ textDecoration: "none", color: "inherit", padding: 18, textAlign: "right" }}><span className="section-eyebrow">SUIVANTE</span><strong style={{ display: "block", marginTop: 6 }}>{next.title}</strong><span className="text-brand" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12 }}>Continuer <ArrowRight size={14} /></span></Link> : <div />}</nav></main>;
}
