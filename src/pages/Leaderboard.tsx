import { useMemo } from "react";
import { ArrowUp, Crown, Flame, Medal, Trophy } from "lucide-react";
import { useAccount } from "../context/AccountContext";
import { resolveUserPath, pathLabels } from "../data/curriculum/secondBac";
import "./Leaderboard.css";

type Row = { rank: number; name: string; xp: number; trend: number; streak: number };
const demoRows: Row[] = [
  { rank: 1, name: "Sara", xp: 1240, trend: 2, streak: 14 },
  { rank: 2, name: "Youssef", xp: 1180, trend: 1, streak: 9 },
  { rank: 3, name: "Toi", xp: 1120, trend: 1, streak: 5 },
  { rank: 4, name: "Adam", xp: 980, trend: -1, streak: 7 },
  { rank: 5, name: "Aya", xp: 930, trend: 3, streak: 6 },
  { rank: 6, name: "Omar", xp: 880, trend: -2, streak: 4 },
  { rank: 7, name: "Imane", xp: 840, trend: 1, streak: 3 },
];
const xpFormat = new Intl.NumberFormat("fr-FR");

export default function Leaderboard() {
  const { schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const rows = useMemo(() => demoRows, []);
  const me = rows.find((row) => row.name === "Toi")!;
  const gap = Math.max(0, rows[0].xp - me.xp);
  const gapToSecond = Math.max(0, rows[1].xp - me.xp);

  return <main className="section container leaderboard-page">
    <header className="leaderboard-header"><div><span className="section-eyebrow">CLASSEMENT</span><h1>Mesure-toi au rythme des autres.</h1><p>{pathLabels[path]} · classement hebdomadaire basé sur l’XP gagné.</p></div><div className="leaderboard-header__badge"><Trophy size={18}/><strong>#{me.rank}</strong><span>cette semaine</span></div></header>
    <section className="leaderboard-stats">
      <div className="card"><span>Ta position</span><strong>#{me.rank}</strong><small>+{me.trend} place</small></div>
      <div className="card"><span>XP</span><strong>{xpFormat.format(me.xp)}</strong><small>cette semaine</small></div>
      <div className="card"><span>Série</span><strong>{me.streak} jours</strong><small>rythme actuel</small></div>
      <div className="card"><span>Écart #1</span><strong>{xpFormat.format(gap)} XP</strong><small>à combler</small></div>
    </section>
    <section className="card leaderboard-board">
      <div className="leaderboard-board__top"><div><span className="section-eyebrow">CLASSEMENT HEBDOMADAIRE</span><h2>Cette semaine</h2></div><span className="leaderboard-live"><i/> Données prêtes pour Supabase</span></div>
      <div className="leaderboard-podium">{rows.slice(0,3).map((row)=><div className={`leader-podium-card rank-${row.rank}`} key={row.rank}><div className="leader-podium-medal">{row.rank===1?<Crown size={18}/>:row.rank===2?<Medal size={18}/>:<Trophy size={18}/>}</div><strong>#{row.rank}</strong><span>{row.name}</span><b>{xpFormat.format(row.xp)} XP</b></div>)}</div>
      <div className="leaderboard-list">{rows.map((row)=><div className={`leaderboard-row${row.name==="Toi"?" current":""}`} key={row.rank}><strong>#{row.rank}</strong><span className="leaderboard-name">{row.name}{row.name==="Toi"&&<em>toi</em>}</span><span className={`leaderboard-trend ${row.trend>=0?"up":"down"}`}>{row.trend>=0?<ArrowUp size={13}/>:<ArrowUp size={13} style={{transform:"rotate(180deg)"}}/>}{Math.abs(row.trend)}</span><span className="leaderboard-streak"><Flame size={13}/> {row.streak}</span><b>{xpFormat.format(row.xp)} XP</b></div>)}</div>
    </section>
    <section className="leaderboard-tip"><div><span className="section-eyebrow">PROCHAIN PALIER</span><h2>Atteindre la 2e place.</h2><p>Il te manque {xpFormat.format(gapToSecond)} XP pour dépasser Youssef dans cette maquette. Les vraies données viendront du moteur de progression.</p></div><Trophy size={28}/></section>
  </main>;
}
