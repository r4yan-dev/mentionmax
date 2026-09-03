import { ArrowRight, BookOpen, CheckCircle2, Clock3, FlaskConical, Flame, GraduationCap, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects } from "../data/curriculum/tracks";
import { pathLabels, resolveUserPath } from "../data/curriculum/secondBac";
import { helios300MathExercises } from "../data/mock/helios300MathExercises";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const subjectMeta: Record<string, { short: string; tone: string }> = {
  maths: { short: "MATHS", tone: "home-subject--teal" },
  "physique-chimie": { short: "PC", tone: "home-subject--green" },
  svt: { short: "SVT", tone: "home-subject--olive" },
  anglais: { short: "EN", tone: "home-subject--blue" },
  philosophie: { short: "PHILO", tone: "home-subject--burgundy" },
};

function daysUntilBac() {
  const target = Date.parse("2027-06-06T08:00:00+01:00");
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

export default function Home() {
  const { user } = useAuth();
  const { schoolPreferences, profile } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const subjects = getTrackSubjects(path);
  const name = profile?.display_name?.trim() || user?.email?.split("@")[0] || "Étudiant";
  const heliosCount = helios300MathExercises.filter((exercise) => exercise.target.trackIds.includes(path === "SP" ? "SP" : path === "SMA" ? "SMA" : "SMB")).length;

  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <span className="home-eyebrow">ESPACE DE TRAVAIL · 2BAC</span>
          <h1>Bonjour, {name} <span>👋</span></h1>
          <p>{pathLabels[path]} · Voilà ce qui mérite ton attention aujourd’hui.</p>
        </div>
        <div className="home-header__actions">
          <div className="home-countdown"><Clock3 size={17} /><strong>{daysUntilBac()}</strong><span>jours avant le BAC</span></div>
          <Link to="/preferences" className="home-profile-link">Mon parcours</Link>
        </div>
      </header>

      <section className="home-hero-grid">
        <article className="home-card home-focus-card">
          <div className="home-card__top"><span><Target size={15} /> AUJOURD’HUI</span><span>0 min planifiées</span></div>
          <div className="home-focus-card__body"><div className="home-focus-icon"><Sparkles size={22} /></div><div><span className="home-eyebrow">REPRISE RAPIDE</span><h2>Continue directement dans Pratique.</h2><p>Une session courte vaut mieux qu’une heure à choisir ce que tu devrais faire.</p><Link to="/focus" className="home-primary">Commencer une session <ArrowRight size={16} /></Link></div></div>
        </article>
        <article className="home-card home-score-card"><div className="home-score-ring"><span>2BAC</span><strong>{path === "SMB" ? "SM B" : path === "SMA" ? "SM A" : "SPC"}</strong></div><div><span className="home-eyebrow">TON PARCOURS</span><h2>{pathLabels[path]}</h2><p>{subjects.length} matières actives</p></div></article>
      </section>

      <section className="home-section">
        <div className="home-section__heading"><div><span className="home-eyebrow">TES MATIÈRES</span><h2>Travaille au bon endroit.</h2></div><Link to="/subjects">Voir tout <ArrowRight size={14} /></Link></div>
        <div className="home-subject-grid">{subjects.map((subject) => { const meta = subjectMeta[subject.id] ?? { short: subject.name.slice(0, 3).toUpperCase(), tone: "home-subject--teal" }; return <Link to={`/lecons/${subject.id}`} className={`home-subject ${meta.tone}`} key={subject.id}><div className="home-subject__top"><span>{meta.short}</span><BookOpen size={17} /></div><h3>{subject.name}</h3><p>Cours, méthodes et entraînement du programme.</p><span className="home-subject__open">Ouvrir <ArrowRight size={14} /></span></Link>; })}</div>
      </section>

      <section className="home-section">
        <div className="home-section__heading"><div><span className="home-eyebrow">MISSION HELIOS</span><h2>Une progression de 15 jours.</h2></div><Link to="/exercices?collection=helios&subject=maths">Explorer <ArrowRight size={14} /></Link></div>
        <Link to="/exercices?collection=helios&subject=maths" className="home-helios"><div className="home-helios__icon"><FlaskConical size={24} /></div><div><strong>300 exercices de mathématiques</strong><p>20 exercices par chapitre, difficulté progressive et synthèse de fin de journée.</p></div><div className="home-helios__stats"><span><CheckCircle2 size={15} /> {heliosCount || 300} exercices</span><span><Trophy size={15} /> +XP</span></div><ArrowRight size={20} /></Link>
      </section>

      <section className="home-bottom-grid">
        <article className="home-card home-progress-card"><div className="home-section__heading"><div><span className="home-eyebrow">PROGRESSION</span><h2>Construis ta régularité.</h2></div><Flame size={20} /></div><div className="home-progress-big"><strong>0%</strong><span>aucune session enregistrée ici pour le moment</span></div><div className="home-progress-track"><span /></div><Link to="/focus" className="home-secondary">Lancer une session <ArrowRight size={15} /></Link></article>
        <article className="home-card home-exam-card"><GraduationCap size={23} /><span className="home-eyebrow">ANNEXE BAC</span><h2>Annales, examens et tests.</h2><p>Entraîne-toi sur des formats plus proches de l’épreuve lorsque les fondamentaux sont solides.</p><Link to="/exams" className="home-secondary">Voir les examens <ArrowRight size={15} /></Link></article>
      </section>
    </main>
  );
}
