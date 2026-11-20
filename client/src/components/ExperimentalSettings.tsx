import {useCapabilities} from "@/lib/capabilities";
import {useEffect,useRef,useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {apiRequest,queryClient} from "@/lib/queryClient";
import {useLocation} from 'wouter';
import {accountContextGuard} from '@/lib/request-actor';
import {activeExperimentalEntries} from '@shared/development-features';
const groupNames={AI_FOOD:'AI Food & Nutrition',ATHLETE:'Athlete & Training',BIOLOGY:'Biological Intelligence',GENETICS:'Genetics',COACH:'AI Coach',INTEGRATIONS:'Data Integrations',RESEARCH:'Research'};
const statusNames={AVAILABLE_FOR_TESTING:'Available for testing',DEVELOPMENT_PREVIEW:'Development preview',IN_DEVELOPMENT:'In development',PLANNED:'Planned',RESTRICTED:'Restricted'};
export default function ExperimentalSettings(){
 const [,navigate]=useLocation();const generation=useRef(0);
 const [opening,setOpening]=useState(false),[openError,setOpenError]=useState('');
 useEffect(()=>()=>{generation.current++;},[]);
 const [requested,setRequested]=useState<boolean|null>(null);
 const status=useCapabilities();const key=status.key;
 const save=useMutation({
  onMutate:(enabled:boolean)=>{
   if(!enabled){
    queryClient.setQueryData(status.holdKey,true);
    queryClient.setQueryData(key,(previous:any)=>previous?{...previous,experimentalEnabled:false}:previous);
    void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedCapability===true});
    queryClient.removeQueries({predicate:q=>q.meta?.restrictedCapability===true});
   }
  },
  mutationFn:async(enabled:boolean)=>(await apiRequest('PATCH','/api/capabilities/experimental',{enabled})).json(),
  onSuccess:async()=>{await queryClient.invalidateQueries({queryKey:key});queryClient.setQueryData(status.holdKey,false);},
  onSettled:async(_data,error)=>{if(error)await queryClient.invalidateQueries({queryKey:key});setRequested(null);},
 });
 const openPreview=async(id:string)=>{
  const started=++generation.current;setOpening(true);setOpenError('');
  try{
   const assertCurrent=accountContextGuard(status.key[1]);
   const fresh=await status.refetch();assertCurrent();
   if(started!==generation.current)return;
   const entry=!fresh.isError&&!queryClient.getQueryData(status.holdKey)?activeExperimentalEntries(fresh.data).find(row=>row.id===id&&row.actionAllowed):undefined;
   if(!entry?.route)throw Error('Preview access changed. Refresh the workspace before trying again.');
   navigate(entry.route);
  }catch(error){if(started===generation.current)setOpenError(error instanceof Error?error.message:'Preview access could not be confirmed.');}
  finally{if(started===generation.current)setOpening(false);}
 };
 const requestPreference=(enabled:boolean)=>{generation.current++;setOpening(false);setOpenError('');setRequested(enabled);save.mutate(enabled);};
 if(!status.data?.eligible||status.isError)return null;
 const pending=requested!==null||save.isPending||status.isFetching;
 return <div className="experimental-preference space-y-3 w-full min-w-0">
  <h2 className="font-serif text-xl">Experimental Features</h2>
  <label className="flex gap-3 items-center min-h-11 cursor-pointer"><input className="h-5 w-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" type="checkbox" checked={requested??status.data.experimentalEnabled} disabled={pending} onChange={e=>requestPreference(e.target.checked)}/>Show development features</label>
  <p className="panel-note">DEV ONLY — NOT APPROVED FOR PUBLIC RELEASE. Isolated synthetic testing only. No restricted services are cleared by this switch alone.</p>
  {status.data.experimentalEnabled&&!status.experimentalEntries.length&&<p className="panel-note">No development modules are available for this account.</p>}
  {!!status.experimentalEntries.length&&<div aria-label="Experimental Features workspace" className="space-y-5">
   {Object.entries(groupNames).map(([group,label])=>{
    const entries=status.experimentalEntries.filter(entry=>entry.group===group);if(!entries.length)return null;
    return <section key={group} aria-label={label} className="min-w-0"><h3 className="text-sm font-semibold tracking-wide text-muted-foreground">{label}</h3>
     <ul className="divide-y divide-border">{entries.map(entry=><li key={entry.id} className="py-3 space-y-2 min-w-0 break-words">
      <div className="flex flex-wrap items-baseline justify-between gap-2"><h4 className="font-medium">{entry.title}</h4><span className="text-xs text-muted-foreground">{statusNames[entry.visibilityStatus]}</span></div>
      <p className="text-sm">{entry.description}</p>
      {!!entry.limitations?.length&&<details><summary className="min-h-11 flex items-center cursor-pointer text-sm underline focus-visible:outline focus-visible:outline-2">Scope & limitations</summary><ul className="text-sm list-disc pl-5">{entry.limitations.map(text=><li key={text}>{text}</li>)}</ul></details>}
      {entry.actionAllowed&&<button type="button" disabled={opening||pending} onClick={()=>void openPreview(entry.id)} className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">{opening?'Checking access…':'Open synthetic preview'}</button>}
     </li>)}</ul>
    </section>;
   })}
  </div>}
  {openError&&<p role="alert">{openError}</p>}
  {(save.error||status.visibilityHeld&&!save.isPending)&&<div role="alert" className="space-y-2">
   <p>{status.visibilityHeld?"Development features are off here. We couldn't confirm your saved preference.":save.error?.message}</p>
   {status.visibilityHeld&&<button type="button" className="text-primary underline inline-flex min-h-11 items-center focus-visible:outline focus-visible:outline-2" disabled={pending} onClick={()=>requestPreference(false)}>Retry turning off</button>}
  </div>}
 </div>;
}
