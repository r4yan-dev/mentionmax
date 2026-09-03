import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap, PenLine } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { pathLabels, resolveUserPath, type UserPath } from "../data/curriculum/secondBac";
import { lessonService } from "../services/lesson/lessonService";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import LessonRenderer from "../features/lessons/LessonRenderer";
import "./Lessons.css";

function normalizeSubject(value?: string) {
  if (["maths", "mathematics", "mathematiques"].includes(value ?? "")) return "maths" as const;
  if (["physique", "physics", "physique-chimie"].includes(value ?? "")) return "physique-chimie" as const;
  if (value === "svt") return "svt" as const;
  if (["anglais", "english"].includes(value ?? "")) return "anglais" as const;
  if (["philosophie", "philo", "philosophy"].includes(value ?? "")) return "philosophie" as const;
  return null;
}

export default function Lessons() {
  const { subjectId, lessonId } = useParams<{ subjectId?: string; lessonId?: string }>();
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const allowed = getTrackSubjects(path).map((subject) => subject.id);
  const subject = normalizeSubject(subjectId);
  const valid = subject !== null && allowed.includes(subject);
  const lessons = valid && subject ? lessonService.list(subject, path) : [];
  const active = lessonId ? lessons.find((lesson) => lesson.id === lessonId) : undefined;
  const label = subject ? subjectCatalog[subject].name : "Matière";

  if (!valid) return <main className="lessons-page"><Header path={path} /><section className="lessons-empty"><div className="lessons-empty__icon"><BookOpen size={24} /></div><span className="lessons-eyebrow">PARCOURS ACTIF</span><h1>Cette matière n’est pas dans ton programme.</h1><p>{path === "SMB" ? "La SVT n’est pas proposée en 2BAC Sciences Mathématiques B." : "Choisis une matière disponible pour ouvrir ses cours."}</p><Link to="/subjects" className="lessons-button lessons-button--primary">Voir les matières <ArrowRight size={16} /></Link></section></main>;

  if (!active) return <main className="lessons-page"><Header path={path} /><header className="lessons-title"><div><Link to="/subjects" className="lessons-back"><ArrowLeft size={15} /> Matières</Link><span className="lessons-eyebrow">{label} · {lessons.length} LEÇONS</span><h1>Comprendre avant de pratiquer.</h1><p>Chaque leçon contient l’essentiel du cours, une méthode Bac, les pièges fréquents et un récapitulatif.</p></div><div className="lessons-title__badge"><GraduationCap size={18} /><span>2BAC</span><strong>{pathLabels[path]}</strong></div></header><section className="lessons-grid">{lessons.map((lesson, index) => <Link key={lesson.id} to={`/lecons/${subject}/${lesson.id}`} className="lesson-card"><div className="lesson-card__top"><span className="lesson-number">{String(index + 1).padStart(2,"0")}</span><span className="lesson-status"><CheckCircle2 size={13} /> Prêt</span></div><span className="lessons-eyebrow">{lesson.chapter}</span><h2>{lesson.title}</h2><p>{lesson.blocks.find((block) => block.type === "intro")?.text ?? "Cours structuré et adapté au programme 2BAC."}</p><div className="lesson-card__footer"><span>Voir le cours</span><ArrowRight size={16} /></div></Link>)}</section></main>;

  const index = lessons.findIndex((lesson) => lesson.id === active.id);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  return <main className="lessons-page"><Header path={path} /><div className="lessons-reader-meta"><Link to={`/lecons/${subject}`} className="lessons-back"><ArrowLeft size={15} /> Tous les cours</Link><span>{label} · Leçon {index + 1}/{lessons.length}</span></div><LessonRenderer lesson={active} /><nav className="lessons-reader-nav">{previous ? <Link to={`/lecons/${subject}/${previous.id}`}><span>PRÉCÉDENTE</span><strong>{previous.title}</strong><small><ArrowLeft size={14} /> Revenir</small></Link> : <div />}{next ? <Link to={`/lecons/${subject}/${next.id}`}><span>SUIVANTE</span><strong>{next.title}</strong><small>Continuer <ArrowRight size={14} /></small></Link> : <div />}</nav><section className="lessons-next-step"><div><span className="lessons-eyebrow">ÉTAPE SUIVANTE</span><h2>Maintenant, mets le cours à l’épreuve.</h2><p>Passe directement à la banque d’exercices du même programme.</p></div><Link to={`/exercices?subject=${subject}`} className="lessons-button lessons-button--primary"><PenLine size={16} /> S’entraîner</Link></section></main>;
}

function Header({ path }: { path: UserPath }) {
  return <div className="lessons-program"><div className="lessons-program__identity"><div className="lessons-program__icon"><BookOpen size={18} /></div><div><span>PARCOURS</span><strong>{pathLabels[path]}</strong></div></div><PathSwitcher /></div>;
}
