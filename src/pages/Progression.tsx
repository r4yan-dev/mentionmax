import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, RefreshCw, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { useAuth } from "../context/AuthContext";
import { mentiSupabase } from "../lib/supabase";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { ProgressBar } from "../components/ui/ProgressBar";
import PeopleFeature from "../components/ui/PeopleFeature";

type WeeklyDay = { date: string; xp: number; exercises: number; correct: number; tests: number; focus_minutes: number };
type SubjectProgress = { slug: string; name: string; mastery: number; accuracy: number; xp: number };
type ProgressionPayload = {
  linked: boolean;
  total: { total_xp?: number; current_streak?: number; longest_streak?: number; total_exercises?: number; total_correct?: number; total_tests?: number; total_focus_minutes?: number };
  weekly_totals: { xp?: number; exercises?: number; correct?: number; tests?: number; focus_minutes?: number };
  weekly: WeeklyDay[];
  subjects: SubjectProgress[];
};

const numberFormat = new Intl.NumberFormat("fr-FR");

function formatMinutes(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return hours > 0 ? `${hours}h ${String(mins).padStart(2, "0")}` : `${mins} min`;
}

function buildSevenDays(rows: WeeklyDay[]) {
  const map = new Map(rows.map((row) => [row.date, row]));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return map.get(key) ?? { date: key, xp: 0, exercises: 0, correct: 0, tests: 0, focus_minutes: 0 };
  });
}

function weekdayLabel(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(new Date(`${date}T12:00:00`)).slice(0, 1).toUpperCase();
}

export default function Progression() {
  const { schoolPreferences } = useAccount();
  const { user } = useAuth();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const [data, setData] = useState<ProgressionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const loadProgression = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const { data: result, error: queryError } = await mentiSupabase.rpc("get_progression_public", {
      p_source_app_user_id: user.id,
    });
    if (queryError) {
      console.error("Failed to load live progression:", queryError);
      setError("Impossible de charger ta progression en direct.");
      setLoading(false);
      return;
    }
    setData((result as ProgressionPayload) ?? null);
    setLastSynced(new Date());
    setLoading(false);
  };

  useEffect(() => {
    void loadProgression();
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = mentiSupabase
      .channel(`live-progression:${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "user_progress" }, () => void loadProgression())
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_progress" }, () => void loadProgression())
      .on("postgres_changes", { event: "*", schema: "public", table: "user_subject_progress" }, () => void loadProgression())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => void loadProgression())
      .subscribe();
    return () => {
      void mentiSupabase.removeChannel(channel);
    };
  }, [user?.id]);

  const total = data?.total ?? {};
  const weeklyTotals = data?.weekly_totals ?? {};
  const weekly = useMemo(() => buildSevenDays(data?.weekly ?? []), [data?.weekly]);
  const maxFocus = Math.max(1, ...weekly.map((day) => day.focus_minutes));
  const totalExercises = Number(total.total_exercises ?? 0);
  const totalCorrect = Number(total.total_correct ?? 0);
  const successRate = totalExercises > 0 ? Math.round((totalCorrect / totalExercises) * 100) : 0;
  const weeklyExercises = Number(weeklyTotals.exercises ?? 0);
  const weeklyCorrect = Number(weeklyTotals.correct ?? 0);
  const weeklySuccessRate = weeklyExercises > 0 ? Math.round((weeklyCorrect / weeklyExercises) * 100) : 0;

  const subjects = useMemo(() => {
    const allowed = path === "2BAC_SM_B"
      ? ["mathematiques", "physique-chimie", "francais", "philosophie", "anglais"]
      : path === "2BAC_SM_A"
        ? ["mathematiques", "physique-chimie", "francais", "philosophie", "anglais", "svt"]
        : null;
    const rows = data?.subjects ?? [];
    return allowed ? rows.filter((subject) => allowed.includes(subject.slug)) : rows;
  }, [data?.subjects, path]);

  const studyGoalMinutes = 15 * 60;
  const totalFocus = Number(total.total_focus_minutes ?? 0);
  const objectivePercent = Math.min(100, Math.round((Number(weeklyTotals.focus_minutes ?? 0) / studyGoalMinutes) * 100));
  const todayFocus = weekly.find((day) => day.date === new Date().toISOString().slice(0, 10))?.focus_minutes ?? 0;

  return <main className="section container">
    <header style={{ marginBottom: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-end" }}>
        <div>
          <span className="section-eyebrow">PROGRESSION</span>
          <h1 style={{ margin: "5px 0 8px" }}>Construis une avance réelle.</h1>
          <p style={{ maxWidth: 650, color: "#718582", lineHeight: 1.65 }}>Pas seulement un compteur de tâches terminées. Ici, tu vois où tu progresses et où ton parcours a encore besoin de travail.</p>
        </div>
        <button type="button" onClick={() => void loadProgression()} disabled={loading} style={{ border: 0, background: "transparent", color: "#718582", display: "flex", alignItems: "center", gap: 6, fontSize: 11, cursor: "pointer" }}>
          <RefreshCw size={13} style={loading ? { animation: "spin .9s linear infinite" } : undefined} />
          {loading ? "Synchronisation…" : lastSynced ? `En direct · ${lastSynced.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "En direct"}
        </button>
      </div>
    </header>

    <PeopleFeature variant="writing" compact title="Chaque session compte." text="Une progression utile se construit dans la répétition : comprendre, pratiquer, corriger, recommencer." />

    {error && <div className="card" style={{ marginBottom: 20, padding: 18, color: "#76213A" }}>{error}</div>}
    {!loading && !data?.linked && <div className="card" style={{ marginBottom: 20, padding: 18, color: "#718582" }}>Ton compte n'est pas encore relié aux données Menti. Tes statistiques resteront vides tant qu'aucune activité n'est enregistrée.</div>}

    <section className="stats-grid" style={{ marginBottom: 20 }}>
      <div className="card"><span className="section-eyebrow">XP TOTAL</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>{numberFormat.format(Number(total.total_xp ?? 0))}</strong><small style={{color:"#718582"}}>+{numberFormat.format(Number(weeklyTotals.xp ?? 0))} cette semaine</small></div>
      <div className="card"><span className="section-eyebrow">TAUX DE RÉUSSITE</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>{successRate}%</strong><small style={{color:"#718582"}}>{weeklyExercises > 0 ? `${weeklySuccessRate}% cette semaine` : "aucune tentative enregistrée"}</small></div>
      <div className="card"><span className="section-eyebrow">TEMPS D'ÉTUDE</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>{formatMinutes(totalFocus)}</strong><small style={{color:"#718582"}}>objectif 15h · {objectivePercent}%</small></div>
      <div className="card"><span className="section-eyebrow">SÉRIE</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>{Number(total.current_streak ?? 0)} jours</strong><small style={{color:"#718582"}}>record {Number(total.longest_streak ?? 0)} jours</small></div>
    </section>

    <div className="dashboard-grid">
      <section className="card">
        <div className="section-row"><div><span className="section-eyebrow">Cette semaine</span><h2>Régularité</h2></div><span style={{fontSize:12,color:"#0fa3a3",fontWeight:800}}>{objectivePercent}% de l'objectif</span></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",alignItems:"end",height:190,gap:10,paddingTop:15}}>
          {weekly.map((day) => <div key={day.date} style={{height:`${Math.max(8, (day.focus_minutes / maxFocus) * 100)}%`,borderRadius:"8px 8px 3px 3px",background:day.focus_minutes>0?"#0fa3a3":"#d8eeea",position:"relative",minHeight:8}}><span style={{position:"absolute",top:-19,left:"50%",transform:"translateX(-50%)",fontSize:10,fontWeight:750,color:day.focus_minutes>0?"#0fa3a3":"#7b9691",whiteSpace:"nowrap"}}>{day.focus_minutes} min</span></div>)}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginTop:9}}>{weekly.map((day)=><span key={day.date} style={{textAlign:"center",fontSize:10,color:"#91a6a2"}}>{weekdayLabel(day.date)}</span>)}</div>
      </section>

      <section className="card">
        <div className="section-row"><div><span className="section-eyebrow">Matières</span><h2>Maîtrise</h2></div><Link to="/matieres" className="text-brand">Explorer <ArrowRight size={14}/></Link></div>
        <div style={{display:"flex",flexDirection:"column",gap:17}}>
          {subjects.length > 0 ? subjects.map((subject)=><div key={subject.slug}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><strong style={{fontSize:12}}>{subject.name}</strong><span style={{fontSize:12,fontWeight:850}}>{Math.round(Number(subject.mastery ?? 0))}%</span></div><ProgressBar value={Math.round(Number(subject.mastery ?? 0))}/></div>) : <div style={{padding:"18px 0",color:"#718582",fontSize:12}}>Aucune donnée de maîtrise enregistrée pour ton compte.</div>}
        </div>
      </section>
    </div>

    <section className="card" style={{marginTop:20,padding:22}}>
      <div className="section-row"><div><span className="section-eyebrow">Prochaines actions</span><h2>Ce qui va vraiment améliorer ton niveau</h2></div></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:10}}>
        <Link to="/exercices?subject=maths" className="card" style={{padding:16,textDecoration:"none"}}><BrainCircuit size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Faire 5 exercices</h3><p style={{margin:0,color:"#718582",fontSize:12}}>Consolide ton chapitre le moins stable selon tes résultats réels.</p></Link>
        <Link to="/exercices?subject=physique-chimie" className="card" style={{padding:16,textDecoration:"none"}}><Target size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Réviser la Physique</h3><p style={{margin:0,color:"#718582",fontSize:12}}>Travaille les applications avant le par cœur.</p></Link>
        <div className="card" style={{padding:16}}><Clock3 size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Aujourd'hui · {formatMinutes(todayFocus)}</h3><p style={{margin:0,color:"#718582",fontSize:12}}>Chaque session compte. Maintiens la régularité de ton parcours.</p></div>
        <div className="card" style={{padding:16}}><CheckCircle2 size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Objectif hebdo</h3><p style={{margin:0,color:"#718582",fontSize:12}}>{objectivePercent}% du volume prévu est déjà enregistré cette semaine.</p></div>
      </div>
    </section>
  </main>;
}
