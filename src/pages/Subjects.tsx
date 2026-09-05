import { useMemo } from "react";
import { ArrowRight, BookOpen, FileText, Layers3, PenLine, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { SubjectIcon, type SubjectType } from "../components/ui/SubjectIcon";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath, pathLabels, type UserPath } from "../data/curriculum/secondBac";
import type { SubjectId } from "../types/academic";
import { lessonService } from "../services/lesson/lessonService";
import { contentCatalogService } from "../services/content/contentCatalogService";
import PathSwitcher from "../components/curriculum/PathSwitcher";
import PeopleFeature, { type PeopleFeatureVariant } from "../components/ui/PeopleFeature";
import "../styles/curriculum-path.css";

const subjectTypes: Record<SubjectId, SubjectType> = {
  maths: "math",
  "physique-chimie": "physics",
  svt: "svt",
  anglais: "english",
  philosophie: "philosophy",
};

function resolveSubject(value?: string): SubjectId | null {
  if (!value) return null;
  if (["maths", "mathematics", "mathematiques"].includes(value)) return "maths";
  if (["physique", "physics", "physique-chimie"].includes(value)) return "physique-chimie";
  if (value === "svt") return "svt";
  if (["anglais", "english"].includes(value)) return "anglais";
  if (["philo", "philosophie", "philosophy"].includes(value)) return "philosophie";
  return null;
}

function peopleVariantForSubject(subject: SubjectId): PeopleFeatureVariant {
  if (subject === "maths") return "maths";
  if (subject === "physique-chimie") return "physics";
  if (subject === "svt") return "svt";
  if (subject === "anglais") return "english";
  return "philosophy";
}

export default function Subjects() {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(
    schoolPreferences?.track ?? null,
    schoolPreferences?.section ?? null,
  );
  const selected = resolveSubject(subjectId);
  const availableSubjects = getTrackSubjects(path);

  const lessons = useMemo(
    () => (selected ? lessonService.list(selected, path) : []),
    [selected, path],
  );
  const exerciseCount = useMemo(
    () => (selected ? contentCatalogService.getBaseExercises(path, selected).length : 0),
    [selected, path],
  );

  if (!selected || !availableSubjects.some((subject) => subject.id === selected)) {
    const unavailableSvt = path === "SMB" && selected === "svt";
    return (
      <main className="section container">
        <div className="subject-path-banner">
          <div className="subject-path-banner__title">
            <div>
              <strong>{pathLabels[path]}</strong>
              <span>Ce choix détermine les matières disponibles.</span>
            </div>
          </div>
          <PathSwitcher />
        </div>
        <PageHeader
          eyebrow="Programme 2BAC"
          title="Cette matière n'est pas disponible."
          description={
            unavailableSvt
              ? "La SVT n'est pas proposée en Sciences Mathématiques B."
              : "Utilise le sélecteur de parcours pour consulter un autre programme."
          }
        />
        <Link to="/subjects" className="btn btn-secondary">
          Retour aux matières
        </Link>
      </main>
    );
  }

  const subject = subjectCatalog[selected];
  const showSpcMathsFlashcards = path === "SP" && selected === "maths";

  return (
    <main className="section container">
      <div className="subject-path-banner">
        <div className="subject-path-banner__title">
          <SubjectIcon type={subjectTypes[selected]} label={subject.name} />
          <div>
            <strong>{pathLabels[path]}</strong>
            <span>{subject.name} · programme 2BAC</span>
          </div>
        </div>
        <PathSwitcher />
      </div>

      <PageHeader
        eyebrow="Cours · exercices · révision"
        title={<>Prépare la <span className="accent-word">{subject.name}.</span></>}
        description="Un espace organisé autour des chapitres, des leçons et des exercices du Bac."
      />

      <PeopleFeature
        variant={peopleVariantForSubject(selected)}
        compact
        title={`Maîtrise ${subject.name}, chapitre après chapitre.`}
        text={`Cours, ${exerciseCount} exercices et notes réunis dans un parcours pensé pour le ${pathLabels[path]}.`}
      />

      <div className="subjects-actions">
        <Link to={`/lecons/${selected}`} className="btn btn-primary"><BookOpen size={15} /> Voir les cours</Link>
        <Link to={`/exercices?subject=${encodeURIComponent(selected)}`} className="btn btn-secondary"><PenLine size={15} /> {exerciseCount} exercices</Link>
        {showSpcMathsFlashcards && <Link to="/flashcards?track=SP&subject=maths" className="btn btn-secondary"><Layers3 size={15} /> Flashcards</Link>}
        <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(selected)}`} className="btn btn-secondary"><FileText size={15} /> Mes notes</Link>
      </div>

      <section className="card subjects-program-card">
        <div className="subjects-program-head">
          <div>
            <span className="section-eyebrow">Programme 2BAC</span>
            <h2 className="subjects-program-title">{lessons.length} leçons accessibles</h2>
          </div>
          <Link to={`/lecons/${selected}`} className="text-brand subjects-inline-link">Tout voir <ArrowRight size={14} /></Link>
        </div>
        {lessons.length ? (
          <div className="subjects-lesson-grid">
            {lessons.map((item, index) => (
              <Link key={item.id} to={`/lecons/${selected}/${item.id}`} className="card subjects-lesson-card">
                <div className="subjects-lesson-card__meta">
                  <span className="subjects-lesson-card__number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="section-eyebrow">LEÇON</span>
                  <span className="subjects-lesson-card__dot" />
                </div>
                <h3 className="subjects-lesson-card__title">{item.title}</h3>
                <p className="subjects-lesson-card__description">
                  {item.blocks.find((block) => block.type === "intro")?.text ?? "Explore ce chapitre et consolide les notions essentielles du programme."}
                </p>
                <span className="text-brand subjects-lesson-card__link">Étudier <ArrowRight size={13} /></span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="subject-empty"><Sparkles size={18} /><span>Aucune leçon n'est encore publiée pour ce parcours.</span></div>
        )}
      </section>
    </main>
  );
}
