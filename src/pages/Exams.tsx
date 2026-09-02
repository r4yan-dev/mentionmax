import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  FileText,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "../lib/supabase";
import {
  exams as nationalExams,
  subjectLabels,
  subjectOrder,
  type ExamSubject,
} from "../features/exams/catalog";

import "./Exams.css";

type ExamTab = "all" | "official" | "created";

type PublishedTest = {
  id: string;
  title: string;
  description: string | null;
  source_type: "custom" | "national_exam" | "ai_generated";
  duration_minutes: number | null;
  level: string | null;
  section: string | null;
  year: number | null;
  total_points: number | null;
  created_at: string;
  subject:
    | {
        id: string;
        name: string;
        short_name: string | null;
        icon: string | null;
        color: string | null;
      }
    | null;
};

const tabLabels: Record<ExamTab, string> = {
  all: "Tous les tests",
  official: "Examens nationaux",
  created: "Tests MentionMax",
};

const subjectSearchLabels: Record<ExamSubject, string[]> = {
  maths: ["math", "mathématique", "mathématiques", "maths"],
  pc: ["physique", "chimie", "physique-chimie", "pc"],
  svt: ["svt", "sciences de la vie", "terre"],
  philo: ["philo", "philosophie"],
  english: ["english", "anglais"],
};

function getTestLabel(test: PublishedTest) {
  if (test.source_type === "ai_generated") return "Généré par IA";
  if (test.source_type === "national_exam") return "Sujet national";
  return "MentionMax";
}

function getSubjectLabel(test: PublishedTest) {
  return test.subject?.short_name || test.subject?.name || "Général";
}

export default function Exams() {
  const [tab, setTab] = useState<ExamTab>("all");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState<"all" | ExamSubject>("all");
  const [tests, setTests] = useState<PublishedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [sourceText, setSourceText] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTests() {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("tests")
        .select(
          `
            id,
            title,
            description,
            source_type,
            duration_minutes,
            level,
            section,
            year,
            total_points,
            created_at,
            subject:subjects (
              id,
              name,
              short_name,
              icon,
              color
            )
          `,
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(24);

      if (cancelled) return;

      if (error) {
        console.error("Failed to load published tests:", error);
        setLoadError("Impossible de charger les tests pour le moment.");
        setTests([]);
      } else {
        setTests((data ?? []) as unknown as PublishedTest[]);
      }

      setLoading(false);
    }

    void loadTests();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesTab =
        tab === "all" ||
        (tab === "official" && test.source_type === "national_exam") ||
        (tab === "created" && test.source_type !== "national_exam");

      const matchesSubject =
        subject === "all" ||
        subjectSearchLabels[subject].some((label) =>
          `${test.subject?.name ?? ""} ${test.subject?.short_name ?? ""}`
            .toLowerCase()
            .includes(label),
        );

      const haystack = [
        test.title,
        test.description ?? "",
        test.subject?.name ?? "",
        test.subject?.short_name ?? "",
        test.year ?? "",
        test.level ?? "",
        test.section ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesTab && matchesSubject && matchesQuery;
    });
  }, [query, subject, tab, tests]);

  const yearSummary = useMemo(() => {
    const grouped = new Map<number, number>();

    for (const exam of nationalExams) {
      grouped.set(exam.year, (grouped.get(exam.year) ?? 0) + 1);
    }

    return [...grouped.entries()].slice(0, 3);
  }, []);

  const latestOfficial = nationalExams.slice(0, 5);

  return (
    <main className="exams-page">
      <header className="exams-page__header">
        <div className="exams-page__heading">
          <span className="section-eyebrow">Tests & examens</span>
          <h1>Prépare le Bac dans les vraies conditions.</h1>
          <p>
            Les sujets officiels d'un côté. Tes tests de préparation de l'autre.
            Et l'IA pour transformer rapidement un texte extrait en véritable
            test structuré.
          </p>
        </div>

        <div className="exams-page__actions">
          <Link to="/exams/nationaux" className="btn btn-secondary">
            <BookOpen size={16} strokeWidth={2.2} />
            Voir les nationaux
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowGenerator(true)}
          >
            <Sparkles size={16} strokeWidth={2.2} />
            Créer avec l'IA
          </button>
        </div>
      </header>

      <section className="exams-hero-grid">
        <Link to="/exams/nationaux" className="exams-hero-card">
          <div className="exams-hero-card__glow" />
          <div className="exams-hero-card__topline">
            <span className="exams-kicker">Bibliothèque officielle</span>
            <span className="exams-pill">{nationalExams.length} sujets</span>
          </div>

          <div className="exams-hero-card__content">
            <span className="exams-hero-card__icon">
              <FileText size={21} />
            </span>
            <div>
              <h2>Examens nationaux</h2>
              <p>
                Les vrais sujets du Bac, classés par matière et par année,
                avec ouverture directe du document.
              </p>
            </div>
          </div>

          <div className="exams-hero-card__bottom">
            <span>Parcourir la banque</span>
            <ArrowRight size={17} />
          </div>
        </Link>

        <button
          type="button"
          className="exams-ai-card"
          onClick={() => setShowGenerator(true)}
        >
          <div className="exams-ai-card__topline">
            <span className="exams-kicker">MentionMax AI</span>
            <span className="exams-ai-card__spark">
              <Sparkles size={16} />
            </span>
          </div>

          <div>
            <h2>Transformer un texte en test</h2>
            <p>
              Colle le texte extrait d'un cours ou d'un sujet. Le pipeline IA
              pourra ensuite produire les questions et leur structure.
            </p>
          </div>

          <span className="exams-ai-card__cta">
            Commencer <ArrowRight size={16} />
          </span>
        </button>
      </section>

      <section className="exams-stats-row">
        <div className="exams-stat">
          <span className="exams-stat__label">Sujets officiels</span>
          <strong>{nationalExams.length}</strong>
          <small>dans la banque actuelle</small>
        </div>

        <div className="exams-stat">
          <span className="exams-stat__label">Tests publiés</span>
          <strong>{loading ? "—" : tests.length}</strong>
          <small>depuis Supabase</small>
        </div>

        <div className="exams-stat exams-stat--wide">
          <span className="exams-stat__label">Années visibles</span>
          <div className="exams-years">
            {yearSummary.length > 0 ? (
              yearSummary.map(([year, count]) => (
                <span key={year}>
                  {year} <b>{count}</b>
                </span>
              ))
            ) : (
              <span>Ajout des sujets en cours</span>
            )}
          </div>
        </div>
      </section>

      <section className="exams-library card">
        <div className="exams-library__header">
          <div>
            <span className="section-eyebrow">Bibliothèque</span>
            <h2 className="section-title">Tests et examens</h2>
          </div>

          <div className="exams-library__search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher un sujet, une matière..."
              aria-label="Rechercher un test"
            />
          </div>
        </div>

        <div className="exams-library__controls">
          <div className="exams-tabs" role="tablist" aria-label="Type de tests">
            {(Object.keys(tabLabels) as ExamTab[]).map((item) => (
              <button
                key={item}
                type="button"
                className={`exams-tab ${tab === item ? "active" : ""}`}
                onClick={() => setTab(item)}
              >
                {tabLabels[item]}
              </button>
            ))}
          </div>

          <label className="exams-subject-filter">
            <span>Matière</span>
            <select
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value as "all" | ExamSubject)
              }
            >
              <option value="all">Toutes</option>
              {subjectOrder.map((item) => (
                <option key={item} value={item}>
                  {subjectLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loadError && <div className="exams-inline-error">{loadError}</div>}

        {loading ? (
          <div className="exams-skeleton-grid" aria-label="Chargement des tests">
            {[0, 1, 2].map((item) => (
              <div className="exams-skeleton" key={item} />
            ))}
          </div>
        ) : filteredTests.length > 0 ? (
          <div className="exams-test-grid">
            {filteredTests.map((test) => (
              <article className="exams-test-card" key={test.id}>
                <div className="exams-test-card__meta">
                  <span>{getTestLabel(test)}</span>
                  {test.year && <span>{test.year}</span>}
                </div>

                <h3>{test.title || getSubjectLabel(test)}</h3>
                <p>
                  {test.description ||
                    "Un test structuré pour ta préparation au Bac."}
                </p>

                <div className="exams-test-card__footer">
                  <span>
                    {test.duration_minutes ? (
                      <>
                        <Clock3 size={14} /> {test.duration_minutes} min
                      </>
                    ) : (
                      "Temps libre"
                    )}
                  </span>
                  <span>{getSubjectLabel(test)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="exams-empty">
            <div className="exams-empty__icon">
              <Plus size={19} />
            </div>
            <div>
              <span className="section-eyebrow">Aucun test</span>
              <h3>La bibliothèque de tests est encore vide.</h3>
              <p>
                Les examens nationaux sont accessibles séparément. Les tests
                MentionMax apparaîtront ici dès leur publication dans Supabase.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowGenerator(true)}
            >
              Créer un test
            </button>
          </div>
        )}

        <div className="exams-library__footer">
          <span>
            {latestOfficial.length > 0
              ? `Derniers sujets : ${latestOfficial
                  .map((exam) => `${subjectLabels[exam.subject]} ${exam.year}`)
                  .join(" · ")}`
              : "La banque officielle sera alimentée prochainement."}
          </span>
          <Link to="/exams/nationaux">
            Voir toute la banque <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {showGenerator && (
        <div
          className="exams-modal-backdrop"
          role="presentation"
          onMouseDown={() => setShowGenerator(false)}
        >
          <div
            className="exams-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exams-generator-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="exams-modal__header">
              <div>
                <span className="section-eyebrow">MentionMax AI</span>
                <h2 id="exams-generator-title">
                  Créer un test depuis un texte
                </h2>
              </div>
              <button
                type="button"
                className="exams-modal__close"
                onClick={() => setShowGenerator(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>

            <p className="exams-modal__lead">
              Colle le texte déjà extrait du document. Cette zone devient
              l'entrée du générateur IA qui transformera le contenu en test
              structuré.
            </p>

            <textarea
              value={sourceText}
              onChange={(event) => setSourceText(event.target.value)}
              placeholder="Colle ici le texte du cours, du sujet ou du document..."
              rows={12}
            />

            <div className="exams-modal__footer">
              <span>{sourceText.trim().length} caractères</span>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!sourceText.trim()}
                onClick={() => {
                  setShowGenerator(false);
                }}
              >
                <Sparkles size={15} />
                Continuer vers le générateur
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
