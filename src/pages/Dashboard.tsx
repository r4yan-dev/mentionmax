import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { SubjectIcon } from '../components/ui/SubjectIcon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { StatCard } from '../components/ui/StatCard';

const subjects = [
  { type: 'math' as const, name: 'Mathématiques', score: 91, chapter: 'Fonctions' },
  { type: 'physics' as const, name: 'Physique-Chimie', score: 84, chapter: 'Circuit RC' },
  { type: 'svt' as const, name: 'SVT', score: 78, chapter: 'Génétique' },
  { type: 'french' as const, name: 'Français', score: 75, chapter: 'Argumentation' },
];

export default function Dashboard() {
  return <main className="section container">
    <PageHeader eyebrow="Tableau de bord" title={<>Continue ta <span className="accent-word">préparation.</span></>} description="Tes priorités de la semaine, ta progression et ton prochain exercice." action={<Link className="btn btn-primary" to="/exercises">Nouvel exercice</Link>} />
    <div className="stats-grid">
      <StatCard label="Exercices cette semaine" value="12" hint="+3 vs semaine dernière" />
      <StatCard label="Moyenne actuelle" value="86%" hint="Très bon niveau" />
      <StatCard label="Série" value="5 jours" hint="Continue demain" />
      <StatCard label="Temps de travail" value="3h40" hint="Objectif : 5h" />
    </div>
    <div className="dashboard-grid">
      <section className="card">
        <div className="section-row"><div><span className="eyebrow">Priorité</span><h2>À faire maintenant</h2></div><Link to="/progress" className="text-brand">Voir ma progression →</Link></div>
        <div className="focus-card"><SubjectIcon type="physics" label="Physique-Chimie" /><div className="focus-card__body"><span className="label">Physique-Chimie · Électricité</span><h3>Réponse d’un circuit RC</h3><p>Difficulté difficile · 25 min</p></div><Link className="btn btn-primary" to="/exercises/circuit-rc">Continuer</Link></div>
      </section>
      <section className="card">
        <div className="section-row"><div><span className="eyebrow">Matières</span><h2>Ton niveau</h2></div><Link to="/subjects" className="text-brand">Explorer →</Link></div>
        <div className="subject-stack">{subjects.map(s => <div className="subject-line" key={s.name}><div className="subject-line__name"><SubjectIcon type={s.type} label={s.name}/><div><strong>{s.name}</strong><span>{s.chapter}</span></div></div><div className="subject-line__score"><strong>{s.score}%</strong><ProgressBar value={s.score}/></div></div>)}</div>
      </section>
    </div>
  </main>;
}
