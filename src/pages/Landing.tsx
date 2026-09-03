import { ArrowRight, BookOpen, BrainCircuit, FlaskConical, LineChart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "./Landing.css";

const features = [
  { icon: BookOpen, title: "Cours clairs", text: "Des leçons structurées autour du programme 2BAC, sans bruit inutile." },
  { icon: BrainCircuit, title: "Pratique ciblée", text: "Travaille une notion, puis passe directement à des exercices adaptés." },
  { icon: LineChart, title: "Progression réelle", text: "Suis tes habitudes, tes chapitres et les notions qui demandent encore du travail." },
];

const tracks = [
  ["SPC", "Sciences Physiques", "Maths · Physique-Chimie · SVT · Philo · Anglais"],
  ["SM A", "Sciences Mathématiques A", "Maths · Physique-Chimie · Philo · Anglais"],
  ["SM B", "Sciences Mathématiques B", "Maths · Physique-Chimie · Philo · Anglais"],
];

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <Link to="/" className="landing-brand"><span>M</span><strong>MentionMax</strong></Link>
        <div className="landing-nav__links">
          <a href="#fonctionnement">Fonctionnement</a>
          <a href="#parcours">Parcours</a>
          <a href="#mission">Mission Helios</a>
        </div>
        <div className="landing-nav__actions">
          <Link to="/connexion" className="landing-login">Se connecter</Link>
          <Link to="/connexion" className="landing-cta">Commencer <ArrowRight size={16} /></Link>
        </div>
      </nav>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <span className="landing-eyebrow"><Sparkles size={14} /> Plateforme de préparation au Bac marocain</span>
            <h1>Travaille le cours.<br /><em>Maîtrise le Bac.</em></h1>
            <p>Une plateforme conçue pour le 2BAC, avec des cours structurés, des exercices contextualisés, un suivi de progression et un assistant IA qui connaît ton travail.</p>
            <div className="landing-hero__actions">
              <Link to="/connexion" className="landing-button landing-button--primary">Commencer gratuitement <ArrowRight size={17} /></Link>
              <a href="#fonctionnement" className="landing-button landing-button--ghost">Voir comment ça marche</a>
            </div>
            <div className="landing-proof"><span>2BAC</span><span>5 matières</span><span>3 parcours</span><span>Mission Helios · 300 exercices</span></div>
          </div>

          <div className="landing-hero__visual" aria-hidden="true">
            <div className="hero-grid" />
            <div className="hero-orbit hero-orbit--one" />
            <div className="hero-orbit hero-orbit--two" />
            <div className="hero-card hero-card--main"><span>MISSION HELIOS</span><strong>Exercice 08/20</strong><p>Théorème des valeurs intermédiaires</p><div><i /><i /><i /><i /></div><small>Intermédiaire · +30 XP</small></div>
            <div className="hero-card hero-card--float"><span>PROGRESSION</span><strong>82%</strong><small>Cette semaine</small></div>
            <div className="hero-mark">M</div>
          </div>
        </section>

        <section className="landing-section" id="fonctionnement">
          <div className="landing-heading"><span className="landing-eyebrow">Le produit</span><h2>Tout ce qu’il faut pour réviser sérieusement.</h2><p>Pas un chatbot avec un joli logo. Un espace de travail construit autour de ton programme.</p></div>
          <div className="landing-feature-grid">{features.map(({ icon: Icon, title, text }) => <article key={title} className="landing-feature"><div><Icon size={20} /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section className="landing-section landing-section--soft" id="parcours">
          <div className="landing-heading"><span className="landing-eyebrow">Ton parcours</span><h2>Choisis ta série. Le contenu suit.</h2><p>Le parcours actif contrôle les matières, les leçons et les exercices affichés.</p></div>
          <div className="landing-track-grid">{tracks.map(([code, name, subjects]) => <article className="landing-track" key={code}><div className="landing-track__top"><span>{code}</span><BookOpen size={17} /></div><h3>{name}</h3><p>{subjects}</p><Link to="/connexion">Choisir ce parcours <ArrowRight size={15} /></Link></article>)}</div>
        </section>

        <section className="landing-section" id="mission">
          <div className="helios-panel"><div className="helios-panel__icon"><FlaskConical size={25} /></div><div><span className="landing-eyebrow">Mission Helios</span><h2>300 exercices de maths, en 15 jours.</h2><p>Une progression narrative : chaque journée correspond à un chapitre, avec 20 exercices et une synthèse finale.</p></div><Link to="/connexion" className="landing-button landing-button--light">Explorer Helios <ArrowRight size={16} /></Link></div>
        </section>

        <section className="landing-bottom-cta"><div><span className="landing-eyebrow">Prêt à travailler ?</span><h2>Commence par une leçon. Termine par un exercice.</h2></div><Link to="/connexion" className="landing-button landing-button--primary">Entrer dans MentionMax <ArrowRight size={17} /></Link></section>
      </main>

      <footer className="landing-footer"><span>© MentionMax</span><span>Préparation 2BAC · Maroc</span></footer>
    </div>
  );
}
