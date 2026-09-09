import { useEffect, useMemo, useState } from "react";
import { Bell, BookOpen, Check, ExternalLink, Flag, Plus, Trophy, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFocus } from "../../context/FocusContext";
import { supabase } from "../../lib/supabase";
import { getMyGroupRole } from "../../features/focus/supabase";

type ChallengeRow = {
  challenge_id: string;
  title: string;
  description: string | null;
  metric: "focus_minutes" | "focus_sessions";
  target: number;
  starts_at: string;
  ends_at: string;
  created_by: string;
  display_name: string;
  member_user_id: string;
  progress: number;
  rank: number;
};

type ResourceRow = {
  id: string;
  title: string;
  description: string | null;
  resource_type: "course" | "exercise" | "quiz" | "document" | "external";
  target_url: string;
  created_at: string;
  created_by: string;
};

type AnnouncementRow = {
  id: string;
  message: string;
  created_at: string;
  created_by: string;
};

function daysLeft(value: string) {
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86400000));
}

function metricLabel(metric: ChallengeRow["metric"]) {
  return metric === "focus_minutes" ? "minutes de focus" : "sessions de focus";
}

export default function SocialStudyFeatures({ groupId }: { groupId: string }) {
  const { user } = useAuth();
  const { groups } = useFocus();
  const selectedGroup = useMemo(() => groups.find((group) => group.id === groupId) ?? null, [groups, groupId]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [resources, setResources] = useState<ResourceRow[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementRow[]>([]);
  const [role, setRole] = useState<"owner" | "admin" | "member" | null>(null);
  const [busy, setBusy] = useState(false);
  const [showChallengeForm, setShowChallengeForm] = useState(false);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeTarget, setChallengeTarget] = useState(120);
  const [challengeMetric, setChallengeMetric] = useState<ChallengeRow["metric"]>("focus_minutes");
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [resourceType, setResourceType] = useState<ResourceRow["resource_type"]>("course");
  const [announcement, setAnnouncement] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    const [{ data: challengeData, error: challengeError }, { data: resourceData, error: resourceError }, { data: announcementData, error: announcementError }, currentRole] = await Promise.all([
      supabase.rpc("get_social_challenge_dashboard", { p_group_id: groupId }),
      supabase.from("group_resources").select("id,title,description,resource_type,target_url,created_at,created_by").eq("group_id", groupId).order("created_at", { ascending: false }).limit(8),
      supabase.from("group_announcements").select("id,message,created_at,created_by").eq("group_id", groupId).order("created_at", { ascending: false }).limit(4),
      getMyGroupRole(groupId),
    ]);
    if (challengeError) throw challengeError;
    if (resourceError) throw resourceError;
    if (announcementError) throw announcementError;
    setChallenges((challengeData ?? []) as ChallengeRow[]);
    setResources((resourceData ?? []) as ResourceRow[]);
    setAnnouncements((announcementData ?? []) as AnnouncementRow[]);
    setRole(currentRole);
  }

  useEffect(() => {
    void load().catch((error) => setNotice(error instanceof Error ? error.message : "Impossible de charger la communauté."));
  }, [groupId]);

  async function createChallenge() {
    if (!user?.id || !challengeTitle.trim()) return;
    setBusy(true); setNotice("");
    try {
      const now = new Date();
      const end = new Date(now.getTime() + 7 * 86400000);
      const { error } = await supabase.from("group_challenges").insert({
        group_id: groupId,
        created_by: user.id,
        title: challengeTitle.trim(),
        description: `Objectif collectif : ${challengeTarget} ${metricLabel(challengeMetric)} en 7 jours.`,
        metric: challengeMetric,
        target: challengeTarget,
        starts_at: now.toISOString(),
        ends_at: end.toISOString(),
      });
      if (error) throw error;
      setChallengeTitle(""); setShowChallengeForm(false); await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Impossible de créer le challenge."); }
    finally { setBusy(false); }
  }

  async function createResource() {
    if (!user?.id || !resourceTitle.trim() || !resourceUrl.trim()) return;
    setBusy(true); setNotice("");
    try {
      const { error } = await supabase.from("group_resources").insert({ group_id: groupId, created_by: user.id, title: resourceTitle.trim(), resource_type: resourceType, target_url: resourceUrl.trim() });
      if (error) throw error;
      setResourceTitle(""); setResourceUrl(""); setShowResourceForm(false); await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Impossible de partager la ressource."); }
    finally { setBusy(false); }
  }

  async function createAnnouncement() {
    if (!user?.id || !announcement.trim()) return;
    setBusy(true); setNotice("");
    try {
      const { error } = await supabase.from("group_announcements").insert({ group_id: groupId, created_by: user.id, message: announcement.trim() });
      if (error) throw error;
      setAnnouncement(""); setShowAnnouncementForm(false); await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Impossible de publier l'annonce."); }
    finally { setBusy(false); }
  }

  const visibleChallenge = challenges[0] ?? null;
  const rankedMembers = visibleChallenge ? challenges.filter((row) => row.challenge_id === visibleChallenge.challenge_id).sort((a, b) => a.rank - b.rank).slice(0, 5) : [];

  return (
    <section className="social-community-features">
      <div className="social-section-heading">
        <div><span className="section-eyebrow">Vie du groupe</span><h2>Étudier ensemble, pas seulement être connectés.</h2></div>
        {notice && <span className="social-notice">{notice}</span>}
      </div>

      <div className="social-feature-grid">
        <article className="social-feature-card social-challenge-card">
          <div className="social-feature-card__head"><div><span className="social-feature-kicker"><Trophy size={14}/> Challenge</span><h3>{visibleChallenge?.title ?? "Lancez votre premier défi"}</h3></div><Flag size={21}/></div>
          {visibleChallenge ? <>
            <p>{visibleChallenge.description}</p>
            <div className="social-challenge-meter"><span style={{ width: `${Math.min(100, Math.round(((visibleChallenge.progress ?? 0) / Math.max(1, visibleChallenge.target)) * 100))}%` }}/></div>
            <div className="social-challenge-meta"><strong>{visibleChallenge.progress} / {visibleChallenge.target}</strong><span>{metricLabel(visibleChallenge.metric)}</span><b>{daysLeft(visibleChallenge.ends_at)} j restants</b></div>
            <div className="social-mini-rankings">{rankedMembers.map((member) => <div key={`${member.challenge_id}-${member.member_user_id}`}><span>#{member.rank}</span><strong>{member.display_name}</strong><b>{member.progress}</b></div>)}</div>
          </> : <p>Un défi de 7 jours transforme immédiatement le groupe en objectif commun. Les progrès sont calculés à partir des vraies sessions de focus.</p>}
          <div className="social-feature-actions"><button type="button" className="btn btn-primary" onClick={() => setShowChallengeForm((value) => !value)}><Plus size={15}/> {visibleChallenge ? "Nouveau défi" : "Créer le défi"}</button></div>
          {showChallengeForm && <div className="social-inline-form"><input className="input" value={challengeTitle} onChange={(event) => setChallengeTitle(event.target.value)} placeholder="Ex. 120 minutes de focus" maxLength={120}/><div className="social-form-row"><select className="input" value={challengeMetric} onChange={(event) => setChallengeMetric(event.target.value as ChallengeRow["metric"])}><option value="focus_minutes">Minutes de focus</option><option value="focus_sessions">Nombre de sessions</option></select><input className="input" type="number" min={1} max={100000} value={challengeTarget} onChange={(event) => setChallengeTarget(Number(event.target.value) || 1)}/><button type="button" className="btn btn-secondary" disabled={busy || !challengeTitle.trim()} onClick={() => void createChallenge()}>{busy ? "..." : "Créer"}</button></div></div>}
        </article>

        <article className="social-feature-card social-resources-card">
          <div className="social-feature-card__head"><div><span className="social-feature-kicker"><BookOpen size={14}/> Ressources partagées</span><h3>Le meilleur contenu du groupe</h3></div><Users size={21}/></div>
          <div className="social-resource-list">{resources.length ? resources.map((resource) => <a href={resource.target_url} key={resource.id} className="social-resource-item"><span className="social-resource-icon"><BookOpen size={16}/></span><span><strong>{resource.title}</strong><small>{resource.resource_type} · partagé par un membre</small></span><ExternalLink size={14}/></a>) : <div className="social-muted">Aucune ressource partagée. Le groupe peut construire sa propre mini-bibliothèque.</div>}</div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowResourceForm((value) => !value)}><Plus size={15}/> Partager une ressource</button>
          {showResourceForm && <div className="social-inline-form"><input className="input" value={resourceTitle} onChange={(event) => setResourceTitle(event.target.value)} placeholder="Titre de la ressource" maxLength={140}/><input className="input" value={resourceUrl} onChange={(event) => setResourceUrl(event.target.value)} placeholder="URL (https://...)" maxLength={2000}/><div className="social-form-row"><select className="input" value={resourceType} onChange={(event) => setResourceType(event.target.value as ResourceRow["resource_type"])}><option value="course">Cours</option><option value="exercise">Exercice</option><option value="quiz">Quiz</option><option value="document">Document</option><option value="external">Externe</option></select><button type="button" className="btn btn-primary" disabled={busy || !resourceTitle.trim() || !resourceUrl.trim()} onClick={() => void createResource()}>{busy ? "..." : "Partager"}</button></div></div>}
        </article>
      </div>

      <article className="social-announcements-card">
        <div className="social-feature-card__head"><div><span className="social-feature-kicker"><Bell size={14}/> Annonces</span><h3>Ce qui compte cette semaine</h3></div>{(role === "owner" || role === "admin") && <button type="button" className="btn btn-ghost" onClick={() => setShowAnnouncementForm((value) => !value)}><Plus size={15}/> Publier</button>}</div>
        {showAnnouncementForm && <div className="social-announcement-form"><textarea className="input" value={announcement} onChange={(event) => setAnnouncement(event.target.value)} placeholder="Ex. Révision collective samedi à 18h" maxLength={500} rows={2}/><button type="button" className="btn btn-primary" disabled={busy || !announcement.trim()} onClick={() => void createAnnouncement()}>{busy ? "..." : "Publier l'annonce"}</button></div>}
        <div className="social-announcements-list">{announcements.length ? announcements.map((item) => <div key={item.id} className="social-announcement"><div className="social-announcement-dot"><Check size={13}/></div><div><strong>{item.message}</strong><small>{new Date(item.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</small></div></div>) : <div className="social-muted">Pas encore d'annonce. Un admin peut lancer la première activité du groupe.</div>}</div>
      </article>
    </section>
  );
}
