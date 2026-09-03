import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bold, CheckSquare, ChevronLeft, Italic, List, ListOrdered, Plus, Search, Trash2, Underline, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import "./Handnotes.css";

type Note = {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  userId?: string;
};

const EMPTY_CONTENT = "<p><br></p>";

function excerpt(html: string) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return (div.textContent || "").replace(/\s+/g, " ").trim().slice(0, 92) || "Nouvelle note";
}

export default function Handnotes() {
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<number | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(EMPTY_CONTENT);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileList, setMobileList] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const activeNote = useMemo(() => notes.find((note) => note.id === activeId) ?? null, [notes, activeId]);
  const filteredNotes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes;
    return notes.filter((note) => `${note.title} ${excerpt(note.content)}`.toLowerCase().includes(needle));
  }, [notes, query]);

  useEffect(() => {
    void loadNotes();
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, []);

  async function loadNotes() {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id ?? null;
    setUserId(uid);

    if (!uid) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("handnotes")
      .select("id,title,content,updated_at")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Failed to load notes", error);
      setLoading(false);
      return;
    }

    const loaded: Note[] = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title || "Note sans titre",
      content: typeof row.content?.html === "string" ? row.content.html : EMPTY_CONTENT,
      updatedAt: row.updated_at,
      userId: uid,
    }));

    setNotes(loaded);
    if (loaded[0]) openNote(loaded[0]);
    setLoading(false);
  }

  function openNote(note: Note) {
    setActiveId(note.id);
    setTitle(note.title === "Note sans titre" ? "" : note.title);
    setContent(note.content || EMPTY_CONTENT);
    setMobileList(false);
    requestAnimationFrame(() => {
      if (editorRef.current) editorRef.current.innerHTML = note.content || EMPTY_CONTENT;
    });
  }

  async function createNote() {
    if (!userId) return;
    const now = new Date().toISOString();
    const localId = crypto.randomUUID();
    const newNote: Note = { id: localId, title: "", content: EMPTY_CONTENT, updatedAt: now, userId };
    setNotes((current) => [newNote, ...current]);
    setActiveId(localId);
    setTitle("");
    setContent(EMPTY_CONTENT);
    setMobileList(false);
    requestAnimationFrame(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = EMPTY_CONTENT;
        editorRef.current.focus();
      }
    });

    const { error } = await supabase.from("handnotes").insert({
      id: localId,
      user_id: userId,
      source_type: "text",
      source_ref: `manual:${localId}`,
      title: "",
      content: { version: 1, html: EMPTY_CONTENT },
    });
    if (error) console.error("Failed to create note", error);
  }

  function scheduleSave(nextTitle = title, nextContent = content) {
    if (!activeId || !userId) return;
    setNotes((current) => current.map((note) => note.id === activeId
      ? { ...note, title: nextTitle || "Note sans titre", content: nextContent, updatedAt: new Date().toISOString() }
      : note));
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => void saveNote(activeId, nextTitle, nextContent), 450);
  }

  async function saveNote(id: string, nextTitle: string, nextContent: string) {
    setSaving(true);
    const { error } = await supabase.from("handnotes").update({
      title: nextTitle.trim(),
      content: { version: 1, html: nextContent, text: excerpt(nextContent) },
      updated_at: new Date().toISOString(),
    }).eq("id", id).eq("user_id", userId);
    if (error) console.error("Failed to save note", error);
    setSaving(false);
  }

  async function deleteActiveNote() {
    if (!activeId || !userId) return;
    const id = activeId;
    const { error } = await supabase.from("handnotes").delete().eq("id", id).eq("user_id", userId);
    if (error) {
      console.error("Failed to delete note", error);
      return;
    }
    const remaining = notes.filter((note) => note.id !== id);
    setNotes(remaining);
    if (remaining[0]) openNote(remaining[0]);
    else {
      setActiveId(null);
      setTitle("");
      setContent(EMPTY_CONTENT);
      setMobileList(true);
    }
  }

  function apply(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    const next = editorRef.current?.innerHTML || EMPTY_CONTENT;
    setContent(next);
    scheduleSave(title, next);
  }

  function updateTitle(value: string) {
    setTitle(value);
    scheduleSave(value, content);
  }

  function updateContent() {
    const next = editorRef.current?.innerHTML || EMPTY_CONTENT;
    setContent(next);
    scheduleSave(title, next);
  }

  return (
    <div className="notes-app">
      <aside className={`notes-sidebar ${mobileList ? "is-mobile-open" : ""}`}>
        <div className="notes-sidebar__top">
          <div>
            <Link to="/ai-help" className="notes-back"><ChevronLeft size={17} /> AI</Link>
            <h1>Notes</h1>
          </div>
          <button className="notes-icon-button notes-new" onClick={() => void createNote()} aria-label="Nouvelle note"><Plus size={21} /></button>
        </div>

        <label className="notes-search">
          <Search size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher" />
        </label>

        <div className="notes-list">
          {loading && <div className="notes-empty-list">Chargement...</div>}
          {!loading && filteredNotes.length === 0 && (
            <button className="notes-first-note" onClick={() => void createNote()}>
              <Plus size={17} /> Créer ta première note
            </button>
          )}
          {filteredNotes.map((note) => (
            <button key={note.id} className={`note-row ${note.id === activeId ? "active" : ""}`} onClick={() => openNote(note)}>
              <strong>{note.title || "Note sans titre"}</strong>
              <span>{excerpt(note.content)}</span>
              <small>{formatDate(note.updatedAt)}</small>
            </button>
          ))}
        </div>

        <div className="notes-sidebar__footer">
          <span>{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
          <span>{saving ? "Enregistrement..." : "Synchronisé"}</span>
        </div>
      </aside>

      <main className="note-editor-shell">
        <header className="note-editor-topbar">
          <button className="notes-mobile-back" onClick={() => setMobileList(true)} aria-label="Retour aux notes"><ChevronLeft size={19} /></button>
          <span className="notes-save-state">{saving ? "Enregistrement..." : "Enregistré"}</span>
          <div className="note-editor-actions">
            <button onClick={() => void deleteActiveNote()} disabled={!activeId} title="Supprimer"><Trash2 size={18} /></button>
          </div>
        </header>

        {activeNote || !loading ? (
          <div className="note-paper">
            {activeId ? (
              <>
                <input
                  className="note-title"
                  value={title}
                  onChange={(event) => updateTitle(event.target.value)}
                  placeholder="Titre"
                  aria-label="Titre de la note"
                />
                <div className="note-meta">Dernière modification {formatDate(activeNote?.updatedAt || new Date().toISOString())}</div>
                <div
                  ref={editorRef}
                  className="note-content"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={updateContent}
                  onBlur={updateContent}
                  data-placeholder="Commence à écrire..."
                  spellCheck
                />
              </>
            ) : (
              <div className="note-welcome">
                <div className="note-welcome__icon">✦</div>
                <h2>Tes notes, sans formulaire.</h2>
                <p>Écris librement. Titres, listes, cases à cocher, mise en forme. MentionMax sauvegarde automatiquement chaque note.</p>
                <button className="btn btn-primary" onClick={() => void createNote()}><Plus size={17} /> Nouvelle note</button>
              </div>
            )}
          </div>
        ) : null}

        {activeId && (
          <div className="note-toolbar" role="toolbar" aria-label="Mise en forme">
            <button onClick={() => apply("bold")} title="Gras"><Bold size={17} /></button>
            <button onClick={() => apply("italic")} title="Italique"><Italic size={17} /></button>
            <button onClick={() => apply("underline")} title="Souligné"><Underline size={17} /></button>
            <span />
            <button onClick={() => apply("formatBlock", "h2")} title="Titre"><b>H</b><sup>2</sup></button>
            <button onClick={() => apply("insertUnorderedList")} title="Liste"><List size={18} /></button>
            <button onClick={() => apply("insertOrderedList")} title="Liste numérotée"><ListOrdered size={18} /></button>
            <button onClick={() => apply("insertHTML", "<div>☐ À faire</div>")} title="Case à cocher"><CheckSquare size={18} /></button>
            <span />
            <button onClick={() => apply("removeFormat")} title="Effacer la mise en forme"><X size={17} /></button>
          </div>
        )}
      </main>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
