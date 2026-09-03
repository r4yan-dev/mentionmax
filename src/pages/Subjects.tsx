import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, FileText, Pin, Plus } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { SubjectIcon, type SubjectType } from "../components/ui/SubjectIcon";
import { useAccount } from "../context/AccountContext";
import { supabase } from "../lib/supabase";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { lessonService } from "../services/lesson/lessonService";
import { resolveUserPath, pathLabels, type UserPath } from "../data/curriculum/secondBac";
import PathSwitcher from "../components/curriculum/PathSwitcher";

const subjectTypes: Record<string, SubjectType> = {
  maths: "math",
  "physique-chimie": "physics",
  svt: "svt",
  anglais: "english",
  philosophie: "philosophy",
};

type Chapter = { id: string; name: string; slug: string; order_index: number };
type RecentNote = { id: string; title: string | null; updated_at: string; is_pinned: boolean; chapter_id: string | null };

type SubjectDetail = { id: string; name: string; description: string | null; short_name: string | null; slug: string };

const slugForSubject = (subjectId: string) => subjectId === "maths" ? "mathematics" : subjectId;

function curriculumSubjectId(slug: string): keyof typeof subjectCatalog | null {
  if (slug === "mathematics" || slug === "mathematiques" || slug === "maths") return "maths";
  if (slug === "physics" || slug === "physique-chimie") return "physique-chimie";
  if (slug === "svt") return "svt";
  if (slug === "english" || slug === "anglais") return "anglais";
  if (slug === "philosophy" || slug === "philosophie") return "philosophie";
  return null;
}

export default function Subjects() {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const { schoolPreferences } = useAccount();
  const path: UserPath = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackId = path;
  const allowedSubjects = getTrackSubjects(trackId);

  const [detail, setDetail] = useState<SubjectDetail | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    const id = curriculumSubjectId(subjectId);
    if (!id || !allowedSubjects.some((subject) => subject.id === id)) {
      setDetail(null);
      return;
    }
    void loadDetail(id);
  }, [subjectId, path]);

  async function loadDetail(id: keyof typeof subjectCatalog) {
    setLoading(true);
    const slugs = id === "maths" ? ["mathematics", "mathematiques", "maths"] : [id];
    let subject: SubjectDetail | null = null;
    for (const slug of slugs) {
      const { data } = await supabase.from("subjects").select("id,name,description,short_name,slug").eq("slug", slug).eq("is_active", true).order("sort_order", { ascending: true, nullsFirst: false }).limit(1).maybeSingle();
      if (data) { subject = data as SubjectDetail; break; }
    }
    if (!subject) { setDetail(null); setChapters([]); setRecentNotes([]); setLoading(false); return; }
    const [{ data: chapterRows }, { data: noteRows }] = await Promise.all([
      supabase.from("chapters").select("id,name,slug,order_index").eq("subject_id", subject.id).order("order_index", { ascending: true }),
      supabase.from("handnotes").select("id,title,updated_at,is_pinned,chapter_id").eq("subject_id", subject.id).order("updated_at", { ascending: false }).limit(8),
    ]);
    setDetail(subject);
    setChapters(chapterRows ?? []);
    setRecentNotes(noteRows ?? []);
    setLoading(false);
  }

  const lessons = useMemo(() => detail ? lessonService.list(curriculumSubjectId(detail.slug) ?? undefined, trackId) : [], [detail, trackId]);
  const notesByChapter = useMemo(() => new Map(chapters.map((chapter) => [chapter.id, recentNotes.filter((note) => note.chapter_id === chapter.id).length])), [chapters, recentNotes]);

  if (subjectId) {
    const requested = curriculumSubjectId(subjectId);
    if (!requested || !allowedSubjects.some((subject) => subject.id === requested)) {
      return <main className="section container"><PageHeader eyebrow={pathLabels[path]} title="Cette matière n'est pas dans ton parcours." description={path === "SMB" ? "SM-B suit Maths, Physique-Chimie, Anglais et Philosophie. La SVT n'est pas affichée." : "Les matières affichées suivent le parcours enregistré dans tes préférences."} /><PathSwitcher /><div style={{ marginTop: 18 }}><Link to="/subjects" className="btn btn-secondary"><ArrowLeft size={16} /> Retour aux matières</Link></div></main>;
    }

    return <main className="section container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 }}><Link to="/subjects" className="foundation-back"><ArrowLeft size={16} /> Matières</Link><PathSwitcher /></div>
      {loading ? <div style={{ padding: "56px 0", color: "#718582" }}>Chargement de la matière...</div> : detail ? <>
        <PageHeader eyebrow={`${pathLabels[path]} · Programme 2BAC`} title={<>Ton espace <span className="accent-word">{detail.name}.</span></>} description={detail.description || "Cours, exercices et notes adaptés à ton parcours."} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "0 0 28px" }}>
          <Link to={`/lecons/${requested}`} className="btn btn-primary"><BookOpen size={15} /> Voir les cours</Link>
          <Link to={`/exercices?subject=${encodeURIComponent(requested)}`} className="btn btn-secondary"><ArrowRight size={15} /> Exercices</Link>
          <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="btn btn-secondary"><FileText size={15} /> Mes notes</Link>
        </div>
        {lessons.length > 0 && <section className="card" style={{ marginBottom: 24, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16 }}><div><span className="section-eyebrow">Cours 2BAC</span><h2 style={{ margin: "5px 0 0" }}>Le programme</h2></div><span className="text-brand">{lessons.length} leçons</span></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 10 }}>{lessons.map((lesson, index) => <Link key={lesson.id} to={`/lecons/${lesson.subjectId}/${lesson.id}`} style={{ textDecoration: "none", color: "inherit", padding: 16, border: "1px solid #e2e9e7", borderRadius: 12, background: "#fbfcfb" }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}><div style={{ width: 28, height: 28, borderRadius: 9, background: "#ddf5f1", color: "#0fa3a3", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800 }}>{String(index + 1).padStart(2, "0")}</div><span className="section-eyebrow">LEÇON</span></div><h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{lesson.title}</h3><p style={{ margin: "0 0 10px", color: "#718582", fontSize: 12, lineHeight: 1.55 }}>{lesson.blocks.find((block) => block.type === "intro")?.text}</p><span className="text-brand" style={{ fontSize: 12 }}>Étudier →</span></Link>)}</div></section>}
        <section className="card" style={{ marginBottom: 24, padding: 22 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 16 }}><div><span className="section-eyebrow">Notes</span><h2 style={{ margin: "5px 0 0" }}>Tes notes</h2></div><Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="text-brand">Voir tout →</Link></div>{recentNotes.length === 0 ? <div style={{ border: "1px dashed #bfd0cc", borderRadius: 12, padding: 20, color: "#718582", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}><span>Aucune note pour cette matière.</span><Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="btn btn-secondary"><Plus size={15} /> Créer</Link></div> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>{recentNotes.slice(0, 4).map((note) => { const chapter = chapters.find((item) => item.id === note.chapter_id); return <Link key={note.id} to={`/ai-studio/handnotes?note=${encodeURIComponent(note.id)}`} style={{ textDecoration: "none", color: "inherit", padding: 15, border: "1px solid #e2e9e7", borderRadius: 12, background: "#fbfcfb" }}><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}><FileText size={15} style={{ color: "#0fa3a3" }} /><strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{note.title || "Note sans titre"}</strong>{note.is_pinned && <Pin size={12} fill="currentColor" style={{ color: "#0fa3a3", marginLeft: "auto" }} />}</div><span style={{ fontSize: 11, color: "#7a8e8b" }}>{chapter?.name || "Note de matière"}</span></Link>; })}</div>}</section>
        <section><span className="section-eyebrow">Chapitres</span><h2 style={{ margin: "5px 0 14px" }}>Organiser par chapitre</h2><div className="subject-page-grid">{chapters.length ? chapters.map((chapter) => <Link key={chapter.id} to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}&chapter=${encodeURIComponent(chapter.id)}`} className="card subject-large-card" style={{ textDecoration: "none" }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}><h2 style={{ margin: 0 }}>{chapter.name}</h2><ArrowRight size={17} className="text-brand" /></div><p style={{ marginBottom: 12 }}>Notes liées : {notesByChapter.get(chapter.id) || 0}</p><span className="text-brand">Ouvrir les notes →</span></Link>) : <div className="card" style={{ padding: 20, color: "#718582" }}>Aucun chapitre disponible pour cette matière.</div>}</div></section>
      </> : <div style={{ padding: "56px 0" }}><h1 className="page-title">Matière introuvable.</h1><Link to="/subjects" className="btn btn-secondary"><ArrowLeft size={16} /> Retour aux matières</Link></div>}
    </main>;
  }

  return <main className="section container"><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 20 }}><PageHeader eyebrow="Programme 2BAC" title={<>Ton <span className="accent-word">parcours.</span></>} description={`${pathLabels[path]} · le parcours choisi détermine les matières et leur contenu.`} /><PathSwitcher /></div><div className="subject-page-grid">{allowedSubjects.map((subject) => <Link to={`/subjects/${slugForSubject(subject.id)}`} className="card subject-large-card" key={subject.id}><SubjectIcon type={subjectTypes[subject.id]} label={subject.name}/><h2>{subject.name}</h2><p>{subject.shortName} · programme 2BAC adapté au parcours.</p><div className="chapter-pills"><span>Cours</span><span>Exercices</span><span>Notes</span></div><span className="text-brand">Explorer →</span></Link>)}</div></main>;
}
