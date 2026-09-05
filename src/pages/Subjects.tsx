import { useMemo, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, Atom, BookOpen, BookOpenText, Brain, Calculator, Dna, FileText, Languages, PenLine, Sparkles } from "lucide-react";
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

function SubjectWidgetArt({ subject }: { subject: string }) {
  const visualStyle: CSSProperties = { width: "100%", height: "100%", padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 };
  const tileStyle: CSSProperties = { background: "rgba(255,255,255,.82)", border: "1px solid rgba(7,59,58,.10)", borderRadius: 14, padding: "10px 12px", boxShadow: "0 8px 20px rgba(7,59,58,.06)" };
  const noteStyle: CSSProperties = { fontSize: 11, fontWeight: 800, color: "#073B3A", letterSpacing: ".02em" };

  if (subject === "maths") return <div style={visualStyle} aria-hidden="true">
    <div style={{ ...tileStyle, flex: 1, minHeight: 104, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 18, right: 18, top: 50, borderTop: "1px solid #0FA3A3" }} />
      <div style={{ position: "absolute", left: 34, top: 18, bottom: 18, borderLeft: "1px solid #0FA3A3" }} />
      <div style={{ position: "absolute", left: 36, top: 28, width: 110, height: 62, borderTop: "3px solid #073B3A", borderRadius: "55% 55% 0 0", transform: "rotate(-16deg)" }} />
      <Calculator size={22} color="#7A873A" style={{ position: "absolute", right: 12, top: 12 }} />
      <span style={{ ...noteStyle, position: "absolute", right: 14, bottom: 12, fontFamily: "Caveat, cursive", fontSize: 18, color: "#0FA3A3" }}>f'(x)</span>
    </div>
    <div style={{ ...tileStyle, width: 92, transform: "rotate(3deg)" }}>
      <span style={noteStyle}>∫ f(x)dx</span>
      <div style={{ marginTop: 8, height: 4, width: "72%", borderRadius: 8, background: "#DDF5F1" }} />
      <div style={{ marginTop: 6, height: 4, width: "52%", borderRadius: 8, background: "#DDF5F1" }} />
    </div>
  </div>;

  if (subject === "physique-chimie") return <div style={visualStyle} aria-hidden="true">
    <div style={{ ...tileStyle, flex: 1, minHeight: 104 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}><Atom size={24} color="#0FA3A3" /><span style={{ ...noteStyle, fontFamily: "Caveat, cursive", fontSize: 18 }}>U = RI</span></div>
      <div style={{ height: 36, display: "flex", alignItems: "center" }}><div style={{ flex: 1, height: 2, background: "#073B3A" }} /><div style={{ width: 28, height: 18, border: "2px solid #0FA3A3", borderRadius: 4 }} /><div style={{ flex: 1, height: 2, background: "#073B3A" }} /></div>
      <div style={{ marginTop: 10, display: "flex", gap: 5 }}>{[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: i % 2 ? "#7A873A" : "#0FA3A3" }} />)}</div>
    </div>
    <div style={{ ...tileStyle, width: 90, transform: "rotate(-4deg)" }}><span style={noteStyle}>λ = vT</span><div style={{ marginTop: 10, fontFamily: "Caveat, cursive", fontSize: 24, color: "#0FA3A3" }}>→ F</div></div>
  </div>;

  if (subject === "svt") return <div style={visualStyle} aria-hidden="true">
    <div style={{ ...tileStyle, flex: 1, minHeight: 104, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <Dna size={60} color="#7A873A" strokeWidth={1.7} />
      <span style={{ ...noteStyle, position: "absolute", left: 12, top: 10, color: "#7A873A", fontFamily: "Caveat, cursive", fontSize: 18 }}>ADN</span>
      <Brain size={24} color="#0FA3A3" style={{ position: "absolute", right: 12, bottom: 10 }} />
    </div>
    <div style={{ ...tileStyle, width: 92, transform: "rotate(4deg)" }}><span style={{ ...noteStyle, color: "#7A873A" }}>CELLULE</span><div style={{ marginTop: 8, width: 44, height: 44, borderRadius: "50%", border: "2px solid #073B3A", marginInline: "auto" }}><div style={{ width: 13, height: 13, borderRadius: "50%", background: "#DDF5F1", border: "1px solid #0FA3A3", margin: "14px auto" }} /></div></div>
  </div>;

  if (subject === "philosophie") return <div style={visualStyle} aria-hidden="true">
    <div style={{ ...tileStyle, flex: 1, minHeight: 104 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Brain size={24} color="#76213A" /><span style={{ ...noteStyle, color: "#76213A" }}>QUESTION</span></div>
      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
        <span style={{ padding: "6px 8px", borderRadius: 999, background: "rgba(118,33,58,.08)", color: "#76213A", fontSize: 9, fontWeight: 800 }}>THÈSE</span>
        <ArrowRight size={13} color="#073B3A" />
        <span style={{ padding: "6px 8px", borderRadius: 999, background: "#DDF5F1", color: "#073B3A", fontSize: 9, fontWeight: 800 }}>ARGUMENT</span>
        <ArrowRight size={13} color="#073B3A" />
        <span style={{ padding: "6px 8px", borderRadius: 999, background: "rgba(118,33,58,.08)", color: "#76213A", fontSize: 9, fontWeight: 800 }}>OBJECTION</span>
      </div>
    </div>
    <div style={{ ...tileStyle, width: 86, transform: "rotate(-3deg)" }}><BookOpenText size={24} color="#76213A" /><div style={{ marginTop: 8, height: 4, width: "78%", background: "#F0E1E6", borderRadius: 6 }} /><div style={{ marginTop: 5, height: 4, width: "58%", background: "#F0E1E6", borderRadius: 6 }} /></div>
  </div>;

  return <div style={visualStyle} aria-hidden="true">
    <div style={{ ...tileStyle, flex: 1, minHeight: 104 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Languages size={24} color="#0FA3A3" /><span style={noteStyle}>VOCAB</span></div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {['achieve', 'however', 'although'].map((word) => <span key={word} style={{ padding: "5px 7px", background: "#DDF5F1", borderRadius: 8, color: "#073B3A", fontSize: 9, fontWeight: 800 }}>{word}</span>)}
      </div>
    </div>
    <div style={{ ...tileStyle, width: 88, transform: "rotate(4deg)" }}><BookOpen size={23} color="#0FA3A3" /><span style={{ display: "block", marginTop: 8, fontSize: 10, fontWeight: 800, color: "#76213A" }}>A–Z</span><div style={{ marginTop: 6, height: 3, width: "80%", background: "#E9D7DF", borderRadius: 5 }} /></div>
  </div>;
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

  return <main className="section container subjects-launcher-page">
    <div className="subject-path-banner"><div className="subject-path-banner__title"><Sparkles size={17} /><div><strong>{pathLabels[path]}</strong><span>Ton parcours contrôle maintenant la liste ci-dessous.</span></div></div><PathSwitcher /></div>
    <PageHeader eyebrow="Tes matières" title={<>Choisis ta <span className="accent-word">matière.</span></>} description="Retrouve tes cours, exercices et fiches de révision dans un espace dédié à chaque matière." />
    <div className="subject-page-grid">
      {trackSubjects.map((subject, index) => <Link key={subject.id} to={`/subjects/${subjectSlug[subject.id]}`} className={`card subject-large-card subject-card--${subjectThemes[subject.id]}`}>
        <div className="subject-large-card__accent-line" />
        <div className="subject-large-card__top"><span className="subject-large-card__index">0{index + 1}</span><span className="subject-large-card__open">Ouvrir <ArrowUpRight size={13} /></span></div>
        <div className="subject-large-card__illustration"><SubjectWidgetArt subject={subject.id} /></div>
        <div className="subject-large-card__copy">
          <h2>{subject.name}</h2>
          <p>{subject.id === "maths" ? "Fonctions, analyse, probabilités et méthodes du Bac." : subject.id === "physique-chimie" ? "Ondes, mécanique, électricité, énergie et chimie." : subject.id === "svt" ? "Génétique, immunologie, géologie et sciences du vivant." : subject.id === "philosophie" ? "Notions, problématiques, dissertations et argumentation." : "Vocabulary, grammar, communication et writing."}</p>
        </div>
        <div className="subject-large-card__footer"><span>{subject.id === "philosophie" ? "Notions · Dissertations · Révision" : subject.id === "anglais" ? "Lessons · Exercises · Revision" : "Cours · Exercices · Révision"}</span><span className="subject-large-card__arrow"><ArrowRight size={15} /></span></div>
      </Link>)}
    </div>
  </main>;
}
