import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Copy, FileText, FileUp, GripVertical, ImagePlus, Layers3, Link2, ListChecks, LoaderCircle, PlaySquare, Sparkles, Wand2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import PeopleFeature from "../components/ui/PeopleFeature";
import { generateStudioResource } from "../services/ai/studioGenerate";
import { supabase } from "../lib/supabase";
import "./AiStudio.css";

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PHOTOS = 12;
const FILE_EXTRACTION_TIMEOUT_MS = 105_000;
const tools = [
  { to: "/ai-studio/handnotes", icon: FileText, title: "PDF → fiches", text: "Transforme un cours ou un document en fiche structurée." },
  { to: "/ai-studio/handnotes", icon: Layers3, title: "Texte → résumé", text: "Passe du texte brut à une synthèse claire pour réviser." },
  { to: "/ai-studio/handnotes", icon: ListChecks, title: "Texte → flashcards", text: "Extrais définitions, formules et idées à mémoriser." },
  { to: "/ai-studio/writing", icon: ImagePlus, title: "Writing Lab", text: "Rédige une dissertation ou un essay, avec photo manuscrite et correction à venir." },
  { to: "#youtube-transcript", icon: PlaySquare, title: "Vidéo → résumé", text: "Transforme une vidéo éducative en synthèse de révision." },
];

const recent = [
  ["Fonctions logarithmiques", "Fiche · Mathématiques", "FICHE"],
  ["Circuit RC", "Résumé · Physique-Chimie", "RÉSUMÉ"],
  ["Argumentation", "Flashcards · Français", "CARDS"],
];

type TranscriptSegment = { start: number; duration: number; text: string };
type TranscriptResult = {
  video: { id: string; title: string; author: string | null; thumbnail: string };
  transcript: { language: string; languageCode: string; isGenerated: boolean; segments: TranscriptSegment[]; source?: string };
};
type FunctionErrorPayload = { error?: string; detail?: string };
type EducationGateResult = { allowed: boolean; title: string | null; author: string | null; reason: string | null };
type PdfExtractionResult = { success: boolean; file: { name: string; mimeType: string }; text: string; extraction: string };
type StudioPhotoPage = { id: string; file: File; url: string };
type SummaryResult = Record<string, unknown>;

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${minutes}:${String(secs).padStart(2, "0")}`;
}

async function getFunctionErrorMessage(error: unknown) {
  if (FunctionsHttpError && error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as FunctionErrorPayload;
      if (payload?.detail) return `${payload.error ?? "Extraction impossible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
    return `Le service a répondu avec une erreur HTTP (${error.context?.status ?? "inconnue"}).`;
  }
  if (error instanceof Error) return error.message;
  return "Impossible de contacter le service.";
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: number | null = null;
  try {
    return await Promise.race([promise, new Promise<T>((_, reject) => { timer = window.setTimeout(() => reject(new Error(message)), timeoutMs); })]);
  } finally { if (timer !== null) window.clearTimeout(timer); }
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

function isPdf(file: File) {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isImage(file: File) {
  return file.type.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(file.name);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character] ?? character);
}

function formatSummaryValue(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : JSON.stringify(item)).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

export default function AiStudio() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoPages, setPhotoPages] = useState<StudioPhotoPage[]>([]);
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dropActive, setDropActive] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savingToNotes, setSavingToNotes] = useState(false);
  const [savedToNotes, setSavedToNotes] = useState(false);

  async function summarizeYoutube(transcript: TranscriptResult) {
    const transcriptText = transcript.transcript.segments.map((segment) => segment.text).join(" ").trim();
    if (!transcriptText) throw new Error("Aucun texte exploitable n'a été extrait de cette vidéo.");
    const generated = await generateStudioResource<SummaryResult>({
      mode: "summary",
      text: transcriptText,
      chapter: transcript.video.title,
    });
    setSummary(generated);
  }

  async function createYoutubeSummary() {
    const url = youtubeUrl.trim();
    if (!url || busy) return;
    setBusy(true); setError(null); setResult(null); setSummary(null);
    try {
      const { data: gate, error: gateError } = await supabase.functions.invoke("youtube-education-gate", { body: { url } });
      if (gateError) { setError(await getFunctionErrorMessage(gateError)); return; }
      const educationCheck = gate as EducationGateResult;
      if (!educationCheck?.allowed) { setError(educationCheck?.reason ?? "Cette vidéo ne semble pas être une ressource éducative."); return; }
      const { data, error: invokeError } = await supabase.functions.invoke("youtube-transcript-v2", { body: { url, languages: ["fr", "en", "ar"] } });
      if (invokeError) { setError(await getFunctionErrorMessage(invokeError)); return; }
      if (!data?.success) { setError(data?.detail ? `${data?.error ?? "Impossible de récupérer le transcript."} ${data.detail}` : data?.error || "Aucun sous-titre exploitable n'a été trouvé."); return; }
      const transcript = data as TranscriptResult;
      setResult(transcript);
      await summarizeYoutube(transcript);
    } catch (caught) {
      setError(await getFunctionErrorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList || fileBusy) return;
    const incoming = Array.from(fileList);
    setFileError(null);
    setExtractedText(null);
    setCopied(false);
    setSavedToNotes(false);

    const invalid = incoming.filter((file) => !isPdf(file) && !isImage(file));
    const oversized = incoming.filter((file) => file.size > MAX_FILE_SIZE_BYTES);
    const valid = incoming.filter((file) => (isPdf(file) || isImage(file)) && file.size <= MAX_FILE_SIZE_BYTES);

    if (invalid.length || oversized.length) {
      setFileError(`Utilise un PDF ou des images PNG, JPG, JPEG ou WebP de ${MAX_FILE_SIZE_MB} Mo maximum.`);
    }
    if (!valid.length) return;

    const pdfs = valid.filter(isPdf);
    const images = valid.filter(isImage);

    if (pdfs.length > 0) {
      if (pdfs.length !== 1 || images.length > 0 || photoPages.length > 0) {
        setFileError("Pour un PDF, importe un seul fichier. Pour plusieurs pages, importe jusqu'à 12 images.");
        return;
      }
      setSelectedFile(pdfs[0]);
      return;
    }

    const capacity = Math.max(0, MAX_PHOTOS - photoPages.length);
    if (capacity === 0) {
      setFileError(`Tu peux importer jusqu'à ${MAX_PHOTOS} pages photo.`);
      return;
    }

    setSelectedFile(null);
    setPhotoPages((current) => [
      ...current,
      ...images.slice(0, capacity).map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) })),
    ]);

    if (images.length > capacity) {
      setFileError(`Seules ${MAX_PHOTOS} pages photo peuvent être importées.`);
    }
  }

  function removePhoto(id: string) {
    setPhotoPages((current) => {
      const target = current.find((page) => page.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((page) => page.id !== id);
    });
  }

  function movePhoto(id: string, direction: -1 | 1) {
    setPhotoPages((current) => {
      const index = current.findIndex((page) => page.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }

  function reorderPhoto(sourceId: string, targetId: string) {
    if (!sourceId || sourceId === targetId) return;
    setPhotoPages((current) => {
      const sourceIndex = current.findIndex((page) => page.id === sourceId);
      const targetIndex = current.findIndex((page) => page.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(sourceIndex, 1);
      if (!moved) return current;
      next.splice(targetIndex, 0, moved);
      return next;
    });
  }

  function clearPhotos() {
    photoPages.forEach((page) => URL.revokeObjectURL(page.url));
    setPhotoPages([]);
    setDraggedPageId(null);
  }

  async function extractFileText() {
    if (fileBusy) return;
    setFileBusy(true); setFileError(null); setExtractedText(null); setCopied(false); setSavedToNotes(false);
    try {
      if (photoPages.length > 0) {
        const chunks: string[] = [];
        for (let index = 0; index < photoPages.length; index += 1) {
          const page = photoPages[index];
          setFileError(`Extraction de la page ${index + 1}/${photoPages.length}…`);
          const dataUrl = await fileToDataUrl(page.file);
          const { data, error: invokeError } = await withTimeout(
            supabase.functions.invoke("pdf-text-extractor", { body: { fileName: page.file.name, mimeType: page.file.type, data: dataUrl } }),
            FILE_EXTRACTION_TIMEOUT_MS,
            "L’extraction prend trop de temps. Essaie moins de pages ou des photos plus légères.",
          );
          if (invokeError) { setFileError(await getFunctionErrorMessage(invokeError)); return; }
          if (!data?.success) { setFileError(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || `Aucun texte lisible n'a été trouvé sur la page ${index + 1}.`); return; }
          const extraction = data as PdfExtractionResult;
          chunks.push(`--- PAGE ${index + 1} ---\n${extraction.text.trim()}`);
        }
        setFileError(null);
        setExtractedText(chunks.join("\n\n"));
        return;
      }

      if (!selectedFile) return;
      const allowed = isPdf(selectedFile) || isImage(selectedFile);
      if (!allowed) { setFileError("Format non pris en charge. Utilise un PDF, PNG, JPG ou WebP."); return; }
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) { setFileError(`Fichier trop volumineux. La limite est de ${MAX_FILE_SIZE_MB} Mo.`); return; }
      setFileError("Lecture du fichier…");
      const dataUrl = await fileToDataUrl(selectedFile);
      setFileError("Envoi à l’extracteur IA…");
      const { data, error: invokeError } = await withTimeout(
        supabase.functions.invoke("pdf-text-extractor", { body: { fileName: selectedFile.name, mimeType: selectedFile.type, data: dataUrl } }),
        FILE_EXTRACTION_TIMEOUT_MS,
        "L’extraction prend trop de temps. Essaie un PDF plus court ou découpe le document en plusieurs parties.",
      );
      if (invokeError) { setFileError(await getFunctionErrorMessage(invokeError)); return; }
      if (!data?.success) { setFileError(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun texte lisible n'a été trouvé."); return; }
      const extraction = data as PdfExtractionResult;
      setFileError(null);
      setExtractedText(extraction.text);
    } catch (error) { setFileError(await getFunctionErrorMessage(error)); }
    finally { setFileBusy(false); }
  }

  async function copyExtractedText() {
    if (!extractedText) return;
    try { await navigator.clipboard.writeText(extractedText); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { setFileError("Impossible de copier le texte."); }
  }

  async function saveExtractionAsNote() {
    if (!extractedText || savingToNotes || savedToNotes) return;
    setSavingToNotes(true); setFileError(null);
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Connecte-toi pour enregistrer cette extraction dans tes notes.");
      const sourceName = selectedFile?.name ?? (photoPages.length > 0 ? `${photoPages.length} pages photo` : "Extraction IA");
      const title = sourceName.replace(/\.[^.]+$/, "").trim() || "Extraction IA";
      const html = extractedText.split(/\n{2,}/).map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`).join("");
      const { error } = await supabase.from("handnotes").insert({
        user_id: auth.user.id,
        source_type: selectedFile && isPdf(selectedFile) ? "pdf" : "text",
        source_ref: `ai-studio:${Date.now()}:${sourceName}`,
        title,
        content: { version: 1, html, text: extractedText },
        is_pinned: false,
        folder: "notes",
        subject_id: null,
        chapter_id: null,
      });
      if (error) throw error;
      setSavedToNotes(true);
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Impossible d’enregistrer cette extraction.");
    } finally {
      setSavingToNotes(false);
    }
  }

  const hasFileSource = Boolean(selectedFile) || photoPages.length > 0;
  const sourceLabel = selectedFile?.name ?? (photoPages.length > 0 ? `${photoPages.length} pages photo` : "Dépose un fichier ici");

  return (
    <main className="studio-page">
      <header className="studio-header">
        <div><span className="studio-eyebrow"><Sparkles size={14} /> AI Studio</span><h1>Fabrique tes propres ressources de révision.</h1><p>Un atelier séparé du tuteur. Tu apportes un cours, un texte ou une ressource, puis MentionMax la transforme en matériel de révision exploitable.</p></div>
        <div className="studio-credits"><span>CRÉATIONS</span><strong>12</strong></div>
      </header>
      <PeopleFeature variant="teacher" compact title="L’IA devient ton atelier de révision." text="Transforme tes cours en fiches, résumés, cartes et quiz sans perdre la structure du programme." action={<Link to="/ai-studio/handnotes" className="btn btn-primary"><Wand2 size={15} /> Ouvrir l’atelier</Link>} />
      <div className="studio-grid">
        <section className="studio-card">
          <span className="studio-eyebrow">COMMENCER</span>
          <h2>Choisis une transformation</h2>
          <p>Les parcours gardent la même logique : source → structure → ressource prête à réviser.</p>
          <div className="studio-tools">{tools.map(({ to, icon: Icon, title, text }) => title.startsWith("Vidéo") ? <a key={title} href={to} className="studio-tool"><span className="studio-tool__icon"><Icon size={18} /></span><span><strong>{title}</strong><span>{text}</span></span><ArrowRight className="studio-tool__arrow" size={15} /></a> : <Link key={title} to={to} className="studio-tool"><span className="studio-tool__icon"><Icon size={18} /></span><span><strong>{title}</strong><span>{text}</span></span><ArrowRight className="studio-tool__arrow" size={15} /></Link>)}</div>
          <div className={`studio-drop ${dropActive ? "is-drag-active" : ""}`} onDragOver={(event) => { event.preventDefault(); setDropActive(true); }} onDragLeave={() => setDropActive(false)} onDrop={(event) => { event.preventDefault(); setDropActive(false); addFiles(event.dataTransfer.files); }}>
            <FileUp size={24} />
            <strong>{sourceLabel}</strong>
            <span>PDF numérique, PDF scanné ou 1 à {MAX_PHOTOS} pages photo · max. {MAX_FILE_SIZE_MB} Mo par fichier</span>
            <input id="studio-file" hidden type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" onChange={(event) => { addFiles(event.target.files); event.currentTarget.value = ""; }} />
            <div className="studio-actions">
              <label htmlFor="studio-file" className="studio-btn studio-btn--primary"><FileUp size={15} /> {photoPages.length > 0 ? "Ajouter des pages" : "Importer"}</label>
              {photoPages.length > 0 && <button type="button" className="studio-btn studio-btn--soft" onClick={clearPhotos}><X size={15} /> Vider les pages</button>}
              <button type="button" className="studio-btn studio-btn--soft" onClick={() => void extractFileText()} disabled={!hasFileSource || fileBusy}>{fileBusy ? <><LoaderCircle className="studio-spin" size={15} /> Extraction IA...</> : <><FileText size={15} /> {photoPages.length > 0 ? `Extraire les ${photoPages.length} pages` : "Extraire le texte"}</>}</button>
              <Link to="/ai-studio/handnotes" className="studio-btn studio-btn--soft"><Wand2 size={15} /> Ouvrir l’atelier</Link>
            </div>
            {fileError && <div className="studio-youtube__error"><AlertCircle size={17} /><div><strong>{fileBusy ? "Extraction en cours" : "Extraction impossible"}</strong><span>{fileError}</span></div></div>}
            {photoPages.length > 0 && <div className="studio-photo-review"><div className="studio-photo-review__header"><div><span className="studio-eyebrow">PAGES À EXTRAIRE</span><strong>{photoPages.length} / {MAX_PHOTOS}</strong></div><span>Ordre d’extraction</span></div><p className="studio-photo-order-hint"><GripVertical size={13} /> Glisse les pages, ou utilise les flèches, pour définir l’ordre.</p><div className="studio-photo-grid">{photoPages.map((page, index) => <article key={page.id} className={`studio-photo-card ${draggedPageId === page.id ? "is-dragging" : ""}`} draggable onDragStart={() => setDraggedPageId(page.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (draggedPageId) reorderPhoto(draggedPageId, page.id); setDraggedPageId(null); }} onDragEnd={() => setDraggedPageId(null)}><div className="studio-photo-card__image"><img src={page.url} alt={`Page ${index + 1}`} /><span>{index + 1}</span><GripVertical className="studio-photo-card__drag" size={14} /></div><div className="studio-photo-card__footer"><strong>Page {index + 1}</strong><div><button type="button" onClick={() => movePhoto(page.id, -1)} disabled={index === 0} aria-label={`Monter la page ${index + 1}`}><ChevronLeft size={14} /></button><button type="button" onClick={() => movePhoto(page.id, 1)} disabled={index === photoPages.length - 1} aria-label={`Descendre la page ${index + 1}`}><ChevronRight size={14} /></button><button type="button" onClick={() => removePhoto(page.id)} aria-label={`Supprimer la page ${index + 1}`}><X size={14} /></button></div></div></article>)}</div></div>}
            {extractedText && <div className="studio-transcript"><div className="studio-youtube__header"><div><span className="studio-eyebrow"><CheckCircle2 size={14} /> EXTRACTION IA</span><h3>{selectedFile?.name ?? `${photoPages.length} pages photo`}</h3><p>Texte détecté dans le document. Les scans et images passent automatiquement par la vision IA.</p></div><div className="studio-actions"><button type="button" className="studio-btn studio-btn--soft" onClick={() => void copyExtractedText()}><Copy size={15} /> {copied ? "Copié" : "Copier"}</button><button type="button" className="studio-btn studio-btn--primary" onClick={() => void saveExtractionAsNote()} disabled={savingToNotes || savedToNotes}>{savingToNotes ? <><LoaderCircle className="studio-spin" size={15} /> Enregistrement...</> : savedToNotes ? <><CheckCircle2 size={15} /> Enregistré dans Notes</> : <><FileText size={15} /> Enregistrer dans Notes</>}</button></div></div><pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 520, overflowY: "auto", padding: "18px", borderRadius: 14, background: "var(--mm-surface-subtle, #f6f8f7)", fontFamily: "inherit", lineHeight: 1.65 }}>{extractedText}</pre></div>}
          </div>
        </section>
        <aside className="studio-card"><span className="studio-eyebrow">RÉCENTS</span><h2>Ce que tu as créé</h2><p>Un historique compact pour reprendre tes ressources sans fouiller partout.</p><div className="studio-recent">{recent.map(([title, meta, badge]) => <Link to="/ai-studio/handnotes" className="studio-recent-item" key={title}><span className="studio-recent-item__icon"><FileText size={16} /></span><span><strong>{title}</strong><span>{meta}</span></span><b className="studio-badge">{badge}</b></Link>)}</div><div className="studio-note">V1 : PDF numériques, PDF scannés et images peuvent être convertis en texte avant de passer à la génération de fiches.</div><div className="studio-actions"><Link to="/ai-help" className="studio-btn studio-btn--soft"><Sparkles size={15} /> Aller au tuteur IA <ArrowRight size={14} /></Link></div></aside>
      </div>
      <section id="youtube-transcript" className="studio-card studio-youtube" aria-labelledby="youtube-transcript-title">
        <div className="studio-youtube__header"><div><span className="studio-eyebrow"><Sparkles size={14} /> AI STUDIO · YOUTUBE</span><h2 id="youtube-transcript-title">Créer un résumé de la vidéo</h2><p>Colle un lien YouTube éducatif. MentionMax vérifie la vidéo, récupère le transcript, puis génère automatiquement une synthèse de révision.</p></div>{summary && <span className="studio-status studio-status--ok"><CheckCircle2 size={14} /> Résumé prêt</span>}</div>
        <div className="studio-youtube__form"><div className="studio-url-input"><Link2 size={17} /><input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void createYoutubeSummary(); }} placeholder="https://www.youtube.com/watch?v=..." aria-label="Lien YouTube" /></div><button type="button" className="studio-btn studio-btn--primary" onClick={() => void createYoutubeSummary()} disabled={!youtubeUrl.trim() || busy}>{busy ? <><LoaderCircle className="studio-spin" size={15} /> Vérification + résumé...</> : <><Sparkles size={15} /> Faire le résumé</>}</button></div>
        {error && <div className="studio-youtube__error"><AlertCircle size={17} /><div><strong>Résumé impossible</strong><span>{error}</span></div></div>}
        {result && <div className="studio-transcript"><div className="studio-transcript__meta"><img src={result.video.thumbnail} alt="" /><div><strong>{result.video.title}</strong><span>{result.video.author ?? "YouTube"} · {result.transcript.language} ({result.transcript.languageCode}) · {result.transcript.segments.length} segments{result.transcript.isGenerated ? " · automatique" : " · créée par le créateur"}</span></div></div></div>}
        {summary && <div className="studio-transcript studio-youtube-summary"><div className="studio-youtube__header"><div><span className="studio-eyebrow"><CheckCircle2 size={14} /> RÉSUMÉ IA</span><h3>{typeof summary.title === "string" ? summary.title : "Résumé de la vidéo"}</h3><p>Généré à partir du transcript de la vidéo, sans inventer de contenu absent.</p></div></div><div className="studio-youtube-summary__body">{Object.entries(summary).filter(([key]) => key !== "title").map(([key, value]) => <section key={key}><span>{key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}</span><div>{formatSummaryValue(value).split("\n").map((line, index) => line.trim() ? <p key={`${key}-${index}`}>{line}</p> : <br key={`${key}-${index}`} />)}</div></section>)}</div></div>}
      </section>
    </main>
  );
}