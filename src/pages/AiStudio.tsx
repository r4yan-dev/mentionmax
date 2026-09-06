import { AlertCircle, ArrowRight, CheckCircle2, Clock3, Copy, FileText, FileUp, Layers3, Link2, ListChecks, LoaderCircle, PlaySquare, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import PeopleFeature from "../components/ui/PeopleFeature";
import { supabase } from "../lib/supabase";
import "./AiStudio.css";

const tools = [
  { to: "/ai-studio/handnotes", icon: FileText, title: "PDF → fiches", text: "Transforme un cours ou un document en fiche structurée." },
  { to: "/ai-studio/handnotes", icon: Layers3, title: "Texte → résumé", text: "Passe du texte brut à une synthèse claire pour réviser." },
  { to: "/ai-studio/handnotes", icon: ListChecks, title: "Texte → flashcards", text: "Extrais définitions, formules et idées à mémoriser." },
  { to: "#youtube-transcript", icon: PlaySquare, title: "Vidéo → sous-titres", text: "Uniquement pour les vidéos éducatives et de révision." },
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

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}` : `${minutes}:${String(secs).padStart(2, "0")}`;
}

async function getFunctionErrorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as FunctionErrorPayload;
      if (payload?.detail) return `${payload.error ?? "Extraction impossible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {}
    return `L'extracteur a répondu avec une erreur HTTP (${error.context?.status ?? "inconnue"}).`;
  }
  if (error instanceof Error) return error.message;
  return "Impossible de contacter l'extracteur.";
}

async function fileToDataUrl(file: File) {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export default function AiStudio() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [fileBusy, setFileBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptResult | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function extractYoutubeTranscript() {
    const url = youtubeUrl.trim();
    if (!url || busy) return;
    setBusy(true); setError(null); setResult(null);
    try {
      const { data: gate, error: gateError } = await supabase.functions.invoke("youtube-education-gate", { body: { url } });
      if (gateError) { setError(await getFunctionErrorMessage(gateError)); return; }
      const educationCheck = gate as EducationGateResult;
      if (!educationCheck?.allowed) { setError(educationCheck?.reason ?? "Cette vidéo ne semble pas être éducative."); return; }
      const { data, error: invokeError } = await supabase.functions.invoke("youtube-transcript-v2", { body: { url, languages: ["fr", "en", "ar"] } });
      if (invokeError) { setError(await getFunctionErrorMessage(invokeError)); return; }
      if (!data?.success) { setError(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun sous-titre exploitable n'a été trouvé."); return; }
      setResult(data as TranscriptResult);
    } catch (error) { setError(await getFunctionErrorMessage(error)); }
    finally { setBusy(false); }
  }

  async function extractFileText() {
    if (!selectedFile || fileBusy) return;
    setFileBusy(true); setFileError(null); setExtractedText(null); setCopied(false);
    try {
      const allowed = selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/") || /\.(pdf|png|jpe?g|webp)$/i.test(selectedFile.name);
      if (!allowed) { setFileError("Format non pris en charge. Utilise un PDF, PNG, JPG ou WebP."); return; }
      if (selectedFile.size > 12 * 1024 * 1024) { setFileError("Fichier trop volumineux. La limite actuelle est d’environ 12 Mo."); return; }
      const dataUrl = await fileToDataUrl(selectedFile);
      const { data, error: invokeError } = await supabase.functions.invoke("pdf-text-extractor", {
        body: { fileName: selectedFile.name, mimeType: selectedFile.type, data: dataUrl },
      });
      if (invokeError) { setFileError(await getFunctionErrorMessage(invokeError)); return; }
      if (!data?.success) { setFileError(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun texte lisible n'a été trouvé."); return; }
      const extraction = data as PdfExtractionResult;
      setExtractedText(extraction.text);
    } catch (error) { setFileError(error instanceof Error ? error.message : "Impossible de lire ce fichier."); }
    finally { setFileBusy(false); }
  }

  async function copyExtractedText() {
    if (!extractedText) return;
    try { await navigator.clipboard.writeText(extractedText); setCopied(true); window.setTimeout(() => setCopied(false), 1500); }
    catch { setFileError("Impossible de copier le texte."); }
  }

  return (
    <main className="studio-page">
      <header className="studio-header">
        <div><span className="studio-eyebrow"><Sparkles size={14} /> AI Studio</span><h1>Fabrique tes propres ressources de révision.</h1><p>Un atelier séparé du tuteur. Tu apportes un cours, un texte ou une ressource, puis MentionMax la transforme en matériel de révision exploitable.</p></div>
        <div className="studio-credits"><span>CRÉATIONS</span><strong>12</strong></div>
      </header>
      <PeopleFeature variant="teacher" compact title="L’IA devient ton atelier de révision." text="Transforme tes cours en fiches, résumés, cartes et quiz sans perdre la structure du programme." action={<Link to="/ai-studio/handnotes" className="btn btn-primary"><Wand2 size={15} /> Ouvrir l’atelier</Link>} />
      <div className="studio-grid">
        <section className="studio-card"><span className="studio-eyebrow">COMMENCER</span><h2>Choisis une transformation</h2><p>Les quatre parcours gardent la même logique : source → structure → ressource prête à réviser.</p><div className="studio-tools">{tools.map(({ to, icon: Icon, title, text }) => title.startsWith("Vidéo") ? <a key={title} href={to} className="studio-tool"><span className="studio-tool__icon"><Icon size={18} /></span><span><strong>{title}</strong><span>{text}</span></span><ArrowRight className="studio-tool__arrow" size={15} /></a> : <Link key={title} to={to} className="studio-tool"><span className="studio-tool__icon"><Icon size={18} /></span><span><strong>{title}</strong><span>{text}</span></span><ArrowRight className="studio-tool__arrow" size={15} /></Link>)}</div><div className="studio-drop"><FileUp size={24} /><strong>{selectedFile?.name ?? "Dépose un fichier ici"}</strong><span>PDF numérique, PDF scanné ou image · OCR IA automatique</span><input id="studio-file" hidden type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp" onChange={(event) => { const file = event.target.files?.[0] ?? null; setSelectedFile(file); setFileError(null); setExtractedText(null); setCopied(false); }} /><div className="studio-actions"><label htmlFor="studio-file" className="studio-btn studio-btn--primary"><FileUp size={15} /> Importer</label><button type="button" className="studio-btn studio-btn--soft" onClick={() => void extractFileText()} disabled={!selectedFile || fileBusy}>{fileBusy ? <><LoaderCircle className="studio-spin" size={15} /> Extraction IA...</> : <><FileText size={15} /> Extraire le texte</>}</button><Link to="/ai-studio/handnotes" className="studio-btn studio-btn--soft"><Wand2 size={15} /> Ouvrir l’atelier</Link></div>{fileError && <div className="studio-youtube__error"><AlertCircle size={17} /><div><strong>Extraction impossible</strong><span>{fileError}</span></div></div>}{extractedText && <div className="studio-transcript"><div className="studio-youtube__header"><div><span className="studio-eyebrow"><CheckCircle2 size={14} /> EXTRACTION IA</span><h3>{selectedFile?.name}</h3><p>Texte détecté dans le document. Les scans et images passent automatiquement par la vision IA.</p></div><button type="button" className="studio-btn studio-btn--soft" onClick={() => void copyExtractedText()}><Copy size={15} /> {copied ? "Copié" : "Copier"}</button></div><pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 520, overflowY: "auto", padding: "18px", borderRadius: 14, background: "var(--mm-surface-subtle, #f6f8f7)", fontFamily: "inherit", lineHeight: 1.65 }}>{extractedText}</pre></div>}</div></section>
        <aside className="studio-card"><span className="studio-eyebrow">RÉCENTS</span><h2>Ce que tu as créé</h2><p>Un historique compact pour reprendre tes ressources sans fouiller partout.</p><div className="studio-recent">{recent.map(([title, meta, badge]) => <Link to="/ai-studio/handnotes" className="studio-recent-item" key={title}><span className="studio-recent-item__icon"><FileText size={16} /></span><span><strong>{title}</strong><span>{meta}</span></span><b className="studio-badge">{badge}</b></Link>)}</div><div className="studio-note">V1 : PDF numériques, PDF scannés et images peuvent être convertis en texte avant de passer à la génération de fiches.</div><div className="studio-actions"><Link to="/ai-help" className="studio-btn studio-btn--soft"><Sparkles size={15} /> Aller au tuteur IA <ArrowRight size={14} /></Link></div></aside>
      </div>
      <section id="youtube-transcript" className="studio-card studio-youtube" aria-labelledby="youtube-transcript-title">
        <div className="studio-youtube__header"><div><span className="studio-eyebrow"><PlaySquare size={14} /> TEST V1 · YOUTUBE</span><h2 id="youtube-transcript-title">Extraire les sous-titres</h2><p>Colle un lien YouTube. MentionMax vérifie d’abord que la vidéo est éducative avant de lancer l’extraction.</p></div>{result && <span className="studio-status studio-status--ok"><CheckCircle2 size={14} /> Extraction réussie</span>}</div>
        <div className="studio-youtube__form"><div className="studio-url-input"><Link2 size={17} /><input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void extractYoutubeTranscript(); }} placeholder="https://www.youtube.com/watch?v=..." aria-label="Lien YouTube" /></div><button type="button" className="studio-btn studio-btn--primary" onClick={() => void extractYoutubeTranscript()} disabled={!youtubeUrl.trim() || busy}>{busy ? <><LoaderCircle className="studio-spin" size={15} /> Vérification...</> : <><PlaySquare size={15} /> Vérifier et extraire</>}</button></div>
        {error && <div className="studio-youtube__error"><AlertCircle size={17} /><div><strong>Extraction impossible</strong><span>{error}</span></div></div>}
        {result && <div className="studio-transcript"><div className="studio-transcript__meta"><img src={result.video.thumbnail} alt="" /><div><strong>{result.video.title}</strong><span>{result.video.author ?? "YouTube"} · {result.transcript.language} ({result.transcript.languageCode}) · {result.transcript.segments.length} segments{result.transcript.isGenerated ? " · automatique" : " · créée par le créateur"}{result.transcript.source ? ` · ${result.transcript.source}` : ""}</span></div></div><div className="studio-transcript__body">{result.transcript.segments.map((segment, index) => <article className="studio-transcript__segment" key={`${segment.start}-${index}`}><time><Clock3 size={12} /> {formatTime(segment.start)}</time><p>{segment.text}</p></article>)}</div></div>}
      </section>
    </main>
  );
}
