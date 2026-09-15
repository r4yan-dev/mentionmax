import { useMemo, useState } from "react";
import { ArrowRight, CalendarPlus, Check, ChevronLeft, Target } from "lucide-react";
import type { SubjectId } from "../../types/academic";
import { savePlanningProfile, createStudentExam, type StudentExam } from "../../services/learning/studyAgentService";

type Subject = { id: SubjectId; name: string };
type Status = "not_started" | "in_progress" | "studied_weak" | "mastered";

type SubjectState = { status: Status; lastReached: string };

const statusOptions: Array<{ value: Status; label: string; help: string }> = [
  { value: "not_started", label: "Pas commencé", help: "Je n'ai pas encore vraiment travaillé ce contenu." },
  { value: "in_progress", label: "En cours", help: "J'ai commencé mais je n'ai pas atteint mon rythme." },
  { value: "studied_weak", label: "Étudié mais fragile", help: "Je l'ai vu, mais je ne le maîtrise pas encore." },
  { value: "mastered", label: "Plutôt maîtrisé", help: "Je peux généralement le faire seul." },
];

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function PlanningOnboarding({ subjects, initialMinutes = 30, onDone }: { subjects: Subject[]; initialMinutes?: number; onDone: () => void }) {
  const [step, setStep] = useState(1);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [states, setStates] = useState<Record<string, SubjectState>>(() => Object.fromEntries(subjects.map((s) => [s.id, { status: "in_progress", lastReached: "" }])));
  const [priority, setPriority] = useState<string[]>([]);
  const [exams, setExams] = useState<Array<Pick<StudentExam, "title" | "exam_date" | "subjects" | "coverage" | "mastery" | "notes">>>([]);
  const [examTitle, setExamTitle] = useState("");
  const [examDate, setExamDate] = useState(todayPlus(21));
  const [examSubjects, setExamSubjects] = useState<string[]>([]);
  const [examCoverage, setExamCoverage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strongSubjects = useMemo(() => subjects.filter((s) => states[s.id]?.status === "mastered").map((s) => s.id), [states, subjects]);
  const weakSubjects = useMemo(() => subjects.filter((s) => states[s.id]?.status === "studied_weak").map((s) => s.id), [states, subjects]);
  const prioritySubjects = useMemo(() => Array.from(new Set([...priority, ...weakSubjects])), [priority, weakSubjects]);

  function updateStatus(id: string, status: Status) {
    setStates((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { lastReached: "" }), status } }));
  }
  function updateReached(id: string, lastReached: string) {
    setStates((prev) => ({ ...prev, [id]: { ...(prev[id] ?? { status: "in_progress" }), lastReached } }));
  }
  function togglePriority(id: string) {
    setPriority((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function toggleExamSubject(id: string) {
    setExamSubjects((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }
  function addExam() {
    if (!examTitle.trim() || !examDate) return;
    setExams((prev) => [...prev, { title: examTitle.trim(), exam_date: examDate, subjects: examSubjects, coverage: { chaptersText: examCoverage.trim() }, mastery: null, notes: null }]);
    setExamTitle(""); setExamCoverage(""); setExamSubjects([]); setExamDate(todayPlus(21));
  }
  async function finish() {
    setSaving(true); setError(null);
    try {
      await savePlanningProfile({
        strongSubjects,
        weakSubjects,
        prioritySubjects,
        subjectStatus: states,
        sessionMinutes: minutes,
        academicStartDate: `${new Date().getFullYear()}-09-01`,
      });
      for (const exam of exams) await createStudentExam(exam);
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer ton profil.");
    } finally { setSaving(false); }
  }

  return <section className="planning-onboarding" aria-label="Configuration de ton profil d'apprentissage">
    <div className="planning-onboarding__top"><div><span className="section-eyebrow">PREMIÈRE CONNEXION · 2BAC</span><h2>Avant de te proposer une séance, il faut savoir où tu en es.</h2><p>Pas besoin d'un long questionnaire. Trois étapes suffisent pour distinguer ce que tu as couvert, ce qui reste à faire et ce qui te pose problème.</p></div><div className="planning-onboarding__steps"><span className={step >= 1 ? "active" : ""}>1</span><span className={step >= 2 ? "active" : ""}>2</span><span className={step >= 3 ? "active" : ""}>3</span></div></div>
    {step === 1 && <div className="planning-onboarding__body"><div className="planning-onboarding__section-head"><div><span className="section-eyebrow">TON ÉTAT ACTUEL</span><h3>Pour chaque matière, où te situes-tu ?</h3></div><span className="planning-onboarding__hint">Tu pourras corriger ça plus tard.</span></div><div className="planning-subject-list">{subjects.map((subject) => { const value = states[subject.id]?.status ?? "in_progress"; return <article key={subject.id} className="planning-subject"><div className="planning-subject__head"><div><strong>{subject.name}</strong><span>{value === "mastered" ? "Point d'appui" : value === "studied_weak" ? "À renforcer" : value === "not_started" ? "À couvrir" : "En cours"}</span></div><button type="button" className={`planning-priority ${priority.includes(subject.id) ? "active" : ""}`} onClick={() => togglePriority(subject.id)}><Target size={14}/>{priority.includes(subject.id) ? "Prioritaire" : "Priorité"}</button></div><div className="planning-status-grid">{statusOptions.map((option) => <button key={option.value} type="button" className={value === option.value ? "active" : ""} onClick={() => updateStatus(subject.id, option.value)}><strong>{option.label}</strong><small>{option.help}</small></button>)}</div><label className="planning-reached"><span>Dernier chapitre / leçon atteint <em>facultatif</em></span><input value={states[subject.id]?.lastReached ?? ""} onChange={(e) => updateReached(subject.id, e.target.value)} placeholder="Ex. dérivation, ondes, fonctions…" /></label></article>; })}</div><div className="planning-onboarding__footer"><button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Continuer <ArrowRight size={16}/></button></div></div>}
    {step === 2 && <div className="planning-onboarding__body"><div className="planning-onboarding__section-head"><div><span className="section-eyebrow">TON RYTHME</span><h3>Combien de temps consacres-tu le plus souvent à une séance ?</h3></div></div><div className="planning-minute-grid">{[15,30,45,60].map((value) => <button key={value} type="button" className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}><strong>{value}</strong><span>minutes</span></button>)}</div><div className="planning-summary-box"><Target size={18}/><div><strong>Ce que MentionMax retiendra</strong><p>{prioritySubjects.length ? `${prioritySubjects.length} matière(s) prioritaire(s), avec les fragilités comme signal principal.` : "Les matières fragiles et non couvertes pèseront davantage au début."}</p></div></div><div className="planning-onboarding__footer"><button type="button" className="btn btn-ghost" onClick={() => setStep(1)}><ChevronLeft size={16}/> Retour</button><button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Ajouter mes examens <CalendarPlus size={16}/></button></div></div>}
    {step === 3 && <div className="planning-onboarding__body"><div className="planning-onboarding__section-head"><div><span className="section-eyebrow">CALENDRIER D'EXAMENS</span><h3>Lesquels arrivent bientôt ?</h3><p>Facultatif. Un examen proche pourra ensuite faire remonter les chapitres concernés dans tes séances.</p></div></div><div className="planning-exam-form"><input value={examTitle} onChange={(e) => setExamTitle(e.target.value)} placeholder="Ex. Contrôle de maths" /><input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} /><div className="planning-exam-subjects">{subjects.map((s) => <button key={s.id} type="button" className={examSubjects.includes(s.id) ? "active" : ""} onClick={() => toggleExamSubject(s.id)}>{s.name}</button>)}</div><textarea value={examCoverage} onChange={(e) => setExamCoverage(e.target.value)} placeholder="Chapitres au programme (facultatif)" rows={3}/><button type="button" className="btn btn-secondary" onClick={addExam}>Ajouter l'examen</button></div>{exams.length > 0 && <div className="planning-exam-list">{exams.map((exam) => <div className="planning-exam" key={`${exam.title}-${exam.exam_date}`}><div><strong>{exam.title}</strong><span>{new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(`${exam.exam_date}T12:00:00`))}</span></div><small>{exam.subjects.length ? exam.subjects.join(" · ") : "Matières non précisées"}</small></div>)}</div>}<div className="planning-onboarding__footer"><button type="button" className="btn btn-ghost" onClick={() => setStep(2)}><ChevronLeft size={16}/> Retour</button><button type="button" className="btn btn-primary" onClick={() => void finish()} disabled={saving}><Check size={16}/>{saving ? "Enregistrement…" : "Terminer ma configuration"}</button></div></div>}
    {error && <div className="planning-onboarding__error">{error}</div>}
  </section>;
}
