import { AlertCircle, ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Copy, FileText, FileUp, GripVertical, ImagePlus, Layers3, Link2, ListChecks, LoaderCircle, PlaySquare, Sparkles, Wand2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { generateStudioResource } from "../services/ai/studioGenerate";
import PeopleFeature from "../components/ui/PeopleFeature";
import "./AiStudio.css";

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PHOTOS = 12;
const FILE_EXTRACTION_TIMEOUT_MS = 105_000;

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

const tools = [
  { to: "/ai-studio/handnotes", icon: FileText, title: "PDF → fiches", text: "Transforme un cours ou un document en fiche structurée." },
  { to: "/ai-studio/handnotes", icon: Layers3, title: "Texte → résumé", text: "Passe du texte brut à une synthèse claire pour réviser." },
  { to: "/ai-studio/handnotes", icon: ListChecks, title: "Texte → flashcards", text: "Extrais définitions, formules et idées à mémoriser." },
  { to: "/ai-studio/writing", icon: ImagePlus, title: "Writing Lab", text: "Rédige une dissertation ou un essay, avec photo manuscrite et correction à venir." },
  { to: "#youtube-transcript", icon: PlaySquare, title: "VIDÉO → RÉSUMÉ", text: "Transforme une vidéo éducative en synthèse de révision." },
];

const recent = [
  ["Fonctions logarithmiques", "Fiche · Mathématiques", "FICHE"],
  ["Circuit RC", "Résumé · Physique-Chimie", "RÉSUMÉ"],
  ["Argumentation", "Flashcards · Français", "CARDS"],
];

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
      if (payload?.detail) return `${payload.error ?? "Impossible de traiter le contenu."} ${payload.detail}`;
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
  } finally {
    if (timer !== null) window.clearTimeout(timer);
  }
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
    if (images.length > capacity) setFileError(`Seules ${MAX_PHOTOS} pages photo peuvent être importées.`);
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
      if (selectedFile.size > MAX_FILE_SIZE_BYTES) { setFileError(`Fichier trop volumineux. La limite est de ${MAX_FILE_SIZE_MB} Mo.`); return; }
      setFileError("Lecture du fichier…");
      const dataUrl = await fileToDataUrl(selectedFile);
      setFileError("Envoi à l’extracteur IA…");
      const { data, error: invokeError } = await withTimeout(
        supabase.functions.invoke("pdf-text-extractor", { body: { fileName: selectedFile.name, mimeType: selectedFile.type, data: dataUrl } }),
        FILE_EXTRACTION_TIMEOUT_MS,
        "L’extraction prend trop de temps. Essaie un fichier plus léger.",
      );
      if (invokeError) { setFileError(await getFunctionErrorMessage(invokeError)); return; }
      if (!data?.success) { setFileError(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun texte lisible n'a été trouvé."); return; }
      const extraction = data as PdfExtractionResult;
      setFileError(null);
      setExtractedText(extraction.text.trim());
    } catch (caught) {
      setFileError(await getFunctionErrorMessage(caught));
    } finally {
      setFileBusy(false);
    }
  }

  async function copyExtractedText() {
    if (!extractedText) return;
    await navigator.clipboard.writeText(extractedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function saveExtractedTextToNotes() {
    if (!extractedText || savingToNotes) return;
    setSavingToNotes(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Connecte-toi pour enregistrer le texte dans tes notes.");
      const { error: noteError } = await supabase.from("notes").insert({ user_id: userId, title: selectedFile?.name ?? "Texte extrait", content: extractedText });
      if (noteError) throw noteError;
      setSavedToNotes(true);
    } catch (caught) {
      setFileError(await getFunctionErrorMessage(caught));
    } finally {
      setSavingToNotes(false);
    }
  }

  return (
    <main className="ai-studio-page">
      <section className="studio-tools">
        <div className="studio-section-heading">
          <div>
            <span className="studio-eyebrow"><Sparkles size={14} /> AI STUDIO</span>
            <h1>Crée des ressources de révision avec l’IA.</h1>
            <p>Transforme tes cours, textes, photos et vidéos en contenus exploitables pour réviser plus vite.</p>
          </div>
        </div>
        <div className="studio-tool-grid">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const content = (
              <>
                <div className="studio-tool-icon"><Icon size={20} /></div>
                <div className="studio-tool-copy">
                  <strong>{tool.title}</strong>
                  <span>{tool.text}</span>
                </div>
                <ArrowRight size={17} className="studio-tool-arrow" />
              </>
            );
            return tool.to.startsWith("#") ? <a key={tool.title} href={tool.to} className="studio-tool-card">{content}</a> : <Link key={tool.title} to={tool.to} className="studio-tool-card">{content}</Link>;
          })}
        </div>
      </section>

      <section className="studio-upload-section">
        <div className="studio-section-heading">
          <div>
            <span className="studio-eyebrow"><FileUp size={14} /> DOCUMENTS</span>
            <h2>Dépose un fichier ici</h2>
            <p>PDF numérique, PDF scanné ou image · OCR IA automatique · max. 25 Mo</p>
          </div>
        </div>
        <div className={`studio-dropzone ${dropActive ? "is-active" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDropActive(true); }}
          onDragLeave={() => setDropActive(false)}
          onDrop={(event) => { event.preventDefault(); setDropActive(false); addFiles(event.dataTransfer.files); }}>
          <input id="studio-file-input" type="file" accept="application/pdf,image/png,image/jpeg,image/webp" multiple onChange={(event) => addFiles(event.target.files)} hidden />
          <label htmlFor="studio-file-input" className="studio-upload-actions"><span className="studio-primary-button">Importer</span></label>
          <button className="studio-secondary-button" type="button" onClick={extractFileText} disabled={fileBusy || (!selectedFile && photoPages.length === 0)}>{fileBusy ? "Extraction…" : "Extraire le texte"}</button>
        </div>
        {fileError && <div className="studio-inline-error"><AlertCircle size={16} /> {fileError}</div>}
        {photoPages.length > 0 && (
          <div className="studio-photo-pages">
            <div className="studio-photo-pages__header">
              <div><strong>{photoPages.length}/{MAX_PHOTOS} pages</strong><span>Réorganise les pages avant extraction.</span></div>
              <button type="button" className="studio-text-button" onClick={clearPhotos}>Tout retirer</button>
            </div>
            <div className="studio-photo-grid">
              {photoPages.map((page, index) => (
                <article key={page.id} className="studio-photo-card" draggable
                  onDragStart={() => setDraggedPageId(page.id)}
                  onDragEnd={() => setDraggedPageId(null)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => { event.preventDefault(); reorderPhoto(draggedPageId ?? "", page.id); setDraggedPageId(null); }}>
                  <div className="studio-photo-card__top"><span><GripVertical size={14} /> Page {index + 1}</span><button type="button" onClick={() => removePhoto(page.id)}><X size={14} /></button></div>
                  <img src={page.url} alt={`Page ${index + 1}`} />
                  <div className="studio-photo-card__controls">
                    <button type="button" onClick={() => movePhoto(page.id, -1)} disabled={index === 0}><ChevronLeft size={15} /></button>
                    <button type="button" onClick={() => movePhoto(page.id, 1)} disabled={index === photoPages.length - 1}><ChevronRight size={15} /></button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
        {extractedText && (
          <div className="studio-extraction-result">
            <div className="studio-result-header"><strong>Texte extrait</strong><div><button type="button" onClick={copyExtractedText}>{copied ? <><CheckCircle2 size={15} /> Copié</> : <><Copy size={15} /> Copier</>}</button><button type="button" onClick={saveExtractedTextToNotes} disabled={savingToNotes}>{savedToNotes ? <><CheckCircle2 size={15} /> Enregistré</> : <><FileText size={15} /> Ouvrir l’atelier</>}</button></div></div>
            <pre>{escapeHtml(extractedText)}</pre>
          </div>
        )}
      </section>

      <section id="youtube-transcript" className="studio-youtube-section">
        <div className="studio-youtube__header">
          <div>
            <span className="studio-eyebrow"><Sparkles size={14} /> AI STUDIO · YOUTUBE</span>
            <h2 id="youtube-transcript-title">Créer un résumé de la vidéo</h2>
            <p>Colle un lien YouTube éducatif. MentionMax vérifie la vidéo, récupère le transcript, puis génère automatiquement une synthèse de révision.</p>
          </div>
          {summary && <span className="studio-status-pill"><CheckCircle2 size={15} /> Résumé prêt</span>}
        </div>
        <div className="studio-youtube__form">
          <label htmlFor="youtube-url">Lien YouTube</label>
          <div className="studio-youtube__input-row">
            <div className="studio-url-input"><Link2 size={17} /><input id="youtube-url" type="url" value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></div>
            <button type="button" className="studio-primary-button" onClick={createYoutubeSummary} disabled={!youtubeUrl.trim() || busy}>{busy ? "Vérification + résumé..." : "Faire le résumé"}</button>
          </div>
          {error && <div className="studio-inline-error"><AlertCircle size={16} /> {error}</div>}
        </div>
        {result && (
          <div className="studio-youtube-result">
            <div className="studio-video-card"><img src={result.video.thumbnail} alt="" /><div><strong>{result.video.title}</strong><span>{result.video.author ?? "YouTube"} · {result.transcript.language}</span></div></div>
            {summary ? (
              <div className="studio-summary-card">
                <div className="studio-result-header"><strong>RÉSUMÉ IA</strong><span><Wand2 size={15} /> Synthèse générée</span></div>
                <div className="studio-summary-content">
                  {Object.entries(summary).map(([key, value]) => <div key={key} className="studio-summary-block"><span>{key.replace(/_/g, " ")}</span><p>{formatSummaryValue(value)}</p></div>)}
                </div>
              </div>
            ) : (
              <div className="studio-loading-state"><LoaderCircle size={18} className="spin" /> Génération de la synthèse…</div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
