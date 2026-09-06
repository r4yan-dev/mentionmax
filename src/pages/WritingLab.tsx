import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Check, ChevronDown, FileText, ImagePlus, Languages, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import "./WritingLab.css";

type WritingSubject = "philosophie" | "anglais";

type Draft = {
  id: string;
  subject: WritingSubject;
  title: string;
  prompt: string;
  text: string;
  updatedAt: string;
};

const STORAGE_KEY = "mentionmax:writing-lab:v1";

const subjectConfig: Record<WritingSubject, { label: string; language: string; placeholder: string; rubric: string[] }> = {
  philosophie: {
    label: "Philosophie",
    language: "Français",
    placeholder: "Commence ton introduction, ta problématique ou ton développement…",
    rubric: ["Problématique", "Argumentation", "Concepts", "Structure", "Expression"],
  },
  anglais: {
    label: "English",
    language: "English",
    placeholder: "Start your introduction, argument, or paragraph…",
    rubric: ["Task response", "Organization", "Grammar", "Vocabulary", "Coherence"],
  },
};

function readDrafts(): Draft[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatSaved(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function countWords(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function WritingLab() {
  const [subject, setSubject] = useState<WritingSubject>("philosophie");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const config = subjectConfig[subject];
  const words = useMemo(() => countWords(text), [text]);
  const characters = text.length;

  useEffect(() => {
    setDrafts(readDrafts());
  }, []);

  useEffect(() => {
    if (!title && !prompt && !text) return;
    const timer = window.setTimeout(() => saveDraft(false), 700);
    return () => window.clearTimeout(timer);
  }, [subject, title, prompt, text]);

  function saveDraft(showFeedback = true) {
    if (!title.trim() && !text.trim() && !prompt.trim()) return;
    const now = new Date().toISOString();
    const id = activeDraftId ?? crypto.randomUUID();
    const next: Draft = { id, subject, title: title.trim() || "Sans titre", prompt: prompt.trim(), text, updatedAt: now };
    setDrafts((current) => {
      const without = current.filter((draft) => draft.id !== id);
      const updated = [next, ...without].slice(0, 20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setActiveDraftId(id);
    if (showFeedback) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1600);
    }
  }

  function newDraft(nextSubject: WritingSubject = subject) {
    setSubject(nextSubject);
    setTitle("");
    setPrompt("");
    setText("");
    setActiveDraftId(null);
    setSaved(false);
  }

  function openDraft(draft: Draft) {
    setSubject(draft.subject);
    setTitle(draft.title === "Sans titre" ? "" : draft.title);
    setPrompt(draft.prompt);
    setText(draft.text);
    setActiveDraftId(draft.id);
    setSaved(false);
  }

  function deleteDraft(id: string) {
    const next = drafts.filter((draft) => draft.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDrafts(next);
    if (activeDraftId === id) newDraft(subject);
  }

  return (
    <main className="writing-lab-page">
      <header className="writing-lab-header">
        <div>
          <span className="writing-lab-eyebrow"><Sparkles size={14} /> WRITING LAB</span>
          <h1>Écris sans perdre ton fil.</h1>
          <p>Un espace dédié à la dissertation et à l’écriture en anglais. Commence au clavier aujourd’hui, ajoute l’import photo et la correction IA dans les prochaines étapes.</p>
        </div>
        <button type="button" className="writing-lab-save" onClick={() => saveDraft(true)} disabled={!title.trim() && !prompt.trim() && !text.trim()}>
          {saved ? <Check size={15} /> : <Save size={15} />}
          {saved ? "Enregistré" : "Enregistrer"}
        </button>
      </header>

      <div className="writing-lab-layout">
        <aside className="writing-lab-sidebar">
          <div className="writing-lab-sidebar__section">
            <span className="writing-lab-label">MATIÈRE</span>
            <div className="writing-lab-subjects">
              {(Object.keys(subjectConfig) as WritingSubject[]).map((item) => (
                <button key={item} type="button" className={`writing-lab-subject ${subject === item ? "active" : ""}`} onClick={() => newDraft(item)}>
                  <span className="writing-lab-subject__icon">{item === "philosophie" ? <BookOpenText size={16} /> : <Languages size={16} />}</span>
                  <span><strong>{subjectConfig[item].label}</strong><small>{subjectConfig[item].language}</small></span>
                </button>
              ))}
            </div>
          </div>

          <div className="writing-lab-sidebar__section writing-lab-sidebar__section--drafts">
            <div className="writing-lab-section-row"><span className="writing-lab-label">MES BROUILLONS</span><button type="button" className="writing-lab-new" onClick={() => newDraft()}><FileText size={14} /> Nouveau</button></div>
            <div className="writing-lab-drafts">
              {drafts.length === 0 && <div className="writing-lab-empty">Aucun brouillon enregistré.</div>}
              {drafts.map((draft) => (
                <button key={draft.id} type="button" className={`writing-lab-draft ${activeDraftId === draft.id ? "active" : ""}`} onClick={() => openDraft(draft)}>
                  <span><strong>{draft.title}</strong><small>{subjectConfig[draft.subject].label} · {formatSaved(draft.updatedAt)}</small></span>
                  <Trash2 size={14} onClick={(event) => { event.stopPropagation(); deleteDraft(draft.id); }} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="writing-lab-editor-card">
          <div className="writing-lab-editor-top">
            <div className="writing-lab-context"><span>{config.label}</span><i>·</i><span>{config.language}</span></div>
            <div className="writing-lab-tools"><span>{words} mots</span><span>{characters} caractères</span></div>
          </div>

          <input className="writing-lab-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={subject === "philosophie" ? "Titre de la dissertation" : "Essay title"} />
          <textarea className="writing-lab-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Sujet / consigne (facultatif)" rows={3} />

          <div className="writing-lab-input-actions">
            <button type="button" className="writing-lab-input-action writing-lab-input-action--primary"><FileText size={16} /> Écrire</button>
            <button type="button" className="writing-lab-input-action" disabled><ImagePlus size={16} /> Importer une photo <span>Bientôt · Part 2</span></button>
          </div>

          <textarea className="writing-lab-textarea" value={text} onChange={(event) => setText(event.target.value)} placeholder={config.placeholder} spellCheck="true" />

          <div className="writing-lab-bottom">
            <div><span>Structure prête pour</span><strong>{config.rubric.join(" · ")}</strong></div>
            <div className="writing-lab-ai-actions">
              <button type="button" disabled className="writing-lab-secondary"><Wand2 size={15} /> Compléter mon texte <span>Part 3</span></button>
              <button type="button" disabled className="writing-lab-primary"><Check size={15} /> Corriger <span>Part 3</span></button>
            </div>
          </div>
        </section>
      </div>

      <section className="writing-lab-planned">
        <div><span className="writing-lab-eyebrow">ROADMAP</span><h2>Trois étapes, un seul espace d’écriture.</h2></div>
        <div className="writing-lab-roadmap">
          <article className="writing-lab-roadmap-card is-active"><b>01</b><strong>Écrire & organiser</strong><p>Éditeur, sujets, brouillons, compteurs et sauvegarde.</p></article>
          <article className="writing-lab-roadmap-card"><b>02</b><strong>Photo → texte</strong><p>Importe une copie manuscrite et vérifie la transcription.</p></article>
          <article className="writing-lab-roadmap-card"><b>03</b><strong>Corriger & compléter</strong><p>Correction, rubric, feedback et continuation de ton début de texte.</p></article>
        </div>
      </section>
    </main>
  );
}
