import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Check, FileText, ImagePlus, Languages, Save, Sparkles, Trash2, Wand2, X } from "lucide-react";
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

type PhotoPage = {
  id: string;
  file: File;
  url: string;
};

const STORAGE_KEY = "mentionmax:writing-lab:v1";
const MAX_PHOTO_SIZE_MB = 12;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

const subjectConfig: Record<WritingSubject, { label: string; language: string; dir: "ltr" | "rtl"; placeholder: string; rubric: string[] }> = {
  philosophie: {
    label: "Philosophie",
    language: "العربية",
    dir: "rtl",
    placeholder: "اكتب مقدمتك أو الإشكالية أو التحليل أو الخاتمة…",
    rubric: ["طرح الإشكال", "الحجاج", "المفاهيم", "المنهجية", "سلامة التعبير"],
  },
  anglais: {
    label: "English",
    language: "English",
    dir: "ltr",
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
  const [transcription, setTranscription] = useState("");
  const [photos, setPhotos] = useState<PhotoPage[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const config = subjectConfig[subject];
  const words = useMemo(() => countWords(text), [text]);
  const characters = text.length;

  useEffect(() => {
    setDrafts(readDrafts());
  }, []);

  useEffect(() => {
    return () => photos.forEach((photo) => URL.revokeObjectURL(photo.url));
  }, [photos]);

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
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setSubject(nextSubject);
    setTitle("");
    setPrompt("");
    setText("");
    setTranscription("");
    setPhotos([]);
    setActiveDraftId(null);
    setSaved(false);
    setPhotoError(null);
  }

  function openDraft(draft: Draft) {
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setSubject(draft.subject);
    setTitle(draft.title === "Sans titre" ? "" : draft.title);
    setPrompt(draft.prompt);
    setText(draft.text);
    setTranscription("");
    setActiveDraftId(draft.id);
    setSaved(false);
    setPhotoError(null);
  }

  function deleteDraft(id: string) {
    const next = drafts.filter((draft) => draft.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setDrafts(next);
    if (activeDraftId === id) newDraft(subject);
  }

  function addPhotos(fileList: FileList | null) {
    if (!fileList) return;
    setPhotoError(null);
    const incoming = Array.from(fileList);
    const rejected = incoming.find((file) => !file.type.startsWith("image/") || file.size > MAX_PHOTO_SIZE_BYTES);
    if (rejected) {
      setPhotoError(`Chaque photo doit être une image de ${MAX_PHOTO_SIZE_MB} Mo maximum.`);
    }
    const valid = incoming.filter((file) => file.type.startsWith("image/") && file.size <= MAX_PHOTO_SIZE_BYTES);
    if (!valid.length) return;
    const pages = valid.map((file) => ({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file) }));
    setPhotos((current) => [...current, ...pages].slice(0, 12));
  }

  function removePhoto(id: string) {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return current.filter((photo) => photo.id !== id);
    });
  }

  function useTranscription() {
    const cleaned = transcription.trim();
    if (!cleaned) return;
    setText((current) => current.trim() ? `${current.trim()}\n\n${cleaned}` : cleaned);
    setTranscription("");
  }

  return (
    <main className="writing-lab-page">
      <header className="writing-lab-header">
        <div>
          <span className="writing-lab-eyebrow"><Sparkles size={14} /> WRITING LAB</span>
          <h1>Écris sans perdre ton fil.</h1>
          <p>Un espace dédié à la dissertation et à l’écriture en anglais. Écris, photographie tes pages, vérifie la transcription puis travaille ton texte.</p>
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
            <div className={`writing-lab-context ${config.dir === "rtl" ? "is-rtl" : ""}`} dir={config.dir}><span>{config.label}</span><i>·</i><span>{config.language}</span></div>
            <div className="writing-lab-tools"><span>{words} mots</span><span>{characters} caractères</span></div>
          </div>

          <input className="writing-lab-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={subject === "philosophie" ? "عنوان المقالة الفلسفية" : "Essay title"} dir={config.dir} />
          <textarea className="writing-lab-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={subject === "philosophie" ? "الموضوع / السؤال (اختياري)" : "Essay prompt (optional)"} rows={3} dir={config.dir} />

          <div className="writing-lab-input-actions">
            <button type="button" className="writing-lab-input-action writing-lab-input-action--primary"><FileText size={16} /> {subject === "philosophie" ? "الكتابة" : "Write"}</button>
            <label htmlFor="writing-lab-photo" className="writing-lab-input-action">
              <ImagePlus size={16} /> {subject === "philosophie" ? "استيراد صورة" : "Import photo"}
              <span>OCR جاهز · Part 2</span>
            </label>
            <input id="writing-lab-photo" hidden type="file" accept="image/*" capture="environment" multiple onChange={(event) => { addPhotos(event.target.files); event.currentTarget.value = ""; }} />
          </div>

          {photos.length > 0 && (
            <section className="writing-lab-photo-review" aria-label="Photos importées">
              <div className="writing-lab-photo-review__header">
                <div><span className="writing-lab-label">PAGES IMPORTÉES</span><strong>{photos.length} photo{photos.length > 1 ? "s" : ""}</strong></div>
                <label htmlFor="writing-lab-photo-more" className="writing-lab-photo-add"><ImagePlus size={14} /> Ajouter</label>
                <input id="writing-lab-photo-more" hidden type="file" accept="image/*" capture="environment" multiple onChange={(event) => { addPhotos(event.target.files); event.currentTarget.value = ""; }} />
              </div>
              <div className="writing-lab-photo-grid">
                {photos.map((photo, index) => (
                  <article key={photo.id} className="writing-lab-photo-card">
                    <img src={photo.url} alt={`Page ${index + 1}`} />
                    <div><span>Page {index + 1}</span><button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Supprimer page ${index + 1}`}><X size={14} /></button></div>
                  </article>
                ))}
              </div>
              {photoError && <p className="writing-lab-photo-error">{photoError}</p>}
              <div className="writing-lab-transcription">
                <div className="writing-lab-transcription__header"><div><span className="writing-lab-label">TRANSCRIPTION</span><strong>Vérifie le texte avant de l’utiliser.</strong></div><span className="writing-lab-transcription__status">OCR IA · à connecter</span></div>
                <textarea value={transcription} onChange={(event) => setTranscription(event.target.value)} placeholder={config.dir === "rtl" ? "La transcription apparaîtra ici. Tu pourras la corriger avant de l’ajouter à ta rédaction." : "The extracted transcription will appear here. Check it before adding it to your essay."} dir={config.dir} />
                <div className="writing-lab-transcription__actions"><span>Le texte reste modifiable avant insertion.</span><button type="button" onClick={useTranscription} disabled={!transcription.trim()}><Check size={14} /> {config.dir === "rtl" ? "إضافة إلى المقالة" : "Ajouter au texte"}</button></div>
              </div>
            </section>
          )}

          <textarea className={`writing-lab-textarea ${config.dir === "rtl" ? "is-rtl" : ""}`} value={text} onChange={(event) => setText(event.target.value)} placeholder={config.placeholder} spellCheck="true" dir={config.dir} />

          <div className="writing-lab-bottom">
            <div><span>Structure prête pour</span><strong dir={config.dir}>{config.rubric.join(" · ")}</strong></div>
            <div className="writing-lab-ai-actions">
              <button type="button" disabled className="writing-lab-secondary"><Wand2 size={15} /> {config.dir === "rtl" ? "أكمل نصي" : "Complete my text"} <span>Part 3</span></button>
              <button type="button" disabled className="writing-lab-primary"><Check size={15} /> {config.dir === "rtl" ? "تصحيح" : "Correct"} <span>Part 3</span></button>
            </div>
          </div>
        </section>
      </div>

      <section className="writing-lab-planned">
        <div><span className="writing-lab-eyebrow">ROADMAP</span><h2>Trois étapes, un seul espace d’écriture.</h2></div>
        <div className="writing-lab-roadmap">
          <article className="writing-lab-roadmap-card"><b>01</b><strong>Écrire & organiser</strong><p>Éditeur, sujets, brouillons, compteurs et sauvegarde.</p></article>
          <article className="writing-lab-roadmap-card is-active"><b>02</b><strong>Photo → texte</strong><p>Importe une ou plusieurs pages manuscrites, vérifie la transcription et l’ajoute au brouillon.</p></article>
          <article className="writing-lab-roadmap-card"><b>03</b><strong>Corriger & compléter</strong><p>Correction, rubric, feedback et continuation de ton début de texte.</p></article>
        </div>
      </section>
    </main>
  );
}
