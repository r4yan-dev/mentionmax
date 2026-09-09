import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock3, Copy, MessageCircle, Radio, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { useFocus } from "../context/FocusContext";
import { supabase } from "../lib/supabase";
import { getLeaderboard } from "../features/focus/supabase";
import "./SocialStudy.css";

type PresenceUser = { userId: string; displayName: string; joinedAt: number };
type LeaderEntry = Awaited<ReturnType<typeof getLeaderboard>>[number];

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "É";
}

function formatMinutes(seconds: number) {
  return `${Math.floor(seconds / 60)} min`;
}

export default function SocialStudy() {
  const { user } = useAuth();
  const { profile } = useAccount();
  const { groups } = useFocus();
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "");
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedGroup = useMemo(() => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null, [groups, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroup && groups.length) setSelectedGroupId(groups[0].id);
  }, [groups, selectedGroup]);

  useEffect(() => {
    if (!selectedGroupId || !user?.id) return;
    let cancelled = false;
    const channel = supabase.channel(`study-room:${selectedGroupId}`, { config: { presence: { key: user.id } } });
    const syncPresence = () => {
      const state = channel.presenceState<PresenceUser>();
      const people = Object.values(state).flat().filter((person) => person && typeof person.userId === "string").sort((a, b) => a.joinedAt - b.joinedAt);
      if (!cancelled) setOnline(people);
    };
    channel.on("presence", { event: "sync" }, syncPresence).on("presence", { event: "join" }, syncPresence).on("presence", { event: "leave" }, syncPresence).subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({ userId: user.id, displayName: profile?.display_name || "Élève", joinedAt: Date.now() });
        syncPresence();
      }
    });
    return () => { cancelled = true; void channel.untrack(); void supabase.removeChannel(channel); };
  }, [selectedGroupId, user?.id, profile?.display_name]);

  useEffect(() => {
    if (!selectedGroupId) { setLeaders([]); return; }
    let cancelled = false;
    getLeaderboard(selectedGroupId, "week").then((rows) => { if (!cancelled) setLeaders(rows.slice(0, 5)); }).catch(() => { if (!cancelled) setLeaders([]); });
    return () => { cancelled = true; };
  }, [selectedGroupId]);

  async function copyCode() {
    if (!selectedGroup?.inviteCode) return;
    try { await navigator.clipboard?.writeText(selectedGroup.inviteCode); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  }

  if (!selectedGroup) {
    return (
      <main className="social-page app-page">
        <header className="social-hero"><span className="section-eyebrow">Communauté</span><h1>Étudie avec d'autres élèves.</h1><p>Crée ou rejoins un groupe pour travailler ensemble, partager vos progrès et garder une présence commune pendant les sessions.</p></header>
        <section className="social-empty card"><div className="social-empty__icon"><Users size={22}/></div><h2>Ton espace social est vide.</h2><p>Le premier pas est de rejoindre un groupe de classe ou de créer ton groupe privé.</p><div className="social-actions"><Link className="btn btn-primary" to="/focus/groups/new">Créer un groupe <ArrowRight size={15}/></Link><Link className="btn btn-secondary" to="/focus/groups/join">Rejoindre un groupe</Link></div></section>
      </main>
    );
  }

  return (
    <main className="social-page app-page">
      <header className="social-hero"><div><span className="section-eyebrow">Communauté · Study Room</span><h1>Travaillez ensemble, sans bavarder pendant 47 minutes.</h1><p>Une salle de travail en direct avec présence, focus partagé, classement hebdomadaire et accès instantané au chat du groupe.</p></div><div className="social-hero__status"><Radio size={15}/><span>{online.length} en ligne</span></div></header>

      <section className="social-room-grid">
        <div className="social-room-card card">
          <div className="social-room-card__header"><div><span className="section-eyebrow">Salle actuelle</span><h2>{selectedGroup.name}</h2><p>Code d'invitation · <strong>{selectedGroup.inviteCode}</strong></p></div><select className="input" value={selectedGroup.id} onChange={(event) => setSelectedGroupId(event.target.value)}>{groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></div>
          <div className="social-room-live"><div className="social-live-ring"><Radio size={19}/></div><div><strong>Présence en direct</strong><span>{online.length ? `${online.length} élève${online.length > 1 ? "s" : ""} dans la salle maintenant.` : "Tu es le premier dans la salle."}</span></div></div>
          <div className="social-online-list">{online.map((person) => <div className="social-online-person" key={`${person.userId}-${person.joinedAt}`}><span className="social-avatar">{initials(person.displayName)}</span><div><strong>{person.displayName}{person.userId === user?.id ? " · toi" : ""}</strong><span>En train de travailler</span></div><span className="social-online-dot"/></div>)}</div>
          <div className="social-room-actions"><Link className="btn btn-primary" to={`/focus?group=${selectedGroup.id}`}><Clock3 size={15}/> Commencer mon focus</Link><Link className="btn btn-secondary" to={`/focus/groups/${selectedGroup.id}/chat`}><MessageCircle size={15}/> Ouvrir le chat</Link><button type="button" className="btn btn-ghost" onClick={() => void copyCode()}><Copy size={15}/> {copied ? "Copié" : "Inviter"}</button></div>
        </div>

        <div className="social-leader-card card"><div className="social-card-heading"><div><span className="section-eyebrow">Cette semaine</span><h2>Qui garde le rythme ?</h2></div><Link to={`/focus/groups/${selectedGroup.id}`}><ArrowRight size={16}/></Link></div><div className="social-leader-list">{leaders.length ? leaders.map((entry, index) => <div className="social-leader-row" key={entry.userId}><strong className="social-leader-rank">#{index + 1}</strong><span className="social-avatar">{entry.avatarUrl ? <img src={entry.avatarUrl} alt=""/> : initials(entry.displayName)}</span><div><strong>{entry.displayName}</strong><span>{formatMinutes(entry.totalSeconds)} de focus</span></div><b>{index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}</b></div>) : <div className="social-muted">Aucune session cette semaine. Quelle occasion de remplir le classement.</div>}</div></div>
      </section>

      <section className="social-feature-strip"><div><span className="section-eyebrow">Collaboration</span><h2>Les outils sociaux sont maintenant reliés au vrai travail.</h2><p>Le focus en groupe nourrit les statistiques, le classement hebdomadaire et la présence en direct. Le chat reste disponible sans quitter ton groupe.</p></div><div className="social-feature-points"><div><CheckCircle2 size={16}/><span>Présence en temps réel</span></div><div><CheckCircle2 size={16}/><span>Focus individuel lié au groupe</span></div><div><CheckCircle2 size={16}/><span>Classement basé sur les sessions réelles</span></div><div><CheckCircle2 size={16}/><span>Chat de groupe instantané</span></div></div></section>

      <section className="social-bottom-grid"><Link className="social-bottom-card" to={`/focus/groups/${selectedGroup.id}/chat`}><MessageCircle size={19}/><div><span>Discussion</span><strong>Parler avec le groupe</strong><small>Questions, encouragements et coordination.</small></div><ArrowRight size={15}/></Link><Link className="social-bottom-card" to={`/focus/groups/${selectedGroup.id}/members`}><Users size={19}/><div><span>Membres</span><strong>Voir la classe</strong><small>Retrouve les membres et leurs rôles.</small></div><ArrowRight size={15}/></Link><Link className="social-bottom-card" to={`/focus/groups/${selectedGroup.id}/stats`}><BookOpen size={19}/><div><span>Stats</span><strong>Analyser l'activité</strong><small>Temps de focus et évolution du groupe.</small></div><ArrowRight size={15}/></Link></section>
    </main>
  );
}
