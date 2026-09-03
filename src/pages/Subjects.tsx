import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, Plus, Pin } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { SubjectIcon, type SubjectType } from '../components/ui/SubjectIcon';
import { supabase } from '../lib/supabase';

const subjects: Array<{ slug: string; type: SubjectType; title: string; description: string; chapters: string[] }> = [
  { slug: 'mathematics', type: 'math', title: 'Mathématiques', description: 'Fonctions, suites, probabilités et raisonnement.', chapters: ['Fonctions', 'Suites', 'Probabilités'] },
  { slug: 'physics', type: 'physics', title: 'Physique-Chimie', description: 'Mécanique, électricité, chimie et méthodes.', chapters: ['Mécanique', 'Circuits électriques', 'Chimie'] },
  { slug: 'svt', type: 'svt', title: 'SVT', description: 'Génétique, physiologie et sciences de la vie.', chapters: ['Génétique', 'Physiologie', 'Immunité'] },
  { slug: 'french', type: 'french', title: 'Français', description: 'Lecture, analyse, langue et expression.', chapters: ['Argumentation', 'Lecture', 'Écriture'] },
  { slug: 'philosophy', type: 'philosophy', title: 'Philosophie', description: 'Concepts, dissertations et explications structurées.', chapters: ['Conscience', 'Liberté', 'Vérité'] },
  { slug: 'english', type: 'english', title: 'English', description: 'Reading, writing, vocabulary and communication.', chapters: ['Reading', 'Writing', 'Grammar'] },
];

type Chapter = { id: string; name: string; slug: string; order_index: number };
type RecentNote = { id: string; title: string | null; updated_at: string; is_pinned: boolean; chapter_id: string | null };

export default function Subjects() {
  const { subjectId } = useParams<{ subjectId?: string }>();
  const [detail, setDetail] = useState<{ id: string; name: string; description: string | null; shortName: string | null; slug: string } | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!subjectId) return;
    void loadDetail(subjectId);
  }, [subjectId]);

  async function loadDetail(slug: string) {
    setLoadingDetail(true);
    const { data: subject } = await supabase
      .from('subjects')
      .select('id,name,description,short_name,slug')
      .eq('slug', slug)
      .eq('is_active', true)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .limit(1)
      .maybeSingle();

    if (!subject) {
      setDetail(null);
      setChapters([]);
      setRecentNotes([]);
      setLoadingDetail(false);
      return;
    }

    const [{ data: chapterRows }, { data: noteRows }] = await Promise.all([
      supabase.from('chapters').select('id,name,slug,order_index').eq('subject_id', subject.id).order('order_index', { ascending: true }),
      supabase.from('handnotes').select('id,title,updated_at,is_pinned,chapter_id').eq('subject_id', subject.id).order('updated_at', { ascending: false }).limit(8),
    ]);

    setDetail({ id: subject.id, name: subject.name, description: subject.description, shortName: subject.short_name, slug: subject.slug });
    setChapters(chapterRows ?? []);
    setRecentNotes(noteRows ?? []);
    setLoadingDetail(false);
  }

  const notesByChapter = useMemo(() => new Map(chapters.map((chapter) => [chapter.id, recentNotes.filter((note) => note.chapter_id === chapter.id).length])), [chapters, recentNotes]);

  if (subjectId) {
    const subjectFallback = subjects.find((subject) => subject.slug === subjectId);
    return (
      <main className="section container">
        <Link to="/subjects" className="foundation-back"><ArrowLeft size={16} /> Matières</Link>
        {loadingDetail ? (
          <div style={{ padding: '56px 0', color: '#718582' }}>Chargement de la matière...</div>
        ) : detail ? (
          <>
            <PageHeader
              eyebrow="Programme"
              title={<>Tes ressources de <span className="accent-word">{detail.name}.</span></>}
              description={detail.description || subjectFallback?.description || 'Cours, chapitres et notes pour organiser ta révision.'}
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, margin: '0 0 28px' }}>
              <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="btn btn-primary"><Plus size={15} /> Nouvelle note</Link>
              <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="btn btn-secondary"><FileText size={15} /> Toutes mes notes</Link>
            </div>

            <section className="card" style={{ marginBottom: 24, padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div>
                  <span className="section-eyebrow">Notes</span>
                  <h2 style={{ margin: '5px 0 0' }}>Tes notes de {detail.shortName || detail.name}</h2>
                </div>
                <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="text-brand">Voir tout →</Link>
              </div>
              {recentNotes.length === 0 ? (
                <div style={{ border: '1px dashed #bfd0cc', borderRadius: 12, padding: 20, color: '#718582', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <span>Aucune note pour cette matière.</span>
                  <Link to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}`} className="btn btn-secondary"><Plus size={15} /> Créer</Link>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 10 }}>
                  {recentNotes.slice(0, 4).map((note) => {
                    const chapter = chapters.find((item) => item.id === note.chapter_id);
                    return (
                      <Link key={note.id} to={`/ai-studio/handnotes?note=${encodeURIComponent(note.id)}`} style={{ textDecoration: 'none', color: 'inherit', padding: 15, border: '1px solid #e2e9e7', borderRadius: 12, background: '#fbfcfb' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                          <FileText size={15} style={{ color: '#0fa3a3' }} />
                          <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title || 'Note sans titre'}</strong>
                          {note.is_pinned && <Pin size={12} fill="currentColor" style={{ color: '#0fa3a3', marginLeft: 'auto' }} />}
                        </div>
                        <span style={{ fontSize: 11, color: '#7a8e8b' }}>{chapter?.name || 'Note de matière'}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: 14 }}>
                <div>
                  <span className="section-eyebrow">Chapitre</span>
                  <h2 style={{ margin: '5px 0 0' }}>Organise tes notes par chapitre</h2>
                </div>
              </div>
              <div className="subject-page-grid">
                {chapters.length > 0 ? chapters.map((chapter) => (
                  <Link key={chapter.id} to={`/ai-studio/handnotes?subject=${encodeURIComponent(detail.id)}&chapter=${encodeURIComponent(chapter.id)}`} className="card subject-large-card" style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                      <h2 style={{ margin: 0 }}>{chapter.name}</h2>
                      <ArrowRight size={17} className="text-brand" />
                    </div>
                    <p style={{ marginBottom: 12 }}>Notes liées : {notesByChapter.get(chapter.id) || 0}</p>
                    <span className="text-brand">Ouvrir les notes →</span>
                  </Link>
                )) : (
                  <div className="card" style={{ padding: 20, color: '#718582' }}>Aucun chapitre disponible pour cette matière pour le moment.</div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div style={{ padding: '56px 0' }}>
            <h1 className="page-title">Matière introuvable.</h1>
            <Link to="/subjects" className="btn btn-secondary"><ArrowLeft size={16} /> Retour aux matières</Link>
          </div>
        )}
      </main>
    );
  }

  return <main className="section container">
    <PageHeader eyebrow="Programme" title={<>Choisis ta <span className="accent-word">matière.</span></>} description="Accède rapidement aux chapitres, aux exercices et maintenant à tes notes de révision." />
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
      <Link to="/exercices" className="btn btn-secondary"><span>Banque d’exercices</span><ArrowRight size={15} /></Link>
    </div>
    <div className="subject-page-grid">{subjects.map(s => <Link to={`/subjects/${s.slug}`} className="card subject-large-card" key={s.slug}><SubjectIcon type={s.type} label={s.title}/><h2>{s.title}</h2><p>{s.description}</p><div className="chapter-pills">{s.chapters.map(c => <span key={c}>{c}</span>)}</div><span className="text-brand">Explorer →</span></Link>)}</div>
  </main>;
}
