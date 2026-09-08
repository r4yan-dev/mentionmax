import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { Exercise } from "../../types/content";
import type { TrackId } from "../../types/academic";

export type CorrectionVerdict = "correct" | "mostly_correct" | "partially_correct" | "incorrect";
export type AICorrectionResult = {
  score:number|null;
  verdict:CorrectionVerdict;
  summary:string;
  strengths:string[];
  errors:Array<{location:string;expected:string;observed:string;fix:string}>;
  correctedSolution:string;
  nextStep:string;
};
type FunctionResponse={success?:boolean;data?:AICorrectionResult;error?:string;detail?:string};

async function getFunctionError(error:unknown){
  if(error instanceof FunctionsHttpError){
    try{
      const payload=(await error.context.json()) as FunctionResponse;
      if(payload?.detail)return `${payload.error??"Le correcteur IA est indisponible."} ${payload.detail}`;
      if(payload?.error)return payload.error;
    }catch{}
  }
  if(error instanceof Error&&error.message.trim())return error.message;
  return "Le correcteur IA est indisponible.";
}

async function invokeCorrection(body: Record<string, unknown>) {
  const {data,error}=await supabase.functions.invoke<FunctionResponse>("ai-exercise-corrector",{body});
  if(error)throw error;
  if(!data?.success||!data.data)throw new Error(data?.detail?`${data.error??"Le correcteur IA est indisponible."} ${data.detail}`:data?.error??"Le correcteur IA est indisponible.");
  return data.data;
}

export async function correctExerciseWithAI(params:{exercise:Exercise;answers:string[];trackId:TrackId}){
  const{exercise,answers,trackId}=params;
  if(!answers.some(a=>a.trim()))throw new Error("Écris au moins une réponse avant de lancer la correction.");
  try{
    const result=await invokeCorrection({
      mode:"exercise",
      exercise:{id:exercise.id,title:exercise.title,statement:exercise.statement,type:exercise.type,difficulty:exercise.difficulty,expectedAnswer:exercise.expectedAnswer,correction:exercise.correction,target:exercise.target},
      answers,
      trackId,
    });
    const{data:userData,error:userError}=await supabase.auth.getUser();
    if(userError)throw userError;
    if(!userData.user)throw new Error("Utilisateur non authentifié.");
    const{error:saveError}=await supabase.from("ai_corrections").insert({
      user_id:userData.user.id,
      exercise_id:exercise.id,
      subject_id:exercise.target.subjectId,
      track_id:trackId,
      statement:exercise.statement,
      student_answers:answers,
      result,
      provider:"gemini",
    });
    if(saveError)throw saveError;
    return result;
  }catch(error){throw new Error(await getFunctionError(error));}
}

export async function correctExamCopyWithAI(params:{trackId:TrackId;ocr:AICorrectionOCRInput}){
  const{trackId,ocr}=params;
  if(!ocr.text.trim()&&!ocr.segments.length)throw new Error("La transcription de la copie est vide.");
  try{
    const result=await invokeCorrection({mode:"exam_copy",trackId,ocr});
    const{data:userData,error:userError}=await supabase.auth.getUser();
    if(userError)throw userError;
    if(!userData.user)throw new Error("Utilisateur non authentifié.");
    const{error:saveError}=await supabase.from("ai_corrections").insert({
      user_id:userData.user.id,
      exercise_id:`exam-copy-${Date.now()}`,
      subject_id:"exam",
      track_id:trackId,
      statement:ocr.text,
      student_answers:ocr.segments.map(segment=>segment.text),
      result,
      provider:"gemini",
    });
    if(saveError)throw saveError;
    return result;
  }catch(error){throw new Error(await getFunctionError(error));}
}

export type AICorrectionOCRInput={
  text:string;
  documentType:"exercise"|"exam_copy"|"notes"|"unknown";
  confidence:number|null;
  segments:Array<{kind:"printed_question"|"student_answer"|"annotation"|"unknown";label:string;text:string}>;
};
