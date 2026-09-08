import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ArrowLeft, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Download, FileImage, FileText, Layers3, ListChecks, LoaderCircle, PlaySquare, RefreshCw, RotateCcw, Sparkles, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { generateStudioResource, type StudioGenerationMode } from "../services/ai/studioGenerate";
import { supabase } from "../lib/supabase";
import { listPersonalLibrary, saveToPersonalLibrary, type LibraryResourceType, type PersonalLibraryItem } from "../lib/personalLibrary";
import { downloadResourcePng } from "../lib/resourceExport";
import { downloadStructuredResourcePdf } from "../lib/structuredResourceExport";
import { LatexText } from "../components/ui/LatexText";
import "./AiStudioGenerator.css";
import "./AiStudioInteractive.css";
import "./AiStudioGeneratorV2.css";

type ResultRecord = Record<string, unknown>;
type TranscriptSegment = { start: number; duration: number; text: string };
type TranscriptResult = { video: { id: string; title: string; author: string | null; thumbnail: string }; transcript: { language: string; languageCode: string; isGenerated: boolean; segments: TranscriptSegment[] } };
type EducationGateResult = { allowed: boolean; title: string | null; author: string | null; reason: string | null };
type Mode = { id: StudioGenerationMode; title: string; text: string; icon: typeof FileText };

const modes: Mode[] = [
  { id: "handnote", title: "Leçon Menti", text: "Cours long, complet et manuscrit.", icon: FileText },
  { id: "summary", title: "Résumé", text: "Synthèse claire et révisable.", icon: BookOpen },
  { id: "flashcards", title: "Flashcards", text: "Cartes question → réponse.", icon: Layers3 },
  { id: "quiz", title: "Quiz", text: "QCM, une question à la fois.", icon: ListChecks },
];

const typeLabels: Record<LibraryResourceType, string> = { handnote: "Leçon", summary: "Résumé", flashcards: "Flashcards", quiz: "Quiz" };

function stringifyValue(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? `• ${item}` : JSON.stringify(item)).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function LatexValue({ value, display = false }: { value: unknown; display?: boolean }) {
  return <LatexText display={display}>{stringifyValue(value)}</LatexText>;
}

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

async function functionErrorMessage(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as { error?: string; detail?: string };
      if (payload?.detail) return `${payload.error ?? "Impossible de traiter la vidéo."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
  }
  return error instanceof Error ? error.message : "Impossible de contacter le service.";
}

function TextList({ items, display = false }: { items: unknown; display?: boolean }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return <ul className="generator-lesson-list">{items.map((item, index) => <li key={index}><LatexValue value={item} display={display} /></li>)}</ul>;
}

export function HandwrittenShellV2({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return <div className="generator-result generator-lesson generator-handwritten-resource">
    <div className="generator-result__head generator-lesson__title-card"><div><span className="generator-eyebrow"><Check size={14} /> {eyebrow}</span><h2><LatexValue value={title} /></h2></div></div>
    {children}
  </div>;
}

export function ResultViewV2({ result }: { result: ResultRecord }) {
  const title = typeof result.title === "string" ? result.title : "Ressource Menti";
  if (Array.isArray(result.cards)) return <FlashcardsResult result={result} title={title} />;
  if (Array.isArray(result.questions)) return <QuizResult result={result} title={title} />;
  if (typeof result.summary === "string" || Array.isArray(result.keyPoints)) return <SummaryResult result={result} title={title} />;
  return <LessonResult result={result} title={title} />;
}

function LessonResult({ result, title }: { result: ResultRecord; title: string }) {
  const sections = Array.isArray(result.sections) ? result.sections as ResultRecord[] : [];
  return <HandwrittenShellV2 title={title} eyebrow="LEÇON MENTI · TERMINÉE">
    {typeof result.intro === "string" && <section className="generator-lesson__intro"><span className="generator-result__label">Introduction</span><p><LatexValue value={result.intro} /></p></section>}
    {(Array.isArray(result.prerequisites) || Array.isArray(result.learningObjectives)) && <div className="generator-lesson__meta-grid"><section><span className="generator-result__label">Prérequis</span><TextList items={result.prerequisites} /></section><section><span className="generator-result__label">Objectifs</span><TextList items={result.learningObjectives} /></section></div>}
    <div className="generator-lesson__sections">{sections.map((section, index) => <article className="generator-lesson__section" key={index}><div className="generator-lesson__section-number">{String(index + 1).padStart(2, "0")}</div><div className="generator-lesson__section-body"><h3><LatexValue value={typeof section.title === "string" ? section.title : `Partie ${index + 1}`} /></h3>{typeof section.explanation === "string" && <p className="generator-lesson__explanation"><LatexValue value={section.explanation} /></p>}{typeof section.intuition === "string" && <div className="generator-lesson__callout"><strong>💡 Intuition</strong><p><LatexValue value={section.intuition} /></p></div>}{Array.isArray(section.definitions) && section.definitions.length > 0 && <div className="generator-lesson__columns"><div><span className="generator-result__label">Définitions</span>{(section.definitions as ResultRecord[]).map((item, i) => <div className="generator-lesson__definition" key={i}><strong><LatexValue value={item.term} /></strong><p><LatexValue value={item.definition} /></p></div>)}</div></div>}{Array.isArray(section.keyConcepts) && section.keyConcepts.length > 0 && <div><span className="generator-result__label">Concepts clés</span><TextList items={section.keyConcepts} /></div>}{Array.isArray(section.formulas) && section.formulas.length > 0 && <div className="generator-lesson__formula-box"><span className="generator-result__label">Formules / relations</span><TextList items={section.formulas} display /></div>}{Array.isArray(section.derivations) && section.derivations.length > 0 && <div><span className="generator-result__label">Démonstrations</span><TextList items={section.derivations} /></div>}{Array.isArray(section.examples) && section.examples.length > 0 && <div><span className="generator-result__label">Exemples</span><TextList items={section.examples} /></div>}{Array.isArray(section.commonMistakes) && section.commonMistakes.length > 0 && <div className="generator-lesson__warning"><span className="generator-result__label">⚠ Pièges fréquents</span><TextList items={section.commonMistakes} /></div>}</div></article>)}</div>
    {Array.isArray(result.mustRemember) && result.mustRemember.length > 0 && <section className="generator-lesson__final-grid"><section><span className="generator-result__label">À retenir absolument</span><TextList items={result.mustRemember} /></section></section>}
  </HandwrittenShellV2>;
}

function SummaryResult({ result, title }: { result: ResultRecord; title: string }) {
  return <HandwrittenShellV2 title={title} eyebrow="RÉSUMÉ · TERMINÉ">
    {typeof result.summary === "string" && <section className="generator-lesson__intro generator-summary__intro"><span className="generator-result__label">L'essentiel</span><p><LatexValue value={result.summary} /></p></section>}
    <div className="generator-lesson__sections generator-summary__sections"><section className="generator-lesson__section"><div className="generator-lesson__section-number">01</div><div className="generator-lesson__section-body"><h3>Points clés</h3><TextList items={result.keyPoints} /></div></section>{Array.isArray(result.formulas) && result.formulas.length > 0 && <section className="generator-lesson__section"><div className="generator-lesson__section-number">02</div><div className="generator-lesson__section-body"><h3>Formules</h3><div className="generator-lesson__formula-box"><TextList items={result.formulas} display /></div></div></section>}</div>
  </HandwrittenShellV2>;
}

function FlashcardsResult({ result, title }: { result: ResultRecord; title: string }) {
  const cards = Array.isArray(result.cards) ? result.cards as ResultRecord[] : [];
  const [index, setIndex] = useState(0); const [flipped, setFlipped] = useState(false);
  useEffect(() => { setIndex(0); setFlipped(false); }, [result]);
  const card = cards[index];
  if (!card) return <HandwrittenShellV2 title={title} eyebrow="FLASHCARDS"><div className="generator-empty-note">Aucune carte.</div></HandwrittenShellV2>;
  const go = (next: number) => { setIndex(Math.max(0, Math.min(cards.length - 1, next))); setFlipped(false); };
  return <HandwrittenShellV2 title={title} eyebrow="FLASHCARDS · PRÊTES"><section className="generator-interactive-resource generator-flashcards"><div className="generator-interactive-resource__top"><span className="generator-result__label">Carte {index + 1} / {cards.length}</span><span className="generator-interactive-hint">Clique pour retourner</span></div><button type="button" className={`generator-flashcard ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped((v) => !v)}><span className="generator-flashcard__inner"><span className="generator-flashcard__face generator-flashcard__front"><span className="generator-flashcard__tag">QUESTION</span><span className="generator-flashcard__text"><LatexValue value={card.question} /></span><span className="generator-flashcard__flip"><RotateCcw size={16} /> Retourner</span></span><span className="generator-flashcard__face generator-flashcard__back"><span className="generator-flashcard__tag">RÉPONSE</span><span className="generator-flashcard__text"><LatexValue value={card.answer} /></span><span className="generator-flashcard__flip"><RotateCcw size={16} /> Retourner</span></span></span></button><div className="generator-interactive-resource__controls"><button className="generator-btn generator-btn--secondary" type="button" onClick={() => go(index - 1)} disabled={index === 0}><ChevronLeft size={16} /> Précédente</button><button className="generator-btn" type="button" onClick={() => go(index + 1)} disabled={index === cards.length - 1}>Suivante <ChevronRight size={16} /></button></div></section></HandwrittenShellV2>;
}

function QuizResult({ result, title }: { result: ResultRecord; title: string }) {
  const questions = Array.isArray(result.questions) ? result.questions as ResultRecord[] : [];
  const [index, setIndex] = useState(0); const [selected, setSelected] = useState<number | null>(null); const [score, setScore] = useState(0);
  useEffect(() => { setIndex(0); setSelected(null); setScore(0); }, [result]);
  const question = questions[index]; if (!question) return <HandwrittenShellV2 title={title} eyebrow="QUIZ"><div className="generator-empty-note">Aucune question.</div></HandwrittenShellV2>;
  const choices = Array.isArray(question.choices) ? question.choices as unknown[] : []; const answerIndex = typeof question.answerIndex === "number" ? question.answerIndex : -1;
  const choose = (choiceIndex: number) => { if (selected !== null) return; setSelected(choiceIndex); if (choiceIndex === answerIndex) setScore((v) => v + 1); };
  const next = () => { if (index < questions.length - 1) { setIndex((v) => v + 1); setSelected(null); } };
  return <HandwrittenShellV2 title={title} eyebrow="QUIZ · INTERACTIF"><section className="generator-interactive-resource generator-quiz"><div className="generator-interactive-resource__top"><span className="generator-result__label">Question {index + 1} / {questions.length}</span><span className="generator-quiz-score">Score : {score} / {questions.length}</span></div><article className="generator-quiz-card"><div className="generator-quiz-card__number">{String(index + 1).padStart(2, "0")}</div><h3><LatexValue value={question.question} /></h3><div className="generator-quiz-choices">{choices.map((choice, choiceIndex) => <button key={choiceIndex} type="button" className={`generator-quiz-choice ${selected !== null && choiceIndex === answerIndex ? "is-correct" : ""} ${selected === choiceIndex && choiceIndex !== answerIndex ? "is-wrong" : ""}`} onClick={() => choose(choiceIndex)} disabled={selected !== null}><span className="generator-quiz-choice__letter">{String.fromCharCode(65 + choiceIndex)}</span><span><LatexValue value={choice} /></span></button>)}</div>{selected !== null && <div className={`generator-quiz-feedback ${selected === answerIndex ? "is-correct" : "is-wrong"}`}><strong>{selected === answerIndex ? "✓ Bonne réponse" : "✗ Pas tout à fait"}</strong><p><LatexValue value={question.explanation} /></p></div>}</article><div className="generator-interactive-resource__controls"><button className="generator-btn generator-btn--secondary" type="button" onClick={() => { if (index) { setIndex((v) => v - 1); setSelected(null); } }} disabled={index === 0}><ChevronLeft size={16} /> Précédente</button>{index < questions.length - 1 ? <button className="generator-btn" type="button" onClick={next} disabled={selected === null}>Suivante <ChevronRight size={16} /></button> : <div className="generator-quiz-finished">Quiz terminé · {score} / {questions.length}</div>}</div></section></HandwrittenShellV2>;
}

function LibraryDrawer({ open, onClose, items, onPick }: { open: boolean; onClose: () => void; items: PersonalLibraryItem[]; onPick: (item: PersonalLibraryItem) => void }) {
  return <><button type="button" aria-label="Fermer la bibliothèque" className={`ai-library-scrim ${open ? "is-open" : ""}`} onClick={onClose} /><aside className={`ai-library-drawer ${open ? "is-open" : ""}`} aria-hidden={!open}><div className="ai-library-drawer__head"><div><span className="generator-eyebrow">MA BIBLIOTHÈQUE</span><h2>Mes ressources</h2></div><button type="button" className="ai-library-close" onClick={onClose} aria-label="Fermer"><X size={18} /></button></div><div className="ai-library-drawer__list">{items.length === 0 ? <div className="ai-library-empty"><BookOpen size={28} /><strong>Rien ici pour l'instant.</strong><span>Enregistre une ressource depuis AI Studio.</span></div> : items.map((item) => <button type="button" className="ai-library-item" key={item.id} onClick={() => onPick(item)}><span className="ai-library-item__icon">{item.resource_type === "handnote" ? <FileText size={17} /> : item.resource_type === "summary" ? <BookOpen size={17} /> : item.resource_type === "flashcards" ? <Layers3 size={17} /> : <ListChecks size={17} />}</span><span><strong>{item.title}</strong><small>{typeLabels[item.resource_type]}{item.subject ? ` · ${item.subject}` : ""}</small></span></button>)}</div></aside></>;
}

export default function AiStudioGeneratorV2() {
  const location = useLocation();
  const requestedMode = new URLSearchParams(location.search).get("mode") as StudioGenerationMode | null;
  const initialMode = useMemo<StudioGenerationMode>(() => modes.some((item) => item.id === requestedMode) ? requestedMode! : "handnote", [requestedMode]);
  const [mode, setMode] = useState<StudioGenerationMode>(initialMode); const [text, setText] = useState(""); const [sourceType, setSourceType] = useState<"text" | "youtube">("youtube"); const [youtubeUrl, setYoutubeUrl] = useState(""); const [youtubeBusy, setYoutubeBusy] = useState(false); const [youtubeError, setYoutubeError] = useState<string | null>(null); const [youtubeResult, setYoutubeResult] = useState<TranscriptResult | null>(null); const [subject, setSubject] = useState(""); const [chapter, setChapter] = useState(""); const [track, setTrack] = useState(""); const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null); const [result, setResult] = useState<ResultRecord | null>(null); const [libraryOpen, setLibraryOpen] = useState(false); const [libraryItems, setLibraryItems] = useState<PersonalLibraryItem[]>([]); const resultRef = useRef<HTMLDivElement>(null);

  const refreshLibrary = async () => { try { setLibraryItems(await listPersonalLibrary()); } catch {} };
  useEffect(() => { void refreshLibrary(); }, []);
  useEffect(() => { setMode(initialMode); }, [initialMode]);

  const generateFromText = async () => { if (!text.trim() || busy) return; setBusy(true); setError(null); setResult(null); try { setResult(await generateStudioResource<ResultRecord>({ mode, text, subject, chapter, track })); } catch (caught) { setError(caught instanceof Error ? caught.message : "La génération IA a échoué."); } finally { setBusy(false); } };
  const generateFromYoutube = async () => { const url = youtubeUrl.trim(); if (!url || youtubeBusy) return; setYoutubeBusy(true); setYoutubeError(null); setError(null); setResult(null); try { const { data: gate, error: gateError } = await supabase.functions.invoke("youtube-education-gate", { body: { url } }); if (gateError) throw gateError; const check = gate as EducationGateResult; if (!check?.allowed) { setYoutubeError(check?.reason ?? "Cette vidéo ne semble pas être une ressource éducative."); return; } const { data, error: transcriptError } = await supabase.functions.invoke("youtube-transcript-v2", { body: { url, languages: ["fr", "en", "ar"] } }); if (transcriptError) throw transcriptError; if (!data?.success) throw new Error(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun sous-titre exploitable n'a été trouvé."); const transcript = data as TranscriptResult; setYoutubeResult(transcript); const transcriptText = transcript.transcript.segments.map((segment) => segment.text).join(" ").trim(); setText(transcriptText); setResult(await generateStudioResource<ResultRecord>({ mode, text: transcriptText, subject, chapter: chapter.trim() || transcript.video.title, track })); } catch (caught) { setYoutubeError(await functionErrorMessage(caught)); } finally { setYoutubeBusy(false); } };

  const selectedMode = modes.find((item) => item.id === mode)!;
  const title = result && typeof result.title === "string" ? result.title : selectedMode.title;
  const save = async () => { if (!result) return; try { await saveToPersonalLibrary({ resourceType: mode as LibraryResourceType, title, subject: subject.trim() || null, chapter: chapter.trim() || null, sourceType, sourceRef: youtubeResult?.video.id ?? null, content: result }); await refreshLibrary(); window.alert("Ressource enregistrée dans ta bibliothèque."); } catch (caught) { window.alert(caught instanceof Error ? caught.message : "Impossible de sauvegarder."); } };
  const exportPng = async () => { if (!resultRef.current) return; try { await downloadResourcePng(resultRef.current, title); } catch (caught) { window.alert(caught instanceof Error ? caught.message : "Impossible de créer l'image."); } };
  const exportPdf = async () => { if (!result) return; try { await downloadStructuredResourcePdf(result, title); } catch (caught) { window.alert(caught instanceof Error ? caught.message : "Impossible de créer le PDF."); } };
  const pickLibraryItem = (item: PersonalLibraryItem) => { setMode(item.resource_type as StudioGenerationMode); setSubject(item.subject ?? ""); setChapter(item.chapter ?? ""); setSourceType("text"); setText(""); setYoutubeResult(null); setResult(item.content); setLibraryOpen(false); };

  return <main className="generator-page ai-studio-v2"><LibraryDrawer open={libraryOpen} onClose={() => setLibraryOpen(false)} items={libraryItems} onPick={pickLibraryItem} />
    <header className="generator-header ai-studio-v2__header"><div><Link to="/ai-studio" className="generator-back"><ArrowLeft size={16} /> AI Studio</Link><span className="generator-eyebrow"><Sparkles size={14} /> AI STUDIO · MULTIFORMAT</span><h1>Transforme une source en ressource Menti.</h1><p>Le même contenu peut devenir une leçon, un résumé, des flashcards ou un quiz, sans sacrifier la mise en page manuscrite.</p></div><div className="ai-studio-v2__header-actions"><button type="button" className="ai-studio-library-button" onClick={() => setLibraryOpen(true)}><Bookmark size={17} /> Ma bibliothèque<span>{libraryItems.length}</span></button><div className="generator-status"><span>FORMAT</span><strong>{selectedMode.title}</strong></div></div></header>
    <section className="generator-shell"><div className="generator-modes"><div className="generator-section-title"><span>01</span><div><strong>Format de sortie</strong><small>Le format choisi contrôle réellement la génération.</small></div></div><div className="generator-mode-grid">{modes.map(({ id, title: modeTitle, text: description, icon: Icon }) => <button type="button" className={`generator-mode ${mode === id ? "is-active" : ""}`} key={id} onClick={() => { setMode(id); setResult(null); setError(null); }}><span className="generator-mode__icon"><Icon size={18} /></span><span><strong>{modeTitle}</strong><small>{description}</small></span></button>)}</div></div>
      <div className="generator-input-area"><div className="generator-section-title"><span>02</span><div><strong>Source</strong><small>Une source, quatre formats.</small></div></div><div className="generator-source-tabs"><button type="button" className={sourceType === "text" ? "is-active" : ""} onClick={() => setSourceType("text")}>Texte / notes</button><button type="button" className={sourceType === "youtube" ? "is-active" : ""} onClick={() => setSourceType("youtube")}>YouTube</button></div>{sourceType === "youtube" ? <div className="generator-youtube"><div className="generator-youtube__row"><div className="generator-youtube__input"><PlaySquare size={17} /><input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void generateFromYoutube(); }} placeholder="https://www.youtube.com/watch?v=..." /></div><button type="button" className="generator-btn" onClick={() => void generateFromYoutube()} disabled={!youtubeUrl.trim() || youtubeBusy}>{youtubeBusy ? <><LoaderCircle className="generator-spin" size={16} /> Extraction + génération…</> : <><Sparkles size={16} /> Générer {selectedMode.title.toLowerCase()}</>}</button></div>{youtubeError && <div className="generator-error"><strong>Vidéo non exploitable</strong><span>{youtubeError}</span></div>}{youtubeResult && <div className="generator-youtube__result"><div className="generator-youtube__meta"><img src={youtubeResult.video.thumbnail} alt="" /><div><strong>{youtubeResult.video.title}</strong><span>{youtubeResult.video.author ?? "YouTube"} · {youtubeResult.transcript.language} · {youtubeResult.transcript.segments.length} segments</span></div></div><div className="generator-youtube__segments">{youtubeResult.transcript.segments.slice(0, 8).map((segment, index) => <article key={`${segment.start}-${index}`}><time>{formatTime(segment.start)}</time><p><LatexValue value={segment.text} /></p></article>)}</div></div>}</div> : <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder={`Colle ici le contenu à transformer en ${selectedMode.title.toLowerCase()}…`} />}
        <div className="generator-meta-grid"><label><span>Matière</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Mathématiques" /></label><label><span>Chapitre</span><input value={chapter} onChange={(event) => setChapter(event.target.value)} placeholder="Dérivation" /></label><label><span>Parcours</span><select value={track} onChange={(event) => setTrack(event.target.value)}><option value="">Automatique</option><option value="SP">2BAC Sciences Physiques</option><option value="SMA">2BAC Sciences Mathématiques A</option><option value="SMB">2BAC Sciences Mathématiques B</option></select></label></div>
        <div className="generator-actions"><span>{text.trim().length.toLocaleString("fr-FR")} caractères · {sourceType === "youtube" ? "source YouTube" : "source texte"}</span><button type="button" className="generator-btn" onClick={() => void generateFromText()} disabled={!text.trim() || busy}>{busy ? <><LoaderCircle className="generator-spin" size={16} /> Génération…</> : <><Sparkles size={16} /> Générer {selectedMode.title.toLowerCase()}</>}</button></div>{error && <div className="generator-error"><strong>Génération impossible</strong><span>{error}</span></div>}</div></section>
    {result && <section className="generator-output ai-studio-v2__output"><div className="generator-output__toolbar"><div><span className="generator-eyebrow">03 · SORTIE</span><strong>{selectedMode.title}</strong></div><button type="button" className="generator-btn generator-btn--secondary" onClick={() => void generateFromText()} disabled={busy}><RefreshCw size={15} /> Régénérer</button></div><div ref={resultRef}><ResultViewV2 result={result} /></div><div className="ai-studio-v2__bottom-actions"><button type="button" className="ai-resource-action ai-resource-action--save" onClick={() => void save()}><Bookmark size={16} /> Enregistrer</button><button type="button" className="ai-resource-action" onClick={() => void exportPng()}><FileImage size={16} /> Image</button><button type="button" className="ai-resource-action" onClick={() => void exportPdf()}><Download size={16} /> PDF</button></div></section>}
  </main>;
}
