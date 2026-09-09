import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, Check, Clock3, LoaderCircle, RefreshCw, Sparkles, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { createStudyAgentSession, getLatestStudyAgentSession, updateStudyAgentSession, type StudyAgentSession } from "../services/learning/studyAgentService";
import "./StudyAgent.css";

const durations = [15, 30, 45, 60] as const;
const typeLabels = { review: "Réactivation", exercise: "Exercice", quiz: "Checkpoint", lesson: "Cours" } as const;

export default function StudyAgent() {
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
      } finally { if (mounted) setLoading(false); }
    }
    void load();
    return () => { mounted = false; };
  }, []);

  async function generate() {
    setGenerating(true); setError(null);
    try {
      const next = await createStudyAgentSession({ trackId: path, subjects, availableMinutes: minutes });
      setSession(next);
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

  if (loading) return <main className="section container study-agent-page"><div className="study-agent-loading"><LoaderCircle className="spin" size={20}/> Préparation de ton agent…</div></main>;

  const completed = session?.tasks.filter((task) => task.completed).length ?? 0;
  const total = session?.tasks.length ?? 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;

  return <main className="section container study-agent-page">
    <header className="study-agent-hero">
      <div>
        <span className="section-eyebrow">AGENT PERSONNEL · 2BAC</span>
        <h1>Une session. <span className="accent-word">Pas une usine à listes.</span></h1>
        <p>MentionMax regarde ce que tu maîtrises, ce qui te résiste et le temps que tu as réellement pour construire la prochaine session.</p>
      </div>
      <div className="study-agent-orb"><BrainCircuit size={28}/><span>ADAPTATIF</span></div>
    </header>

    <section className="study-agent-controls card">
      <div><span className="section-eyebrow">TEMPS DISPONIBLE</span><h2>Combien de temps as-tu ?</h2><p>L’agent répartit lui-même les étapes. Humanité épargnée, au moins pour aujourd’hui.</p></div>
      <div className="study-agent-duration">{durations.map((value) => <button key={value} type="button" className={minutes === value ? "active" : ""} onClick={() => setMinutes(value)}>{value}<small>min</small></button>)}</div>
      <button className="btn btn-primary study-agent-generate" type="button" onClick={() => void generate()} disabled={generating}>{generating ? <LoaderCircle className="spin" size={16}/> : <Sparkles size={16}/>} {generating ? "Construction…" : session ? "Reconstruire ma session" : "Construire ma session"}</button>
    </section>

    {error && <div className="study-agent-error">{error}</div>}

    {session ? <section className="study-agent-session card">
      <header className="study-agent-session__header"><div><span className="section-eyebrow">SESSION ACTIVE · {session.availableMinutes} MIN</span><h2>{session.title}</h2><p>{session.subtitle}</p></div><div className="study-agent-progress"><strong>{progress}%</strong><span>{completed}/{total} étapes</span><div><span style={{ width: `${progress}%` }}/></div></div></header>
      <div className="study-agent-priorities">{session.priorities.map((priority) => <span key={priority}><Target size={12}/>{priority}</span>)}</div>
      <div className="study-agent-tasks">{session.tasks.map((task, index) => <article className={`study-agent-task ${task.completed ? "is-complete" : ""}`} key={task.id}><button className="study-agent-task__check" type="button" onClick={() => void toggleTask(task.id)} aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}>{task.completed ? <Check size={15}/> : <span>{index + 1}</span>}</button><div className="study-agent-task__main"><div className="study-agent-task__meta"><span>{typeLabels[task.type]}</span><small><Clock3 size={12}/>{task.minutes} min</small></div><h3>{task.title}</h3><p>{task.reason}</p>{task.conceptIds.length > 0 && <div className="study-agent-concepts">{task.conceptIds.slice(0,3).map((concept) => <span key={concept}>{concept}</span>)}</div>}</div><Link to={task.route} className="study-agent-task__go" aria-label={`Commencer ${task.title}`}><ArrowRight size={17}/></Link></article>)}</div>
      {session.status === "completed" ? <div className="study-agent-complete"><Check size={17}/> Session terminée. Les prochaines recommandations partiront de tes nouveaux résultats.</div> : <div className="study-agent-note"><RefreshCw size={15}/> Ta session reste modifiable, et chaque résultat réécrit progressivement la prochaine.</div>}
    </section> : <section className="study-agent-empty card"><Sparkles size={22}/><h2>Ton agent attend ses premières données.</h2><p>Quelques quiz ou exercices suffisent pour commencer. Ensuite, la session cesse d’être générique et devient réellement pilotée par ton historique.</p></section>}
  </main>;
}
