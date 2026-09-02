import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bot, Clock3, FileText, ScanLine, Sparkles, Upload, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { exams as nationalExams } from "../features/exams/catalog";
import "./Exams.css";
import "./ExamsFocusLayout.css";

type PublishedTest = {
  id: string;
  title: string;
  description: string | null;
  source_type: "custom" | "national_exam" | "ai_generated";
  duration_minutes: number | null;
  level: string | null;
  section: string | null;
  year: number | null;
  subject: { name: string; short_name: string | null } | null;
};

function testSourceLabel(source: PublishedTest["source_type"]) {
  if (source === "ai_generated") return "Généré par IA";
  if (source === "national_exam") return "Sujet national";
  return "Communauté";
}

export default function Exams() {
  const [tests, setTests] = useState<PublishedTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceText, setSourceText] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("tests")
        .select("id,title,description,source_type,duration_minutes,level,section,year,subject:subjects(name,short_name)")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (!cancelled) {
        setTests((data ?? []) as unknown as PublishedTest[]);
        setLoading(false);
      }
    }

    void load();
    return () => { cancelled = true; };
  }, []);

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tests;
    return tests.filter((test) =>
      `${test.title} ${test.description ?? ""} ${test.subject?.name ?? ""} ${test.year ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [query, tests]);

  return (
    <main className="exams-page exams-ai-page">
      <header className="exams-page__header exams-ai-page__header">
        <div className="exams-page__heading">
          <span className="section-eyebrow">EXAMENS & CORRIGÉS</span>
          <h1>Travaille les examens avec l'IA.</h1>
          <p>
            Génère un vrai sujet depuis ton cours, ou fais corriger ton travail par MentionMax.
            Les sujets PDF classiques restent dans l'espace Tests.
          </p>
        </div>
        <div className="exam-mode-switch" role="tablist" aria-label="Mode des examens">
          <Link className="exam-mode-switch__item active" to="/exams" role="tab" aria-selected="true">
            <Sparkles size={15} /> IA & Correction
          </Link>
          <Link className="exam-mode-switch__item" to="/tests" role="tab" aria-selected="false">
            <FileText size={15} /> Tests classiques
          </Link>
        </div>
      </header>

      <section className="exams-ai-workspace">
        <article className="exams-ai-generator">
          <div className="exams-ai-generator__head">
            <div>
              <span className="exams-kicker">GÉNÉRATEUR D'EXAMEN</span>
              <h2>Transforme ton cours en véritable sujet.</h2>
              <p>Colle le texte extrait de tes notes ou d'un document. Le contenu devient la matière première du générateur.</p>
            </div>
            <span className="exams-ai-icon"><Wand2 size={24} /></span>
          </div>
          <textarea
            className="exams-generator-input"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="Colle ici le texte de ton cours, d'un chapitre ou d'un sujet..."
            rows={9}
            aria-label="Texte source pour le générateur d'examen"
          />
          <div className="exams-ai-generator__footer">
            <span>{sourceText.trim().length} caractères</span>
            <button className="btn btn-primary" type="button" disabled={!sourceText.trim()}>
              <Sparkles size={16} /> Générer l'examen
            </button>
          </div>
        </article>

        <article className="exams-ai-corrector">
          <div>
            <span className="exams-kicker">CORRECTEUR IA</span>
            <h2>Scanne. Corrige. Comprends.</h2>
            <p>Envoie ton devoir ou une photo de ta copie pour obtenir une correction guidée et exploitable.</p>
          </div>
          <div className="exams-corrector-visual">
            <div className="exams-corrector-ring"><ScanLine size={34} /></div>
            <div className="exams-corrector-brain"><Bot size={30} /></div>
            <span className="exams-corrector-line exams-corrector-line--one" />
            <span className="exams-corrector-line exams-corrector-line--two" />
          </div>
          <div className="exams-corrector-actions">
            <button type="button" className="btn btn-primary"><Upload size={16} /> Scanner pour corriger</button>
            <span>PDF, image ou copie scannée</span>
          </div>
        </article>
      </section>

      <section className="exams-ai-library card">
        <div className="exams-ai-library__header">
          <div>
            <span className="section-eyebrow">IA TESTS & COMMUNAUTÉ</span>
            <h2 className="section-title">Tes tests en notes & communauté</h2>
          </div>
          <div className="exams-library__search">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un test..." aria-label="Rechercher un test" />
          </div>
        </div>

        {loading ? (
          <div className="exams-test-grid">
            {[0, 1, 2].map((item) => <div className="exams-skeleton" key={item} />)}
          </div>
        ) : filteredTests.length ? (
          <div className="exams-test-grid">
            {filteredTests.map((test) => (
              <article className="exams-test-card exams-test-card--ai" key={test.id}>
                <div className="exams-test-card__meta">
                  <span>{testSourceLabel(test.source_type)}</span>
                  {test.year && <span>{test.year}</span>}
                </div>
                <h3>{test.title}</h3>
                <p>{test.description || "Un test structuré pour ta préparation au Bac."}</p>
                <div className="exams-test-card__footer">
                  <span>{test.duration_minutes ? <><Clock3 size={14} /> {test.duration_minutes} min</> : "Temps libre"}</span>
                  <span>{test.subject?.short_name || test.subject?.name || "Général"}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="exams-ai-empty">
            <div className="exams-empty__icon"><Bot size={19} /></div>
            <div>
              <h3>Commence avec ton premier test.</h3>
              <p>Les tests publiés depuis Supabase apparaîtront ici.</p>
            </div>
          </div>
        )}
      </section>

      <section className="exams-national-strip">
        <div>
          <span className="section-eyebrow">BANQUE OFFICIELLE</span>
          <h2>Les vrais examens nationaux restent à portée de clic.</h2>
          <p>{nationalExams.length} sujets disponibles par matière et par année.</p>
        </div>
        <Link className="btn btn-secondary" to="/exams/nationaux">
          Parcourir les nationaux <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}
