import { Link } from "react-router-dom";

export default function Exams() {
  return (
    <main className="exams-hub-page">
      <header className="exams-hub-header">
        <span className="section-eyebrow">Examens</span>

        <h1 className="page-title">
          Simule les conditions du Bac.
        </h1>

        <p className="page-lead">
          Retrouve les sujets disponibles, génère des tests avec l'IA
          et prépare ta correction directement dans MentionMax.
        </p>
      </header>

      <section className="exams-feature-grid">
        <Link
          to="/exams/nationaux"
          className="exams-feature-card exams-feature-card--primary"
        >
          <div className="exams-feature-card__icon">N</div>

          <div className="exams-feature-card__body">
            <span className="section-eyebrow">
              Sujets officiels
            </span>

            <h2>Examens nationaux</h2>

            <p>
              Consulte les sujets nationaux réellement disponibles dans
              la banque MentionMax, par matière et par année.
            </p>

            <span className="exams-feature-card__link">
              Parcourir les sujets →
            </span>
          </div>
        </Link>

        <article className="exams-feature-card">
          <div className="exams-feature-card__icon">✦</div>

          <div className="exams-feature-card__body">
            <span className="section-eyebrow">IA</span>

            <h2>Générer un test</h2>

            <p>
              Génère une simulation adaptée à ta matière, ton niveau et
              les notions que tu veux travailler.
            </p>

            <span className="feature-status">
              Fonctionnalité en développement
            </span>
          </div>
        </article>

        <article className="exams-feature-card">
          <div className="exams-feature-card__icon">↗</div>

          <div className="exams-feature-card__body">
            <span className="section-eyebrow">Professeurs</span>

            <h2>Sujets de professeurs</h2>

            <p>
              Une bibliothèque dédiée aux sujets créés et partagés par
              des enseignants.
            </p>

            <span className="feature-status">
              Fonctionnalité en développement
            </span>
          </div>
        </article>

        <article className="exams-feature-card">
          <div className="exams-feature-card__icon">◎</div>

          <div className="exams-feature-card__body">
            <span className="section-eyebrow">Correction</span>

            <h2>Corriger ma copie</h2>

            <p>
              Scanne ta copie et laisse l'IA extraire tes réponses,
              identifier tes erreurs et les expliquer.
            </p>

            <span className="feature-status">
              Fonctionnalité en développement
            </span>
          </div>
        </article>
      </section>

      <section className="exams-hub-secondary">
        <div>
          <span className="section-eyebrow">Autres sujets</span>

          <h2 className="section-title">
            Sujets de la communauté
          </h2>

          <p>
            Des sujets supplémentaires pourront être ajoutés plus tard
            sans les mélanger aux examens nationaux.
          </p>
        </div>

        <span className="feature-status">
          Fonctionnalité en développement
        </span>
      </section>
    </main>
  );
}
