import {useEffect,useRef} from 'react';
import {useMutation} from '@tanstack/react-query';
import {useAuth} from './auth';
import {apiRequest,ApiRequestError} from './queryClient';
import {refreshExperience} from './experience';
import {trainingSessionSchema,type TrainingSession} from '@shared/experience';
type Attempt={payload:TrainingSession;owner:string;key:string;finish?:()=>void};
/** Existing training payload + the same owned receipt pattern as manual activity. */
export function useSessionSave(){
 const{user}=useAuth(),actor=useRef(user?.id),active=useRef(true),attempt=useRef<Attempt|null>(null);actor.current=user?.id;
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const mutation=useMutation({mutationFn:async(value:Attempt)=>{
  if(!active.current||actor.current!==value.owner)throw Error('The session save was interrupted. Review it in the current account.');
  const record=await(await apiRequest('POST','/api/experience/sessions',value.payload,{'Idempotency-Key':value.key})).json(),parsed=trainingSessionSchema.safeParse(record.payload);
  if(record.kind!=='session'||typeof record.id!=='string'||!/^session_[a-f0-9]{64}$/.test(record.id)||!parsed.success||JSON.stringify(parsed.data)!==JSON.stringify(value.payload))throw Error('The session save could not be confirmed. Retry this same session or check your calendar.');
  return record;
 },onSuccess:(_record,value)=>{if(!active.current||actor.current!==value.owner||attempt.current!==value)return;attempt.current=null;value.finish?.();},onSettled:refreshExperience});
 const unknown=mutation.isError&&(!(mutation.error instanceof ApiRequestError)||mutation.error.status>=500);
 function mutate(input:{entry:{kind:'session';payload:TrainingSession}},options?:{onSuccess?:()=>void}){
  if(!user||!active.current)return;
  if(!attempt.current||attempt.current.owner!==user.id||mutation.isError&&!unknown)attempt.current={payload:trainingSessionSchema.parse(input.entry.payload),owner:user.id,key:crypto.randomUUID(),finish:options?.onSuccess};
  mutation.mutate(attempt.current);
 }
 function retry(){if(attempt.current&&active.current&&actor.current===attempt.current.owner)mutation.mutate(attempt.current);}
 return{mutate,retry,isPending:mutation.isPending,isPaused:mutation.isPaused,isSuccess:mutation.isSuccess,error:mutation.error,unknown};
}
