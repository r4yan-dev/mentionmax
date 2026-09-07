import { ArrowRight, FileText, FileUp, Layers3, ListChecks, PlaySquare, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./AiStudio.css";

const tools = [
  { to: "/ai-studio/handnotes", icon: FileText, title: "PDF → fiches", text: "Transforme un cours ou un document en fiche structurée." },
  { to: "/ai-studio/handnotes", icon: Layers3, title: "Texte → résumé", text: "Passe du texte brut à une synthèse claire pour réviser." },
  { to: "/ai-studio/handnotes", icon: ListChecks, title: "Texte → flashcards", text: "Extrais définitions, formules et idées à mémoriser." },
  { to: "/ai-studio/handnotes", icon: PlaySquare, title: "Vidéo → quiz", text: "Prépare un quiz de vérification à partir d'une ressource." },
];

const recent = [
  ["Fonctions logarithmiques", "Fiche · Mathématiques", "FICHE"],
  ["Circuit RC", "Résumé · Physique-Chimie", "RÉSUMÉ"],
  ["Argumentation", "Flashcards · Français", "CARDS"],
];

export default function AiStudio() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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

      <div className="studio-grid">
        <section className="studio-card">
          <span className="studio-eyebrow">COMMENCER</span>
          <h2>Choisis une transformation</h2>
          <p>Les quatre parcours gardent la même logique : source → structure → ressource prête à réviser.</p>
          <div className="studio-tools">
            {tools.map(({ to, icon: Icon, title, text }) => <Link key={title} to={to} className="studio-tool"><span className="studio-tool__icon"><Icon size={18} /></span><span><strong>{title}</strong><span>{text}</span></span><ArrowRight className="studio-tool__arrow" size={15} /></Link>)}
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
          <div className="studio-note">Le tuteur IA reste dans son espace dédié. Ici, l'objectif est de produire des supports que tu peux ensuite utiliser dans la pratique.</div>
          <div className="studio-actions"><Link to="/ai-help" className="studio-btn studio-btn--soft"><Sparkles size={15} /> Aller au tuteur IA <ArrowRight size={14} /></Link></div>
        </aside>
      </div>
    </main>
  );
}
