import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Download, FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import {
  exams,
  displayFileName,
  sessionLabel,
  subjectLabels,
  subjectOrder,
} from "../features/exams/catalog";
import "./Exams.css";

export default function Tests() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [year, setYear] = useState("all");

  const years = useMemo(() => [...new Set(exams.map((exam) => exam.year))].sort((a, b) => b - a), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exams.filter((exam) => {
      const subjectMatch = subject === "all" || exam.subject === subject;
      const yearMatch = year === "all" || String(exam.year) === year;
      const haystack = `${subjectLabels[exam.subject]} ${exam.year} ${exam.fileName} ${sessionLabel(exam.session)}`.toLowerCase();
      return subjectMatch && yearMatch && (!q || haystack.includes(q));
    });
  }, [query, subject, year]);

  return (
    <main className="exams-page classic-tests-page">
      <header className="exams-page__header">
        <div className="exams-page__heading">
          <span className="section-eyebrow">TESTS CLASSIQUES</span>
          <h1>Les sujets PDF, simplement.</h1>
          <p>
            L'espace classique pour travailler directement sur les vrais sujets disponibles en PDF.
            Pour le générateur et le correcteur IA, passe en mode IA.
          </p>
        </div>
        <div className="exam-mode-switch" role="tablist" aria-label="Mode des examens">
          <Link className="exam-mode-switch__item" to="/exams" role="tab" aria-selected="false">
            <span>✦</span> IA & Correction
          </Link>
          <Link className="exam-mode-switch__item active" to="/tests" role="tab" aria-selected="true">
            <FileText size={15} /> Tests classiques
          </Link>
        </div>
      </header>

      <section className="classic-tests-toolbar card">
        <div className="exams-library__search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une matière, une année..." aria-label="Rechercher un test classique" />
        </div>
        <label>
          <span>Matière</span>
          <select value={subject} onChange={(event) => setSubject(event.target.value)}>
            <option value="all">Toutes</option>
            {subjectOrder.map((item) => <option key={item} value={item}>{subjectLabels[item]}</option>)}
          </select>
        </label>
        <label>
          <span>Année</span>
          <select value={year} onChange={(event) => setYear(event.target.value)}>
            <option value="all">Toutes</option>
            {years.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </section>

      <section className="classic-tests-intro">
        <div>
          <span className="section-eyebrow">PDF TESTS</span>
          <h2 className="section-title">Sujets officiels</h2>
        </div>
        <span>{filtered.length} sujets affichés</span>
      </section>

      <section className="classic-tests-grid">
        {filtered.map((exam) => (
          <article className="classic-test-card" key={exam.id}>
            <div className="classic-test-card__icon"><FileText size={20} /></div>
            <div className="classic-test-card__body">
              <div className="classic-test-card__meta">
                <span>{subjectLabels[exam.subject]}</span>
                <span><CalendarDays size={13} /> {exam.year}</span>
              </div>
              <h3>{displayFileName(exam.fileName)}</h3>
              <p>{sessionLabel(exam.session)} · PDF officiel</p>
              <div className="classic-test-card__footer">
                <span>Document PDF</span>
                <a href={exam.url} target="_blank" rel="noreferrer" className="classic-test-card__open">
                  Ouvrir <Download size={15} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </section>

      {!filtered.length && (
        <section className="exams-empty card">
          <div className="exams-empty__icon"><Search size={19} /></div>
          <div>
            <span className="section-eyebrow">Aucun résultat</span>
            <h3>Aucun sujet ne correspond à tes filtres.</h3>
            <p>Réinitialise la recherche ou ouvre directement la banque nationale.</p>
          </div>
          <Link className="btn btn-secondary" to="/exams/nationaux">Banque nationale <ArrowRight size={15} /></Link>
        </section>
      )}
    </main>
  );
}
