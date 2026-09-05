import { useEffect, useMemo, useState } from "react";
import { Crown, Flame, Medal, RefreshCw, Trophy } from "lucide-react";
import { useAccount } from "../context/AccountContext";
import { useAuth } from "../context/AuthContext";
import { mentiSupabase } from "../lib/supabase";
import { resolveUserPath, pathLabels } from "../data/curriculum/secondBac";
import "./Leaderboard.css";

type LeaderboardRecord = {
  user_id: string;
  source_app_user_id: string | null;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  weekly_xp: number;
  current_streak: number;
  total_exercises: number;
  total_tests: number;
  total_focus_minutes: number;
  weekly_exercises: number;
  weekly_tests: number;
  weekly_focus_minutes: number;
  updated_at: string;
};

type Row = LeaderboardRecord & { rank: number };

const xpFormat = new Intl.NumberFormat("fr-FR");

function rankRows(records: LeaderboardRecord[]): Row[] {
  return [...records]
    .sort((a, b) =>
      b.weekly_xp - a.weekly_xp ||
      b.total_xp - a.total_xp ||
      b.weekly_focus_minutes - a.weekly_focus_minutes ||
      a.display_name.localeCompare(b.display_name, "fr")
    )
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

export default function Leaderboard() {
  const { profile, schoolPreferences } = useAccount();
  const { user } = useAuth();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const [records, setRecords] = useState<LeaderboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const loadLeaderboard = async () => {
    setError(null);

    const { data, error: queryError } = await mentiSupabase.rpc("get_leaderboard_public");

    if (queryError) {
      console.error("Failed to load live leaderboard:", queryError);
      setError("Impossible de charger le classement en direct.");
      setLoading(false);
      return;
    }

    setRecords((data as LeaderboardRecord[]) ?? []);
    setLastSynced(new Date());
    setLoading(false);
  };

  useEffect(() => {
    void loadLeaderboard();
  }, []);

  useEffect(() => {
    const refresh = () => void loadLeaderboard();
    const channel = mentiSupabase
      .channel("live-classment-leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_progress" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "daily_progress" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, refresh)
      .subscribe();

    return () => {
      void mentiSupabase.removeChannel(channel);
    };
  }, []);

  const rows = useMemo(() => rankRows(records), [records]);

  // The logged-in app profile is the source of truth for the current user's
  // display name. This makes a name change visible immediately even if the
  // separate Menti leaderboard identity has not synchronized yet.
  const me = rows.find((row) => row.source_app_user_id === user?.id)
    ?? rows.find((row) => row.user_id === user?.id)
    ?? null;
  const displayedRows = useMemo(() => {
    const currentName = profile?.display_name?.trim();
    if (!currentName || !me) return rows;
    return rows.map((row) => row.user_id === me.user_id
      ? { ...row, display_name: currentName }
      : row);
  }, [rows, me?.user_id, profile?.display_name]);

  const displayedMe = displayedRows.find((row) => row.user_id === me?.user_id) ?? me;
  const leader = displayedRows[0] ?? null;
  const gap = displayedMe && leader ? Math.max(0, leader.weekly_xp - displayedMe.weekly_xp) : 0;
  const gapToSecond = displayedMe && displayedRows[1] ? Math.max(0, displayedRows[1].weekly_xp - displayedMe.weekly_xp) : 0;
  const meName = displayedMe?.display_name ?? profile?.display_name ?? "Toi";

  return <main className="section container leaderboard-page">
    <header className="leaderboard-header">
      <div>
        <span className="section-eyebrow">CLASSEMENT</span>
        <h1>Mesure-toi au rythme des autres.</h1>
        <p>{pathLabels[path]} · classement hebdomadaire synchronisé en direct avec les données d’activité.</p>
      </div>
      <div className="leaderboard-header__badge">
        <Trophy size={18}/>
        <strong>{displayedMe ? `#${displayedMe.rank}` : "—"}</strong>
        <span>cette semaine</span>
      </div>
    </header>

    <section className="leaderboard-stats">
      <div className="card"><span>Ta position</span><strong>{displayedMe ? `#${displayedMe.rank}` : "—"}</strong><small>{displayedMe ? "classement actuel" : "profil non lié"}</small></div>
      <div className="card"><span>XP</span><strong>{displayedMe ? xpFormat.format(displayedMe.weekly_xp) : "—"}</strong><small>gagné cette semaine</small></div>
      <div className="card"><span>Série</span><strong>{displayedMe ? `${displayedMe.current_streak} jours` : "—"}</strong><small>rythme actuel</small></div>
      <div className="card"><span>Écart #1</span><strong>{displayedMe ? `${xpFormat.format(gap)} XP` : "—"}</strong><small>à combler</small></div>
    </section>

    <section className="card leaderboard-board">
      <div className="leaderboard-board__top">
        <div><span className="section-eyebrow">CLASSEMENT HEBDOMADAIRE</span><h2>Cette semaine</h2></div>
        <button className="leaderboard-live" type="button" onClick={() => void loadLeaderboard()} disabled={loading} title="Actualiser">
          <i/>{loading ? "Synchronisation…" : lastSynced ? `En direct · ${lastSynced.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "En direct"}<RefreshCw size={13} className={loading ? "leaderboard-spin" : ""}/>
        </button>
      </div>

      {error && <div className="leaderboard-empty">{error}</div>}
      {!error && loading && <div className="leaderboard-empty">Synchronisation du classement…</div>}
      {!error && !loading && displayedRows.length === 0 && <div className="leaderboard-empty">Aucun élève n'a encore de données de classement.</div>}

      {!error && !loading && displayedRows.length > 0 && <>
        <div className="leaderboard-podium">
          {displayedRows.slice(0, 3).map((row) => <div className={`leader-podium-card rank-${row.rank}`} key={row.user_id}>
            <div className="leader-podium-medal">{row.rank === 1 ? <Crown size={18}/> : row.rank === 2 ? <Medal size={18}/> : <Trophy size={18}/>}</div>
            <strong>#{row.rank}</strong>
            <span>{row.display_name}</span>
            <b>{xpFormat.format(row.weekly_xp)} XP</b>
          </div>)}
        </div>

        <div className="leaderboard-list">
          {displayedRows.map((row) => <div className={`leaderboard-row${displayedMe?.user_id === row.user_id ? " current" : ""}`} key={row.user_id}>
            <strong>#{row.rank}</strong>
            <span className="leaderboard-name">{row.display_name}{displayedMe?.user_id === row.user_id && <em>toi</em>}</span>
            <span className="leaderboard-trend up">{row.weekly_exercises} ex.</span>
            <span className="leaderboard-streak"><Flame size={13}/> {row.weekly_focus_minutes} min</span>
            <b>{xpFormat.format(row.weekly_xp)} XP</b>
          </div>)}
        </div>
      </>}
    </section>

    <section className="leaderboard-tip">
      <div>
        <span className="section-eyebrow">PROCHAIN PALIER</span>
        <h2>{displayedMe ? (displayedRows.length > 1 ? "Atteindre la place suivante." : "Construire une vraie série.") : "Synchroniser ton profil."}</h2>
        <p>{displayedMe ? (displayedRows[1] ? `Il te manque ${xpFormat.format(gapToSecond)} XP pour dépasser ${displayedRows[1].display_name}.` : `${meName}, tu es actuellement seul dans les données publiques du classement.`) : "Ton compte est connecté à mentimax-app, mais aucune liaison Menti n'est encore disponible pour ton profil."}</p>
      </div>
      <Trophy size={28}/>
    </section>
  </main>;
}
