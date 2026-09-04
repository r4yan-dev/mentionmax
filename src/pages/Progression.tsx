import { ArrowRight, BrainCircuit, CheckCircle2, Clock3, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { getTrackSubjects, subjects as subjectCatalog } from "../data/curriculum/tracks";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { ProgressBar } from "../components/ui/ProgressBar";
import PeopleFeature from "../components/ui/PeopleFeature";

const weekly = [62, 78, 54, 91, 68, 84, 72];

export default function Progression() {
  const { schoolPreferences } = useAccount();
  const path = resolveUserPath(schoolPreferences?.track ?? null, schoolPreferences?.section ?? null);
  const subjects = getTrackSubjects(path);

  return <main className="section container">
    <header style={{ marginBottom: 26 }}><span className="section-eyebrow">PROGRESSION</span><h1 style={{ margin: "5px 0 8px" }}>Construis une avance réelle.</h1><p style={{ maxWidth: 650, color: "#718582", lineHeight: 1.65 }}>Pas seulement un compteur de tâches terminées. Ici, tu vois où tu progresses et où ton parcours a encore besoin de travail.</p></header>
    <PeopleFeature variant="writing" compact title="Chaque session compte." text="Une progression utile se construit dans la répétition : comprendre, pratiquer, corriger, recommencer." />
    <section className="stats-grid" style={{ marginBottom: 20 }}>
      <div className="card"><span className="section-eyebrow">XP TOTAL</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>1 120</strong><small style={{color:"#718582"}}>+180 cette semaine</small></div>
      <div className="card"><span className="section-eyebrow">TAUX DE RÉUSSITE</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>86%</strong><small style={{color:"#718582"}}>+4 pts ce mois</small></div>
      <div className="card"><span className="section-eyebrow">TEMPS D'ÉTUDE</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>12h 40</strong><small style={{color:"#718582"}}>objectif 15h</small></div>
      <div className="card"><span className="section-eyebrow">SÉRIE</span><strong style={{ display:"block",fontSize:28,marginTop:7 }}>5 jours</strong><small style={{color:"#718582"}}>record 12 jours</small></div>
    </section>
    <div className="dashboard-grid">
      <section className="card"><div className="section-row"><div><span className="section-eyebrow">Cette semaine</span><h2>Régularité</h2></div><span style={{fontSize:12,color:"#0fa3a3",fontWeight:800}}>+18% vs semaine passée</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",alignItems:"end",height:190,gap:10,paddingTop:15}}>{weekly.map((value,index)=><div key={index} style={{height:`${Math.max(25,value)}%`,borderRadius:"8px 8px 3px 3px",background:index===4?"#0fa3a3":"#d8eeea",position:"relative"}}><span style={{position:"absolute",top:-19,left:"50%",transform:"translateX(-50%)",fontSize:10,fontWeight:750,color:index===4?"#0fa3a3":"#7b9691"}}>{value}%</span></div>)}</div><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:10,marginTop:9}}>{["L","M","M","J","V","S","D"].map((day,index)=><span key={index} style={{textAlign:"center",fontSize:10,color:"#91a6a2"}}>{day}</span>)}</div></section>
      <section className="card"><div className="section-row"><div><span className="section-eyebrow">Matières</span><h2>Maîtrise</h2></div><Link to="/matieres" className="text-brand">Explorer <ArrowRight size={14}/></Link></div><div style={{display:"flex",flexDirection:"column",gap:17}}>{subjects.map((subject,index)=>{const value=[91,84,78,72,68][index%5];return <div key={subject.id}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><strong style={{fontSize:12}}>{subjectCatalog[subject.id].name}</strong><span style={{fontSize:12,fontWeight:850}}>{value}%</span></div><ProgressBar value={value}/></div>})}</div></section>
    </div>
    <section className="card" style={{marginTop:20,padding:22}}><div className="section-row"><div><span className="section-eyebrow">Prochaines actions</span><h2>Ce qui va vraiment améliorer ton niveau</h2></div></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:10}}><Link to="/exercices?subject=maths" className="card" style={{padding:16,textDecoration:"none"}}><BrainCircuit size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Faire 5 exercices</h3><p style={{margin:0,color:"#718582",fontSize:12}}>Consolide ton chapitre le moins stable.</p></Link><Link to="/exercices?subject=physique-chimie" className="card" style={{padding:16,textDecoration:"none"}}><Target size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Réviser la Physique</h3><p style={{margin:0,color:"#718582",fontSize:12}}>Travaille les applications avant le par cœur.</p></Link><div className="card" style={{padding:16}}><Clock3 size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>25 min aujourd'hui</h3><p style={{margin:0,color:"#718582",fontSize:12}}>Une session courte reste meilleure que zéro.</p></div><div className="card" style={{padding:16}}><CheckCircle2 size={18}/><h3 style={{margin:"10px 0 5px",fontSize:15}}>Objectif hebdo</h3><p style={{margin:0,color:"#718582",fontSize:12}}>72% du volume prévu est déjà réalisé.</p></div></div></section>
  </main>;
}
