import { ArrowRight, BarChart3, BookOpen, CheckCircle2, Clock3, Flame, GraduationCap, LayoutDashboard, Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import "./Landing.css";

const tracks = [
  { code: "SPC", name: "Sciences Physiques", subjects: "Maths · Physique-Chimie · SVT · Philo · Anglais" },
  { code: "SM A", name: "Sciences Mathématiques A", subjects: "Maths · Physique-Chimie · Philo · Anglais" },
  { code: "SM B", name: "Sciences Mathématiques B", subjects: "Maths · Physique-Chimie · Philo · Anglais" },
];

const subjects = [
  ["01", "Mathématiques", "Cours, méthodes, exercices"],
  ["02", "Physique-Chimie", "Comprendre puis appliquer"],
  ["03", "SVT", "Notions et entraînement"],
  ["04", "Philosophie", "Notions, auteurs, dissertations"],
  ["05", "Anglais", "Compréhension et expression"],
];

export default function Landing() {
  return (
    <div className="landing-new">
      <header className="landing-new__nav">
        <Link to="/" className="landing-new__brand" aria-label="MentionMax">
          <span className="landing-new__mark">M</span>
          <span>MentionMax</span>
        </Link>
        <nav>
          <a href="#method">Méthode</a>
          <a href="#parcours">Parcours</a>
          <a href="#matieres">Matières</a>
        </nav>
        <div className="landing-new__actions">
          <Link to="/connexion" className="landing-new__login">Connexion</Link>
          <Link to="/connexion" className="landing-new__button landing-new__button--dark">Commencer <ArrowRight size={15} /></Link>
        </div>
      </header>

      <main>
        <section className="landing-new__hero">
          <div className="landing-new__hero-copy">
            <div className="landing-new__label"><span className="landing-new__label-dot" /> Préparation 2BAC · Maroc</div>
            <h1>Ton année de Bac, <em>organisée.</em></h1>
            <p className="landing-new__lead">MentionMax réunit tes cours, tes exercices, tes annales et ta progression dans un seul espace de travail pensé pour le programme marocain.</p>
            <div className="landing-new__hero-actions">
              <Link to="/connexion" className="landing-new__button landing-new__button--teal">Créer mon espace <ArrowRight size={16} /></Link>
              <a href="#method" className="landing-new__text-link">Voir la méthode <ArrowRight size={15} /></a>
            </div>
            <div className="landing-new__hero-meta">
              <span><CheckCircle2 size={15} /> 2BAC uniquement</span>
              <span><CheckCircle2 size={15} /> 3 parcours</span>
              <span><CheckCircle2 size={15} /> 300 exercices Helios</span>
            </div>
          </div>

          <div className="landing-new__workspace" aria-hidden="true">
            <div className="workspace-window">
              <div className="workspace-bar"><span /><span /><span /><b>Mon espace · MentionMax</b></div>
              <div className="workspace-body">
                <aside><div className="workspace-logo">M</div><i /><i /><i /><i /><div className="workspace-aside-bottom"><i /><i /></div></aside>
                <div className="workspace-content">
                  <div className="workspace-topline"><div><small>AUJOURD’HUI</small><strong>Bonjour, étudiant.</strong><p>Voici ce qui mérite ton attention.</p></div><div className="workspace-profile">2BAC · SPC</div></div>
                  <div className="workspace-grid">
                    <div className="workspace-card workspace-card--focus"><small>PROCHAINE SESSION</small><h3>Mission Helios</h3><p>Limites et continuité · Exercice 08</p><div className="workspace-progress"><span /></div><strong>8 / 20</strong><button>Continuer <ArrowRight size={13} /></button></div>
                    <div className="workspace-card workspace-card--stats"><small>PROGRESSION</small><strong>72%</strong><span>Cette semaine</span><div className="workspace-bars"><i /><i /><i /><i /><i /><i /><i /></div></div>
                    <div className="workspace-card workspace-card--subjects"><small>TES MATIÈRES</small><div><b>Maths</b><span>→</span></div><div><b>Physique-Chimie</b><span>→</span></div><div><b>SVT</b><span>→</span></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-new__strip">
          <span>UNE SEULE BASE DE TRAVAIL</span><strong>Apprendre → pratiquer → corriger → progresser</strong>
        </section>

        <section className="landing-new__section" id="method">
          <div className="landing-new__section-head"><div><span className="landing-new__label">La méthode</span><h2>Pas besoin de chercher quoi faire ensuite.</h2></div><p>Chaque partie du produit sert le même objectif : te faire passer du cours à la maîtrise sans perdre ton temps dans les menus.</p></div>
          <div className="landing-new__method-grid">
            <article><span>01</span><Target size={21} /><h3>Comprendre</h3><p>Retrouve le chapitre et les notions de ton parcours avec une structure claire.</p></article>
            <article><span>02</span><BookOpen size={21} /><h3>Pratiquer</h3><p>Travaille avec des exercices progressifs et des séries dédiées comme Mission Helios.</p></article>
            <article><span>03</span><BarChart3 size={21} /><h3>Mesurer</h3><p>Vois ce que tu as réellement travaillé et ce qui mérite une nouvelle session.</p></article>
          </div>
        </section>

        <section className="landing-new__section landing-new__section--tinted" id="parcours">
          <div className="landing-new__section-head"><div><span className="landing-new__label">Les parcours</span><h2>Le programme s’adapte à ta série.</h2></div><p>Choisis ton parcours pendant l’inscription. MentionMax filtre ensuite les matières et le contenu qui te concernent.</p></div>
          <div className="landing-new__track-grid">{tracks.map((track, index) => <article className={`landing-new__track landing-new__track--${index + 1}`} key={track.code}><div className="landing-new__track-code">{track.code}</div><div><h3>{track.name}</h3><p>{track.subjects}</p></div><Link to="/connexion">Choisir ce parcours <ArrowRight size={15} /></Link></article>)}</div>
        </section>

        <section className="landing-new__section" id="matieres">
          <div className="landing-new__section-head"><div><span className="landing-new__label">Les matières</span><h2>Tout ton programme, au même endroit.</h2></div><p>Les matières affichées dans ton espace dépendent du parcours sélectionné. Pas de SVT parachuté chez les SM B, parce que même les interfaces peuvent respecter le programme.</p></div>
          <div className="landing-new__subjects">{subjects.map(([number, name, text]) => <div className="landing-new__subject" key={name}><span>{number}</span><div><strong>{name}</strong><small>{text}</small></div><ArrowRight size={17} /></div>)}</div>
        </section>

        <section className="landing-new__helios">
          <div className="landing-new__helios-copy"><div className="landing-new__label landing-new__label--light"><FlaskIcon /> Mission Helios</div><h2>300 exercices.<br /><em>15 jours.</em></h2><p>Une campagne mathématique structurée en 15 chapitres, avec 20 exercices par journée et une difficulté qui monte progressivement.</p><Link to="/connexion" className="landing-new__button landing-new__button--light">Explorer Mission Helios <ArrowRight size={16} /></Link></div>
          <div className="landing-new__helios-map" aria-hidden="true"><div className="helios-ring helios-ring--outer" /><div className="helios-ring helios-ring--middle" /><div className="helios-ring helios-ring--inner" /><div className="helios-core">08</div><div className="helios-caption">JOUR<br /><strong>08 / 15</strong></div></div>
        </section>

        <section className="landing-new__final">
          <div><span className="landing-new__label">Ton espace de travail</span><h2>Moins de dispersion.<br />Plus de travail utile.</h2></div>
          <div className="landing-new__final-right"><p>Commence avec ton parcours et laisse MentionMax organiser le reste.</p><Link to="/connexion" className="landing-new__button landing-new__button--teal">Commencer maintenant <ArrowRight size={16} /></Link></div>
        </section>
      </main>

      <footer className="landing-new__footer"><span>© MentionMax</span><span>2BAC · Maroc</span><span>Plateforme non lucrative</span></footer>
    </div>
  );
}

function FlaskIcon() {
  return <Sparkles size={15} />;
}
