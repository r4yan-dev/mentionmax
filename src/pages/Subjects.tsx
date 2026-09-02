import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { SubjectIcon, type SubjectType } from '../components/ui/SubjectIcon';

const subjects: Array<{ slug: string; type: SubjectType; title: string; description: string; chapters: string[] }> = [
  { slug: 'mathematics', type: 'math', title: 'Mathématiques', description: 'Fonctions, suites, probabilités et raisonnement.', chapters: ['Fonctions', 'Suites', 'Probabilités'] },
  { slug: 'physics', type: 'physics', title: 'Physique-Chimie', description: 'Mécanique, électricité, chimie et méthodes.', chapters: ['Mécanique', 'Circuits électriques', 'Chimie'] },
  { slug: 'svt', type: 'svt', title: 'SVT', description: 'Génétique, physiologie et sciences de la vie.', chapters: ['Génétique', 'Physiologie', 'Immunité'] },
  { slug: 'french', type: 'french', title: 'Français', description: 'Lecture, analyse, langue et expression.', chapters: ['Argumentation', 'Lecture', 'Écriture'] },
  { slug: 'philosophy', type: 'philosophy', title: 'Philosophie', description: 'Concepts, dissertations et explications structurées.', chapters: ['Conscience', 'Liberté', 'Vérité'] },
  { slug: 'english', type: 'english', title: 'English', description: 'Reading, writing, vocabulary and communication.', chapters: ['Reading', 'Writing', 'Grammar'] },
];

export default function Subjects() {
  return <main className="section container">
    <PageHeader eyebrow="Programme" title={<>Choisis ta <span className="accent-word">matière.</span></>} description="Accède rapidement aux chapitres et aux exercices qui correspondent à ton niveau." />
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
      <Link to="/exercices" className="btn btn-secondary"><span>Banque d’exercices</span><ArrowRight size={15} /></Link>
    </div>
    <div className="subject-page-grid">{subjects.map(s => <Link to={`/subjects/${s.slug}`} className="card subject-large-card" key={s.slug}><SubjectIcon type={s.type} label={s.title}/><h2>{s.title}</h2><p>{s.description}</p><div className="chapter-pills">{s.chapters.map(c => <span key={c}>{c}</span>)}</div><span className="text-brand">Explorer →</span></Link>)}</div>
  </main>;
}
