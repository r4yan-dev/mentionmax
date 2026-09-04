import { useMemo } from "react";
import { ArrowRight, BookOpen, FileText, PenLine } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { SubjectIcon, type SubjectType } from "../components/ui/SubjectIcon";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath, pathLabels, type UserPath } from "../data/curriculum/secondBac";
import { lessonService } from "../services/lesson/lessonService";
import { contentCatalogService } from "../services/content/contentCatalogService";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import PeopleFeature from "../components/ui/PeopleFeature";
import "../styles/curriculum-path.css";

const subjectTypes: Record<string, SubjectType> = { maths: "math", "physique-chimie": "physics", svt: "svt", anglais: "english", philosophie: "philosophy" };
const subjectSlug: Record<string, string> = { maths: "maths", "physique-chimie": "physique-chimie", svt: "svt", anglais: "anglais", philosophie: "philosophie" };

function resolveSubject(value?: string): "maths" | "physique-chimie" | "svt" | "anglais" | "philosophie" | null {
  if (!value) return "maths";
  if (value === "maths" || value === "mathematics" || value === "mathematiques") return "maths";
  if (value === "physique" || value === "physics" || value === "physique-chimie") return "physique-chimie";
  if (value === "svt") return "svt";
  if (value === "anglais" || value === "english") return "anglais";
  if (value === "philo" || value === "philosophie" || value === "philosophy") return "philosophie";
  return null;
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
    const peopleVariant = selected === "maths" ? "maths" : selected === "physique-chimie" ? "physics" : selected;
    return <main className="section container">
      <div className="subject-path-banner"><div className="subject-path-banner__title"><SubjectIcon type={subjectTypes[selected]} label={subject.name} /><div><strong>{pathLabels[path]}</strong><span>{subject.name} · programme 2BAC</span></div></div><PathSwitcher /></div>
      <PageHeader eyebrow="Cours · exercices · révision" title={<>Prépare la <span className="accent-word">{subject.name}.</span></>} description="Un espace organisé autour des chapitres, des leçons et des exercices du Bac." />
      <PeopleFeature variant={peopleVariant} compact title={`Maîtrise ${subject.name}, chapitre après chapitre.`} text={`Cours, ${exerciseCount} exercices et notes réunis dans un parcours pensé pour le ${pathLabels[path]}.`} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 28 }}>
        <Link to={`/lecons/${selected}`} className="btn btn-primary"><BookOpen size={15} /> Voir les cours</Link>
        <Link to={`/exercices?subject=${encodeURIComponent(selected)}`} className="btn btn-secondary"><PenLine size={15} /> {exerciseCount} exercices</Link>
        <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(selected)}`} className="btn btn-secondary"><FileText size={15} /> Mes notes</Link>
      </div>
      <section className="card" style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "end", marginBottom: 16 }}>
          <div><span className="section-eyebrow">Programme 2BAC</span><h2 style={{ margin: "5px 0 0" }}>{lessons.length} leçons accessibles</h2></div>
          <Link to={`/lecons/${selected}`} className="text-brand">Tout voir <ArrowRight size={14} /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10 }}>
          {lessons.map((item, index) => <Link key={item.id} to={`/lecons/${selected}/${item.id}`} className="card subject-large-card" style={{ textDecoration: "none", padding: 17 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}><span style={{ width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "#ddf5f1", color: "#0fa3a3", fontWeight: 850, fontSize: 10 }}>{String(index + 1).padStart(2, "0")}</span><span className="section-eyebrow">LEÇON</span></div><h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{item.title}</h3><p style={{ margin: "0 0 10px", fontSize: 12, color: "#718582", lineHeight: 1.55 }}>{item.blocks.find((block) => block.type === "intro")?.text}</p><span className="text-brand" style={{ fontSize: 12 }}>Étudier →</span></Link>)}
        </div>
      </section>
    </main>;
  }

  return <main className="section container">
    <div className="subject-path-banner"><div className="subject-path-banner__title"><div><strong>{pathLabels[path]}</strong><span>Ton parcours contrôle maintenant la liste ci-dessous.</span></div></div><PathSwitcher /></div>
    <PageHeader eyebrow="Programme 2BAC" title={<>Choisis ta <span className="accent-word">matière.</span></>} description="Mathématiques, Physique-Chimie, SVT, Anglais et Philosophie selon ton parcours." />
    <PeopleFeature variant="hero" compact title="Une matière à la fois. Un programme qui avance." text="Chaque matière garde ses chapitres, ses exercices et ses ressources dans le même espace." />
    <div className="subject-page-grid">{trackSubjects.map((subject) => <Link key={subject.id} to={`/subjects/${subjectSlug[subject.id]}`} className="card subject-large-card" style={{ textDecoration: "none" }}><SubjectIcon type={subjectTypes[subject.id]} label={subject.name}/><h2>{subject.name}</h2><p>{subject.shortName} · programme 2BAC · {contentCatalogService.getBaseExercises(path, subject.id).length} exercices</p><div className="chapter-pills"><span>{lessonService.list(subject.id, path).length} leçons</span><span>Exercices</span><span>Notes</span></div><span className="text-brand">Ouvrir <ArrowRight size={14} /></span></Link>)}</div>
  </main>;
}
