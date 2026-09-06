import { useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Check, FileText, Layers3, ListChecks, LoaderCircle, RefreshCw, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { generateStudioResource, type StudioGenerationMode } from "../services/ai/studioGenerate";
import "./AiStudioGenerator.css";

type ResultRecord = Record<string, unknown>;

const modes: { id: StudioGenerationMode; title: string; text: string; icon: typeof FileText }[] = [
  { id: "handnote", title: "Fiche structurée", text: "Notions, définitions, formules, exemples et points examen.", icon: FileText },
  { id: "summary", title: "Résumé", text: "Une synthèse claire, dense et directement révisable.", icon: BookOpen },
  { id: "flashcards", title: "Flashcards", text: "Questions-réponses prêtes à mémoriser.", icon: Layers3 },
  { id: "quiz", title: "Quiz", text: "QCM avec réponse correcte et explication.", icon: ListChecks },
];

function stringifyValue(value: unknown) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? `• ${item}` : JSON.stringify(item)).join("\n");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function ResultView({ result }: { result: ResultRecord }) {
  const title = typeof result.title === "string" ? result.title : "Ressource générée";
  const entries = Object.entries(result).filter(([key]) => key !== "title");

  return (
    <div className="generator-result">
      <div className="generator-result__head">
        <div>
          <span className="generator-eyebrow"><Check size={14} /> GÉNÉRATION TERMINÉE</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="generator-result__grid">
        {entries.map(([key, value]) => {
          const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
          const isCards = key === "cards" || key === "questions" || key === "sections" || key === "keyPoints" || key === "formulas" || key === "definitions";
          return (
            <section key={key} className={`generator-result__block ${isCards ? "is-rich" : ""}`}>
              <span className="generator-result__label">{label}</span>
              <div className="generator-result__content">
                {Array.isArray(value) ? value.map((item, index) => (
                  <article className="generator-result__item" key={`${key}-${index}`}>
                    {typeof item === "object" && item !== null ? Object.entries(item as Record<string, unknown>).map(([itemKey, itemValue]) => (
                      <div key={itemKey}><strong>{itemKey.replace(/([A-Z])/g, " $1")}</strong><p>{stringifyValue(itemValue)}</p></div>
                    )) : <p>{stringifyValue(item)}</p>}
                  </article>
                )) : <p>{stringifyValue(value)}</p>}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function AiStudioGenerator() {
  const location = useLocation();
  const initialMode = useMemo<StudioGenerationMode>(() => {
    const requested = new URLSearchParams(location.search).get("mode") as StudioGenerationMode | null;
    return modes.some((mode) => mode.id === requested) ? requested! : "handnote";
  }, [location.search]);
  const [mode, setMode] = useState<StudioGenerationMode>(initialMode);
  const [text, setText] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [track, setTrack] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultRecord | null>(null);

  async function generate() {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError(null);
    setResult(null);
    try {
      const next = await generateStudioResource<ResultRecord>({ mode, text, subject, chapter, track });
      setResult(next);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "La génération IA a échoué.");
    } finally {
      setBusy(false);
    }
  }

  const selectedMode = modes.find((item) => item.id === mode)!;

  return (
    <main className="generator-page">
      <header className="generator-header">
        <div>
          <Link to="/ai-studio" className="generator-back"><ArrowLeft size={16} /> AI Studio</Link>
          <span className="generator-eyebrow"><Sparkles size={14} /> ATELIER DE GÉNÉRATION</span>
          <h1>Transforme ton cours en ressource de révision.</h1>
          <p>Choisis le résultat, ajoute ton contenu source et laisse le moteur pédagogique structurer le document.</p>
        </div>
        <div className="generator-status"><span>MODÈLE</span><strong>Gemini 3.6 Flash</strong></div>
      </header>

      <section className="generator-shell">
        <div className="generator-modes">
          <div className="generator-section-title"><span>01</span><div><strong>Choisir le résultat</strong><small>Le même contenu peut produire plusieurs formats.</small></div></div>
          <div className="generator-mode-grid">
            {modes.map(({ id, title, text: description, icon: Icon }) => (
              <button type="button" className={`generator-mode ${mode === id ? "is-active" : ""}`} key={id} onClick={() => { setMode(id); setResult(null); setError(null); }}>
                <span className="generator-mode__icon"><Icon size={18} /></span>
                <span><strong>{title}</strong><small>{description}</small></span>
              </button>
            ))}
          </div>
        </div>

        <div className="generator-input-area">
          <div className="generator-section-title"><span>02</span><div><strong>Source</strong><small>Colle un texte extrait, un cours ou une partie de document.</small></div></div>
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Colle ici le contenu à transformer…" />
          <div className="generator-meta-grid">
            <label><span>Matière</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Mathématiques" /></label>
            <label><span>Chapitre</span><input value={chapter} onChange={(event) => setChapter(event.target.value)} placeholder="Dérivation" /></label>
            <label><span>Parcours</span><select value={track} onChange={(event) => setTrack(event.target.value)}><option value="">Automatique</option><option value="SP">2BAC Sciences Physiques</option><option value="SMA">2BAC Sciences Mathématiques A</option><option value="SMB">2BAC Sciences Mathématiques B</option></select></label>
          </div>
          <div className="generator-actions"><span>{text.trim().length.toLocaleString("fr-FR")} caractères</span><button type="button" className="generator-btn" onClick={() => void generate()} disabled={!text.trim() || busy}>{busy ? <><LoaderCircle className="generator-spin" size={16} /> Génération…</> : <><Sparkles size={16} /> Générer {selectedMode.title.toLowerCase()}</>}</button></div>
          {error && <div className="generator-error"><strong>Génération impossible</strong><span>{error}</span></div>}
        </div>
      </section>

      {result && (
        <section className="generator-output">
          <div className="generator-output__toolbar"><div><span className="generator-eyebrow">03 · APERÇU</span><strong>Résultat généré</strong></div><button type="button" className="generator-btn generator-btn--secondary" onClick={() => void generate()} disabled={busy}><RefreshCw size={15} /> Régénérer</button></div>
          <ResultView result={result} />
        </section>
      )}
    </main>
  );
}
