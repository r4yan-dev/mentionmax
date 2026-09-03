import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  FlaskConical,
  GraduationCap,
  Play,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { useAuth } from "../context/AuthContext";
import { getTrackSubjects } from "../data/curriculum/tracks";
import { pathLabels, resolveUserPath } from "../data/curriculum/secondBac";
import { helios300MathExercises } from "../data/mock/helios300MathExercises";
import "./Home.css";

const subjectMeta: Record<string, { code: string; className: string; icon: string }> = {
  maths: { code: "MA", className: "home-subject--maths", icon: "∑" },
  "physique-chimie": { code: "PC", className: "home-subject--pc", icon: "φ" },
  svt: { code: "SV", className: "home-subject--svt", icon: "⌁" },
  anglais: { code: "EN", className: "home-subject--english", icon: "A" },
  philosophie: { code: "PH", className: "home-subject--philo", icon: "π" },
};

function daysUntilBac() {
  const target = Date.parse("2027-06-06T08:00:00+01:00");
  return Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
}

function pathId(path: string) {
  return path === "SP" ? "SP" : path === "SMA" ? "SMA" : "SMB";
}

export default function Home() {
  const { user } = useAuth();
  const { schoolPreferences, profile } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackId = pathId(path);
  const subjects = getTrackSubjects(path);
  const name = profile?.display_name?.trim() || user?.email?.split("@")[0] || "Étudiant";
  const heliosCount = helios300MathExercises.filter((exercise) => exercise.target.trackIds.includes(trackId)).length;
  const activeSubjects = subjects.length;

  return (
    <main className="home-page">
      <div className="home-wrap">
        <header className="home-top">
          <div>
            <div className="home-kicker"><span className="home-kicker-dot" /> ESPACE ÉTUDIANT · 2BAC</div>
            <h1>Bonjour, {name.split(" ")[0]}.</h1>
            <p>{pathLabels[path]} <span className="home-top-separator">·</span> Ton espace pour apprendre, t’entraîner et avancer sans te perdre.</p>
          </div>
          <div className="home-top-meta">
            <div className="home-countdown">
              <Clock3 size={17} />
              <div><strong>{daysUntilBac()}</strong><span>jours avant le BAC</span></div>
            </div>
            <Link to="/preferences" className="home-path-button">{pathLabels[path]}</Link>
          </div>
        </header>

        <section className="home-main-grid">
          <article className="home-card home-today">
            <div className="home-card-heading">
              <div><span className="home-overline">À FAIRE MAINTENANT</span><h2>Ta prochaine session</h2></div>
              <span className="home-status-pill"><span /> prête</span>
            </div>
            <div className="home-today-content">
              <div className="home-session-icon"><Target size={24} /></div>
              <div className="home-session-copy">
                <span className="home-session-label">SESSION LIBRE</span>
                <h3>Commence par 20 minutes de pratique.</h3>
                <p>Choisis une matière, travaille un chapitre et garde l’IA à portée de main quand ça bloque.</p>
                <div className="home-session-actions">
                  <Link to="/focus" className="home-primary-button"><Play size={15} fill="currentColor" /> Commencer</Link>
                  <Link to="/exercices" className="home-text-button">Choisir un exercice <ArrowRight size={14} /></Link>
                </div>
              </div>
            </div>
            <div className="home-session-footer">
              <span><Clock3 size={14} /> 20–30 min</span>
              <span><Brain size={14} /> tutorat IA disponible</span>
              <span><Sparkles size={14} /> niveau adaptatif</span>
            </div>
          </article>

          <aside className="home-card home-overview">
            <div className="home-card-heading"><div><span className="home-overline">TON PARCOURS</span><h2>Vue d’ensemble</h2></div></div>
            <div className="home-overview-path">
              <div className="home-path-code">{path === "SP" ? "SPC" : path === "SMA" ? "SM A" : "SM B"}</div>
              <div><strong>{pathLabels[path]}</strong><span>{activeSubjects} matières actives</span></div>
            </div>
            <div className="home-overview-divider" />
            <div className="home-overview-stat"><div><strong>{daysUntilBac}</strong><span>jours restants</span></div><Clock3 size={17} /></div>
            <div className="home-overview-stat"><div><strong>0</strong><span>sessions enregistrées</span></div><Flame size={17} /></div>
            <Link to="/preferences" className="home-outline-button">Modifier mon parcours <ArrowRight size={14} /></Link>
          </aside>
        </section>

        <section className="home-section">
          <div className="home-section-head">
            <div><span className="home-overline">TES MATIÈRES</span><h2>Choisis ton terrain de travail.</h2></div>
            <Link to="/subjects" className="home-head-link">Toutes les matières <ArrowRight size={14} /></Link>
          </div>
          <div className="home-subjects-grid">
            {subjects.map((subject) => {
              const meta = subjectMeta[subject.id] ?? { code: subject.name.slice(0, 2).toUpperCase(), className: "home-subject--maths", icon: "•" };
              return (
                <Link to={`/lecons/${subject.id}`} className={`home-subject ${meta.className}`} key={subject.id}>
                  <div className="home-subject-top"><span className="home-subject-code">{meta.code}</span><span className="home-subject-symbol">{meta.icon}</span></div>
                  <h3>{subject.name}</h3>
                  <p>Cours, méthodes, exercices et entraînement.</p>
                  <span className="home-subject-open">Ouvrir <ArrowRight size={13} /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="home-lower-grid">
          <article className="home-card home-helios-card">
            <div className="home-helios-top"><span className="home-overline">MISSION HELIOS</span><span className="home-helios-badge">15 JOURS</span></div>
            <div className="home-helios-title"><div className="home-helios-icon"><FlaskConical size={23} /></div><div><h2>300 exercices de maths.</h2><p>Une progression construite pour travailler sérieusement, pas pour collectionner des badges.</p></div></div>
            <div className="home-helios-progress"><div className="home-helios-progress-head"><span>Progression</span><strong>0 / 300</strong></div><div className="home-progress-track"><span style={{ width: "0%" }} /></div></div>
            <div className="home-helios-footer"><span><CheckCircle2 size={14} /> {heliosCount || 300} exercices disponibles</span><Link to="/exercices?collection=helios&subject=maths">Entrer dans la mission <ArrowRight size={14} /></Link></div>
          </article>

          <article className="home-card home-tools-card">
            <div className="home-card-heading"><div><span className="home-overline">OUTILS</span><h2>Tout ce dont tu as besoin.</h2></div></div>
            <div className="home-tools-list">
              <Link to="/ai-help" className="home-tool-row"><span className="home-tool-icon home-tool-icon--ai"><Sparkles size={16} /></span><span><strong>Assistant IA</strong><small>Explique, corrige et débloque un exercice.</small></span><ArrowRight size={14} /></Link>
              <Link to="/exams" className="home-tool-row"><span className="home-tool-icon"><FileText size={16} /></span><span><strong>Examens & annales</strong><small>Travaille sur des formats proches de l’épreuve.</small></span><ArrowRight size={14} /></Link>
              <Link to="/focus" className="home-tool-row"><span className="home-tool-icon"><Flame size={16} /></span><span><strong>Focus</strong><small>Une session sans distraction, centrée sur le travail.</small></span><ArrowRight size={14} /></Link>
            </div>
          </article>
        </section>

        <section className="home-bottom-grid">
          <article className="home-card home-progress-card">
            <div className="home-card-heading"><div><span className="home-overline">PROGRESSION</span><h2>Tu pars de zéro ici.</h2></div><Trophy size={19} /></div>
            <div className="home-big-progress"><strong>0%</strong><div><span>progression enregistrée</span><small>Commence une session pour alimenter ton historique.</small></div></div>
            <div className="home-progress-track home-progress-track--large"><span style={{ width: "0%" }} /></div>
            <Link to="/focus" className="home-bottom-link">Démarrer ma première session <ArrowRight size={14} /></Link>
          </article>

          <article className="home-card home-exam-card">
            <div className="home-exam-mark"><GraduationCap size={20} /></div>
            <span className="home-overline">OBJECTIF FINAL</span>
            <h2>Arriver au BAC avec des bases solides.</h2>
            <p>Apprends le cours, pratique régulièrement, puis passe aux annales quand le chapitre est maîtrisé.</p>
            <Link to="/exams" className="home-bottom-link">Voir les examens <ArrowRight size={14} /></Link>
          </article>
        </section>
      </div>
    </main>
  );
}
