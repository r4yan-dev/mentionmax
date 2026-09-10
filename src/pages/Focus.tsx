import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, MessageCircle, Radio, Sparkles, Users } from "lucide-react";
import { FocusTimer } from "../components/focus/FocusTimer";
import SocialStudyFeatures from "../components/social/SocialStudyFeatures";
import collaboratingPerson from "../assets/people/students-collaborating.webp";
import collaboratingBg from "../assets/people-bg/students-collaborating-bg.webp";
import { getLeaderboard } from "../features/focus/supabase";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { useFocus } from "../context/FocusContext";
import { supabase } from "../lib/supabase";
import mentionmaxMark from "../assets/brand/mentionmax-mark.svg";
import "../styles/focus-people.css";
import "./SocialStudy.css";
import "../components/social/SocialStudyFeatures.css";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).map((part) => part.charAt(0)).join("").slice(0, 2).toUpperCase() || "É";
}

function formatMinutes(seconds: number) {
  return `${Math.floor(seconds / 60)} min`;
}

type PresenceUser = { userId: string; displayName: string; joinedAt: number };
type LeaderEntry = Awaited<ReturnType<typeof getLeaderboard>>[number];

export default function Focus() {
  const { user } = useAuth();
  const { profile } = useAccount();
  const { groups } = useFocus();
  const [groupRankings, setGroupRankings] = useState<Record<string, Awaited<ReturnType<typeof getLeaderboard>>>>({});
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id ?? "");
  const [online, setOnline] = useState<PresenceUser[]>([]);
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const selectedGroup = useMemo(() => groups.find((group) => group.id === selectedGroupId) ?? groups[0] ?? null, [groups, selectedGroupId]);

  useEffect(() => {
    if (!selectedGroup && groups.length) setSelectedGroupId(groups[0].id);
  }, [groups, selectedGroup]);

  useEffect(() => {
    let cancelled = false;
    async function loadRankings() {
      if (!groups.length) {
        setGroupRankings({});
        return;
      }
      const entries = await Promise.all(groups.map(async (group) => {
        try {
          return [group.id, await getLeaderboard(group.id, "week")] as const;
        } catch (error) {
          console.error(`Impossible de charger le classement du groupe ${group.id}:`, error);
          return [group.id, []] as const;
        }
      }));
      if (!cancelled) setGroupRankings(Object.fromEntries(entries));
    }
    void loadRankings();
    return () => { cancelled = true; };
  }, [groups]);

  useEffect(() => {
    if (!selectedGroupId || !user?.id) {
      setOnline([]);
      return;
    }
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
    if (!selectedGroupId) {
      setLeaders([]);
      return;
    }
    let cancelled = false;
    getLeaderboard(selectedGroupId, "week").then((rows) => { if (!cancelled) setLeaders(rows.slice(0, 5)); }).catch(() => { if (!cancelled) setLeaders([]); });
    return () => { cancelled = true; };
  }, [selectedGroupId]);

  async function copyCode() {
    if (!selectedGroup?.inviteCode) return;
    try {
      await navigator.clipboard?.writeText(selectedGroup.inviteCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="app-page">
      <header className="page-header">
        <span className="section-eyebrow">Focus · Communauté</span>
        <h1 className="page-title">Ton espace pour travailler seul ou ensemble.</h1>
        <p className="page-lead">Lance un focus, retrouve ton groupe, vois qui travaille en direct et garde toute la vie sociale de tes révisions au même endroit.</p>
      </header>

      <FocusTimer />

      {selectedGroup ? (
        <>
          <section className="social-room-grid">
            <div className="social-room-card card">
              <div className="social-room-card__header">
                <div>
                  <span className="section-eyebrow">Salle d'étude</span>
                  <h2>{selectedGroup.name}</h2>
                  <p>Code d'invitation · <strong>{selectedGroup.inviteCode}</strong></p>
                </div>
                <select className="input" value={selectedGroup.id} onChange={(event) => setSelectedGroupId(event.target.value)} aria-label="Choisir un groupe">
                  {groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
                </select>
              </div>
              <div className="social-room-live"><div className="social-live-ring"><Radio size={19}/></div><div><strong>Présence en direct</strong><span>{online.length ? `${online.length} élève${online.length > 1 ? "s" : ""} dans la salle maintenant.` : "Tu es le premier dans la salle."}</span></div></div>
              <div className="social-online-list">
                {online.map((person) => <div className="social-online-person" key={`${person.userId}-${person.joinedAt}`}><span className="social-avatar">{getInitials(person.displayName)}</span><div><strong>{person.displayName}{person.userId === user?.id ? " · toi" : ""}</strong><span>En train de travailler</span></div><span className="social-online-dot"/></div>)}
              </div>
              <div className="social-room-actions">
                <button type="button" className="btn btn-primary" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Sparkles size={15}/> Continuer mon focus</button>
                <Link className="btn btn-secondary" to={`/focus/groups/${selectedGroup.id}/chat`}><MessageCircle size={15}/> Ouvrir le chat</Link>
                <button type="button" className="btn btn-ghost" onClick={() => void copyCode()}><Copy size={15}/> {copied ? "Copié" : "Inviter"}</button>
              </div>
            </div>

            <div className="social-leader-card card">
              <div className="social-card-heading"><div><span className="section-eyebrow">Cette semaine</span><h2>Qui garde le rythme ?</h2></div><Link to={`/focus/groups/${selectedGroup.id}`} aria-label="Ouvrir le groupe"><Users size={17}/></Link></div>
              <div className="social-leader-list">
                {leaders.length ? leaders.map((entry, index) => <div className="social-leader-row" key={entry.userId}><strong className="social-leader-rank">#{index + 1}</strong><span className="social-avatar">{entry.avatarUrl ? <img src={entry.avatarUrl} alt=""/> : getInitials(entry.displayName)}</span><div><strong>{entry.displayName}</strong><span>{formatMinutes(entry.totalSeconds)} de focus</span></div><b>{index === 0 ? "🏆" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}</b></div>) : <div className="social-muted">Aucune session cette semaine. Le classement attend désespérément quelqu'un.</div>}
              </div>
            </div>
          </section>

          <SocialStudyFeatures groupId={selectedGroup.id} />
        </>
      ) : (
        <section className="focus-group-feature" style={{ backgroundImage: `url(${collaboratingBg})` }}>
          <div className="focus-group-feature__content">
            <span className="focus-group-feature__eyebrow">Focus Group</span>
            <h2>Travaille à plusieurs.</h2>
            <p>Crée ou rejoins un groupe pour ajouter présence, chat, statistiques et classement à tes sessions de focus.</p>
            <div className="focus-group-feature__actions">
              <Link to="/focus/groups/new" className="btn btn-primary">Créer un groupe</Link>
              <Link to="/focus/groups/join" className="btn btn-ghost">Rejoindre un groupe</Link>
            </div>
          </div>
          <div className="focus-group-feature__person"><img src={collaboratingPerson} alt="" aria-hidden="true" /></div>
        </section>
      )}

      <section className="focus-groups-section">
        <div className="section-heading-row"><div><span className="section-eyebrow">Mes groupes</span><h2 className="section-title">Tous tes espaces de travail</h2></div></div>
        {groups.length === 0 ? (
          <div className="card focus-empty-groups"><div className="focus-empty-groups__icon">👥</div><h2>Aucun groupe pour le moment.</h2><p>Crée ton premier groupe ou rejoins celui de ta classe avec un code.</p><div><Link to="/focus/groups/new" className="btn btn-primary">Créer mon groupe</Link></div></div>
        ) : (
          <div className="focus-group-grid">
            {groups.map((group) => {
              const ranking = groupRankings[group.id] ?? [];
              const topThree = ranking.slice(0, 3);
              const topAverage = topThree.length ? Math.round(topThree.reduce((sum, entry) => sum + entry.totalSeconds, 0) / topThree.length) : 0;
              const averageMinutes = Math.floor(topAverage / 60);
              return <Link key={group.id} to={`/focus/groups/${group.id}`} className="focus-group-card">
                {group.badge?.imageUrl ? <img src={group.badge.imageUrl} alt="" className="focus-group-card__badge-image" style={{ width: "45px", height: "45px", minWidth: "45px", minHeight: "45px", objectFit: "cover", display: "block", borderRadius: "10px", flexShrink: 0 }}/> : group.badge?.emoji ? <span>{group.badge.emoji}</span> : <img src={mentionmaxMark} alt="MentionMax" className="focus-group-card__brand-mark"/>}
                <div className="focus-group-card__body"><div className="focus-group-card__top"><div><span className="focus-group-card__type">{group.type === "school" ? "École" : group.type === "class" ? "Classe" : "Privé"}</span><h3>{group.name}</h3></div><span className="focus-group-card__arrow">↗</span></div><div className="focus-group-card__meta"><span>👥 {group.memberIds.length} membre{group.memberIds.length !== 1 ? "s" : ""}</span>{topThree.length ? <span>Top {topThree.length} cette semaine{averageMinutes > 0 ? ` · moy. ${averageMinutes} min` : ""}</span> : <span>Aucun focus cette semaine</span>}</div><div className="focus-group-card__members">{ranking.slice(0, 4).map((member) => <span key={member.userId} className="mini-avatar focus-group-card__member-preview" title={member.displayName}>{member.avatarUrl ? <img src={member.avatarUrl} alt={member.displayName} className="focus-group-card__member-preview-image"/> : getInitials(member.displayName)}</span>)}</div></div>
              </Link>;
            })}
          </div>
        )}
      </section>
    </main>
  );
}
