import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Check, FileText, Layers3, ListChecks, LoaderCircle, PlaySquare, RefreshCw, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { generateStudioResource, type StudioGenerationMode } from "../services/ai/studioGenerate";
import { supabase } from "../lib/supabase";
import { LatexText } from "../components/ui/LatexText";
import "./AiStudioGenerator.css";

type ResultRecord = Record<string, unknown>;
type TranscriptSegment = { start: number; duration: number; text: string };
type TranscriptResult = { video: { id: string; title: string; author: string | null; thumbnail: string }; transcript: { language: string; languageCode: string; isGenerated: boolean; segments: TranscriptSegment[]; source?: string } };
type EducationGateResult = { allowed: boolean; title: string | null; author: string | null; reason: string | null };
type Mode = { id: StudioGenerationMode; title: string; text: string; icon: typeof FileText };

const modes: Mode[] = [
  { id: "handnote", title: "Leçon Menti", text: "Cours long, complet et manuscrit, reconstruit pour apprendre.", icon: FileText },
  { id: "summary", title: "Résumé", text: "Une synthèse claire et directement révisable.", icon: BookOpen },
  { id: "flashcards", title: "Flashcards", text: "Questions-réponses prêtes à mémoriser.", icon: Layers3 },
  { id: "quiz", title: "Quiz", text: "QCM avec réponse correcte et explication.", icon: ListChecks },
];

function stringifyValue(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? `• ${item}` : JSON.stringify(item)).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function LatexValue({ value, className, display = false }: { value: unknown; className?: string; display?: boolean }) {
  return <LatexText className={className} display={display}>{stringifyValue(value)}</LatexText>;
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

async function getFunctionErrorMessage(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as { error?: string; detail?: string };
      if (payload?.detail) return `${payload.error ?? "Impossible de traiter la vidéo."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
    return `Le service a répondu avec une erreur HTTP (${error.context?.status ?? "inconnue"}).`;
  }
  return error instanceof Error ? error.message : "Impossible de contacter le service YouTube.";
}

function TextList({ items, display = false, className = "" }: { items: unknown; display?: boolean; className?: string }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return <ul className={`generator-lesson-list ${className}`.trim()}>{items.map((item, index) => <li key={index}><LatexValue value={item} display={display} /></li>)}</ul>;
}

function LessonResultView({ result }: { result: ResultRecord }) {
  const title = typeof result.title === "string" ? result.title : "Leçon Menti";
  const sections = Array.isArray(result.sections) ? result.sections as ResultRecord[] : [];
  const checkpoints = (section: ResultRecord) => Array.isArray(section.checkpoints) ? section.checkpoints as ResultRecord[] : [];
  return <div className="generator-result generator-lesson">
    <div className="generator-result__head generator-lesson__title-card"><div><span className="generator-eyebrow"><Check size={14} /> LEÇON MENTI · TERMINÉE</span><h2><LatexValue value={title} /></h2></div></div>
    {typeof result.intro === "string" && <section className="generator-lesson__intro"><span className="generator-result__label">Introduction</span><p><LatexValue value={result.intro} /></p></section>}
    <div className="generator-lesson__meta-grid">
      <section><span className="generator-result__label">Prérequis</span><TextList items={result.prerequisites} /></section>
      <section><span className="generator-result__label">Objectifs</span><TextList items={result.learningObjectives} /></section>
    </div>
    <div className="generator-lesson__sections">
      {sections.map((section, index) => <article className="generator-lesson__section" key={`${String(section.title)}-${index}`}>
        <div className="generator-lesson__section-number">{String(index + 1).padStart(2, "0")}</div>
        <div className="generator-lesson__section-body">
          <h3><LatexValue value={typeof section.title === "string" ? section.title : `Partie ${index + 1}`} /></h3>
          {typeof section.explanation === "string" && <p className="generator-lesson__explanation"><LatexValue value={section.explanation} /></p>}
          {typeof section.intuition === "string" && section.intuition.trim() && <div className="generator-lesson__callout"><strong>💡 Intuition</strong><p><LatexValue value={section.intuition} /></p></div>}
          <div className="generator-lesson__columns">
            {Array.isArray(section.keyConcepts) && section.keyConcepts.length > 0 && <div><span className="generator-result__label">Concepts clés</span><TextList items={section.keyConcepts} /></div>}
            {Array.isArray(section.definitions) && section.definitions.length > 0 && <div><span className="generator-result__label">Définitions</span>{(section.definitions as ResultRecord[]).map((item, i) => <div className="generator-lesson__definition" key={i}><strong><LatexValue value={item.term} /></strong><p><LatexValue value={item.definition} /></p></div>)}</div>}
          </div>
          {Array.isArray(section.formulas) && section.formulas.length > 0 && <div className="generator-lesson__formula-box"><span className="generator-result__label">Formules / relations</span><TextList items={section.formulas} display /></div>}
          {Array.isArray(section.derivations) && section.derivations.length > 0 && <div><span className="generator-result__label">Raisonnement / démonstration</span><TextList items={section.derivations} /></div>}
          {Array.isArray(section.examples) && section.examples.length > 0 && <div><span className="generator-result__label">Exemples</span><TextList items={section.examples} /></div>}
          {checkpoints(section).length > 0 && <div className="generator-lesson__checkpoints"><span className="generator-result__label">✎ Checkpoints</span>{checkpoints(section).map((item, i) => <details key={i}><summary><LatexValue value={item.question} /></summary><p><strong>Réponse :</strong> <LatexValue value={item.answer} /></p>{typeof item.why === "string" && item.why.trim() && <p><LatexValue value={item.why} /></p>}</details>)}</div>}
          {Array.isArray(section.commonMistakes) && section.commonMistakes.length > 0 && <div className="generator-lesson__warning"><span className="generator-result__label">⚠ Pièges fréquents</span><TextList items={section.commonMistakes} /></div>}
          {Array.isArray(section.examFocusPoints) && section.examFocusPoints.length > 0 && <div className="generator-lesson__exam"><span className="generator-result__label">★ Focus examen</span><TextList items={section.examFocusPoints} /></div>}
        </div>
      </article>)}
    </div>
    <div className="generator-lesson__final-grid">
      <section><span className="generator-result__label">À retenir absolument</span><TextList items={result.mustRemember} /></section>
      <section><span className="generator-result__label">Auto-évaluation</span>{Array.isArray(result.selfAssessment) && (result.selfAssessment as ResultRecord[]).map((item, i) => <details key={i}><summary><LatexValue value={item.question} /></summary><p><LatexValue value={item.answer} /></p></details>)}</section>
    </div>
    {Array.isArray(result.progressiveExercises) && result.progressiveExercises.length > 0 && <section className="generator-lesson__exercises"><span className="generator-result__label">Exercices progressifs</span>{(result.progressiveExercises as ResultRecord[]).map((item, i) => <article key={i}><span><LatexValue value={item.difficulty} /></span><p><LatexValue value={item.statement} /></p><details><summary>Correction / indication</summary><p><LatexValue value={item.hint} /></p><p><LatexValue value={item.answer} /></p></details></article>)}</section>}
    {typeof result.estimatedStudyTimeMinutes === "number" && <div className="generator-lesson__footer">Temps d'étude estimé : {result.estimatedStudyTimeMinutes} min · Leçon reconstruite à partir de la source YouTube</div>}
  </div>;
}

function ResultView({ result }: { result: ResultRecord }) {
  if (Array.isArray(result.sections) || result.intro || result.mustRemember) return <LessonResultView result={result} />;
  const title = typeof result.title === "string" ? result.title : "Ressource générée";
  const entries = Object.entries(result).filter(([key]) => key !== "title");
  return <div className="generator-result"><div className="generator-result__head"><div><span className="generator-eyebrow"><Check size={14} /> GÉNÉRATION TERMINÉE</span><h2><LatexValue value={title} /></h2></div></div><div className="generator-result__grid">{entries.map(([key, value]) => <section key={key} className="generator-result__block"><span className="generator-result__label">{key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span><div className="generator-result__content">{Array.isArray(value) ? value.map((item, index) => <article className="generator-result__item" key={`${key}-${index}`}>{item && typeof item === "object" ? Object.entries(item as Record<string, unknown>).map(([itemKey, itemValue]) => <div key={itemKey}><strong>{itemKey.replace(/([A-Z])/g, " $1")}</strong><p><LatexValue value={itemValue} /></p></div>) : <p><LatexValue value={item} /></p>}</article>) : <p><LatexValue value={value} /></p>}</div></section>)}</div></div>;
}

export default function AiStudioGenerator() {
  const location = useLocation();
  const requestedMode = new URLSearchParams(location.search).get("mode") as StudioGenerationMode | null;
  const initialMode = useMemo<StudioGenerationMode>(() => modes.some((item) => item.id === requestedMode) ? requestedMode! : "handnote", [requestedMode]);
  const [mode, setMode] = useState<StudioGenerationMode>(initialMode);
  const [text, setText] = useState("");
  const [sourceType, setSourceType] = useState<"text" | "youtube">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeBusy, setYoutubeBusy] = useState(false);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [youtubeResult, setYoutubeResult] = useState<TranscriptResult | null>(null);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [track, setTrack] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultRecord | null>(null);

  async function generateLesson(source: TranscriptResult) {
    const transcriptText = source.transcript.segments.map((segment) => segment.text).join(" ").trim();
    if (!transcriptText) throw new Error("Aucun texte exploitable n'a été extrait de cette vidéo.");
    setMode("handnote");
    setText(transcriptText);
    const next = await generateStudioResource<ResultRecord>({ mode: "handnote", text: transcriptText, subject, chapter: chapter.trim() || source.video.title, track });
    setResult(next);
  }

  async function checkAndGenerateYoutube() {
    const url = youtubeUrl.trim();
    if (!url || youtubeBusy) return;
    setYoutubeBusy(true); setYoutubeError(null); setError(null); setYoutubeResult(null); setResult(null);
    try {
      const { data: gate, error: gateError } = await supabase.functions.invoke("youtube-education-gate", { body: { url } });
      if (gateError) throw gateError;
      const educationCheck = gate as EducationGateResult;
      if (!educationCheck?.allowed) { setYoutubeError(educationCheck?.reason ?? "Cette vidéo ne semble pas être une ressource éducative."); return; }
      const { data, error: transcriptError } = await supabase.functions.invoke("youtube-transcript-v2", { body: { url, languages: ["fr", "en", "ar"] } });
      if (transcriptError) throw transcriptError;
      if (!data?.success) throw new Error(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun sous-titre exploitable n'a été trouvé.");
      const transcript = data as TranscriptResult;
      setYoutubeResult(transcript);
      await generateLesson(transcript);
    } catch (caught) { setYoutubeError(await getFunctionErrorMessage(caught)); } finally { setYoutubeBusy(false); }
  }

  async function generate() {
    if (!text.trim() || busy) return;
    setBusy(true); setError(null); setResult(null);
    try { setResult(await generateStudioResource<ResultRecord>({ mode, text, subject, chapter, track })); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "La génération IA a échoué."); }
    finally { setBusy(false); }
  }

  const selectedMode = modes.find((item) => item.id === mode)!;
  return <main className="generator-page">
    <header className="generator-header"><div><Link to="/ai-studio" className="generator-back"><ArrowLeft size={16} /> AI Studio</Link><span className="generator-eyebrow"><Sparkles size={14} /> AI STUDIO · YOUTUBE</span><h1>Transforme une vidéo en vraie leçon Menti.</h1><p>Pas un résumé. Menti reconstruit une leçon longue, complète et manuscrite à partir du cours, avec explications, raisonnements, exemples, checkpoints et préparation examen.</p></div><div className="generator-status"><span>MODE</span><strong>Leçon longue</strong></div></header>
    <section className="generator-shell"><div className="generator-modes"><div className="generator-section-title"><span>01</span><div><strong>Format de sortie</strong><small>YouTube utilise la Leçon Menti par défaut.</small></div></div><div className="generator-mode-grid">{modes.map(({ id, title, text: description, icon: Icon }) => <button type="button" className={`generator-mode ${mode === id ? "is-active" : ""}`} key={id} onClick={() => { setMode(id); setResult(null); setError(null); }}><span className="generator-mode__icon"><Icon size={18} /></span><span><strong>{title}</strong><small>{description}</small></span></button>)}</div></div>
      <div className="generator-input-area"><div className="generator-section-title"><span>02</span><div><strong>Source</strong><small>Une vidéo éducative devient une leçon complète.</small></div></div><div className="generator-source-tabs" role="tablist" aria-label="Type de source"><button type="button" className={sourceType === "text" ? "is-active" : ""} onClick={() => setSourceType("text")}>Texte / notes</button><button type="button" className={sourceType === "youtube" ? "is-active" : ""} onClick={() => setSourceType("youtube")}>YouTube</button></div>
        {sourceType === "youtube" ? <div className="generator-youtube"><div className="generator-youtube__row"><div className="generator-youtube__input"><PlaySquare size={17} /><input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void checkAndGenerateYoutube(); }} placeholder="https://www.youtube.com/watch?v=..." aria-label="Lien YouTube" /></div><button type="button" className="generator-btn" onClick={() => void checkAndGenerateYoutube()} disabled={!youtubeUrl.trim() || youtubeBusy}>{youtubeBusy ? <><LoaderCircle className="generator-spin" size={16} /> Extraction + leçon…</> : <><Sparkles size={16} /> Créer la leçon Menti</>}</button></div>{youtubeError && <div className="generator-error"><strong>Vidéo non exploitable</strong><span>{youtubeError}</span></div>}{youtubeResult && <div className="generator-youtube__result"><div className="generator-youtube__meta"><img src={youtubeResult.video.thumbnail} alt="" /><div><strong>{youtubeResult.video.title}</strong><span>{youtubeResult.video.author ?? "YouTube"} · {youtubeResult.transcript.language} · {youtubeResult.transcript.segments.length} segments{youtubeResult.transcript.isGenerated ? " · automatique" : ""}</span></div></div><div className="generator-youtube__segments">{youtubeResult.transcript.segments.slice(0, 10).map((segment, index) => <article key={`${segment.start}-${index}`}><time>{formatTime(segment.start)}</time><p><LatexValue value={segment.text} /></p></article>)}{youtubeResult.transcript.segments.length > 10 && <span className="generator-youtube__more">{youtubeResult.transcript.segments.length - 10} segments supplémentaires utilisés pour la leçon.</span>}</div></div>}</div> : <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Colle ici le contenu à transformer en leçon Menti…" />}
        <div className="generator-meta-grid"><label><span>Matière</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Mathématiques" /></label><label><span>Chapitre</span><input value={chapter} onChange={(event) => setChapter(event.target.value)} placeholder="Dérivation" /></label><label><span>Parcours</span><select value={track} onChange={(event) => setTrack(event.target.value)}><option value="">Automatique</option><option value="SP">2BAC Sciences Physiques</option><option value="SMA">2BAC Sciences Mathématiques A</option><option value="SMB">2BAC Sciences Mathématiques B</option></select></label></div>
        <div className="generator-actions"><span>{text.trim().length.toLocaleString("fr-FR")} caractères · {sourceType === "youtube" ? "source YouTube" : "source texte"}</span><button type="button" className="generator-btn" onClick={() => void generate()} disabled={!text.trim() || busy}>{busy ? <><LoaderCircle className="generator-spin" size={16} /> Génération…</> : <><Sparkles size={16} /> Générer {selectedMode.title.toLowerCase()}</>}</button></div>{error && <div className="generator-error"><strong>Génération impossible</strong><span>{error}</span></div>}</div></section>
    {result && <section className="generator-output"><div className="generator-output__toolbar"><div><span className="generator-eyebrow">03 · LEÇON</span><strong>Leçon Menti</strong></div><button type="button" className="generator-btn generator-btn--secondary" onClick={() => void generate()} disabled={busy}><RefreshCw size={15} /> Régénérer</button></div><ResultView result={result} /></section>}
  </main>;
}
