import { ArrowRight, BookOpen, CheckCircle2, Clock3, Flame, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { ProgressBar } from "../components/ui/ProgressBar";
import { SubjectIcon, type SubjectType } from "../components/ui/SubjectIcon";
import PeopleFeature from "../components/ui/PeopleFeature";
import "./Dashboard.css";

const subjectTypes: Record<string, SubjectType> = { maths: "math", "physique-chimie": "physics", svt: "svt", anglais: "english", philosophie: "philosophy" };
const mastery: Record<string, number> = { maths: 91, "physique-chimie": 84, svt: 78, anglais: 75, philosophie: 72 };
const week = [55, 74, 82, 48, 91, 66, 38];
const weekLabels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function Dashboard() {
  const { profile, schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const trackSubjects = getTrackSubjects(path);
  const displayName = profile?.display_name?.split(" ")[0] || "élève";
  const pathLabel = schoolPreferences?.track === "SM" ? `Sciences Mathématiques ${schoolPreferences.section ?? ""}` : "Sciences Physiques";

  return <main className="section container dashboard-page">
    <header className="dashboard-hero"><div><span className="section-eyebrow">TABLEAU DE BORD · 2BAC</span><h1>Continue ta <span className="accent-word">préparation.</span></h1><p>Bonjour {displayName}. Voici ce qui mérite ton attention aujourd’hui.</p></div><div className="dashboard-path"><span>PARCOURS ACTIF</span><strong>{pathLabel}</strong><Link to="/preferences">Modifier</Link></div></header>

    <PeopleFeature variant="hero" compact title="Ton prochain chapitre commence ici." text="Cours, exercices et correction guidée dans un seul parcours. Travaille régulièrement pour construire une préparation solide au Bac." action={<Link className="btn btn-primary" to="/exercices">Commencer une session <ArrowRight size={15} /></Link>} />

    <section className="stats-grid dashboard-stats"><div className="card"><div className="dashboard-stat-icon"><TrendingUp size={17}/></div><span>Réussite moyenne</span><strong>86%</strong><small>+4 pts ce mois</small></div><div className="card"><div className="dashboard-stat-icon"><Target size={17}/></div><span>Exercices</span><strong>186</strong><small>12 cette semaine</small></div><div className="card"><div className="dashboard-stat-icon"><Flame size={17}/></div><span>Série</span><strong>5 jours</strong><small>record : 12 jours</small></div><div className="card"><div className="dashboard-stat-icon"><Clock3 size={17}/></div><span>Temps de travail</span><strong>12h40</strong><small>objectif : 15h</small></div></section>

    <div className="dashboard-grid">
      <section className="card dashboard-priority"><div className="section-row"><div><span className="section-eyebrow">PRIORITÉ DU JOUR</span><h2>Physique-Chimie · Électricité</h2></div><span className="dashboard-priority-time">25 min</span></div><div className="dashboard-priority-body"><div className="dashboard-priority-icon"><SubjectIcon type="physics" label="Physique-Chimie" /></div><div><strong>Réponse d’un circuit RC</strong><p>Consolide les équations différentielles avant de passer aux exercices plus difficiles.</p><div className="dashboard-tags"><span>Difficile</span><span>+40 XP</span><span>2 tentatives</span></div></div><Link className="btn btn-primary" to="/exercices?subject=physique-chimie">Commencer <ArrowRight size={15}/></Link></div></section>
      <section className="card"><div className="section-row"><div><span className="section-eyebrow">TON PROGRAMME</span><h2>Matières</h2></div><Link to="/matieres" className="text-brand">Explorer <ArrowRight size={14}/></Link></div><div className="dashboard-subjects">{trackSubjects.map((subject) => { const value = mastery[subject.id] ?? 70; return <Link to={`/subjects/${subject.id}`} className="dashboard-subject" key={subject.id}><SubjectIcon type={subjectTypes[subject.id]} label={subject.name}/><div><strong>{subjectCatalog[subject.id].shortName}</strong><span>{subject.name}</span></div><b>{value}%</b><ProgressBar value={value}/></Link>; })}</div></section>
    </div>

    <div className="dashboard-lower-grid">
      <section className="card dashboard-week"><div className="section-row"><div><span className="section-eyebrow">ACTIVITÉ</span><h2>Ta semaine</h2></div><Link to="/progression" className="text-brand">Détails <ArrowRight size={14}/></Link></div><div className="dashboard-chart">{week.map((value,index)=><div className="dashboard-bar-wrap" key={weekLabels[index]}><span className="dashboard-bar-value">{value}%</span><div className={`dashboard-bar ${index === 4 ? "active" : ""}`} style={{height:`${value}%`}}/><small>{weekLabels[index]}</small></div>)}</div></section>
      <section className="card dashboard-checklist"><div><span className="section-eyebrow">SESSION DU JOUR</span><h2>3 choses à faire</h2></div><div className="dashboard-check"><span className="dashboard-check-dot done"><CheckCircle2 size={15}/></span><div><strong>Revoir un cours</strong><small>Mathématiques · 12 min</small></div><b>✓</b></div><div className="dashboard-check"><span className="dashboard-check-dot"><Target size={15}/></span><div><strong>Faire 3 exercices</strong><small>Physique-Chimie · 25 min</small></div><Link to="/exercices" aria-label="Faire les exercices"><ArrowRight size={15}/></Link></div><div className="dashboard-check"><span className="dashboard-check-dot"><BookOpen size={15}/></span><div><strong>Lire une fiche</strong><small>Philosophie · 10 min</small></div><Link to="/ai-studio/handnotes" aria-label="Ouvrir les notes"><ArrowRight size={15}/></Link></div></section>
    </div>

    <section className="dashboard-next card"><div><span className="section-eyebrow">PROCHAINE ÉTAPE</span><h2>Travaille un chapitre, puis vérifie-le.</h2><p>Le parcours le plus efficace reste simple : cours → pratique → correction → reprise ciblée.</p></div><div className="dashboard-next-actions"><Link className="btn btn-secondary" to="/lecons/maths"><BookOpen size={15}/> Revoir un cours</Link><Link className="btn btn-primary" to="/exercices"><Target size={15}/> Faire des exercices</Link></div></section>
  </main>;
}
