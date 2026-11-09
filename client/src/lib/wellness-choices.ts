import {useEffect,useRef,useState} from "react";
import {useQuery,useMutation,useQueryClient} from "@tanstack/react-query";
import {useLocation} from "wouter";
import {useAuth} from "./auth";
import {useExperience} from "./experience";
import {apiRequest,ApiRequestError} from "./queryClient";
import {accountContextGuard} from "./request-actor";
import {invalidatePlanningInputs} from "./planning-cache";
import {wellnessChoiceCommandSchema,type WellnessActionView,type WellnessChoiceCommand,type WellnessDay} from "@shared/wellness-actions";
import type {ExperienceRecord} from "@shared/experience";
const key="bloomWellnessPendingV1";
type Attempt={actor:string;command:WellnessChoiceCommand;assertCurrent:()=>void;href?:string};
function clearStored(actor:string,intentId?:string){const stored=window.history.state?.[key];if(stored?.actor!==actor||intentId&&stored?.command?.intentId!==intentId)return;const{[key]:_removed,...rest}=window.history.state;window.history.replaceState(rest,"");}
export function useWellnessChoices(day:WellnessDay,enabled:boolean){
 const{user}=useAuth(),experience=useExperience(),queryClient=useQueryClient(),[,navigate]=useLocation();
 const actor=useRef(user?.id);actor.current=user?.id;
 const[attempt,setAttempt]=useState<Attempt|null>(null),[preparing,setPreparing]=useState(false),[notice,setNotice]=useState("");
 const preparingRef=useRef(false);
 const path=`/api/experience/wellness-actions?date=${encodeURIComponent(day.date)}&timezoneOffset=${day.timezoneOffset}`;
 const read=async()=>{const body=await(await apiRequest("GET",path)).json();if(body?.version!=="wellness-actions-v1"||body.accountScope!==user?.id||body.day?.date!==day.date||body.day?.timezoneOffset!==day.timezoneOffset||!Array.isArray(body.actions)||!Array.isArray(body.history))throw Error("The current action source could not be confirmed.");return body as WellnessActionView;};
 const source=useQuery<WellnessActionView>({queryKey:["/api/experience/wellness-actions",user?.id,day.date,day.timezoneOffset],enabled:!!user&&enabled,queryFn:read});
 const current=enabled&&source.fetchStatus==="idle"&&!source.isError&&!source.isStale&&source.data?.accountScope===user?.id?source.data:undefined;
 const refresh=async()=>{await Promise.all([invalidatePlanningInputs(),queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith("/api/experience/")&&!String(q.queryKey[0]).startsWith("/api/experience/wellness-actions")})]);};
 const save=useMutation({mutationFn:async(value:Attempt)=>{value.assertCurrent();const result=await(await apiRequest("POST","/api/experience/wellness-choices",value.command)).json() as ExperienceRecord;value.assertCurrent();return result;},onSuccess:async(_record,value)=>{
  try{value.assertCurrent();}catch{return;}if(actor.current!==value.actor)return;
  clearStored(value.actor,value.command.intentId);setAttempt(null);await refresh();
  try{value.assertCurrent();}catch{return;}if(actor.current!==value.actor)return;
  setNotice(`Choice saved for ${value.command.date}.`);
  if(value.href?.startsWith("/")&&!value.href.startsWith("//"))navigate(value.href);
 }});
 const remove=useMutation({mutationFn:async(value:{actor:string;records:WellnessActionView["history"];assertCurrent:()=>void})=>{value.assertCurrent();await apiRequest("DELETE","/api/experience/wellness-choices",{records:value.records.map(({id,intentId,revision})=>({id,intentId,revision}))},{"X-Bloom-Confirm":"delete-wellness-choice-history"});value.assertCurrent();},onSuccess:async(_value,variables)=>{
  if(actor.current!==variables.actor)return;await refresh();try{variables.assertCurrent();}catch{return;}setNotice("Selected choice history deleted.");document.getElementById("today-action-title")?.focus();
 }});
 useEffect(()=>{
  setAttempt(null);setNotice("");save.reset();remove.reset();
  const stored=window.history.state?.[key];if(!stored)return;
  if(!user?.id||stored.actor!==user.id){clearStored(stored.actor);return;}
  const parsed=wellnessChoiceCommandSchema.safeParse(stored.command);
  if(parsed.success)setAttempt({actor:user.id,command:parsed.data,assertCurrent:accountContextGuard(user.id)});else clearStored(user.id);
 },[user?.id]);
 useEffect(()=>{
  if(!attempt||!current||save.isPending)return;
  const row=current.history.find(row=>row.intentId===attempt.command.intentId);
  if(!row)return;
  const parsed=wellnessChoiceCommandSchema.safeParse({date:row.date,timezoneOffset:row.timezoneOffset,intentId:row.intentId,actionId:row.actionId,choice:row.choice,lifecycleId:row.lifecycleId,requestRevision:row.requestRevision});
  if(parsed.success&&JSON.stringify(parsed.data)===JSON.stringify(attempt.command)){clearStored(attempt.actor,attempt.command.intentId);setAttempt(null);save.reset();setNotice(`Choice saved for ${row.date}.`);}
 },[attempt,current,save.isPending]);
 async function choose(actionId:string,choice:WellnessChoiceCommand["choice"],open=false){
  if(!user||!current||attempt||preparingRef.current||save.isPending||remove.isPending||!experience.ready)return;
  const selected=current.actions.find(a=>a.action.id===actionId&&a.eligible);if(!selected)return;
  const assertCurrent=accountContextGuard(user.id);preparingRef.current=true;setPreparing(true);setNotice("");
  try{
   let view=current;
   if(!view.lifecycleId){await experience.patchAsync({onboarding:experience.settings.onboarding});assertCurrent();view=await read();assertCurrent();}
   const latest=view.actions.find(a=>a.action.id===actionId);
   if(!view.dateCurrent||!view.lifecycleId||!latest?.eligible||latest.decisionRevision!==selected.decisionRevision||!latest.requestRevision)throw Error("The suggestion changed. Review the current source before choosing again.");
   const command=wellnessChoiceCommandSchema.parse({...view.day,intentId:crypto.randomUUID(),actionId,choice,lifecycleId:view.lifecycleId,requestRevision:latest.requestRevision});
   const value:Attempt={actor:user.id,command,assertCurrent,...(open?{href:latest.action.href}:{})};
   window.history.replaceState({...window.history.state,[key]:{actor:user.id,command}},"");
   setAttempt(value);save.mutate(value);
  }catch(error){if(actor.current===user.id)setNotice(error instanceof Error?error.message:"Your choice could not be prepared. Ordinary logging remains available.");}
  finally{preparingRef.current=false;setPreparing(false);}
 }
 const rejected=save.error instanceof ApiRequestError&&[400,401,403,404,409,422].includes(save.error.status);
 const resetRejected=()=>{if(!attempt||!rejected)return;clearStored(attempt.actor,attempt.command.intentId);setAttempt(null);save.reset();setNotice("");void refresh();};
 const deleteHistory=(records:WellnessActionView["history"])=>{if(!user||!records.length||attempt||save.isPending||remove.isPending)return;if(window.confirm(`Delete these ${records.length} saved action choices for ${day.date}?`))remove.mutate({actor:user.id,records,assertCurrent:accountContextGuard(user.id)});};
 return{current,source,choose,deleteHistory,notice,error:save.error?.message||remove.error?.message||"",busy:preparing||save.isPending||remove.isPending,waiting:!!attempt&&attempt.actor===user?.id,sourceReady:experience.ready,settingsLoading:experience.loading,preparing,rejected,resetRejected,retry:()=>{if(attempt&&attempt.actor===user?.id&&!save.isPending)save.mutate(attempt);}};
}
export type WellnessChoicesController=ReturnType<typeof useWellnessChoices>;
