import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Check, Clock3, LoaderCircle, RefreshCw, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import type { SubjectId, TrackId } from "../../types/academic";
import { getDailyPlan, type DailyPlan } from "../../services/learning/dailyPlanService";
import { updateDailyPlanTask } from "../../services/learning/dailyPlanService";

const typeLabel = { review: "Réactivation", exercise: "Pratique", quiz: "Checkpoint" } as const;

export default function DailyPlanPanel({ trackId, subjects }: { trackId: TrackId; subjects: Array<{ id: SubjectId; name: string }> }) {
  const [plan, setPlan] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(force = false) {
    setLoading(true); setError(null);
    try { setPlan(await getDailyPlan({ trackId, subjects, force })); }
    catch (err) { setError(err instanceof Error ? err.message : "Impossible de préparer ton plan."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [trackId]);

  const completed = plan?.tasks.filter((task) => task.completed).length ?? 0;
  const total = plan?.tasks.length ?? 0;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const remainingMinutes = useMemo(() => plan?.tasks.filter((task) => !task.completed).reduce((sum, task) => sum + task.minutes, 0) ?? 0, [plan]);

  async function toggleTask(id: string) {
    if (!plan || saving) return;
    const tasks = plan.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task);
    setPlan({ ...plan, tasks, status: tasks.every((task) => task.completed) ? "completed" : "active" });
    setSaving(true);
    try { await updateDailyPlanTask(plan.planDate, tasks); } catch (err) { setError(err instanceof Error ? err.message : "Impossible d'enregistrer la tâche."); setPlan(plan); } finally { setSaving(false); }
  }

  if (loading) return <section className="daily-plan card"><div className="daily-plan__loading"><LoaderCircle className="spin" size={19} /><span>Construction de ton plan personnalisé…</span></div></section>;
  if (error && !plan) return <section className="daily-plan card"><div className="daily-plan__error"><span>{error}</span><button type="button" onClick={() => void load(true)}>Réessayer</button></div></section>;
  if (!plan) return null;

  return <section className="daily-plan card">
    <header className="daily-plan__header"><div><span className="section-eyebrow">PLAN DU JOUR · ADAPTATIF</span><h2>{plan.title}</h2><p>{plan.subtitle}</p></div><button className="daily-plan__refresh" type="button" onClick={() => void load(true)} disabled={loading}><RefreshCw size={15} /></button></header>
    <div className="daily-plan__summary"><div><strong>{completed}/{total}</strong><span>tâches terminées</span></div><div><strong>{remainingMinutes} min</strong><span>restantes</span></div><div><strong>{progress}%</strong><span>du plan</span></div><div className="daily-plan__meter"><span style={{ width: `${progress}%` }} /></div></div>
    <div className="daily-plan__tasks">{plan.tasks.map((task, index) => <article className={`daily-plan__task ${task.completed ? "is-complete" : ""}`} key={task.id}><button type="button" className="daily-plan__check" onClick={() => void toggleTask(task.id)} aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}>{task.completed ? <Check size={15} /> : <span>{index + 1}</span>}</button><div className="daily-plan__task-body"><div className="daily-plan__task-top"><span>{typeLabel[task.type]}</span><small><Clock3 size={12} /> {task.minutes} min</small></div><h3>{task.title}</h3><p>{task.reason}</p><div className="daily-plan__chips">{task.conceptIds.slice(0,3).map((concept) => <span key={concept}><Target size={11}/>{concept}</span>)}</div></div><Link className="daily-plan__go" to={task.route} aria-label={`Ouvrir ${task.title}`}><ArrowRight size={16}/></Link></article>)}</div>
    {plan.status === "completed" ? <div className="daily-plan__done"><Zap size={16} /> Plan terminé. Les prochains choix partiront de tes nouvelles performances.</div> : <div className="daily-plan__footer"><BookOpen size={15} /><span>Chaque tâche nourrit ton profil de maîtrise et peut changer la suite.</span></div>}
    {error && <div className="daily-plan__inline-error">{error}</div>}
  </section>;
}
