import { Link, useParams } from "react-router-dom";
import {
  displayFileName,
  getExamById,
  sessionLabel,
  subjectLabels,
} from "../features/exams/catalog";

export default function ExamReader() {
  const { examId } = useParams<{ examId: string }>();

  const exam = examId
    ? getExamById(decodeURIComponent(examId))
    : null;

  if (!exam) {
    return (
      <main className="exam-reader-page">
        <div className="exam-reader-error card">
          <span className="section-eyebrow">
            Examen introuvable
          </span>

          <h1>Ce sujet n'est pas disponible.</h1>

          <p>
            Le document demandé n'existe pas dans la banque actuelle
            de MentionMax.
          </p>

          <Link
            to="/exams/nationaux"
            className="btn btn-primary"
          >
            Retour aux examens
          </Link>
        </div>
      </main>
    );
  }

  const title =
    `${subjectLabels[exam.subject]} · ${exam.year}`;

  return (
    <main className="exam-reader-page">
      <header className="exam-reader-topbar">
        <div className="exam-reader-topbar__left">
          <Link
            to="/exams/nationaux"
            className="exam-reader-back"
          >
            ← Examens
          </Link>

          <div className="exam-reader-title">
            <span className="section-eyebrow">
              {subjectLabels[exam.subject]}
            </span>

            <h1>{title}</h1>
          </div>
        </div>

        <a
          href={exam.url}
          download={exam.fileName}
          className="btn btn-ghost"
        >
          Télécharger PDF
        </a>
      </header>

      <div className="exam-reader-workspace">
        <aside className="exam-reader-sidebar">
          <div>
            <span className="section-eyebrow">
              Sujet
            </span>

            <div className="exam-reader-sidebar__year">
              {exam.year}
            </div>

            <h2>
              {subjectLabels[exam.subject]}
            </h2>

            <p>{sessionLabel(exam.session)}</p>
          </div>

          <div className="exam-reader-sidebar__divider" />

          <div>
            <span className="section-eyebrow">
              Document
            </span>

            <p className="exam-reader-file">
              {displayFileName(exam.fileName)}
            </p>
          </div>

          <div className="exam-reader-sidebar__bottom">
            <span>Document original</span>
            <small>
              Lecture directement dans MentionMax.
            </small>
          </div>
        </aside>

        <section className="exam-reader-document">
          <div className="exam-reader-document__bar">
            <div>
              <strong>{title}</strong>
              <span>·</span>
              <span>{sessionLabel(exam.session)}</span>
            </div>

            <a
              href={exam.url}
              download={exam.fileName}
            >
              Télécharger
            </a>
          </div>

          <div className="exam-reader-pdf">
            <iframe
              title={title}
              src={`${exam.url}#toolbar=1&navpanes=0&view=FitH`}
              className="exam-reader-pdf__frame"
            />
          </div>
        </section>
      </div>
    </main>
  );
}
