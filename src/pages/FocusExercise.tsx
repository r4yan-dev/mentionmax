import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Lightbulb, Loader2, Sparkles, Target } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAccount } from "../context/AccountContext";
import { useAuth } from "../context/AuthContext";
import { resolveUserPath } from "../data/curriculum/secondBac";
import { contentCatalogService } from "../services/content/contentCatalogService";
import { correctExerciseWithAI, type AICorrectionResult } from "../services/ai/aiCorrector";
import { LatexText } from "../components/ui/LatexText";
import LatexContent from "../components/ui/LatexContent";
import "../components/ui/LatexContent.css";
import type { Exercise } from "../types/content";
import "./FocusExercise.css";

const difficultyLabels=["","Très facile","Facile","Intermédiaire","Difficile","Très difficile"];
function trackIdForPath(path:ReturnType<typeof resolveUserPath>){return path==="SP"?"SP":path==="SMA"?"SMA":"SMB";}
const verdictLabels={correct:"Correct",mostly_correct:"Presque correct",partially_correct:"Partiellement correct",incorrect:"À reprendre"} as const;

export default function FocusExercise(){
  const{exerciseId}=useParams();const navigate=useNavigate();const{user}=useAuth();const{schoolPreferences}=useAccount();const path=resolveUserPath(schoolPreferences?.track??null,schoolPreferences?.section??null);const trackId=trackIdForPath(path);
  const exercise=useMemo<Exercise|undefined>(()=>{if(!exerciseId)return undefined;return contentCatalogService.getBaseExercises(trackId,"maths").find(item=>item.id===exerciseId);},[exerciseId,trackId]);
  const parts=exercise?[exercise.statement]:[];const[answers,setAnswers]=useState<string[]>([]);const[hint,setHint]=useState(false);const[aiBusy,setAiBusy]=useState(false);const[aiResult,setAiResult]=useState<AICorrectionResult|null>(null);const[error,setError]=useState<string|null>(null);
  useEffect(()=>{setError(null);setAiResult(null);setAnswers(parts.map(()=>""));},[exerciseId,parts.length]);
  if(!exercise)return <main className="focus-exercise-page"><section className="focus-question-card"><span className="section-eyebrow">EXERCICE</span><h1>Ressource introuvable.</h1><p>Ce contenu n’existe pas dans ton parcours actuel.</p><Link to="/exercices" className="btn btn-primary">Retour aux exercices</Link></section></main>;
  const answered=answers.filter(value=>value.trim()).length;
  async function runAICorrection(){if(!user||!answered||aiBusy)return;setAiBusy(true);setError(null);try{const result=await correctExerciseWithAI({exercise,answers,trackId});setAiResult(result);}catch(correctionError){console.error(correctionError);setError(correctionError instanceof Error?correctionError.message:"Le correcteur IA est momentanément indisponible.");}finally{setAiBusy(false);}}
  function updateAnswer(indexPart:number,value:string){setAiResult(null);setAnswers(current=>current.map((answer,indexValue)=>indexValue===indexPart?value:answer));}
  return <main className="focus-exercise-page"><div className="focus-exercise-shell">
    <header className="focus-exercise-header"><button className="runner-back" onClick={()=>navigate("/exercices")}><ArrowLeft size={16}/> Exercices</button><div className="focus-exercise-progress"><div className="focus-exercise-progress__top"><span>{path}</span><strong>Exercice</strong></div></div><span className={`exercise-difficulty difficulty-${exercise.difficulty}`}>{difficultyLabels[exercise.difficulty]}</span></header>
    <section className="focus-question-card"><div className="focus-question-meta"><span><Sparkles size={14}/> EXERCICE</span><span><Clock3 size={14}/> {exercise.estimatedMinutes} min</span></div><span className="section-eyebrow">{exercise.target.chapter} · {exercise.target.topic}</span><h1>{exercise.title}</h1><div className="focus-context-box"><span className="section-eyebrow">ÉNONCÉ</span><LatexText>{exercise.statement}</LatexText></div><div className="focus-objective-box"><Target size={17}/><div><span>Objectif</span><strong>Résoudre, justifier et rédiger proprement.</strong></div></div>
      <div className="focus-parts"><div className="focus-parts__header"><div><span className="section-eyebrow">RÉPONSE</span><h2>Ton raisonnement</h2></div><span>{answered}/1 remplie</span></div>{parts.map((part,indexPart)=><label className="focus-part" key={`${exercise.id}-${indexPart}`}><span className="focus-part__number">A</span><div className="focus-part__content"><LatexText>{part}</LatexText><textarea value={answers[indexPart]??""} rows={8} disabled={aiBusy} onChange={event=>updateAnswer(indexPart,event.target.value)} placeholder="Écris ton raisonnement ici..."/></div></label>)}</div>
      <div className="focus-work-footer"><div className="focus-ai-actions"><button className="btn btn-primary" disabled={!user||!answered||aiBusy} onClick={()=>void runAICorrection()}>{aiBusy?<><Loader2 size={16}/> Analyse...</>:<>Corriger avec l’IA <Sparkles size={16}/></>}</button>{aiResult?<button className="btn btn-secondary" onClick={()=>setAiResult(null)}>Nouvelle analyse</button>:null}</div></div>
      <div className="focus-tools"><button className="runner-tool-button" onClick={()=>setHint(value=>!value)}><Lightbulb size={16}/> {hint?"Masquer le rappel":"Afficher un rappel"}</button>{aiBusy?<span className="focus-saving-status"><Loader2 size={13}/> Le correcteur analyse ton raisonnement…</span>:null}</div>{hint?<div className="focus-hint-box"><strong>Rappel de méthode</strong><p>{exercise.hint??"Identifie la notion, écris la propriété utilisée, puis avance étape par étape avant de vérifier le résultat."}</p></div>:null}{error?<div className="focus-save-error">{error}</div>:null}{aiResult?<AICorrectionPanel result={aiResult}/>:null}
    </section>
  </div></main>;
}

function AICorrectionPanel({result}:{result:AICorrectionResult}){return <section className={`focus-ai-correction verdict-${result.verdict}`}><div className="focus-ai-correction__header"><div><span className="section-eyebrow">CORRECTEUR IA</span><h2>{verdictLabels[result.verdict]}</h2></div>{result.score!==null?<div className="focus-ai-score"><strong>{result.score}</strong><span>/20</span></div>:null}</div><LatexContent className="focus-ai-summary">{result.summary}</LatexContent>{result.strengths.length>0?<div className="focus-ai-block"><strong>Ce qui est réussi</strong><ul>{result.strengths.map((strength,index)=><li key={`strength-${index}`}><LatexContent>{strength}</LatexContent></li>)}</ul></div>:null}{result.errors.length>0?<div className="focus-ai-block"><strong>À corriger</strong><div className="focus-ai-errors">{result.errors.map((error,index)=><article key={`error-${index}`}><span><LatexContent>{error.location}</LatexContent></span><p><b>Attendu :</b> <LatexContent>{error.expected}</LatexContent></p><p><b>Dans ta copie :</b> <LatexContent>{error.observed}</LatexContent></p><p><b>Correction :</b> <LatexContent>{error.fix}</LatexContent></p></article>)}</div></div>:null}{result.correctedSolution?<div className="focus-ai-block"><strong>Solution corrigée</strong><div className="focus-ai-solution"><LatexContent>{result.correctedSolution}</LatexContent></div></div>:null}<div className="focus-ai-next"><Sparkles size={15}/><div><span>Prochaine action</span><strong><LatexContent>{result.nextStep}</LatexContent></strong></div></div></section>;}
