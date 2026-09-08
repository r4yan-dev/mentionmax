import { useEffect, useMemo, useState } from "react";
import { BookOpen, Download, FileImage, FileText, Layers3, ListChecks, Search, Trash2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { deletePersonalLibraryItem, listPersonalLibrary, type LibraryResourceType, type PersonalLibraryItem } from "../lib/personalLibrary";
import { downloadResourcePdf, downloadResourcePng } from "../lib/resourceExport";
import { ResultView } from "./AiStudioGenerator";
import "./AiStudioGenerator.css";
import "./AiStudioInteractive.css";
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

function LibraryDetail({ item, onBack }: { item: PersonalLibraryItem; onBack: () => void }) {
  const resultRef = useState<HTMLDivElement | null>(null)[0];
  const [exporting, setExporting] = useState<"png" | "pdf" | null>(null);
  const exportFile = async (kind: "png" | "pdf") => {
    const element = resultRef;
    if (!element) return;
    setExporting(kind);
    try {
      if (kind === "png") await downloadResourcePng(element, item.title);
      else await downloadResourcePdf(element, item.title);
    } finally {
      setExporting(null);
    }
  };

  return <main className="library-page">
    <header className="library-header">
      <div>
        <button type="button" className="library-back" onClick={onBack}>← Ma bibliothèque</button>
        <span className="generator-eyebrow">BIBLIOTHÈQUE PERSONNELLE</span>
        <h1>{item.title}</h1>
        <p>{labels[item.resource_type]}{item.subject ? ` · ${item.subject}` : ""}{item.chapter ? ` · ${item.chapter}` : ""}</p>
      </div>
      <div className="library-export-actions">
        <button type="button" className="generator-btn generator-btn--secondary" onClick={() => void exportFile("png")} disabled={exporting !== null}><FileImage size={16} /> {exporting === "png" ? "Création…" : "Image PNG"}</button>
        <button type="button" className="generator-btn" onClick={() => void exportFile("pdf")} disabled={exporting !== null}><Download size={16} /> {exporting === "pdf" ? "Création…" : "PDF"}</button>
      </div>
    </header>
    <div className="library-render-target" ref={(node) => { if (node && resultRef !== node) { /* ref callback kept intentionally lightweight */ } }}>
      <div className="generator-handwritten-resource library-render-result"><ResultView result={item.content} /></div>
    </div>
  </main>;
}

export default function Library() {
  const { itemId } = useParams();
  const [items, setItems] = useState<PersonalLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PersonalLibraryItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try { setItems(await listPersonalLibrary()); setError(null); } catch (caught) { setError(caught instanceof Error ? caught.message : "Impossible de charger ta bibliothèque."); }
    finally { setLoading(false); }
  };

  useEffect(() => { void refresh(); }, []);
  useEffect(() => { setSelected(itemId ? items.find((item) => item.id === itemId) ?? null : null); }, [itemId, items]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.title} ${item.subject ?? ""} ${item.chapter ?? ""} ${labels[item.resource_type]}`.toLowerCase().includes(needle));
  }, [items, query]);

  const remove = async (item: PersonalLibraryItem) => {
    if (!window.confirm(`Supprimer « ${item.title} » de ta bibliothèque ?`)) return;
    await deletePersonalLibraryItem(item.id);
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    if (selected?.id === item.id) setSelected(null);
  };

  if (selected) return <LibraryDetail item={selected} onBack={() => setSelected(null)} />;

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
        <button type="button" className="library-card__body" onClick={() => setSelected(item)}><h2>{item.title}</h2><p>{item.subject || "Menti"}{item.chapter ? ` · ${item.chapter}` : ""}</p><time>{new Date(item.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}</time></button>
        <div className="library-card__footer"><button type="button" className="library-card__open" onClick={() => setSelected(item)}>Ouvrir</button><span>LaTeX conservé</span></div>
      </article>; })}</div>}
    </section>
  </main>;
}
