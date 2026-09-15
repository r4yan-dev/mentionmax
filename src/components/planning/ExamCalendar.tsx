import { useEffect, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { createStudentExam, deleteStudentExam, listStudentExams, type StudentExam } from "../../services/learning/studyAgentService";
import "./ExamCalendar.css";

function daysUntil(date: string) {
  const target = new Date(`${date}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export default function ExamCalendar() {
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [subjects, setSubjects] = useState("");
  const [coverage, setCoverage] = useState("");
  const [mastery, setMastery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try { setExams((await listStudentExams()).filter((exam) => daysUntil(exam.exam_date) >= 0)); }
    catch (err) { setError(err instanceof Error ? err.message : "Impossible de charger le calendrier."); }
  }
  useEffect(() => { void load(); }, []);

  async function addExam() {
    if (!title.trim() || !date) return;
    setSaving(true); setError(null);
    try {
      const exam = await createStudentExam({
        title: title.trim(),
        exam_date: date,
        subjects: subjects.split(",").map((x) => x.trim()).filter(Boolean),
        coverage: { chaptersText: coverage.trim() },
        mastery: mastery === "" ? null : Math.max(0, Math.min(100, Number(mastery))),
        notes: null,
      });
      setExams((prev) => [...prev, exam].sort((a, b) => a.exam_date.localeCompare(b.exam_date)));
      setTitle(""); setDate(""); setSubjects(""); setCoverage(""); setMastery(""); setOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible d'ajouter l'examen."); }
    finally { setSaving(false); }
  }

  async function removeExam(id: string) {
    try { await deleteStudentExam(id); setExams((prev) => prev.filter((exam) => exam.id !== id)); }
    catch (err) { setError(err instanceof Error ? err.message : "Impossible de supprimer l'examen."); }
  }

  return <section className="exam-calendar card">
    <div className="exam-calendar__header"><div><span className="section-eyebrow">CALENDRIER</span><h2>Mes prochains examens</h2><p>Ces échéances peuvent influencer automatiquement les priorités de tes séances.</p></div><button type="button" className="btn btn-primary" onClick={() => setOpen((value) => !value)}><Plus size={15}/> Ajouter</button></div>
    {open && <div className="exam-calendar__form"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nom de l'examen" /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><input value={subjects} onChange={(e) => setSubjects(e.target.value)} placeholder="Matières · ex. Maths, Physique" /><textarea value={coverage} onChange={(e) => setCoverage(e.target.value)} rows={2} placeholder="Chapitres au programme (facultatif)" /><label>Maîtrise actuelle (facultatif)<input type="number" min="0" max="100" value={mastery} onChange={(e) => setMastery(e.target.value)} placeholder="0–100" /></label><button type="button" className="btn btn-secondary" onClick={() => void addExam()} disabled={saving}>Enregistrer</button></div>}
    {error && <div className="exam-calendar__error">{error}</div>}
    <div className="exam-calendar__list">{exams.length ? exams.map((exam) => { const days = daysUntil(exam.exam_date); return <article className="exam-calendar__item" key={exam.id}><div className="exam-calendar__date"><CalendarDays size={17}/><strong>{new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(`${exam.exam_date}T12:00:00`))}</strong></div><div className="exam-calendar__main"><strong>{exam.title}</strong><span>{exam.subjects.length ? exam.subjects.join(" · ") : "Matières non précisées"}{exam.mastery != null ? ` · ${exam.mastery}% maîtrisé` : ""}</span>{typeof exam.coverage?.chaptersText === "string" && exam.coverage.chaptersText && <small>Au programme · {exam.coverage.chaptersText}</small>}</div><strong className="exam-calendar__countdown">{days === 0 ? "Aujourd'hui" : `${days} j`}</strong><button type="button" className="exam-calendar__delete" onClick={() => void removeExam(exam.id)} aria-label={`Supprimer ${exam.title}`}><Trash2 size={15}/></button></article>; }) : <div className="exam-calendar__empty">Aucun examen enregistré. Ajoute une échéance pour que MentionMax puisse en tenir compte.</div>}</div>
  </section>;
}
