import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SubjectIcon, type SubjectType } from "../components/ui/SubjectIcon";
import PeopleFeature from "../components/ui/PeopleFeature";
import { supabase } from "../lib/supabase";
import { getWeakPoints, type LearnerMastery } from "../services/learning/weakPointsService";
import "./Dashboard.css";

const subjectTypes: Record<string, SubjectType> = { maths: "math", "physique-chimie": "physics", svt: "svt", anglais: "english", philosophie: "philosophy" };
const subjectLabels: Record<string, string> = { maths: "Mathématiques", "physique-chimie": "Physique-Chimie", svt: "SVT", anglais: "Anglais", philosophie: "Philosophie" };

interface DashboardActivity { completedExercises: number; totalExercises: number; totalFocusSeconds: number; weekFocusSeconds: number; streakDays: number; weekFocusByDay: number[]; }
const emptyActivity: DashboardActivity = { completedExercises: 0, totalExercises: 0, totalFocusSeconds: 0, weekFocusSeconds: 0, streakDays: 0, weekFocusByDay: [0, 0, 0, 0, 0, 0, 0] };

function startOfLocalDay(date = new Date()) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
function formatStudyTime(seconds: number) { const hours = Math.floor(seconds / 3600); const minutes = Math.floor((seconds % 3600) / 60); return hours > 0 ? `${hours}h${minutes.toString().padStart(2, "0")}` : `${minutes} min`; }
function calculateStreak(activityDates: string[]) { const days = new Set(activityDates.map((value) => startOfLocalDay(new Date(value)).getTime())); let streak = 0; const cursor = startOfLocalDay(); while (days.has(cursor.getTime())) { streak += 1; cursor.setDate(cursor.getDate() - 1); } if (streak === 0) { const yesterday = startOfLocalDay(); yesterday.setDate(yesterday.getDate() - 1); while (days.has(yesterday.getTime())) { streak += 1; yesterday.setDate(yesterday.getDate() - 1); } } return streak; }
function masteryLabel(value: number) { if (value < 0.45) return "À renforcer"; if (value < 0.65) return "Fragile"; if (value < 0.8) return "En progrès"; return "Maîtrisé"; }

export default function Dashboard() {
  const { profile, schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackSubjects = getTrackSubjects(path);
  const displayName = profile?.display_name?.split(" ")[0] || "élève";
  const pathLabel = schoolPreferences?.track === "SM" ? `Sciences Mathématiques ${schoolPreferences.section ?? ""}` : "Sciences Physiques";
  const [activity, setActivity] = useState<DashboardActivity>(emptyActivity);
  const [activityLoading, setActivityLoading] = useState(true);
  const [weakPoints, setWeakPoints] = useState<LearnerMastery[]>([]);
  const [weakPointsLoading, setWeakPointsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadActivity() {
      if (!profile?.id) { setActivityLoading(false); return; }
      setActivityLoading(true);
      try {
        const [progressResult, totalResult, focusResult] = await Promise.all([
          supabase.from("mission_helios_progress").select("completed, completed_at").eq("user_id", profile.id),
          supabase.from("mission_helios_exercises").select("id", { count: "exact", head: true }),
          supabase.from("focus_sessions").select("actual_seconds, started_at, status").eq("user_id", profile.id).eq("status", "completed"),
        ]);
        if (!mounted) return;
        const progressRows = progressResult.data ?? [];
        const focusRows = focusResult.data ?? [];
        const completedExercises = progressRows.filter((row) => row.completed).length;
        const focusSeconds = focusRows.reduce((sum, row) => sum + Number(row.actual_seconds ?? 0), 0);
        const weekStart = startOfLocalDay();
        weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
        weekStart.setHours(0, 0, 0, 0);
        const weekFocusByDay = [0, 0, 0, 0, 0, 0, 0];
        for (const row of focusRows) { const startedAt = new Date(row.started_at); if (startedAt < weekStart) continue; const dayIndex = (startedAt.getDay() + 6) % 7; weekFocusByDay[dayIndex] += Number(row.actual_seconds ?? 0); }
        const activityDates = [...focusRows.map((row) => row.started_at), ...progressRows.filter((row) => row.completed && row.completed_at).map((row) => row.completed_at as string)];
        setActivity({ completedExercises, totalExercises: totalResult.count ?? 0, totalFocusSeconds: focusSeconds, weekFocusSeconds: weekFocusByDay.reduce((sum, value) => sum + value, 0), streakDays: calculateStreak(activityDates), weekFocusByDay });
      } catch (error) { console.error("Failed to load dashboard activity:", error); if (mounted) setActivity(emptyActivity); }
      finally { if (mounted) setActivityLoading(false); }
    }
    void loadActivity();
    return () => { mounted = false; };
  }, [profile?.id]);

  useEffect(() => {
    let mounted = true;
    async function loadWeakPoints() {
      if (!profile?.id) { setWeakPointsLoading(false); return; }
      setWeakPointsLoading(true);
      try {
        const data = await getWeakPoints(undefined, 12);
        if (mounted) setWeakPoints(data.filter((item) => trackSubjects.some((subject) => subject.id === item.subject_id)).slice(0, 8));
      } catch (error) { console.error("Failed to load learner weak points:", error); if (mounted) setWeakPoints([]); }
      finally { if (mounted) setWeakPointsLoading(false); }
    }
    void loadWeakPoints();
    return () => { mounted = false; };
  }, [profile?.id, path]);

  const exerciseProgress = activity.totalExercises > 0 ? Math.round((activity.completedExercises / activity.totalExercises) * 100) : 0;
  const maxDaySeconds = Math.max(...activity.weekFocusByDay, 1);
  const weekLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const focusTodayMinutes = Math.round(activity.weekFocusByDay[(new Date().getDay() + 6) % 7] / 60);
  const realMastery = exerciseProgress;
  const topWeakPoint = weakPoints.find((item) => item.mastery < 0.8) ?? weakPoints[0] ?? null;
  const prioritySubject = topWeakPoint?.subject_id ?? trackSubjects[0]?.id ?? "maths";
  const priorityConcept = topWeakPoint?.concept_id || topWeakPoint?.topic || topWeakPoint?.chapter || "ta première notion à travailler";
  const priorityPercent = topWeakPoint ? Math.round(topWeakPoint.mastery * 100) : null;
  const priorityCopy = useMemo(() => {
    if (!topWeakPoint) return { title: "Construis tes premières données d’apprentissage", description: "Commence quelques exercices et quiz. MentionMax pourra ensuite distinguer les vrais blocages des erreurs isolées.", meta: "Nouveau parcours" };
    if (topWeakPoint.mastery < 0.45) return { title: `Renforcer ${priorityConcept}`, description: "Cette notion ressort comme prioritaire dans ton historique. Reprends la méthode puis travaille quelques exercices ciblés.", meta: "Priorité élevée" };
    return { title: `Consolider ${priorityConcept}`, description: "La notion progresse, mais reste suffisamment fragile pour mériter une nouvelle série ciblée.", meta: masteryLabel(topWeakPoint.mastery) };
  }, [priorityConcept, topWeakPoint]);

  return <main className="section container dashboard-page">
    <header className="dashboard-hero"><div><span className="section-eyebrow">TABLEAU DE BORD · 2BAC</span><h1>Continue ta <span className="accent-word">préparation.</span></h1><p>Bonjour {displayName}. Voici ce qui mérite ton attention aujourd’hui.</p></div><div className="dashboard-path"><span>PARCOURS ACTIF</span><strong>{pathLabel}</strong><Link to="/preferences">Modifier</Link></div></header>
    <PeopleFeature variant="hero" compact title="Ton prochain chapitre commence ici." text="Cours, exercices et correction guidée dans un seul parcours. Travaille régulièrement pour construire une préparation solide au Bac." action={<Link className="btn btn-primary" to={topWeakPoint ? `/lecons/${prioritySubject}` : "/exercices"}>Commencer une session <ArrowRight size={15} /></Link>} />
    <section className="stats-grid dashboard-stats">
      <div className="card"><div className="dashboard-stat-icon"><TrendingUp size={17}/></div><span>Progression exercices</span><strong>{activityLoading ? "…" : `${realMastery}%`}</strong><small>{activity.completedExercises} terminés sur {activity.totalExercises || "—"}</small></div>
      <div className="card"><div className="dashboard-stat-icon"><Target size={17}/></div><span>Exercices terminés</span><strong>{activityLoading ? "…" : activity.completedExercises}</strong><small>Données réelles de ton compte</small></div>
      <div className="card"><div className="dashboard-stat-icon"><Flame size={17}/></div><span>Série</span><strong>{activityLoading ? "…" : `${activity.streakDays} ${activity.streakDays > 1 ? "jours" : "jour"}`}</strong><small>Basée sur tes activités réelles</small></div>
      <div className="card"><div className="dashboard-stat-icon"><Clock3 size={17}/></div><span>Temps de travail</span><strong>{activityLoading ? "…" : formatStudyTime(activity.totalFocusSeconds)}</strong><small>{focusTodayMinutes} min aujourd’hui</small></div>
    </section>
    <div className="dashboard-grid">
      <section className="card dashboard-priority"><div className="section-row"><div><span className="section-eyebrow">PRIORITÉ DU JOUR</span><h2>{weakPointsLoading ? "Analyse de ton historique…" : priorityCopy.title}</h2></div><span className="dashboard-priority-time">{topWeakPoint ? `${priorityPercent}% maîtrise` : "Démarrage"}</span></div><div className="dashboard-priority-body"><div className="dashboard-priority-icon"><SubjectIcon type={subjectTypes[prioritySubject] ?? "math"} label={subjectLabels[prioritySubject] ?? prioritySubject} /></div><div><strong>{subjectLabels[prioritySubject] ?? prioritySubject}</strong><p>{priorityCopy.description}</p><div className="dashboard-tags"><span>{priorityCopy.meta}</span>{topWeakPoint ? <span>{topWeakPoint.attempts} tentatives</span> : <span>0 tentatives</span>}<span>{topWeakPoint?.trend === "improving" ? "En progression" : "Suivi automatique"}</span></div></div><Link className="btn btn-primary" to={topWeakPoint ? `/exercices?subject=${prioritySubject}&chapter=${encodeURIComponent(topWeakPoint.chapter || "")}` : `/exercices?subject=${prioritySubject}`}>Commencer <ArrowRight size={15}/></Link></div></section>
      <section className="card"><div className="section-row"><div><span className="section-eyebrow">TON PROGRAMME</span><h2>Matières</h2></div><Link to="/matieres" className="text-brand">Explorer <ArrowRight size={14}/></Link></div><div className="dashboard-subjects">{trackSubjects.map((subject) => { const value = subject.id === "maths" ? realMastery : null; return <Link to={`/subjects/${subject.id}`} className="dashboard-subject" key={subject.id}><SubjectIcon type={subjectTypes[subject.id]} label={subject.name}/><div><strong>{subjectCatalog[subject.id].shortName}</strong><span>{subject.name}</span></div><b>{value === null ? "—" : `${value}%`}</b><ProgressBar value={value ?? 0}/></Link>; })}</div></section>
    </div>
    <div className="dashboard-lower-grid">
      <section className="card dashboard-week"><div className="section-row"><div><span className="section-eyebrow">ACTIVITÉ RÉELLE</span><h2>Ta semaine</h2></div><Link to="/progression" className="text-brand">Détails <ArrowRight size={14}/></Link></div><div className="dashboard-chart">{activity.weekFocusByDay.map((seconds,index)=><div className="dashboard-bar-wrap" key={weekLabels[index]}><span className="dashboard-bar-value">{Math.round(seconds / 60)} min</span><div className={`dashboard-bar ${index === (new Date().getDay() + 6) % 7 ? "active" : ""}`} style={{height:`${Math.max(5,(seconds / maxDaySeconds) * 100)}%`}}/><small>{weekLabels[index]}</small></div>)}</div><small style={{display:"block",marginTop:10,color:"#718582"}}>{formatStudyTime(activity.weekFocusSeconds)} de Focus cette semaine</small></section>
      <section className="card dashboard-checklist"><div><span className="section-eyebrow">SESSION DU JOUR</span><h2>3 choses à faire</h2></div><div className="dashboard-check"><span className="dashboard-check-dot done"><CheckCircle2 size={15}/></span><div><strong>Revoir un cours</strong><small>{topWeakPoint ? `${subjectLabels[topWeakPoint.subject_id] ?? topWeakPoint.subject_id} · ${priorityConcept}` : "Choisis une matière à commencer"}</small></div><b>✓</b></div><div className="dashboard-check"><span className="dashboard-check-dot"><Target size={15}/></span><div><strong>Faire 3 exercices</strong><small>{topWeakPoint ? `${subjectLabels[topWeakPoint.subject_id] ?? topWeakPoint.subject_id} · ciblés` : "Selon ton parcours"}</small></div><Link to={topWeakPoint ? `/exercices?subject=${topWeakPoint.subject_id}` : "/exercices"} aria-label="Faire les exercices"><ArrowRight size={15}/></Link></div><div className="dashboard-check"><span className="dashboard-check-dot"><BookOpen size={15}/></span><div><strong>Voir tes points faibles</strong><small>Historique et tendances par notion</small></div><Link to="/points-faibles" aria-label="Voir tes points faibles"><ArrowRight size={15}/></Link></div></section>
    </div>
    <section className="dashboard-next card"><div><span className="section-eyebrow">PROCHAINE ÉTAPE</span><h2>Le système apprend avec toi.</h2><p>Chaque quiz, exercice et correction affine ta carte de maîtrise pour choisir la suite plus intelligemment.</p></div><div className="dashboard-next-actions"><Link className="btn btn-secondary" to="/points-faibles"><Target size={15}/> Voir mes points faibles</Link><Link className="btn btn-primary" to={topWeakPoint ? `/lecons/${prioritySubject}` : "/exercices"}><BookOpen size={15}/> {topWeakPoint ? "Revoir la notion" : "Commencer"}</Link></div></section>
  </main>;
}
