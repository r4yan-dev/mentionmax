import { AlertCircle, ArrowRight, CheckCircle2, Clock3, FileText, FileUp, Layers3, Link2, ListChecks, LoaderCircle, PlaySquare, Sparkles, Wand2 } from "lucide-react";
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
  { to: "#youtube-transcript", icon: PlaySquare, title: "Vidéo → sous-titres", text: "V1 test : récupère les captions d'une vidéo YouTube." },
];

const recent = [
  ["Fonctions logarithmiques", "Fiche · Mathématiques", "FICHE"],
  ["Circuit RC", "Résumé · Physique-Chimie", "RÉSUMÉ"],
  ["Argumentation", "Flashcards · Français", "CARDS"],
];

type TranscriptSegment = { start: number; duration: number; text: string };
type TranscriptResult = {
  video: { id: string; title: string; author: string | null; thumbnail: string };
  transcript: { language: string; languageCode: string; isGenerated: boolean; segments: TranscriptSegment[] };
};

type FunctionErrorPayload = { error?: string; detail?: string };

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}

async function getFunctionErrorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = (await error.context.json()) as FunctionErrorPayload;
      if (payload?.detail) return `${payload.error ?? "Extraction impossible."} ${payload.detail}`;
      if (payload?.error) return payload.error;
    } catch {
      // The relay may return a non-JSON error body.
    }
    return `L'extracteur a répondu avec une erreur HTTP (${error.context?.status ?? "inconnue"}).`;
  }

  if (error instanceof Error) return error.message;
  return "Impossible de contacter l'extracteur.";
}

export default function AiStudio() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptResult | null>(null);

  async function extractYoutubeTranscript() {
    const url = youtubeUrl.trim();
    if (!url || busy) return;

    setBusy(true);
    setError(null);
    setResult(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("youtube-transcript", {
        body: { url, languages: ["fr", "en", "ar"] },
      });

      if (invokeError) {
        setError(await getFunctionErrorMessage(invokeError));
        return;
      }

      if (!data?.success) {
        setError(data?.detail ? `${data?.error ?? "Extraction impossible."} ${data.detail}` : data?.error || "Aucun sous-titre exploitable n'a été trouvé.");
        return;
      }

      setResult(data as TranscriptResult);
    } catch (error) {
      setError(await getFunctionErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="studio-page">
      <header className="studio-header">
        <div>
          <span className="studio-eyebrow"><Sparkles size={14} /> AI Studio</span>
          <h1>Fabrique tes propres ressources de révision.</h1>
          <p>Un atelier séparé du tuteur. Tu apportes un cours, un texte ou une ressource, puis MentionMax la transforme en matériel de révision exploitable.</p>
        </div>
        <div className="studio-credits"><span>CRÉATIONS</span><strong>12</strong></div>
      </header>

      <PeopleFeature variant="teacher" compact title="L’IA devient ton atelier de révision." text="Transforme tes cours en fiches, résumés, cartes et quiz sans perdre la structure du programme." action={<Link to="/ai-studio/handnotes" className="btn btn-primary"><Wand2 size={15} /> Ouvrir l’atelier</Link>} />

      <div className="studio-grid">
        <section className="studio-card">
          <span className="studio-eyebrow">COMMENCER</span>
          <h2>Choisis une transformation</h2>
          <p>Les quatre parcours gardent la même logique : source → structure → ressource prête à réviser.</p>
          <div className="studio-tools">
            {tools.map(({ to, icon: Icon, title, text }) => title.startsWith("Vidéo") ? (
              <a key={title} href={to} className="studio-tool">
                <span className="studio-tool__icon"><Icon size={18} /></span>
                <span><strong>{title}</strong><span>{text}</span></span>
                <ArrowRight className="studio-tool__arrow" size={15} />
              </a>
            ) : (
              <Link key={title} to={to} className="studio-tool">
                <span className="studio-tool__icon"><Icon size={18} /></span>
                <span><strong>{title}</strong><span>{text}</span></span>
                <ArrowRight className="studio-tool__arrow" size={15} />
              </Link>
            ))}
          </div>

          <div className="studio-drop">
            <FileUp size={24} />
            <strong>{selectedFile ?? "Dépose un fichier ici"}</strong>
            <span>PDF, image ou texte · la sélection sera utilisée par l'atelier</span>
            <input id="studio-file" hidden type="file" accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.webp" onChange={(event) => setSelectedFile(event.target.files?.[0]?.name ?? null)} />
            <div className="studio-actions"><label htmlFor="studio-file" className="studio-btn studio-btn--primary"><FileUp size={15} /> Importer</label><Link to="/ai-studio/handnotes" className="studio-btn studio-btn--soft"><Wand2 size={15} /> Ouvrir l'atelier</Link></div>
          </div>
        </section>

        <aside className="studio-card">
          <span className="studio-eyebrow">RÉCENTS</span>
          <h2>Ce que tu as créé</h2>
          <p>Un historique compact pour reprendre tes ressources sans fouiller partout.</p>
          <div className="studio-recent">{recent.map(([title, meta, badge]) => <Link to="/ai-studio/handnotes" className="studio-recent-item" key={title}><span className="studio-recent-item__icon"><FileText size={16} /></span><span><strong>{title}</strong><span>{meta}</span></span><b className="studio-badge">{badge}</b></Link>)}</div>
          <div className="studio-note">V1 en test : les vidéos servent uniquement à vérifier l'extraction des sous-titres. Aucun résumé IA n'est généré ici.</div>
          <div className="studio-actions"><Link to="/ai-help" className="studio-btn studio-btn--soft"><Sparkles size={15} /> Aller au tuteur IA <ArrowRight size={14} /></Link></div>
        </aside>
      </div>

      <section id="youtube-transcript" className="studio-card studio-youtube" aria-labelledby="youtube-transcript-title">
        <div className="studio-youtube__header">
          <div>
            <span className="studio-eyebrow"><PlaySquare size={14} /> TEST V1 · YOUTUBE</span>
            <h2 id="youtube-transcript-title">Extraire les sous-titres</h2>
            <p>Colle un lien YouTube. MentionMax récupère les captions disponibles et affiche le texte brut avec ses timestamps. Pas d'IA, pas de résumé, juste le test de la tuyauterie.</p>
          </div>
          {result && <span className="studio-status studio-status--ok"><CheckCircle2 size={14} /> Extraction réussie</span>}
        </div>

        <div className="studio-youtube__form">
          <div className="studio-url-input">
            <Link2 size={17} />
            <input value={youtubeUrl} onChange={(event) => setYoutubeUrl(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void extractYoutubeTranscript(); }} placeholder="https://www.youtube.com/watch?v=..." aria-label="Lien YouTube" />
          </div>
          <button type="button" className="studio-btn studio-btn--primary" onClick={() => void extractYoutubeTranscript()} disabled={!youtubeUrl.trim() || busy}>
            {busy ? <><LoaderCircle className="studio-spin" size={15} /> Extraction...</> : <><PlaySquare size={15} /> Extraire</>}
          </button>
        </div>

        {error && <div className="studio-youtube__error"><AlertCircle size={17} /><div><strong>Extraction impossible</strong><span>{error}</span></div></div>}

        {result && (
          <div className="studio-transcript">
            <div className="studio-transcript__meta">
              <img src={result.video.thumbnail} alt="" />
              <div><strong>{result.video.title}</strong><span>{result.video.author ?? "YouTube"} · {result.transcript.language} ({result.transcript.languageCode}) · {result.transcript.segments.length} segments{result.transcript.isGenerated ? " · automatique" : " · créée par le créateur"}</span></div>
            </div>
            <div className="studio-transcript__body">
              {result.transcript.segments.map((segment, index) => (
                <article className="studio-transcript__segment" key={`${segment.start}-${index}`}>
                  <time><Clock3 size={12} /> {formatTime(segment.start)}</time>
                  <p>{segment.text}</p>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
