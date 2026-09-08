import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Download, FileImage, FileText, Layers3, ListChecks, Search, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { deletePersonalLibraryItem, listPersonalLibrary, type LibraryResourceType, type PersonalLibraryItem } from "../lib/personalLibrary";
import { downloadResourcePdf, downloadResourcePng } from "../lib/resourceExport";
import { ResultViewV2 } from "./AiStudioGeneratorV2";
import "./AiStudioGenerator.css";
import "./AiStudioInteractive.css";
import "./AiStudioGeneratorV2.css";
import "./Library.css";

const labels: Record<LibraryResourceType, string> = {
  handnote: "Leçon",
  summary: "Résumé",
  flashcards: "Flashcards",
  quiz: "Quiz",
};

const icons = {
  handnote: FileText,
  summary: BookOpen,
  flashcards: Layers3,
  quiz: ListChecks,
};

function LibraryDetail({ item }: { item: PersonalLibraryItem }) {
  const resultRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const exportFile = async (kind: "png" | "pdf") => {
    const element = resultRef.current;
    if (!element) return;
    setExporting(kind);
    try {
      if (kind === "png") await downloadResourcePng(element, item.title);
      else await downloadResourcePdf(element, item.title);
    } catch (caught) {
      window.alert(caught instanceof Error ? caught.message : "Impossible de créer le fichier.");
    } finally {
      setExporting(null);
    }
  };

  return <main className="library-page">
    <header className="library-header">
      <div>
        <button type="button" className="library-back" onClick={() => navigate("/bibliotheque")}>← Ma bibliothèque</button>
        <span className="generator-eyebrow">BIBLIOTHÈQUE PERSONNELLE</span>
        <h1>{item.title}</h1>
        <p>{labels[item.resource_type]}{item.subject ? ` · ${item.subject}` : ""}{item.chapter ? ` · ${item.chapter}` : ""}</p>
      </div>
      <div className="library-export-actions">
        <button type="button" className="generator-btn generator-btn--secondary" onClick={() => void exportFile("png")} disabled={exporting !== null}><FileImage size={16} /> {exporting === "png" ? "Création…" : "Image PNG"}</button>
        <button type="button" className="generator-btn" onClick={() => void exportFile("pdf")} disabled={exporting !== null}><Download size={16} /> {exporting === "pdf" ? "Création…" : "PDF"}</button>
      </div>
    </header>
    <div ref={resultRef} className="library-render-target"><ResultViewV2 result={item.content} /></div>
  </main>;
}

export default function Library() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState<PersonalLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try { setItems(await listPersonalLibrary()); setError(null); }
      catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de charger ta bibliothèque."); }
      finally { setLoading(false); }
    })();
  }, []);

  const selected = itemId ? items.find((item) => item.id === itemId) ?? null : null;
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.title} ${item.subject ?? ""} ${item.chapter ?? ""} ${labels[item.resource_type]}`.toLowerCase().includes(needle));
  }, [items, query]);

  const remove = async (item: PersonalLibraryItem) => {
    if (!window.confirm(`Supprimer « ${item.title} » de ta bibliothèque ?`)) return;
    try {
      await deletePersonalLibraryItem(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      if (selected?.id === item.id) navigate("/bibliotheque");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Impossible de supprimer cette ressource.");
    }
  };

  if (selected) return <LibraryDetail item={selected} />;

  return <main className="library-page">
    <header className="library-header">
      <div>
        <span className="generator-eyebrow">BIBLIOTHÈQUE PERSONNELLE</span>
        <h1>Mes ressources Menti</h1>
        <p>Retrouve tes leçons, résumés, flashcards et quiz générés par AI Studio.</p>
      </div>
      <Link to="/ai-studio" className="generator-btn"><FileText size={16} /> Créer une ressource</Link>
    </header>
    <section className="library-shell">
      <div className="library-toolbar"><div className="library-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une ressource…" aria-label="Rechercher dans la bibliothèque" /></div><span>{items.length} ressource{items.length === 1 ? "" : "s"}</span></div>
      {error && <div className="library-error">{error}</div>}
      {loading ? <div className="library-empty">Chargement…</div> : filtered.length === 0 ? <div className="library-empty"><BookOpen size={28} /><strong>{items.length ? "Aucun résultat" : "Ta bibliothèque est vide"}</strong><span>{items.length ? "Essaie un autre terme de recherche." : "Sauvegarde une ressource depuis AI Studio pour la retrouver ici."}</span></div> : <div className="library-grid">{filtered.map((item) => { const Icon = icons[item.resource_type]; return <article className="library-card" key={item.id}>
        <div className="library-card__top"><span className="library-card__icon"><Icon size={18} /></span><span className="library-card__type">{labels[item.resource_type]}</span><button type="button" className="library-card__delete" onClick={() => void remove(item)} aria-label={`Supprimer ${item.title}`}><Trash2 size={15} /></button></div>
        <button type="button" className="library-card__body" onClick={() => navigate(`/bibliotheque/${item.id}`)}><h2>{item.title}</h2><p>{item.subject || "Menti"}{item.chapter ? ` · ${item.chapter}` : ""}</p><time>{new Date(item.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</time></button>
        <div className="library-card__footer"><button type="button" className="library-card__open" onClick={() => navigate(`/bibliotheque/${item.id}`)}>Ouvrir</button><span>LaTeX conservé</span></div>
      </article>; })}</div>}
    </section>
  </main>;
}
