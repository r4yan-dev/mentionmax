import { useMemo, useState } from "react";
import { CalendarDays, Download, FileText, Search } from "lucide-react";
import {
  exams,
  displayFileName,
  sessionLabel,
  subjectLabels,
  subjectOrder,
} from "../features/exams/catalog";
import "./NationalExams.css";

export default function NationalExams() {
  const [subject, setSubject] = useState<"all" | (typeof subjectOrder)[number]>("all");
  const [year, setYear] = useState("all");
  const [session, setSession] = useState<"all" | "normale" | "rattrapage" | "other">("all");
  const [search, setSearch] = useState("");
  const years = useMemo(() => [...new Set(exams.map((exam) => exam.year))].sort((a, b) => b - a), []);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return exams.filter((exam) => {
      const text = `${subjectLabels[exam.subject]} ${exam.year} ${exam.fileName} ${sessionLabel(exam.session)}`.toLowerCase();
      return (subject === "all" || exam.subject === subject) && (year === "all" || String(exam.year) === year) && (session === "all" || exam.session === session) && (!q || text.includes(q));
    });
  }, [search, session, subject, year]);

  return <main className="national-exams-page">
    <header className="national-exams-header"><div><span className="section-eyebrow">BANQUE OFFICIELLE · 2BAC</span><h1>Les vrais sujets du Bac.</h1><p className="page-lead">Ouvre les PDF disponibles, filtre par matière ou année et travaille directement sur les annales.</p></div><div className="national-exams-live-stat"><strong>{exams.length}</strong><span>sujets disponibles</span></div></header>
    <section className="national-exams-toolbar card">
      <div className="national-exams-tabs"><button type="button" className={`national-exams-tab ${subject === "all" ? "active" : ""}`} onClick={() => setSubject("all")}>Tous</button>{subjectOrder.map((id) => <button type="button" key={id} className={`national-exams-tab ${subject === id ? "active" : ""}`} onClick={() => setSubject(id)}>{subjectLabels[id]}</button>)}</div>
      <div className="national-exams-filters"><label><span>Année</span><select value={year} onChange={(e) => setYear(e.target.value)}><option value="all">Toutes</option>{years.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label><span>Session</span><select value={session} onChange={(e) => setSession(e.target.value as typeof session)}><option value="all">Toutes</option><option value="normale">Normale</option><option value="rattrapage">Rattrapage</option><option value="other">Autres</option></select></label><label className="national-exams-search"><span>Recherche</span><div style={{position:"relative"}}><Search size={15} style={{position:"absolute",left:10,top:12,color:"#8aa09b"}}/><input style={{paddingLeft:32,width:"100%"}} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Année, matière, fichier..." /></div></label></div>
    </section>
    <section className="national-exams-content"><div className="national-exams-content__header"><span className="section-eyebrow">Sujets disponibles</span><h2 className="section-title">{filtered.length} sujet{filtered.length > 1 ? "s" : ""}</h2></div>{filtered.length === 0 ? <div className="national-exams-empty card"><Search size={19}/><div><span className="section-eyebrow">Aucun résultat</span><h2>Aucun sujet ne correspond.</h2><p>Réinitialise les filtres pour revoir toute la banque.</p></div></div> : <div className="national-exams-list">{filtered.map((exam) => <article key={exam.id} className="national-exam-card"><div className="national-exam-card__main"><div className="national-exam-card__year">{exam.year}</div><div className="national-exam-card__info"><div className="national-exam-card__eyebrow">{subjectLabels[exam.subject]} <span>·</span> {sessionLabel(exam.session)}</div><h3>{displayFileName(exam.fileName)}</h3><p className="national-exam-card__file">PDF officiel · {subjectLabels[exam.subject]}</p></div></div><div className="national-exam-card__actions"><a className="btn btn-primary" href={exam.url} target="_blank" rel="noreferrer"><FileText size={15}/> Ouvrir</a><a className="btn btn-ghost" href={exam.url} download={exam.fileName}><Download size={15}/> Télécharger</a></div></article>)}</div>}</section>
    <section className="national-exams-dev-grid"><article className="national-exams-dev-card card"><span className="section-eyebrow">PROCHAINE ÉTAPE</span><h2>Version interactive</h2><p>Transformer chaque PDF en sujet structuré avec navigation question par question.</p></article><article className="national-exams-dev-card card"><span className="section-eyebrow">CORRECTION</span><h2>Correction guidée</h2><p>Afficher méthode, erreurs fréquentes et points à récupérer après le test.</p></article><article className="national-exams-dev-card card"><span className="section-eyebrow">IA</span><h2>Créer un sujet similaire</h2><p>Générer un nouvel entraînement à partir du niveau et des chapitres travaillés.</p></article></section>
  </main>;
}