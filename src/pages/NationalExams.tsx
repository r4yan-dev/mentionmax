import { useMemo, useState } from "react";

type SubjectId = "maths" | "pc" | "svt" | "philo" | "english";

type ExamAsset = {
  id: string;
  subject: SubjectId;
  year: number;
  session: "normale" | "rattrapage" | "other";
  fileName: string;
  url: string;
};

const subjectLabels: Record<SubjectId, string> = {
  maths: "Mathématiques",
  pc: "Physique-Chimie",
  svt: "SVT",
  philo: "Philosophie",
  english: "English",
};

const subjectOrder: SubjectId[] = [
  "maths",
  "pc",
  "svt",
  "philo",
  "english",
];

const pdfModules = import.meta.glob(
  "../assets/exams-spc/**/*.pdf",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

function parseExamAsset(
  sourcePath: string,
  url: string,
): ExamAsset | null {
  const normalized = sourcePath.replaceAll("\\", "/");
  const parts = normalized.split("/");
  const index = parts.indexOf("exams-spc");

  if (index === -1) return null;

  const subject = parts[index + 1] as SubjectId;
  const year = Number(parts[index + 2]);

  if (!subjectOrder.includes(subject)) return null;
  if (!Number.isInteger(year)) return null;

  const fileName = parts.at(-1) ?? "";
  const lower = fileName.toLowerCase();

  let session: ExamAsset["session"] = "other";

  if (lower.includes("rattrapage") || lower.includes("rattrape")) {
    session = "rattrapage";
  } else if (lower.includes("normale") || lower.includes("normal")) {
    session = "normale";
  }

  return {
    id: `${subject}-${year}-${fileName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    subject,
    year,
    session,
    fileName,
    url,
  };
}

const exams: ExamAsset[] = Object.entries(pdfModules)
  .map(([path, url]) => parseExamAsset(path, url))
  .filter((exam): exam is ExamAsset => exam !== null)
  .sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;

    return (
      subjectOrder.indexOf(a.subject) -
      subjectOrder.indexOf(b.subject)
    );
  });

function sessionLabel(session: ExamAsset["session"]) {
  if (session === "normale") return "Session normale";
  if (session === "rattrapage") return "Rattrapage";
  return "Sujet PDF";
}

function displayFileName(fileName: string) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function NationalExams() {
  const [subject, setSubject] = useState<"all" | SubjectId>("all");
  const [year, setYear] = useState("all");
  const [session, setSession] = useState<"all" | ExamAsset["session"]>(
    "all",
  );
  const [search, setSearch] = useState("");

  const years = useMemo(
    () =>
      [...new Set(exams.map((exam) => exam.year))]
        .sort((a, b) => b - a)
        .map(String),
    [],
  );

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSubject =
        subject === "all" || exam.subject === subject;

      const matchesYear =
        year === "all" || String(exam.year) === year;

      const matchesSession =
        session === "all" || exam.session === session;

      const searchText = [
        subjectLabels[exam.subject],
        String(exam.year),
        exam.fileName,
        sessionLabel(exam.session),
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesSubject &&
        matchesYear &&
        matchesSession &&
        (query === "" || searchText.includes(query))
      );
    });
  }, [search, session, subject, year]);

  const grouped = useMemo(() => {
    const map = new Map<number, ExamAsset[]>();

    for (const exam of filteredExams) {
      const list = map.get(exam.year) ?? [];
      list.push(exam);
      map.set(exam.year, list);
    }

    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [filteredExams]);

  return (
    <main className="national-exams-page">
      <header className="national-exams-header">
        <div>
          <span className="section-eyebrow">Examens nationaux</span>
          <h1 className="page-title">Les sujets du Bac.</h1>
          <p className="page-lead">
            Consulte les sujets disponibles et ouvre directement le
            document PDF.
          </p>
        </div>

        <div className="national-exams-live-stat">
          <strong>{exams.length}</strong>
          <span>sujets disponibles</span>
        </div>
      </header>

      <section className="national-exams-toolbar card">
        <div className="national-exams-tabs">
          <button
            type="button"
            className={`national-exams-tab ${
              subject === "all" ? "active" : ""
            }`}
            onClick={() => setSubject("all")}
          >
            Tous
          </button>

          {subjectOrder.map((id) => (
            <button
              key={id}
              type="button"
              className={`national-exams-tab ${
                subject === id ? "active" : ""
              }`}
              onClick={() => setSubject(id)}
            >
              {subjectLabels[id]}
            </button>
          ))}
        </div>

        <div className="national-exams-filters">
          <label>
            <span>Année</span>
            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
            >
              <option value="all">Toutes</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Session</span>
            <select
              value={session}
              onChange={(event) =>
                setSession(
                  event.target.value as "all" | ExamAsset["session"],
                )
              }
            >
              <option value="all">Toutes</option>
              <option value="normale">Normale</option>
              <option value="rattrapage">Rattrapage</option>
              <option value="other">Autres</option>
            </select>
          </label>

          <label className="national-exams-search">
            <span>Recherche</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Année, matière, fichier..."
            />
          </label>
        </div>
      </section>

      <section className="national-exams-content">
        <div className="national-exams-content__header">
          <span className="section-eyebrow">Sujets disponibles</span>
          <h2 className="section-title">
            {filteredExams.length} sujet
            {filteredExams.length > 1 ? "s" : ""}
          </h2>
        </div>

        {filteredExams.length === 0 ? (
          <div className="national-exams-empty card">
            <div className="national-exams-empty__icon">N</div>

            <div>
              <span className="section-eyebrow">
                Aucun résultat
              </span>
              <h2>Aucun sujet ne correspond à cette recherche.</h2>
              <p>
                Cette page affiche uniquement les PDF réellement présents
                dans la banque d'examens.
              </p>
            </div>
          </div>
        ) : (
          <div className="national-exams-years">
            {grouped.map(([examYear, items]) => (
              <section key={examYear} className="national-exams-year">
                <div className="national-exams-year__header">
                  <h2>{examYear}</h2>
                  <span>
                    {items.length} sujet
                    {items.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="national-exams-list">
                  {items.map((exam) => (
                    <article
                      key={exam.id}
                      className="national-exam-card"
                    >
                      <div className="national-exam-card__main">
                        <div className="national-exam-card__year">
                          {exam.year}
                        </div>

                        <div className="national-exam-card__info">
                          <div className="national-exam-card__eyebrow">
                            {subjectLabels[exam.subject]}
                            <span>·</span>
                            {sessionLabel(exam.session)}
                          </div>

                          <h3>
                            {subjectLabels[exam.subject]}
                          </h3>

                          <p className="national-exam-card__file">
                            {displayFileName(exam.fileName)}
                          </p>
                        </div>
                      </div>

                      <div className="national-exam-card__actions">
                        <a
                          className="btn btn-primary"
                          href={exam.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ouvrir le sujet
                        </a>

                        <a
                          className="btn btn-ghost"
                          href={exam.url}
                          download={exam.fileName}
                        >
                          Télécharger
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>

      <section className="national-exams-dev-grid">
        <article className="national-exams-dev-card card">
          <span className="section-eyebrow">Lecture structurée</span>
          <h2>Version MentionMax</h2>
          <p>
            Une version structurée du sujet sera générée à partir du
            texte extrait du document original.
          </p>
          <span className="feature-status">
            Fonctionnalité en développement
          </span>
        </article>

        <article className="national-exams-dev-card card">
          <span className="section-eyebrow">Correction IA</span>
          <h2>Corriger ma copie</h2>
          <p>
            Analyse d'une copie photographiée, extraction des réponses
            et explication des erreurs.
          </p>
          <span className="feature-status">
            Fonctionnalité en développement
          </span>
        </article>

        <article className="national-exams-dev-card card">
          <span className="section-eyebrow">Génération IA</span>
          <h2>Générer un sujet</h2>
          <p>
            Génération de sujets adaptés à la matière et au niveau de
            l'élève.
          </p>
          <span className="feature-status">
            Fonctionnalité en développement
          </span>
        </article>
      </section>
    </main>
  );
}
