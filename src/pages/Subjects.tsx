import { useMemo } from "react";
import { ArrowRight, BookOpen, FileText, PenLine, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { SubjectIcon, type SubjectType } from "../components/ui/SubjectIcon";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath, pathLabels, type UserPath } from "../data/curriculum/secondBac";
import { lessonService } from "../services/lesson/lessonService";
import { contentCatalogService } from "../services/content/contentCatalogService";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import PeopleFeature, { type PeopleFeatureVariant } from "../components/ui/PeopleFeature";
import "../styles/curriculum-path.css";

const subjectTypes: Record<string, SubjectType> = { maths: "math", "physique-chimie": "physics", svt: "svt", anglais: "english", philosophie: "philosophy" };
const subjectSlug: Record<string, string> = { maths: "maths", "physique-chimie": "physique-chimie", svt: "svt", anglais: "anglais", philosophie: "philosophie" };
const subjectThemes: Record<string, string> = { maths: "maths", "physique-chimie": "physics", svt: "svt", anglais: "english", philosophie: "philosophy" };

function resolveSubject(value?: string): "maths" | "physique-chimie" | "svt" | "anglais" | "philosophie" | null {
  if (!value) return "maths";
  if (value === "maths" || value === "mathematics" || value === "mathematiques") return "maths";
  if (value === "physique" || value === "physics" || value === "physique-chimie") return "physique-chimie";
  if (value === "svt") return "svt";
  if (value === "anglais" || value === "english") return "anglais";
  if (value === "philo" || value === "philosophie" || value === "philosophy") return "philosophie";
  return null;
}

function peopleVariantForSubject(subject: "maths" | "physique-chimie" | "svt" | "anglais" | "philosophie"): PeopleFeatureVariant {
  if (subject === "maths") return "maths";
  if (subject === "physique-chimie") return "physics";
  if (subject === "svt") return "svt";
  if (subject === "anglais") return "english";
  return "philosophy";
}

export default function Subjects() {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackSubjects = getTrackSubjects(path);
  const requested = resolveSubject(subjectId);
  const selected = requested && trackSubjects.some((item) => item.id === requested) ? requested : null;

  const lessons = useMemo(() => selected ? lessonService.list(selected, path) : [], [selected, path]);
  const exerciseCount = useMemo(() => selected ? contentCatalogService.getBaseExercises(path, selected).length : 0, [selected, path]);

  if (subjectId) {
    if (!selected) return <main className="section container"><div className="subject-path-banner"><div className="subject-path-banner__title"><div><strong>{pathLabels[path]}</strong><span>Ce choix détermine les matières disponibles.</span></div></div><PathSwitcher /></div><PageHeader eyebrow="Programme 2BAC" title="Cette matière n'est pas disponible." description={path === "SMB" && requested === "svt" ? "La SVT n'est pas proposée en Sciences Mathématiques B." : "Utilise le sélecteur de parcours pour consulter un autre programme."} /><Link to="/subjects" className="btn btn-secondary">Retour aux matières</Link></main>;

    const subject = subjectCatalog[selected];
    return <main className="section container">
      <div className="subject-path-banner"><div className="subject-path-banner__title"><SubjectIcon type={subjectTypes[selected]} label={subject.name} /><div><strong>{pathLabels[path]}</strong><span>{subject.name} · programme 2BAC</span></div></div><PathSwitcher /></div>
      <PageHeader eyebrow="Cours · exercices · révision" title={<>Prépare la <span className="accent-word">{subject.name}.</span></>} description="Un espace organisé autour des chapitres, des leçons et des exercices du Bac." />
      <PeopleFeature variant={peopleVariantForSubject(selected)} compact title={`Maîtrise ${subject.name}, chapitre après chapitre.`} text={`Cours, ${exerciseCount} exercices et notes réunis dans un parcours pensé pour le ${pathLabels[path]}.`} />
      <div className="subjects-actions">
        <Link to={`/lecons/${selected}`} className="btn btn-primary"><BookOpen size={15} /> Voir les cours</Link>
        <Link to={`/exercices?subject=${encodeURIComponent(selected)}`} className="btn btn-secondary"><PenLine size={15} /> {exerciseCount} exercices</Link>
        <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(selected)}`} className="btn btn-secondary"><FileText size={15} /> Mes notes</Link>
      </div>
      <section className="card subjects-program-card">
        <div className="subjects-program-head">
          <div><span className="section-eyebrow">Programme 2BAC</span><h2 className="subjects-program-title">{lessons.length} leçons accessibles</h2></div>
          <Link to={`/lecons/${selected}`} className="text-brand subjects-inline-link">Tout voir <ArrowRight size={14} /></Link>
        </div>
        {lessons.length ? <div className="subjects-lesson-grid">
          {lessons.map((item, index) => <Link key={item.id} to={`/lecons/${selected}/${item.id}`} className="card subjects-lesson-card">
            <div className="subjects-lesson-card__meta"><span className="subjects-lesson-card__number">{String(index + 1).padStart(2, "0")}</span><span className="section-eyebrow">LEÇON</span><span className="subjects-lesson-card__dot" /></div>
            <h3 className="subjects-lesson-card__title">{item.title}</h3>
            <p className="subjects-lesson-card__description">{item.blocks.find((block) => block.type === "intro")?.text ?? "Explore ce chapitre et consolide les notions essentielles du programme."}</p>
            <span className="text-brand subjects-lesson-card__link">Étudier <ArrowRight size={13} /></span>
          </Link>)}
        </div> : <div className="subject-empty"><Sparkles size={18} /><span>Aucune leçon n'est encore publiée pour ce parcours.</span></div>}
      </section>
    </main>;
  }

  return <main className="section container">
    <div className="subject-path-banner"><div className="subject-path-banner__title"><Sparkles size={17} /><div><strong>{pathLabels[path]}</strong><span>Ton parcours contrôle maintenant la liste ci-dessous.</span></div></div><PathSwitcher /></div>
    <PageHeader eyebrow="Programme 2BAC" title={<>Choisis ta <span className="accent-word">matière.</span></>} description="Des espaces dédiés pour travailler les chapitres, pratiquer et suivre tes ressources." />
    <PeopleFeature variant="hero" compact title="Une matière à la fois. Un programme qui avance." text="Chaque matière garde ses chapitres, ses exercices et ses ressources dans le même espace." />
    <div className="subjects-grid-intro"><div><span className="section-eyebrow">TON PROGRAMME</span><h2>Tout ton Bac, au même endroit.</h2></div><span>{trackSubjects.length} matières dans ce parcours</span></div>
    <div className="subject-page-grid">{trackSubjects.map((subject, index) => {
      const lessonsCount = lessonService.list(subject.id, path).length;
      const exercisesCount = contentCatalogService.getBaseExercises(path, subject.id).length;
      return <Link key={subject.id} to={`/subjects/${subjectSlug[subject.id]}`} className={`card subject-large-card subject-card--${subjectThemes[subject.id]}`}>
        <div className="subject-large-card__glow" />
        <div className="subject-large-card__top"><span className="subject-large-card__index">0{index + 1}</span><span className="subject-large-card__open">Ouvrir <ArrowUpRight /></span></div>
        <div className="subject-large-card__icon"><SubjectIcon type={subjectTypes[subject.id]} label={subject.name}/></div>
        <div className="subject-large-card__copy"><h2>{subject.name}</h2><p>{subject.shortName} · programme 2BAC</p></div>
        <div className="subject-large-card__stats"><div><strong>{lessonsCount}</strong><span>leçons</span></div><div><strong>{exercisesCount}</strong><span>exercices</span></div><div><strong>∞</strong><span>notes</span></div></div>
        <div className="subject-large-card__footer"><span>Entrer dans la matière</span><span className="subject-large-card__arrow"><ArrowRight size={15} /></span></div>
      </Link>;
    })}</div>
  </main>;
}

function ArrowUpRight() {
  return <ArrowRight size={13} />;
}
