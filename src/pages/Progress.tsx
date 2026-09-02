import { PageHeader } from '../components/ui/PageHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SubjectIcon, type SubjectType } from '../components/ui/SubjectIcon';
import { StatCard } from '../components/ui/StatCard';

const data: Array<{ name: string; type: SubjectType; score: number; solved: number; target: number }> = [
  { name: 'Mathématiques', type: 'math', score: 91, solved: 38, target: 50 },
  { name: 'Physique-Chimie', type: 'physics', score: 84, solved: 31, target: 45 },
  { name: 'SVT', type: 'svt', score: 78, solved: 25, target: 40 },
  { name: 'Français', type: 'french', score: 75, solved: 19, target: 35 },
];

export default function Progress() {
  return <main className="section container"><PageHeader eyebrow="Progression" title={<>Mes <span className="accent-word">progrès.</span></>} description="Analyse ton niveau, tes habitudes et les chapitres qui méritent plus de travail." />
    <div className="stats-grid"><StatCard label="Moyenne globale" value="86%" hint="+8% ce mois-ci"/><StatCard label="Exercices terminés" value="113" hint="29 cette semaine"/><StatCard label="Série actuelle" value="5 jours" hint="Record : 12 jours"/><StatCard label="Temps total" value="27h" hint="Depuis le début"/></div>
    <section className="card"><div className="section-row"><div><span className="eyebrow">Par matière</span><h2>Où tu en es</h2></div><span className="label">Objectif : 90%</span></div><div className="progress-subject-list">{data.map(item => <article key={item.name} className="progress-subject"><div className="progress-subject__head"><div><SubjectIcon type={item.type} label={item.name}/><strong>{item.name}</strong></div><strong>{item.score}%</strong></div><ProgressBar value={item.score}/><div className="progress-subject__foot"><span>{item.solved} exercices terminés</span><span>Objectif {item.target}</span></div></article>)}</div></section>
    <section className="card heat-card"><div><span className="eyebrow">Régularité</span><h2>Ton activité</h2><p>Les petites sessions répétées gagnent contre les marathons occasionnels. Malheureusement, le cerveau humain n'est pas un forfait illimité.</p></div><div className="heat-grid">{Array.from({ length: 35 }, (_, i) => <span key={i} className={`heat-cell heat-${(i * 7) % 5}`} />)}</div></section>
  </main>;
}
