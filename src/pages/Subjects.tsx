import { useMemo } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, FileText, PenLine, Sparkles } from "lucide-react";
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
import "../styles/subjects-launcher-fix.css";

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
    return (
      <svg className="subject-widget-svg" viewBox="0 0 600 280" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <rect x="30" y="30" width="540" height="220" rx="24" fill="#FFFFFF" stroke="#D9EAE7" strokeWidth="2" />
        <path d="M90 210V70M60 180H230" stroke="#0FA3A3" strokeWidth="5" strokeLinecap="round" />
        <path d="M86 75L90 65L95 75M220 175L232 180L220 185" fill="none" stroke="#0FA3A3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M92 174C122 120 160 106 188 126C206 139 221 126 243 87" fill="none" stroke="#073B3A" strokeWidth="7" strokeLinecap="round" />
        <circle cx="90" cy="174" r="7" fill="#7A873A" />
        <circle cx="243" cy="87" r="7" fill="#0FA3A3" />
        <g transform="translate(305 58) rotate(-4)">
          <rect width="198" height="78" rx="16" fill="#F8FCFB" stroke="#CFE7E3" strokeWidth="2" />
          <text x="20" y="38" fontFamily="Caveat, cursive" fontSize="28" fontWeight="700" fill="#073B3A">f′(x) = 2x − 2</text>
          <path d="M20 56H124" stroke="#0FA3A3" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g transform="translate(352 162) rotate(3)">
          <rect width="150" height="58" rx="14" fill="#DDF5F1" stroke="#9FD8D2" strokeWidth="2" />
          <text x="20" y="37" fontFamily="Caveat, cursive" fontSize="24" fontWeight="700" fill="#073B3A">∫ f(x) dx</text>
        </g>
        <circle cx="278" cy="190" r="33" fill="#EEF4DF" stroke="#7A873A" strokeWidth="3" />
        <path d="M278 164V216M252 190H304" stroke="#7A873A" strokeWidth="2" strokeDasharray="4 5" />
      </svg>
    );
  }

  if (subject === "physique-chimie") {
    return (
      <svg className="subject-widget-svg" viewBox="0 0 600 280" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <rect x="30" y="30" width="540" height="220" rx="24" fill="#FFFFFF" stroke="#D9EAE7" strokeWidth="2" />
        <g transform="translate(52 54)">
          <circle cx="62" cy="62" r="22" fill="none" stroke="#0FA3A3" strokeWidth="5" />
          <ellipse cx="62" cy="62" rx="52" ry="20" fill="none" stroke="#073B3A" strokeWidth="4" transform="rotate(28 62 62)" />
          <ellipse cx="62" cy="62" rx="52" ry="20" fill="none" stroke="#073B3A" strokeWidth="4" transform="rotate(-28 62 62)" />
          <circle cx="62" cy="62" r="8" fill="#7A873A" />
        </g>
        <g transform="translate(188 72)">
          <path d="M0 42H46L56 24L66 60L76 24L86 60L96 42H140" fill="none" stroke="#073B3A" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="55" y="60" width="30" height="34" rx="5" fill="#DDF5F1" stroke="#0FA3A3" strokeWidth="4" />
          <path d="M0 42H-20M140 42H160" stroke="#073B3A" strokeWidth="5" strokeLinecap="round" />
        </g>
        <g transform="translate(366 54) rotate(-3)">
          <rect width="152" height="74" rx="16" fill="#F8FCFB" stroke="#CFE7E3" strokeWidth="2" />
          <text x="20" y="40" fontFamily="Caveat, cursive" fontSize="29" fontWeight="700" fill="#0FA3A3">U = R × I</text>
        </g>
        <g transform="translate(360 156) rotate(3)">
          <rect width="162" height="60" rx="15" fill="#EEF4DF" stroke="#D4DFC0" strokeWidth="2" />
          <text x="20" y="37" fontFamily="Caveat, cursive" fontSize="24" fontWeight="700" fill="#073B3A">λ = vT</text>
          <path d="M91 30H136" stroke="#7A873A" strokeWidth="4" strokeLinecap="round" />
          <path d="M126 20L138 30L126 40" fill="none" stroke="#7A873A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <circle cx="250" cy="190" r="5" fill="#0FA3A3" />
        <circle cx="269" cy="190" r="5" fill="#7A873A" />
        <circle cx="288" cy="190" r="5" fill="#0FA3A3" />
      </svg>
    );
  }

  if (subject === "svt") {
    return (
      <svg className="subject-widget-svg" viewBox="0 0 600 280" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <rect x="30" y="30" width="540" height="220" rx="24" fill="#FFFFFF" stroke="#D9EAE7" strokeWidth="2" />
        <text x="66" y="64" fontFamily="Caveat, cursive" fontSize="25" fontWeight="700" fill="#7A873A">ADN</text>
        <g transform="translate(70 86)">
          <path d="M0 0C58 22 58 92 0 116M48 0C-10 22 -10 92 48 116" fill="none" stroke="#7A873A" strokeWidth="6" strokeLinecap="round" />
          <path d="M6 15H42M2 39H46M2 63H46M2 87H46M6 111H42" stroke="#073B3A" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g transform="translate(200 58)">
          <circle cx="70" cy="70" r="56" fill="#F8FCFB" stroke="#073B3A" strokeWidth="4" />
          <ellipse cx="70" cy="70" rx="27" ry="22" fill="#EEF4DF" stroke="#7A873A" strokeWidth="3" />
          <circle cx="70" cy="70" r="7" fill="#7A873A" />
          <circle cx="30" cy="88" r="8" fill="#DDF5F1" stroke="#0FA3A3" strokeWidth="3" />
          <circle cx="108" cy="51" r="7" fill="#DDF5F1" stroke="#0FA3A3" strokeWidth="3" />
        </g>
        <g transform="translate(358 63)">
          <rect x="0" y="0" width="158" height="58" rx="14" fill="#F8FCFB" stroke="#D6E5D4" strokeWidth="2" />
          <text x="18" y="36" fontFamily="Inter, sans-serif" fontSize="15" fontWeight="800" fill="#7A873A">CELLULE</text>
        </g>
        <circle cx="426" cy="174" r="43" fill="none" stroke="#0FA3A3" strokeWidth="4" />
        <circle cx="426" cy="174" r="13" fill="#DDF5F1" stroke="#0FA3A3" strokeWidth="3" />
        <circle cx="494" cy="174" r="7" fill="#7A873A" />
        <path d="M456 174H485" stroke="#073B3A" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  if (subject === "philosophie") {
    return (
      <svg className="subject-widget-svg" viewBox="0 0 600 280" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
        <rect x="30" y="30" width="540" height="220" rx="24" fill="#FFFFFF" stroke="#D9EAE7" strokeWidth="2" />
        <g transform="translate(66 55)">
          <circle cx="66" cy="54" r="36" fill="#F3E5EA" stroke="#76213A" strokeWidth="4" />
          <path d="M50 48C55 31 79 31 84 48C89 64 75 74 66 74C57 74 45 63 50 48Z" fill="none" stroke="#76213A" strokeWidth="4" />
          <circle cx="60" cy="49" r="4" fill="#76213A" />
          <circle cx="73" cy="49" r="4" fill="#76213A" />
          <path d="M58 61C63 65 68 65 74 61" fill="none" stroke="#76213A" strokeWidth="3" strokeLinecap="round" />
          <text x="18" y="122" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="900" fill="#76213A">QUESTION</text>
        </g>
        <g transform="translate(205 62)">
          <rect width="104" height="42" rx="21" fill="#F3E5EA" />
          <text x="52" y="27" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="900" fill="#76213A">THÈSE</text>
          <path d="M104 21H134" stroke="#073B3A" strokeWidth="4" strokeLinecap="round" />
          <path d="M126 13L136 21L126 29" fill="none" stroke="#073B3A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g transform="translate(339 62)">
          <rect width="122" height="42" rx="21" fill="#DDF5F1" />
          <text x="61" y="27" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="900" fill="#073B3A">ARGUMENT</text>
        </g>
        <g transform="translate(208 140)">
          <rect width="126" height="42" rx="21" fill="#F3E5EA" />
          <text x="63" y="27" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="900" fill="#76213A">OBJECTION</text>
        </g>
        <g transform="translate(401 134) rotate(-4)">
          <path d="M0 0C34 -12 71 -12 102 0V92C71 80 34 80 0 92Z" fill="#F8FCFB" stroke="#76213A" strokeWidth="4" />
          <path d="M51 0V83" stroke="#76213A" strokeWidth="3" />
          <path d="M14 25H43M59 25H88M14 42H43M59 42H88" stroke="#C89AA9" strokeWidth="3" strokeLinecap="round" />
        </g>
        <text x="529" y="215" fontFamily="Caveat, cursive" fontSize="42" fill="#76213A">?</text>
      </svg>
    );
  }

  return (
    <svg className="subject-widget-svg" viewBox="0 0 600 280" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <rect x="30" y="30" width="540" height="220" rx="24" fill="#FFFFFF" stroke="#D9EAE7" strokeWidth="2" />
      <g transform="translate(54 57) rotate(-4)">
        <rect width="188" height="114" rx="16" fill="#F8FCFB" stroke="#0FA3A3" strokeWidth="4" />
        <rect x="18" y="22" width="72" height="24" rx="8" fill="#DDF5F1" />
        <text x="24" y="40" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="900" fill="#073B3A">VOCAB</text>
        <text x="20" y="74" fontFamily="Caveat, cursive" fontSize="25" fontWeight="700" fill="#073B3A">achieve</text>
        <text x="20" y="99" fontFamily="Caveat, cursive" fontSize="22" fontWeight="700" fill="#0FA3A3">although</text>
      </g>
      <g transform="translate(283 52)">
        <path d="M0 0H164C174 0 182 8 182 18V69C182 79 174 87 164 87H76L52 110V87H18C8 87 0 79 0 69Z" fill="#FFFFFF" stroke="#073B3A" strokeWidth="4" />
        <path d="M24 30H140M24 49H112" stroke="#073B3A" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform="translate(335 160) rotate(4)">
        <rect width="166" height="61" rx="14" fill="#F3E5EA" stroke="#E2CBD3" strokeWidth="2" />
        <text x="23" y="40" fontFamily="Fraunces, serif" fontSize="19" fontWeight="600" fill="#76213A">Writing · A–Z</text>
      </g>
      <path d="M61 200C91 187 120 214 150 200C180 186 208 214 238 200" fill="none" stroke="#7A873A" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
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
