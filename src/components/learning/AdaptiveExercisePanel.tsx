import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, LoaderCircle, Target } from "lucide-react";
import type { SubjectId, TrackId } from "../../types/academic";
import { LatexText } from "../ui/LatexText";
import { generateAdaptiveActivity, type AdaptiveExercise } from "../../services/learning/adaptivePractice";
import { recordLearningEvent } from "../../services/learning/weakPointsService";
import type { LearningJourney } from "../../services/learning/weakPointsTutor";

type Props = { lessonId: string; courseTitle: string; chapter: string; topic: string; intro?: string; objectives?: string[]; subjectId: SubjectId; trackId: TrackId; nextAction: LearningJourney["nextAction"]; onFinished: () => void };
function text(v: unknown) { return typeof v === "string" ? v : String(v ?? ""); }
function normalize(v: string) { return v.toLowerCase().trim().replace(/\s+/g, "").replace(/,/g, "."); }
function difficultyValue(v: number) { return Math.max(1, Math.min(5, Math.round(v || 2))); }

export default function AdaptiveExercisePanel(props: Props) {
  const [activity, setActivity] = useState<AdaptiveExercise | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const score = useMemo(() => activity?.parts.reduce((sum, part) => sum + (checked[part.id] ? part.points : 0), 0) ?? 0, [activity, checked]);
  const total = useMemo(() => activity?.parts.reduce((sum, part) => sum + part.points, 0) ?? 0, [activity]);

  async function start() {
    setLoading(true); setError(null); setAnswers({}); setChecked({});
    try {
      const next = await generateAdaptiveActivity({ lessonId: props.lessonId, courseTitle: props.courseTitle, chapter: props.chapter, topic: props.topic, intro: props.intro, objectives: props.objectives, subjectId: props.subjectId, trackId: props.trackId, nextAction: props.nextAction });
      if (next.kind !== "exercise") throw new Error("Le tuteur a choisi un quiz au lieu d'un exercice.");
      setActivity(next);
    } catch (err) { setError(err instanceof Error ? err.message : "Impossible de générer cet exercice."); }
    finally { setLoading(false); }
  }

  function check(partId: string) {
    if (!activity) return;
    const part = activity.parts.find((item) => item.id === partId);
    if (!part || checked[partId]) return;
    const value = normalize(answers[partId] ?? "");
    if (!value) return;
    const valid = part.acceptedAnswers.some((accepted) => normalize(accepted) === value);
    setChecked((current) => ({ ...current, [partId]: valid }));
    void recordLearningEvent({ source: "exercise", subjectId: props.subjectId, trackId: props.trackId, chapter: props.chapter, topic: props.topic, conceptId: part.conceptIds[0] ?? props.topic ?? props.chapter, outcome: valid ? "correct" : "incorrect", pointsEarned: valid ? part.points : 0, pointsPossible: part.points, difficulty: difficultyValue(part.difficulty), mistakeType: valid ? null : "answer_mismatch", metadata: { activity: "adaptive_structured", lessonId: props.lessonId, partId: part.id } });
  }

  async function finish() {
    if (!activity || finishing) return;
    const allAnswered = activity.parts.every((part) => checked[part.id] !== undefined);
    if (!allAnswered) return;
    setFinishing(true); setError(null);
    try { props.onFinished(); } catch (err) { setError(err instanceof Error ? err.message : "La mise à jour de ta progression a échoué."); } finally { setFinishing(false); }
  }

  if (!activity) return <div className="lesson-adaptive-quiz"><div className="lesson-adaptive-quiz__intro"><div><span className="lessons-eyebrow">EXERCICE BAC ADAPTATIF</span><h3>{props.nextAction.title}</h3><p>{props.nextAction.reason}</p><div className="lesson-adaptive-quiz__chips">{props.nextAction.conceptIds.slice(0, 5).map((concept) => <span key={concept}><Target size={12} />{concept}</span>)}</div></div><button type="button" className="lesson-journey__cta" onClick={() => void start()} disabled={loading}>{loading ? <><LoaderCircle size={15} className="spin" /> Génération…</> : <>Commencer <ArrowRight size={15} /></>}</button></div>{error && <div className="lesson-journey__error"><span>{error}</span><button type="button" onClick={() => void start()}>Réessayer</button></div>}</div>;

  return <div className="lesson-adaptive-quiz"><div className="lesson-adaptive-quiz__head"><div><span className="lessons-eyebrow">{activity.title}</span><p>{activity.subtitle}</p></div><strong>{score} / {total} pts</strong></div><article className="lesson-adaptive-quiz__question"><div className="lesson-adaptive-quiz__question-top"><span>EXERCICE UNIQUE</span><strong>Niveau {activity.difficulty}/5</strong></div><div><LatexText>{text(activity.statement)}</LatexText></div><div style={{ marginTop: 18 }}>{activity.parts.map((part) => <section key={part.id} style={{ padding: "16px 0", borderTop: "1px solid rgba(7,59,58,.09)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{part.label}</strong><span>{part.points} pt · N{part.difficulty}</span></div><p><LatexText>{text(part.prompt)}</LatexText></p><input value={answers[part.id] ?? ""} onChange={(e) => setAnswers((current) => ({ ...current, [part.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") check(part.id); }} disabled={checked[part.id] !== undefined} placeholder="Ta réponse" style={{ width: "100%", boxSizing: "border-box", padding: 12, borderRadius: 10, border: "1px solid rgba(7,59,58,.16)" }} /><div style={{ display: "flex", gap: 8, marginTop: 9 }}><button type="button" className="lesson-journey__refresh" onClick={() => void recordLearningEvent({ source: "exercise", subjectId: props.subjectId, trackId: props.trackId, chapter: props.chapter, topic: props.topic, conceptId: part.conceptIds[0] ?? props.topic ?? props.chapter, outcome: "skipped", difficulty: difficultyValue(part.difficulty), metadata: { activity: "adaptive_structured", partId: part.id, usedHint: true } })}>Indice</button><button type="button" className="lesson-journey__cta" onClick={() => check(part.id)} disabled={!answers[part.id]?.trim() || checked[part.id] !== undefined}>Vérifier</button></div>{checked[part.id] !== undefined && <div className={`lesson-adaptive-quiz__feedback ${checked[part.id] ? "is-correct" : "is-wrong"}`}><strong>{checked[part.id] ? "Correct" : "À retravailler"}</strong><p><LatexText>{text(checked[part.id] ? part.explanation : `Réponse attendue : ${part.acceptedAnswers[0]}. ${part.explanation}`)}</LatexText></p></div>}</section>)}</div></article>{error && <div className="lesson-journey__error"><span>{error}</span></div>}<div className="lesson-adaptive-quiz__controls"><button type="button" className="lesson-journey__cta" disabled={finishing || activity.parts.some((part) => checked[part.id] === undefined)} onClick={() => void finish()}>{finishing ? <><LoaderCircle size={15} className="spin" /> Mise à jour…</> : <>Terminer · {score}/{total} <CheckCircle2 size={15} /></>}</button></div></div>;
}
