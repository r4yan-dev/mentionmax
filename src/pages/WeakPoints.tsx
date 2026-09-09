import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, Flame, RefreshCw, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath, type UserPath } from "../data/curriculum/secondBac";
import { getWeakPoints, type LearnerMastery } from "../services/learning/weakPointsService";
import "./WeakPoints.css";

const labels: Record<string, string> = {
  maths: "Mathématiques",
  "physique-chimie": "Physique-Chimie",
  svt: "SVT",
  anglais: "Anglais",
  philosophie: "Philosophie",
};

function masteryLabel(value: number) {
  if (value < 0.45) return "À renforcer";
  if (value < 0.65) return "Fragile";
  if (value < 0.8) return "En progrès";
  return "Maîtrisé";
}

function trendIcon(trend: LearnerMastery["trend"]) {
  if (trend === "improving") return <TrendingUp size={15} />;
  if (trend === "declining") return <TrendingDown size={15} />;
  return <Target size={15} />;
}

export default function WeakPoints() {
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const allowed = getTrackSubjects(path);
  const [subject, setSubject] = useState<string>(allowed[0]?.id ?? "maths");
  const [items, setItems] = useState<LearnerMastery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentSubjectName = labels[subject] ?? subjectCatalog[subject as keyof typeof subjectCatalog]?.name ?? subject;

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setItems(await getWeakPoints(subject, 12));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de charger tes points faibles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const first = allowed[0]?.id ?? "maths";
    setSubject((current) => allowed.some((item) => item.id === current) ? current : first);
  }, [path]);

  useEffect(() => {
    void load();
  }, [subject]);

  const confirmed = useMemo(() => items.filter((item) => item.attempts >= 3), [items]);
  const emerging = useMemo(() => items.filter((item) => item.attempts > 0 && item.attempts < 3), [items]);
  const average = useMemo(() => items.length ? Math.round(items.reduce((sum, item) => sum + item.mastery, 0) / items.length * 100) : 0, [items]);

  return (
    <main className="weak-points-page">
      <header className="weak-points-header">
        <div>
          <span className="weak-points-eyebrow">MÉMOIRE D’APPRENTISSAGE</span>
          <h1>Tes points faibles, sur la durée.</h1>
          <p>Chaque quiz et chaque correction affine cette carte. Une seule erreur ne suffit pas à te coller une étiquette.</p>
        </div>
        <button type="button" className="weak-points-refresh" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} /> Actualiser
        </button>
      </header>

      <section className="weak-points-controls">
        <div className="weak-points-subjects">
          {allowed.map((item) => (
            <button key={item.id} type="button" className={subject === item.id ? "active" : ""} onClick={() => setSubject(item.id)}>
              {item.name}
            </button>
          ))}
        </div>
        <div className="weak-points-stats">
          <span><BrainCircuit size={15} /> {items.length} notions suivies</span>
          <span><Flame size={15} /> {confirmed.length} points faibles confirmés</span>
          <span><CheckCircle2 size={15} /> {average}% maîtrise moyenne</span>
        </div>
      </section>

      {error ? (
        <section className="weak-points-state">
          <strong>Impossible de charger les données.</strong>
          <p>{error}</p>
          <button type="button" onClick={() => void load()}>Réessayer</button>
        </section>
      ) : loading ? (
        <section className="weak-points-state"><span className="weak-points-loader" /> Analyse de ta progression…</section>
      ) : !items.length ? (
        <section className="weak-points-empty">
          <div className="weak-points-empty__icon"><Target size={22} /></div>
          <span className="weak-points-eyebrow">{currentSubjectName.toUpperCase()}</span>
          <h2>Pas encore assez de données.</h2>
          <p>Fais quelques exercices ou quiz avec cette matière. MentionMax commencera ensuite à distinguer les vrais blocages des erreurs isolées.</p>
          <Link to={`/lecons/${subject}`} className="weak-points-primary">Revoir le cours <ArrowRight size={15} /></Link>
        </section>
      ) : (
        <>
          {confirmed.length > 0 && (
            <section className="weak-points-section">
              <div className="weak-points-section__heading"><div><span className="weak-points-eyebrow">PRIORITÉ</span><h2>À retravailler maintenant</h2></div><span>{confirmed.length} notions</span></div>
              <div className="weak-points-grid">
                {confirmed.map((item) => <WeakPointCard key={`${item.subject_id}-${item.concept_id}`} item={item} />)}
              </div>
            </section>
          )}
          {emerging.length > 0 && (
            <section className="weak-points-section weak-points-section--soft">
              <div className="weak-points-section__heading"><div><span className="weak-points-eyebrow">À SURVEILLER</span><h2>Signaux émergents</h2></div><span>{emerging.length} notions</span></div>
              <div className="weak-points-grid">{emerging.map((item) => <WeakPointCard key={`${item.subject_id}-${item.concept_id}`} item={item} />)}</div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function WeakPointCard({ item }: { item: LearnerMastery }) {
  const percent = Math.round(item.mastery * 100);
  return (
    <article className={`weak-point-card weak-point-card--${item.trend}`}>
      <div className="weak-point-card__top">
        <span className="weak-point-card__subject">{labels[item.subject_id] ?? item.subject_id}</span>
        <span className="weak-point-trend">{trendIcon(item.trend)} {item.trend === "improving" ? "En hausse" : item.trend === "declining" ? "En baisse" : "Stable"}</span>
      </div>
      <h3>{item.concept_id || item.topic || item.chapter || "Notion générale"}</h3>
      <p>{[item.chapter, item.topic].filter(Boolean).join(" · ") || "Notion suivie automatiquement"}</p>
      <div className="weak-point-meter"><span style={{ width: `${Math.max(4, percent)}%` }} /></div>
      <div className="weak-point-card__meta"><strong>{percent}%</strong><span>{masteryLabel(item.mastery)}</span><span>{item.attempts} tentatives</span></div>
      {item.recent_mistakes?.length ? <div className="weak-point-card__mistake">Dernier signal : {item.recent_mistakes[0]}</div> : null}
      <Link to={`/lecons/${item.subject_id}`} className="weak-point-card__action">Revoir et pratiquer <ArrowRight size={14} /></Link>
    </article>
  );
}
