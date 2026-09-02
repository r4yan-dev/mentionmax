export type ExamSubject =
  | "maths"
  | "pc"
  | "svt"
  | "philo"
  | "english";

export type ExamSession =
  | "normale"
  | "rattrapage"
  | "other";

export type ExamAsset = {
  id: string;
  subject: ExamSubject;
  year: number;
  session: ExamSession;
  fileName: string;
  url: string;
};

export const subjectLabels: Record<ExamSubject, string> = {
  maths: "Mathématiques",
  pc: "Physique-Chimie",
  svt: "SVT",
  philo: "Philosophie",
  english: "English",
};

export const subjectOrder: ExamSubject[] = [
  "maths",
  "pc",
  "svt",
  "philo",
  "english",
];

const pdfModules = import.meta.glob(
  "../../assets/exams-spc/**/*.pdf",
  {
    eager: true,
    query: "?url",
    import: "default",
  },
) as Record<string, string>;

function detectSession(fileName: string): ExamSession {
  const name = fileName.toLowerCase();

  if (
    name.includes("rattrapage") ||
    name.includes("rattrape")
  ) {
    return "rattrapage";
  }

  if (
    name.includes("normale") ||
    name.includes("normal")
  ) {
    return "normale";
  }

  return "other";
}

function createId(
  subject: string,
  year: number,
  fileName: string,
) {
  return `${subject}-${year}-${fileName}`
    .toLowerCase()
    .replace(/\.pdf$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseExam(
  sourcePath: string,
  url: string,
): ExamAsset | null {
  const normalized = sourcePath.replaceAll("\\", "/");
  const parts = normalized.split("/");
  const root = parts.indexOf("exams-spc");

  if (root === -1) return null;

  const subject = parts[root + 1] as ExamSubject;
  const year = Number(parts[root + 2]);
  const fileName = parts.at(-1) ?? "";

  if (!subjectOrder.includes(subject)) return null;
  if (!Number.isInteger(year)) return null;
  if (!fileName.toLowerCase().endsWith(".pdf")) return null;

  return {
    id: createId(subject, year, fileName),
    subject,
    year,
    session: detectSession(fileName),
    fileName,
    url,
  };
}

export const exams: ExamAsset[] = Object.entries(pdfModules)
  .map(([path, url]) => parseExam(path, url))
  .filter(
    (exam): exam is ExamAsset =>
      exam !== null,
  )
  .sort((a, b) => {
    if (b.year !== a.year) {
      return b.year - a.year;
    }

    const subjectDiff =
      subjectOrder.indexOf(a.subject) -
      subjectOrder.indexOf(b.subject);

    if (subjectDiff !== 0) {
      return subjectDiff;
    }

    return a.fileName.localeCompare(b.fileName);
  });

export function getExamById(id: string) {
  return exams.find((exam) => exam.id === id) ?? null;
}

export function sessionLabel(
  session: ExamSession,
) {
  switch (session) {
    case "normale":
      return "Session normale";
    case "rattrapage":
      return "Rattrapage";
    default:
      return "Sujet";
  }
}

export function displayFileName(
  fileName: string,
) {
  return fileName
    .replace(/\.pdf$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
