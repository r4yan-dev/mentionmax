import { Link } from "react-router-dom";

type SubjectProgress = {
  name: string;
  value: number;
  className: string;
};

const progress: SubjectProgress[] = [
  {
    name: "Mathématiques",
    value: 91,
    className: "dot--math",
  },
  {
    name: "Physique-Chimie",
    value: 84,
    className: "dot--phys",
  },
  {
    name: "SVT",
    value: 78,
    className: "dot--svt",
  },
  {
    name: "Français",
    value: 75,
    className: "dot--fr",
  },
];

function ProgressCard() {
  return (
    <aside className="progress-card">
      <div className="progress-card__header">
        <span className="progress-card__eyebrow">
          Cette semaine
        </span>

        <span className="progress-card__count">
          12 exercices
        </span>
      </div>

      <div className="progress-ring">
        <svg
          viewBox="0 0 100 100"
          aria-label="Progression globale 82%"
        >
          <circle
            className="ring-bg"
            cx="50"
            cy="50"
            r="42"
          />

          <circle
            className="ring-value"
            cx="50"
            cy="50"
            r="42"
            style={
              {
                "--pct": 82,
              } as React.CSSProperties
            }
          />
        </svg>

        <div className="ring-center">
          <strong>82%</strong>
          <span>Très bien !</span>
        </div>
      </div>

      <ul className="progress-list">
        {progress.map((item) => (
          <li key={item.name}>
            <span className="progress-list__subject">
              <span className={`dot ${item.className}`} />
              {item.name}
            </span>

            <b>{item.value}%</b>
          </li>
        ))}
      </ul>

      <div className="progress-card__streak">
        🔥 5 jours de série
      </div>
    </aside>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <article className="feature-card">
      <div className="feature-card__icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{description}</p>
    </article>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <header className="navbar">
        <Link
          to="/"
          className="brand"
          aria-label="MentionMax accueil"
        >
          <div
            className="brand__mark brand__mark--fallback"
            aria-hidden="true"
          >
            M
          </div>

          <span className="brand__wordmark">
            MentionMax
          </span>
        </Link>

        <nav
          className="navbar__links"
          aria-label="Navigation principale"
        >
          <Link
            to="/subjects"
            className="nav-link active"
          >
            Matières
          </Link>

          <Link
            to="/exercises"
            className="nav-link"
          >
            Exercices
          </Link>

          <Link
            to="/progress"
            className="nav-link"
          >
            Progression
          </Link>
        </nav>

        <Link
          to="/dashboard"
          className="btn btn-primary"
        >
          Commencer
        </Link>
      </header>

      <main>
        <section className="hero">
          <div className="hero-content">
            <span className="badge-pill">
              Plateforme n°1 pour réussir ton Bac
            </span>

            <h1 className="hero-title">
              Ta{" "}
              <span className="accent-word">
                réussite
              </span>{" "}
              au Bac commence ici.
            </h1>

            <p className="hero-description">
              Prépare ton Bac avec des exercices ciblés,
              un suivi clair de ta progression et une
              méthode conçue pour le programme marocain.
            </p>

            <div className="hero-actions">
              <Link
                to="/exercises"
                className="btn btn-primary btn-lg"
              >
                Commencer à réviser
              </Link>

              <Link
                to="/subjects"
                className="btn btn-ghost btn-lg"
              >
                Explorer les matières
              </Link>
            </div>

            <div className="stat-strip">
              <div>
                <strong>10K+</strong>
                <span>exercices</span>
              </div>

              <div>
                <strong>5</strong>
                <span>matières</span>
              </div>

              <div>
                <strong>24/7</strong>
                <span>accessible</span>
              </div>
            </div>
          </div>

          <div className="hero-aside">
            <div className="hero-illustration">
              <div className="hero-illustration__grid" />

              <div className="hero-illustration__content">
                <span className="hero-illustration__symbol">
                  ∫
                </span>

                <span className="hero-illustration__label">
                  Prépare ton Bac
                </span>
              </div>

              <div className="hero-illustration__orb hero-illustration__orb--one" />
              <div className="hero-illustration__orb hero-illustration__orb--two" />
            </div>

            <ProgressCard />
          </div>
        </section>

        <section className="landing-section">
          <div className="section-heading">
            <span className="section-eyebrow">
              Pourquoi MentionMax ?
            </span>

            <h2 className="section-title">
              Tout ce qu'il faut pour mieux réviser.
            </h2>

            <p className="section-description">
              Moins de temps perdu à chercher quoi faire,
              plus de temps à résoudre les exercices qui
              comptent.
            </p>
          </div>

          <div className="feature-grid">
            <FeatureCard
              icon="◎"
              title="Exercices ciblés"
              description="Travaille exactement les notions dont tu as besoin avec des exercices organisés par matière et chapitre."
            />

            <FeatureCard
              icon="↗"
              title="Progression claire"
              description="Visualise tes résultats, identifie tes points faibles et vois concrètement tes progrès semaine après semaine."
            />

            <FeatureCard
              icon="✦"
              title="Pensé pour le Bac marocain"
              description="Une expérience construite autour du programme et des habitudes de travail des lycéens marocains."
            />
          </div>
        </section>

        <section className="landing-section landing-section--soft">
          <div className="container">
            <div className="cta-panel">
              <div>
                <span className="section-eyebrow">
                  Prêt à commencer ?
                </span>

                <h2 className="section-title">
                  Passe directement à l'exercice.
                </h2>

                <p className="section-description">
                  Choisis une matière, sélectionne un
                  chapitre et commence à travailler.
                </p>
              </div>

              <Link
                to="/exercises"
                className="btn btn-primary btn-lg"
              >
                Voir les exercices
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
