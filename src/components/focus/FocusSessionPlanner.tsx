import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, CalendarDays, Check, Clock3, LoaderCircle, RefreshCw, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../../context/AccountContext";
import { getTrackSubjects } from "../../data/curriculum/tracks";
import { resolveUserPath } from "../../data/curriculum/secondBac";
import { createStudyAgentSession, getLatestStudyAgentSession, getPlanningProfile, listStudentExams, updateStudyAgentSession, type StudentExam, type StudyAgentSession } from "../../services/learning/studyAgentService";
import PlanningOnboarding from "./PlanningOnboarding";
import "./FocusSessionPlanner.css";

const durations = [15, 30, 45, 60] as const;
const typeLabels = { review: "Réactivation", exercise: "Exercice", quiz: "Checkpoint", lesson: "Cours" } as const;

function daysUntil(date: string) {
  const target = new Date(`${date}T12:00:00`);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

export default function FocusSessionPlanner() {
  const { schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const subjects = useMemo(() => getTrackSubjects(path).map((subject) => ({ id: subject.id, name: subject.name })), [path]);
  const [minutes, setMinutes] = useState<number>(30);
  const [session, setSession] = useState<StudyAgentSession | null>(null);
  const [exams, setExams] = useState<StudentExam[]>([]);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      const [latest, planningProfile, upcomingExams] = await Promise.all([getLatestStudyAgentSession(), getPlanningProfile(), listStudentExams()]);
      setSession(latest);
      setExams(upcomingExams.filter((exam) => daysUntil(exam.exam_date) >= 0));
      setOnboardingDone(Boolean(planningProfile?.onboarding_completed));
      if (planningProfile?.session_minutes) setMinutes(planningProfile.session_minutes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger ta planification.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  async function generate() {
    setGenerating(true); setError(null);
    try {
      const next = await createStudyAgentSession({ trackId: path, subjects, availableMinutes: minutes });
      setSession(next);
      const refreshed = await listStudentExams();
      setExams(refreshed.filter((exam) => daysUntil(exam.exam_date) >= 0));
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible de construire ta session."); }
    finally { setGenerating(false); }
  }

  async function toggleTask(id: string) {
    if (!session?.id) return;
    const tasks = session.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
    const status = tasks.every((task) => task.completed) ? "completed" : "active";
    setSession({ ...session, tasks, status });
    try { await updateStudyAgentSession(session.id, tasks, status); }
    catch (err) { setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'avancement."); }
  }

  const completed = session?.tasks.filter((task) => task.completed).length ?? 0;
  const total = session?.tasks.length ?? 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const nextExam = exams[0] ?? null;

  if (loading) return <section className="focus-session-planner card"><div className="focus-session-planner__loading"><LoaderCircle className="spin" size={18}/> Préparation de ton espace de travail…</div></section>;

  if (!onboardingDone) return <section className="focus-session-planner card" aria-label="Configurer ton profil d'apprentissage"><PlanningOnboarding subjects={subjects} initialMinutes={minutes} onDone={() => { setOnboardingDone(true); void load(); }} /></section>;

  return <section className="focus-session-planner card" aria-label="Ma session adaptive">
    <header className="focus-session-planner__hero">
      <div><span className="section-eyebrow">MA SESSION</span><h2>Tu as du temps. MentionMax sait quoi en faire.</h2><p>Choisis une durée. La séance tient compte de ton profil, de tes résultats, du moment de l'année et de tes prochains examens.</p></div>
      <div className="focus-session-planner__mark"><BrainCircuit size={24}/><span>ADAPTATIF</span></div>
    </header>

    <div className="focus-session-planner__context">
      <div className="focus-session-planner__context-item"><span>TON CALENDRIER</span><strong>{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date())}</strong><small>{new Date().getMonth() === 8 ? "Début d'année : les bases et premiers chapitres passent devant le reste." : "La séance suit progressivement le rythme recommandé de l'année."}</small></div>
      {nextExam ? <div className="focus-session-planner__context-item"><span>PROCHAIN EXAMEN</span><strong>{nextExam.title} · {daysUntil(nextExam.exam_date) === 0 ? "aujourd'hui" : `dans ${daysUntil(nextExam.exam_date)} j`}</strong><small>{nextExam.subjects.length ? nextExam.subjects.join(" · ") : "Matières non précisées"}{nextExam.mastery != null ? ` · maîtrise déclarée ${nextExam.mastery}%` : ""}</small></div> : <div className="focus-session-planner__context-item"><span>EXAMENS</span><strong>Aucune échéance renseignée</strong><small>Ajoute tes contrôles pour que les dates influencent les priorités.</small></div>}
      <Link className="focus-session-planner__calendar-link" to="/progression"><CalendarDays size={16}/> Voir ma planification</Link>
    </div>

    <div className="focus-session-planner__controls"><div className="focus-session-planner__durations" role="group" aria-label="Durée de la session">{durations.map((value) => <button key={value} type="button" className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}>{value}<small>min</small></button>)}</div><button className="btn btn-primary" type="button" onClick={() => void generate()} disabled={generating}>{generating ? <LoaderCircle className="spin" size={16}/> : <Sparkles size={16}/>} {generating ? "Construction…" : session ? "Reconstruire" : "Construire ma session"}</button></div>
    {error && <div className="focus-session-planner__error">{error}</div>}

    {session && <>
      <div className="focus-session-planner__summary"><div><span className="section-eyebrow">SESSION ACTIVE · {session.availableMinutes} MIN</span><h3>{session.title}</h3><p>{session.subtitle}</p></div><div className="focus-session-planner__progress"><strong>{progress}%</strong><span>{completed}/{total} étapes</span><div><span style={{ width: `${progress}%` }}/></div></div></div>
      {session.explanation && <div className="focus-session-planner__why"><div className="focus-session-planner__why-icon"><Target size={16}/></div><div><span>POURQUOI CETTE SESSION ?</span><p>{session.explanation}</p></div></div>}
      <div className="focus-session-planner__priorities">{session.priorities.map((priority) => <span key={priority}><Target size={12}/>{priority}</span>)}</div>
      <div className="focus-session-planner__tasks">{session.tasks.map((task, index) => <article className={`focus-session-planner__task ${task.completed ? "is-complete" : ""}`} key={task.id}><button className="focus-session-planner__check" type="button" onClick={() => void toggleTask(task.id)} aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}>{task.completed ? <Check size={15}/> : <span>{index + 1}</span>}</button><div><div className="focus-session-planner__task-meta"><span>{typeLabels[task.type]}</span><small><Clock3 size={12}/>{task.minutes} min</small></div><h4>{task.title}</h4><p>{task.reason}</p></div><Link to={task.route} className="focus-session-planner__go" aria-label={`Commencer ${task.title}`}><ArrowRight size={16}/></Link></article>)}</div>
      {session.status === "completed" ? <div className="focus-session-planner__note success"><Check size={15}/> Session terminée. Tes nouveaux résultats serviront à construire la prochaine.</div> : <div className="focus-session-planner__note"><RefreshCw size={15}/> Quand tu progresses, la prochaine session s'adapte.</div>}
    </>}

    {!session && <div className="focus-session-planner__empty"><Sparkles size={20}/><strong>Ta première session est prête à être construite.</strong><span>MentionMax dispose maintenant de ton profil initial, mais attend encore tes premières performances.</span></div>}
  </section>;
}
