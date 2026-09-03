import { useMemo } from "react";
import { ArrowLeft, ArrowRight, BookOpen, PenLine } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { pathLabels, resolveUserPath, type UserPath } from "../data/curriculum/secondBac";
import { lessonService } from "../services/lesson/lessonService";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import LessonRenderer from "../features/lessons/LessonRenderer";
import "../styles/curriculum-path.css";

function normalizeSubject(value?: string) {
  if (value === "maths" || value === "mathematics" || value === "mathematiques") return "maths" as const;
  if (value === "physics" || value === "physique" || value === "physique-chimie") return "physique-chimie" as const;
  if (value === "svt") return "svt" as const;
  if (value === "anglais" || value === "english") return "anglais" as const;
  if (value === "philosophie" || value === "philo" || value === "philosophy") return "philosophie" as const;
  return null;
}

export default function Lessons() {
  const { subjectId, lessonId } = useParams<{ subjectId?: string; lessonId?: string }>();
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const allowedSubjects = getTrackSubjects(path).map((item) => item.id);
  const subject = normalizeSubject(subjectId);
  const available = subject !== null && allowedSubjects.includes(subject);
  const lessons = useMemo(() => available && subject ? lessonService.list(subject, path) : [], [available, subject, path]);
  const active = lessonId ? lessons.find((item) => item.id === lessonId) : null;

  if (!subject || !available) {
    return <main className="app-page foundation-page"><div className="subject-path-banner"><div className="subject-path-banner__title"><BookOpen size={18} /><div><strong>{pathLabels[path]}</strong><span>Choisis une matière disponible dans ton parcours.</span></div></div><PathSwitcher /></div><h1 className="page-title">Cette matière n'est pas disponible.</h1><p className="page-lead">En SM-B, la SVT n'est pas proposée. Change de parcours avec les boutons ci-dessus pour charger un autre programme.</p><Link className="btn btn-secondary" to="/subjects">Retour aux matières</Link></main>;
  }

  const label = subjectCatalog[subject].name;

  if (!active) {
    return <main className="app-page foundation-page">
      <div className="subject-path-banner"><div className="subject-path-banner__title"><BookOpen size={18} /><div><strong>{pathLabels[path]}</strong><span>{label} · {lessons.length} leçons 2BAC</span></div></div><PathSwitcher /></div>
      <div className="foundation-lesson-meta"><Link className="foundation-back" to="/subjects"><ArrowLeft size={16} /> Matières</Link><span className="foundation-source">{label}</span></div>
      <h1 className="page-title">Maîtrise <span className="accent-word">{label}.</span></h1>
      <p className="page-lead">Cours construits pour le 2BAC, avec notions essentielles, méthode Bac, erreurs fréquentes et récapitulatif.</p>
      <div className="subject-page-grid" style={{ marginTop: 28 }}>
        {lessons.map((item, index) => <Link key={item.id} to={`/lecons/${subject}/${item.id}`} className="card subject-large-card" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}><span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", background: "#ddf5f1", color: "#0fa3a3", fontWeight: 850, fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</span><span className="section-eyebrow">LEÇON</span></div>
          <h2>{item.title}</h2><p>{item.blocks.find((block) => block.type === "intro")?.text}</p><span className="text-brand" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>Commencer <ArrowRight size={14} /></span>
        </Link>)}
      </div>
    </main>;
  }

  const index = lessons.findIndex((item) => item.id === active.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];

  return <main className="app-page foundation-page">
    <div className="subject-path-banner"><div className="subject-path-banner__title"><BookOpen size={18} /><div><strong>{pathLabels[path]}</strong><span>{label} · Leçon {index + 1}/{lessons.length}</span></div></div><PathSwitcher /></div>
    <div className="foundation-lesson-meta"><Link className="foundation-back" to={`/lecons/${subject}`}><ArrowLeft size={16} /> Tous les cours</Link><span className="foundation-source">{active.chapter}</span></div>
    <LessonRenderer lesson={active} />
    <nav aria-label="Navigation des leçons" style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, maxWidth: 860, margin: "0 auto 28px" }}>
      {previous ? <Link to={`/lecons/${subject}/${previous.id}`} className="card" style={{ textDecoration: "none", color: "inherit", padding: 18 }}><span className="section-eyebrow">PRÉCÉDENTE</span><strong style={{ display: "block", marginTop: 6 }}>{previous.title}</strong><span className="text-brand" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12 }}><ArrowLeft size={14} /> Revenir</span></Link> : <div />}
      {next ? <Link to={`/lecons/${subject}/${next.id}`} className="card" style={{ textDecoration: "none", color: "inherit", padding: 18, textAlign: "right" }}><span className="section-eyebrow">SUIVANTE</span><strong style={{ display: "block", marginTop: 6 }}>{next.title}</strong><span className="text-brand" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 12 }}>Continuer <ArrowRight size={14} /></span></Link> : <div />}
    </nav>
    <div style={{ textAlign: "center", marginBottom: 64 }}><Link to={`/exercices?subject=${subject}`} className="btn btn-primary"><PenLine size={15} /> S'entraîner sur ce programme</Link></div>
  </main>;
}
