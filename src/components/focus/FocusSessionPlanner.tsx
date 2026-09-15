import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, Check, Clock3, LoaderCircle, RefreshCw, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../../context/AccountContext";
import { getTrackSubjects } from "../../data/curriculum/tracks";
import { resolveUserPath } from "../../data/curriculum/secondBac";
import { createStudyAgentSession, getLatestStudyAgentSession, updateStudyAgentSession, type StudyAgentSession } from "../../services/learning/studyAgentService";
import "./FocusSessionPlanner.css";

const durations = [15, 30, 45, 60] as const;
const typeLabels = { review: "Réactivation", exercise: "Exercice", quiz: "Checkpoint", lesson: "Cours" } as const;

export default function FocusSessionPlanner() {
  const { schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const subjects = useMemo(() => getTrackSubjects(path).map((subject) => ({ id: subject.id, name: subject.name })), [path]);
  const [minutes, setMinutes] = useState<number>(30);
  const [session, setSession] = useState<StudyAgentSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const latest = await getLatestStudyAgentSession();
        if (mounted) setSession(latest);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Impossible de charger la session.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const next = await createStudyAgentSession({ trackId: path, subjects, availableMinutes: minutes });
      setSession(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de construire ta session.");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleTask(id: string) {
    if (!session?.id) return;
    const tasks = session.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
    const status = tasks.every((task) => task.completed) ? "completed" : "active";
    setSession({ ...session, tasks, status });
    try {
      await updateStudyAgentSession(session.id, tasks, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'enregistrer l'avancement.");
    }
  }

  const completed = session?.tasks.filter((task) => task.completed).length ?? 0;
  const total = session?.tasks.length ?? 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="focus-session-planner card" aria-label="Ma session adaptive">
      <header className="focus-session-planner__hero">
        <div>
          <span className="section-eyebrow">MA SESSION</span>
          <h2>Tu as du temps. MentionMax sait quoi en faire.</h2>
          <p>Choisis une durée. La session est construite à partir de ta maîtrise et de tes priorités réelles.</p>
        </div>
        <div className="focus-session-planner__mark"><BrainCircuit size={24}/><span>ADAPTATIF</span></div>
      </header>

      <div className="focus-session-planner__controls">
        <div className="focus-session-planner__durations" role="group" aria-label="Durée de la session">
          {durations.map((value) => (
            <button key={value} type="button" className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}>
              {value}<small>min</small>
            </button>
          ))}
        </div>
        <button className="btn btn-primary" type="button" onClick={() => void generate()} disabled={generating}>
          {generating ? <LoaderCircle className="spin" size={16}/> : <Sparkles size={16}/>} {generating ? "Construction…" : session ? "Reconstruire" : "Construire ma session"}
        </button>
      </div>

      {loading && <div className="focus-session-planner__loading"><LoaderCircle className="spin" size={18}/> Chargement de ta dernière session…</div>}
      {error && <div className="focus-session-planner__error">{error}</div>}

      {!loading && session && (
        <>
          <div className="focus-session-planner__summary">
            <div>
              <span className="section-eyebrow">SESSION ACTIVE · {session.availableMinutes} MIN</span>
              <h3>{session.title}</h3>
              <p>{session.subtitle}</p>
            </div>
            <div className="focus-session-planner__progress">
              <strong>{progress}%</strong>
              <span>{completed}/{total} étapes</span>
              <div><span style={{ width: `${progress}%` }}/></div>
            </div>
          </div>

          <div className="focus-session-planner__priorities">
            {session.priorities.map((priority) => <span key={priority}><Target size={12}/>{priority}</span>)}
          </div>

          <div className="focus-session-planner__tasks">
            {session.tasks.map((task, index) => (
              <article className={`focus-session-planner__task ${task.completed ? "is-complete" : ""}`} key={task.id}>
                <button className="focus-session-planner__check" type="button" onClick={() => void toggleTask(task.id)} aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}>
                  {task.completed ? <Check size={15}/> : <span>{index + 1}</span>}
                </button>
                <div>
                  <div className="focus-session-planner__task-meta"><span>{typeLabels[task.type]}</span><small><Clock3 size={12}/>{task.minutes} min</small></div>
                  <h4>{task.title}</h4>
                  <p>{task.reason}</p>
                </div>
                <Link to={task.route} className="focus-session-planner__go" aria-label={`Commencer ${task.title}`}><ArrowRight size={16}/></Link>
              </article>
            ))}
          </div>

          {session.status === "completed" ? (
            <div className="focus-session-planner__note success"><Check size={15}/> Session terminée. Tes nouveaux résultats serviront à construire la prochaine.</div>
          ) : (
            <div className="focus-session-planner__note"><RefreshCw size={15}/> Quand tu progresses, la prochaine session s'adapte.</div>
          )}
        </>
      )}

      {!loading && !session && !error && (
        <div className="focus-session-planner__empty"><Sparkles size={20}/><strong>Ta première session t'attend.</strong><span>Quelques exercices suffisent pour donner à MentionMax assez de signal pour personnaliser la suite.</span></div>
      )}
    </section>
  );
}
