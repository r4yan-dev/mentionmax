import { useEffect, useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, LoaderCircle, RefreshCw, Target, Zap } from "lucide-react";
import type { LessonDocument, SubjectId, TrackId } from "../../types/academic";
import { useAuth } from "../../context/AuthContext";
import { getCourseJourney, type LearningJourney } from "../../services/learning/weakPointsTutor";
import AdaptiveQuizPanel from "./AdaptiveQuizPanel";
import "./LessonJourneyPanel.css";

type Props = { lesson: LessonDocument; subjectId: SubjectId; trackId: TrackId };

export default function LessonJourneyPanel({ lesson, subjectId, trackId }: Props) {
  const { user } = useAuth();
  const [journey, setJourney] = useState<LearningJourney | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [practiceOpen, setPracticeOpen] = useState(false);

  async function load(options?: { force?: boolean }) {
    if (!user) return;
    setLoading(true); setError(null);
    try {
      setJourney(await getCourseJourney({
        trackId, subjectId, lessonId: lesson.id, courseTitle: lesson.title, chapter: lesson.chapter, topic: lesson.topic,
        intro: lesson.blocks.find((block) => block.type === "intro")?.text,
        objectives: lesson.blocks.filter((block) => block.type === "concept" || block.type === "method" || block.type === "recap").flatMap((block) => block.items ?? (block.title ? [block.title] : [])).slice(0, 6),
      }, options));
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible de construire ton parcours."); }
    finally { setLoading(false); }
  }

  useEffect(() => { setPracticeOpen(false); void load(); }, [lesson.id, subjectId, trackId, user?.id]);

  if (!user) return null;
  if (loading && !journey) return <section className="lesson-journey"><div className="lesson-journey__loading"><LoaderCircle size={18} className="spin" /><span>Analyse de ton historique pour préparer la suite…</span></div></section>;
  if (error && !journey) return <section className="lesson-journey"><div className="lesson-journey__error"><span>{error}</span><button type="button" onClick={() => void load()}><RefreshCw size={14} /> Réessayer</button></div></section>;
  if (!journey) return null;

  const objectives = lesson.blocks.filter((block) => block.type === "concept" || block.type === "method" || block.type === "recap").flatMap((block) => block.items ?? (block.title ? [block.title] : [])).slice(0, 6);
  return <section className="lesson-journey">
    <div className="lesson-journey__header"><div><span className="lessons-eyebrow">TON PARCOURS ADAPTATIF</span><h2>Comprendre → appliquer → vérifier</h2><p>La suite est choisie à partir de ce que tu viens de voir et de ce que tu rates habituellement.</p></div><button type="button" className="lesson-journey__refresh" onClick={() => { setPracticeOpen(false); void load({ force: true }); }} disabled={loading}><RefreshCw size={14} /></button></div>
    <div className="lesson-journey__grid">
      <article className="lesson-journey__overview"><div className="lesson-journey__icon"><BrainCircuit size={17} /></div><div><span className="lesson-journey__label">À RETENIR</span><strong>{journey.courseOverview.whyItMatters}</strong><ul>{journey.courseOverview.goals.slice(0, 4).map((goal) => <li key={goal}><CheckCircle2 size={14} />{goal}</li>)}</ul></div></article>
      <article className="lesson-journey__action"><div className="lesson-journey__action-top"><span className="lesson-journey__label">PROCHAINE ÉTAPE</span><span className="lesson-journey__difficulty">Niveau {journey.nextAction.difficulty}/5</span></div><h3>{journey.nextAction.title}</h3><p>{journey.nextAction.reason}</p><div className="lesson-journey__chips">{journey.nextAction.conceptIds.slice(0, 4).map((concept) => <span key={concept}><Target size={12} />{concept}</span>)}</div><button type="button" className="lesson-journey__cta" onClick={() => setPracticeOpen((v) => !v)}><Zap size={15} />{practiceOpen ? "Fermer la pratique" : "Pratiquer maintenant"}<ArrowRight size={15} /></button></article>
    </div>
    {practiceOpen && <AdaptiveQuizPanel lessonId={lesson.id} courseTitle={lesson.title} chapter={lesson.chapter} topic={lesson.topic} intro={lesson.blocks.find((block) => block.type === "intro")?.text} objectives={objectives} subjectId={subjectId} trackId={trackId} nextAction={journey.nextAction} onFinished={() => { setPracticeOpen(false); void load({ force: true }); }} />}
    <div className="lesson-journey__footer"><span><strong>Si tu réussis :</strong> {journey.afterAction.success}</span><span><strong>Si tu bloques :</strong> {journey.afterAction.struggle}</span></div>
  </section>;
}
