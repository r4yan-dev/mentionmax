import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Bold,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  Folder,
  Italic,
  List,
  ListOrdered,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
  Underline,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./Handnotes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  createdAt: string;
  pinned: boolean;
  folder: string;
  subjectId: string | null;
  chapterId: string | null;
};

type Subject = { id: string; slug: string; name: string; shortName: string | null };
type Chapter = { id: string; subjectId: string; name: string; slug: string };

const DEFAULT_FOLDER = "notes";

function excerpt(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").replace(/\s+/g, " ").trim().slice(0, 92) || "Nouvelle note";
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export default function Handnotes() {
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);
  const latestRef = useRef({ id: null as string | null, title: "", content: "" });
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [query, setQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState(searchParams.get("subject") || "all");
  const [chapterFilter, setChapterFilter] = useState(searchParams.get("chapter") || "all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [mobileList, setMobileList] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showOrganize, setShowOrganize] = useState(false);

  const activeNote = useMemo(() => notes.find((note) => note.id === activeId) ?? null, [notes, activeId]);
  const activeSubject = useMemo(() => subjects.find((subject) => subject.id === activeNote?.subjectId) ?? null, [subjects, activeNote]);
  const activeChapter = useMemo(() => chapters.find((chapter) => chapter.id === activeNote?.chapterId) ?? null, [chapters, activeNote]);
  const visibleChapters = useMemo(
    () => (subjectFilter === "all" ? chapters : chapters.filter((chapter) => chapter.subjectId === subjectFilter)),
    [chapters, subjectFilter],
  );

  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return notes
      .filter((note) => subjectFilter === "all" || note.subjectId === subjectFilter)
      .filter((note) => chapterFilter === "all" || note.chapterId === chapterFilter)
      .filter((note) => !needle || `${note.title} ${excerpt(note.content)}`.toLowerCase().includes(needle))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [notes, query, subjectFilter, chapterFilter]);

  useEffect(() => {
    void loadWorkspace();
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  useEffect(() => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (subjectFilter === "all") next.delete("subject");
      else next.set("subject", subjectFilter);
      if (chapterFilter === "all") next.delete("chapter");
      else next.set("chapter", chapterFilter);
      return next;
    }, { replace: true });
  }, [subjectFilter, chapterFilter, setSearchParams]);

  async function loadWorkspace() {
    setLoading(true);
    setSaveError(null);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? null;
    setUserId(uid);

    const noteRequest = uid
      ? supabase.from("handnotes").select("id,title,content,created_at,updated_at,is_pinned,folder,subject_id,chapter_id").eq("user_id", uid).order("updated_at", { ascending: false })
      : Promise.resolve({ data: [], error: null });

    const [{ data: noteRows, error: noteError }, { data: subjectRows, error: subjectError }, { data: chapterRows, error: chapterError }] = await Promise.all([
      noteRequest,
      supabase.from("subjects").select("id,slug,name,short_name").eq("is_active", true).order("sort_order", { ascending: true, nullsFirst: false }),
      supabase.from("chapters").select("id,subject_id,name,slug,order_index").order("order_index", { ascending: true, nullsFirst: false }),
    ]);

    if (noteError) {
      console.error("Failed to load notes", noteError);
      setSaveError("Impossible de charger tes notes.");
    }
    if (subjectError) console.error("Failed to load subjects", subjectError);
    if (chapterError) console.error("Failed to load chapters", chapterError);

    const loadedSubjects: Subject[] = (subjectRows ?? []).map((row) => ({ id: row.id, slug: row.slug, name: row.name, shortName: row.short_name }));
    const loadedChapters: Chapter[] = (chapterRows ?? []).map((row) => ({ id: row.id, subjectId: row.subject_id, name: row.name, slug: row.slug }));
    const loadedNotes: Note[] = (noteRows ?? []).map((row) => ({
      id: row.id,
      title: row.title || "",
      content: typeof row.content?.html === "string" ? row.content.html : "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      pinned: row.is_pinned ?? false,
      folder: row.folder || DEFAULT_FOLDER,
      subjectId: row.subject_id ?? null,
      chapterId: row.chapter_id ?? null,
    }));

    setSubjects(loadedSubjects);
    setChapters(loadedChapters);
    setNotes(loadedNotes);
    setLoading(false);

    const requestedSubject = searchParams.get("subject");
    const requestedChapter = searchParams.get("chapter");
    const requestedNote = searchParams.get("note");
    const requested = requestedNote ? loadedNotes.find((note) => note.id === requestedNote) : undefined;
    const firstVisible = requested || loadedNotes.find((note) => (!requestedSubject || note.subjectId === requestedSubject) && (!requestedChapter || note.chapterId === requestedChapter));
    if (firstVisible) openNote(firstVisible);
  }

  function openNote(note: Note) {
    setActiveId(note.id);
    setTitle(note.title);
    setContent(note.content);
    latestRef.current = { id: note.id, title: note.title, content: note.content };
    setMobileList(false);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.content || "";
    });
  }

  async function createNote() {
    if (!userId) {
      setSaveError("Connecte-toi pour créer une note.");
      return;
    }
    const now = new Date().toISOString();
    const localId = crypto.randomUUID();
    const nextSubject = subjectFilter === "all" ? null : subjectFilter;
    const nextChapter = chapterFilter === "all" ? null : chapterFilter;
    const newNote: Note = { id: localId, title: "", content: "", createdAt: now, updatedAt: now, pinned: false, folder: DEFAULT_FOLDER, subjectId: nextSubject, chapterId: nextChapter };

    setSaveError(null);
    setNotes((current) => [newNote, ...current]);
    setActiveId(localId);
    setTitle("");
    setContent("");
    latestRef.current = { id: localId, title: "", content: "" };
    setMobileList(false);
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
        editorRef.current.focus();
      }
    });

    const { error } = await supabase.from("handnotes").insert({
      id: localId,
      user_id: userId,
      source_type: "text",
      source_ref: `manual:${localId}`,
      subject_id: nextSubject,
      chapter_id: nextChapter,
      title: "",
      content: { version: 1, html: "", text: "" },
      is_pinned: false,
      folder: DEFAULT_FOLDER,
    });

    if (error) {
      console.error("Failed to create note", error);
      setNotes((current) => current.filter((note) => note.id !== localId));
      setActiveId(null);
      setMobileList(true);
      setSaveError("La note n’a pas pu être enregistrée.");
    }
  }

  function scheduleSave(nextTitle = latestRef.current.title, nextContent = latestRef.current.content) {
    if (!activeId || !userId) return;
    const id = activeId;
    latestRef.current = { id, title: nextTitle, content: nextContent };
    const updatedAt = new Date().toISOString();
    setNotes((current) => current.map((note) => note.id === id ? { ...note, title: nextTitle, content: nextContent, updatedAt } : note));
    setSaveError(null);
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void saveNote(id, latestRef.current.title, latestRef.current.content), 450);
  }

  async function saveNote(id: string, nextTitle: string, nextContent: string) {
    setSaving(true);
    const { error } = await supabase.from("handnotes").update({
      title: nextTitle.trim(),
      content: { version: 1, html: nextContent, text: excerpt(nextContent) },
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId);
    setSaving(false);
    if (error) {
      console.error("Failed to save note", error);
      setSaveError("Échec de l’enregistrement. Tes modifications sont gardées à l’écran.");
    }
  }

  async function updateMetadata(next: { subjectId?: string | null; chapterId?: string | null; pinned?: boolean; folder?: string }) {
    if (!activeId || !userId) return;
    const current = notes.find((note) => note.id === activeId);
    if (!current) return;
    const patch = {
      subject_id: next.subjectId === undefined ? current.subjectId : next.subjectId,
      chapter_id: next.chapterId === undefined ? current.chapterId : next.chapterId,
      is_pinned: next.pinned === undefined ? current.pinned : next.pinned,
      folder: next.folder === undefined ? current.folder : next.folder,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("handnotes").update(patch).eq("id", activeId).eq("user_id", userId);
    if (error) {
      console.error("Failed to update note metadata", error);
      setSaveError("Impossible de mettre à jour cette note.");
      return;
    }
    setNotes((all) => all.map((note) => note.id === activeId ? { ...note, subjectId: patch.subject_id, chapterId: patch.chapter_id, pinned: patch.is_pinned, folder: patch.folder, updatedAt: patch.updated_at } : note));
  }

  async function togglePin() {
    if (activeNote) await updateMetadata({ pinned: !activeNote.pinned });
  }

  async function deleteActiveNote() {
    if (!activeId || !userId) return;
    if (!window.confirm("Supprimer cette note ? Cette action est définitive.")) return;
    const id = activeId;
    const { error } = await supabase.from("handnotes").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      console.error("Failed to delete note", error);
      setSaveError("Impossible de supprimer cette note.");
      return;
    }
    const remaining = notes.filter((note) => note.id !== id);
    setNotes(remaining);
    const next = remaining.find((note) => (subjectFilter === "all" || note.subjectId === subjectFilter) && (chapterFilter === "all" || note.chapterId === chapterFilter)) || remaining[0];
    if (next) openNote(next);
    else {
      setActiveId(null);
      setTitle("");
      setContent("");
      setMobileList(true);
    }
  }

  function apply(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    const next = editorRef.current?.innerHTML || "";
    setContent(next);
    scheduleSave(title, next);
  }

  function updateTitle(value: string) {
    setTitle(value);
    scheduleSave(value, latestRef.current.content);
  }

  function updateContent() {
    const next = editorRef.current?.innerHTML || "";
    setContent(next);
    scheduleSave(latestRef.current.title, next);
  }

  const activeChapters = activeNote?.subjectId ? chapters.filter((chapter) => chapter.subjectId === activeNote.subjectId) : chapters;

  return (
    <div className="notes-app">
      <aside className={`notes-sidebar ${mobileList ? "is-mobile-open" : ""}`}>
        <div className="notes-sidebar__top">
          <div><Link to="/ai-help" className="notes-back"><ChevronLeft size={17} /> AI</Link><h1>Notes</h1></div>
          <button className="notes-icon-button notes-new" onClick={() => void createNote()} aria-label="Nouvelle note"><Plus size={21} /></button>
        </div>
        <label className="notes-search"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" /></label>
        <div className="notes-filters">
          <div className="notes-filter"><Folder size={15} /><select value={subjectFilter} onChange={(event) => { setSubjectFilter(event.target.value); setChapterFilter("all"); }} aria-label="Filtrer par matière"><option value="all">Toutes les matières</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.shortName || subject.name}</option>)}</select><ChevronDown size={14} /></div>
          <div className="notes-filter"><select value={chapterFilter} onChange={(event) => setChapterFilter(event.target.value)} aria-label="Filtrer par chapitre" disabled={visibleChapters.length === 0}><option value="all">Tous les chapitres</option>{visibleChapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</select><ChevronDown size={14} /></div>
        </div>
        <div className="notes-list">
          {loading && <div className="notes-empty-list">Chargement...</div>}
          {!loading && filteredNotes.length === 0 && <button className="notes-first-note" onClick={() => void createNote()}><Plus size={17} /> {subjectFilter !== "all" ? "Créer une note ici" : "Créer ta première note"}</button>}
          {filteredNotes.map((note) => {
            const subject = subjects.find((item) => item.id === note.subjectId);
            return <button key={note.id} className={`note-row ${note.id === activeId ? "active" : ""}`} onClick={() => openNote(note)}><div className="note-row__title"><strong>{note.title || "Note sans titre"}</strong>{note.pinned && <Pin size={12} fill="currentColor" />}</div><span>{excerpt(note.content)}</span><small>{subject?.shortName || subject?.name || "Notes personnelles"} · {formatDate(note.updatedAt)}</small></button>;
          })}
        </div>
        <div className="notes-sidebar__footer"><span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span><span className={saveError ? "has-error" : ""}>{saveError || (saving ? "Enregistrement..." : "Synchronisé")}</span></div>
      </aside>

      <main className="note-editor-shell">
        <header className="note-editor-topbar">
          <button className="notes-mobile-back" onClick={() => setMobileList(true)} aria-label="Retour aux notes"><ChevronLeft size={19} /></button>
          <div className="note-context-chip">{activeSubject ? <span>{activeSubject.shortName || activeSubject.name}</span> : <span>Note personnelle</span>}{activeChapter && <><span>·</span><span>{activeChapter.name}</span></>}</div>
          <span className={`notes-save-state ${saveError ? "has-error" : ""}`}>{saveError ? "À vérifier" : saving ? "Enregistrement..." : "Enregistré"}</span>
          <div className="note-editor-actions"><button onClick={() => void togglePin()} disabled={!activeId} title={activeNote?.pinned ? "Désépingler" : "Épingler"}>{activeNote?.pinned ? <PinOff size={18} /> : <Pin size={18} />}</button><button onClick={() => setShowOrganize((value) => !value)} disabled={!activeId} title="Organiser"><Folder size={18} /></button><button onClick={() => void deleteActiveNote()} disabled={!activeId} title="Supprimer"><Trash2 size={18} /></button></div>
        </header>

        {showOrganize && activeNote && <div className="notes-organize-panel"><div><label>Matière</label><select value={activeNote.subjectId || ""} onChange={(event) => void updateMetadata({ subjectId: event.target.value || null, chapterId: null })}><option value="">Aucune</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select></div><div><label>Chapitre</label><select value={activeNote.chapterId || ""} onChange={(event) => void updateMetadata({ chapterId: event.target.value || null })} disabled={!activeNote.subjectId}><option value="">Aucun</option>{activeChapters.map((chapter) => <option key={chapter.id} value={chapter.id}>{chapter.name}</option>)}</select></div><div><label>Dossier</label><input value={activeNote.folder} onChange={(event) => void updateMetadata({ folder: event.target.value || DEFAULT_FOLDER })} placeholder="notes" /></div></div>}

        <div className="note-paper">
          {activeId ? <><input className="note-title" value={title} onChange={(event) => updateTitle(event.target.value)} placeholder="Titre" aria-label="Titre de la note" /><div className="note-meta">Créée le {formatDate(activeNote?.createdAt || new Date().toISOString())} · Dernière modification {formatDate(activeNote?.updatedAt || new Date().toISOString())}</div><div ref={editorRef} className="note-content" contentEditable suppressContentEditableWarning onInput={updateContent} onBlur={updateContent} data-placeholder="Commence à écrire..." spellCheck /></> : <div className="note-welcome"><div className="note-welcome__icon">✦</div><h2>Tes notes, sans formulaire.</h2><p>Écris librement, épingle les notes importantes et rattache-les à une matière ou à un chapitre.</p><button className="btn btn-primary" onClick={() => void createNote()}><Plus size={17} /> Nouvelle note</button></div>}
        </div>

        {activeId && <div className="note-toolbar" role="toolbar" aria-label="Mise en forme"><button onClick={() => apply("bold")} title="Gras"><Bold size={17} /></button><button onClick={() => apply("italic")} title="Italique"><Italic size={17} /></button><button onClick={() => apply("underline")} title="Souligné"><Underline size={17} /></button><span /><button onClick={() => apply("formatBlock", "h2")} title="Titre"><b>H</b><sup>2</sup></button><button onClick={() => apply("insertUnorderedList")} title="Liste"><List size={18} /></button><button onClick={() => apply("insertOrderedList")} title="Liste numérotée"><ListOrdered size={18} /></button><button onClick={() => apply("insertHTML", '<div class="note-check"><label><input type="checkbox" /> <span>À faire</span></label></div>')} title="Case à cocher"><CheckSquare size={18} /></button><span /><button onClick={() => apply("removeFormat")} title="Effacer la mise en forme"><X size={17} /></button></div>}
      </main>
    </div>
  );
}
