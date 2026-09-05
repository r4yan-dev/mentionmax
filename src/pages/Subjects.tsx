import { useMemo } from "react";
import { ArrowRight, BookOpen, FileText, PenLine, Sparkles, ArrowUpRight } from "lucide-react";
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
  if (subject === "maths") {
    return <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="296" height="146" rx="16" className="widget-paper" />
      <path d="M43 127V45M32 116h118" className="art-teal" strokeWidth="1.5" />
      <path d="M39 49l4-7 4 7M145 112l7 4-7 4" className="art-teal" strokeWidth="1.5" />
      <path d="M47 111C66 96 70 61 97 51c20-7 27 20 42 27 10 5 18-2 28-19" className="art-ink" strokeWidth="2.2" />
      <path d="M79 52l8 2m-7 9 9 2" className="art-olive" strokeWidth="1.4" />
      <circle cx="221" cy="104" r="30" className="art-olive-dash" strokeWidth="1.4" />
      <path d="M221 74v60M191 104h60M199 82l44 44M199 126l44-44" className="art-olive-light" strokeWidth=".8" />
      <rect x="180" y="30" width="102" height="28" rx="9" className="highlight-teal" transform="rotate(-3 180 30)" />
      <text x="188" y="49" className="art-hand teal" transform="rotate(-3 188 49)">f'(x) &gt; 0</text>
      <text x="48" y="27" className="art-hand ink" transform="rotate(-4 48 27)">variations</text>
      <path d="M46 141h30l-18-18z" className="art-ink" strokeWidth="1.2" />
      <circle cx="280" cy="127" r="5" className="sticker-olive" />
    </svg>;
  }

  if (subject === "physique-chimie") {
    return <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="296" height="146" rx="16" className="widget-paper" />
      <path d="M27 53c19-29 38 29 57 0s38 29 57 0 38 29 57 0" className="art-ink" strokeWidth="2" />
      <path d="M32 111h24v-17h22l7 8 7-8h22v17h22" className="art-teal" strokeWidth="1.7" />
      <rect x="24" y="107" width="125" height="17" rx="4" className="art-teal-outline" />
      <circle cx="219" cy="48" r="8" className="node-olive" />
      <circle cx="246" cy="34" r="6" className="node-teal" />
      <circle cx="246" cy="63" r="6" className="node-teal" />
      <path d="M226 45l14-8m-14 14 14 8" className="art-ink" strokeWidth="1.5" />
      <path d="M178 111l60-20" className="art-ink" strokeWidth="1.6" />
      <path d="M228 88l10 3-7 7" className="art-ink" strokeWidth="1.5" />
      <rect x="190" y="121" width="84" height="23" rx="8" className="highlight-olive" transform="rotate(-2 190 121)" />
      <text x="199" y="138" className="art-hand teal" transform="rotate(-2 199 138)">U = R × I</text>
      <text x="34" y="29" className="art-hand teal" transform="rotate(-4 34 29)">λ = vT</text>
      <path d="M270 90h14m-7-7v14" className="art-olive" strokeWidth="1.3" />
    </svg>;
  }

  if (subject === "svt") {
    return <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="296" height="146" rx="16" className="widget-paper" />
      <path d="M42 30c24 19-18 38 6 57s-18 38 6 57m14-114c-24 19 18 38-6 57s18 38-6 57" className="art-olive" strokeWidth="2" />
      <path d="M48 42h22m-28 20h34m-28 20h22m-28 20h34m-28 20h22" className="art-ink-light" strokeWidth="1" />
      <circle cx="153" cy="73" r="33" className="art-ink-outline" strokeWidth="1.5" />
      <ellipse cx="162" cy="66" rx="12" ry="9" className="art-olive-outline" strokeWidth="1.3" />
      <circle cx="162" cy="66" r="3" className="node-olive" />
      <ellipse cx="137" cy="87" rx="7" ry="4" className="art-teal-outline" />
      <path d="M185 43c8-4 13 2 8 7" className="art-teal" strokeWidth="1" />
      <rect x="126" y="47" width="34" height="13" rx="5" className="highlight-olive" transform="rotate(-4 126 47)" />
      <path d="M226 102h57m-57 10h57m-57 10h57m-57 10h57" className="art-ink-light" strokeWidth="1.2" />
      <path d="M228 103h54v8h-54zm0 18h54v8h-54z" className="strata-fill" />
      <circle cx="240" cy="48" r="5" className="art-teal-outline" />
      <path d="M240 43l-7-9m7 9 8-10m-4 17 14 5m-18-3-11 7" className="art-ink-light" strokeWidth="1" />
      <text x="93" y="30" className="art-hand olive" transform="rotate(-4 93 30)">ADN</text>
      <text x="221" y="91" className="art-hand teal" transform="rotate(3 221 91)">strates</text>
    </svg>;
  }

  if (subject === "philosophie") {
    return <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false">
      <rect x="12" y="12" width="296" height="146" rx="16" className="widget-paper" />
      <rect x="31" y="33" width="58" height="28" rx="9" className="highlight-burgundy" transform="rotate(-4 31 33)" />
      <rect x="34" y="34" width="58" height="28" rx="12" className="art-burgundy-outline" />
      <text x="63" y="52" className="art-small burgundy" textAnchor="middle">THÈSE</text>
      <rect x="106" y="69" width="78" height="30" rx="12" className="art-ink-outline" />
      <text x="145" y="88" className="art-small ink" textAnchor="middle">ARGUMENT</text>
      <rect x="42" y="112" width="72" height="28" rx="12" className="art-teal-outline" />
      <text x="78" y="130" className="art-small teal" textAnchor="middle">OBJECTION</text>
      <path d="M91 55l24 18m42 27-58 14" className="art-ink-light" strokeWidth="1.2" strokeDasharray="3 3" />
      <path d="M178 43c14-6 31-6 45 0v67c-14-6-31-6-45 0z" className="art-burgundy-outline" strokeWidth="1.4" />
      <path d="M201 43v67m-17-52 11-2m-11 12 11-2m11-8 14-2m-14 12 14-2" className="art-burgundy-light" strokeWidth=".9" />
      <text x="247" y="132" className="art-hand burgundy" transform="rotate(6 247 132)">?</text>
      <text x="204" y="31" className="art-hand burgundy" transform="rotate(-5 204 31)">problématiser</text>
      <path d="M21 95c-5 10 3 18 13 15" className="art-teal" strokeWidth="1" />
    </svg>;
  }

  return <svg viewBox="0 0 320 170" aria-hidden="true" focusable="false">
    <rect x="12" y="12" width="296" height="146" rx="16" className="widget-paper" />
    <rect x="30" y="35" width="76" height="46" rx="7" className="art-teal-outline" transform="rotate(-4 30 35)" />
    <rect x="42" y="58" width="76" height="46" rx="7" className="art-burgundy-outline" transform="rotate(3 42 58)" />
    <rect x="42" y="48" width="44" height="13" rx="5" className="highlight-teal" transform="rotate(-4 42 48)" />
    <text x="45" y="66" className="art-hand ink" transform="rotate(-4 45 66)">achieve</text>
    <path d="M156 35h79a8 8 0 0 1 8 8v31a8 8 0 0 1-8 8h-40l-16 15v-15h-23a8 8 0 0 1-8-8V43a8 8 0 0 1 8-8z" className="art-ink-outline" strokeWidth="1.4" />
    <path d="M168 53h47m-47 11h31" className="art-ink-light" strokeWidth="1" />
    <rect x="184" y="106" width="69" height="31" rx="4" className="art-teal-outline" />
    <path d="M218 106v31" className="art-teal" strokeWidth="1" />
    <text x="192" y="126" className="art-small teal">A–Z</text>
    <text x="30" y="131" className="art-hand olive" transform="rotate(-3 30 131)">however</text>
    <path d="M267 102c13-5 23 2 18 12" className="art-burgundy" strokeWidth="1.2" />
  </svg>;
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
      {trackSubjects.map((subject, index) => {
        return <Link key={subject.id} to={`/subjects/${subjectSlug[subject.id]}`} className={`card subject-large-card subject-card--${subjectThemes[subject.id]}`}>
          <div className="subject-large-card__accent-line" />
          <div className="subject-large-card__top">
            <span className="subject-large-card__index">0{index + 1}</span>
            <span className="subject-large-card__open">Ouvrir <ArrowUpRight size={13} /></span>
          </div>
          <div className="subject-large-card__illustration"><SubjectWidgetArt subject={subject.id} /></div>
          <div className="subject-large-card__copy">
            <h2>{subject.name}</h2>
            <p>{subject.id === "maths" ? "Fonctions, analyse, probabilités et méthodes du Bac." : subject.id === "physique-chimie" ? "Ondes, mécanique, électricité, énergie et chimie." : subject.id === "svt" ? "Génétique, immunologie, géologie et sciences du vivant." : subject.id === "philosophie" ? "Notions, problématiques, dissertations et argumentation." : "Vocabulary, grammar, communication et writing."}</p>
          </div>
          <div className="subject-large-card__footer">
            <span>{subject.id === "philosophie" ? "Notions · Dissertations · Révision" : subject.id === "anglais" ? "Lessons · Exercises · Revision" : "Cours · Exercices · Révision"}</span>
            <span className="subject-large-card__arrow"><ArrowRight size={15} /></span>
          </div>
        </Link>;
      })}
    </div>
  </main>;
}
