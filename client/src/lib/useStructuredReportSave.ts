import {useEffect,useRef,useState} from 'react';
import {useAuth} from './auth';
import {apiRequest,ApiRequestError} from './queryClient';
import {reportImportIdentity,type ReportImportFields,type ReportSaveResult} from '@shared/structured-report';
type Command=ReportImportFields&{report:unknown;originalFilename?:string};
type Counts=Pick<ReportSaveResult['preview'],'kind'|'scores'|'reportedOrganisms'|'quantifiedTaxa'>;
type Attempt={owner:string;key:string;serialized:string;counts:Counts;expectedId:string;sent:boolean;uncertainEver:boolean};
export function useStructuredReportSave(){
 const{user}=useAuth(),actor=useRef(user?.id),active=useRef(true),attempt=useRef<Attempt|null>(null),running=useRef(false),completed=useRef(false);actor.current=user?.id;
 const[pending,setPending]=useState(false),[uncertain,setUncertain]=useState(false),[error,setError]=useState<Error|null>(null),[saved,setSaved]=useState<ReportSaveResult|null>(null);
 useEffect(()=>{active.current=true;return()=>{active.current=false;attempt.current=null;};},[]);
 const current=(snapshot:Attempt)=>active.current&&actor.current===snapshot.owner&&attempt.current===snapshot;
 async function run(snapshot:Attempt):Promise<ReportSaveResult|undefined>{
  if(running.current||!current(snapshot))return;
  running.current=true;setPending(true);setError(null);
  try{
   if(!snapshot.expectedId){const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(reportImportIdentity(snapshot.owner,snapshot.key)));snapshot.expectedId='report_'+Array.from(new Uint8Array(hash),byte=>byte.toString(16).padStart(2,'0')).join('');}
   if(!current(snapshot))return;
   const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),30000);let result:any;
   try{snapshot.sent=true;result=await(await apiRequest('POST','/api/microbiome/import',JSON.parse(snapshot.serialized),{'Idempotency-Key':snapshot.key,'X-Bloom-Report-Actor':snapshot.owner},controller.signal)).json();}finally{window.clearTimeout(timeout);}
   const preview=result?.preview;
   if(result?.success!==true||result.sampleId!==snapshot.expectedId||!preview||Object.entries(snapshot.counts).some(([key,value])=>preview[key]!==value)||!['import-date','user-provided','report-provided'].includes(preview.dateSource)||!Array.isArray(preview.missingData)||!preview.missingData.every((value:unknown)=>typeof value==='string'))throw Error('The report save could not be confirmed. Retry the same import or check your saved reports.');
   if(!current(snapshot))return;
   attempt.current=null;completed.current=true;setUncertain(false);setSaved(result as ReportSaveResult);return result;
  }catch(cause){
   if(!current(snapshot))return;
   const definitive=!snapshot.uncertainEver&&cause instanceof ApiRequestError&&cause.status>=400&&cause.status<500&&![408,425,429,499].includes(cause.status);
   if(!snapshot.sent||definitive){attempt.current=null;setUncertain(false);}else{snapshot.uncertainEver=true;setUncertain(true);}
   setError(cause instanceof ApiRequestError?cause:new Error(snapshot.sent?'The report save could not be confirmed. Retry the same import or check your saved reports.':'The import could not be prepared. Try again using a secure browser connection.'));
  }finally{running.current=false;if(active.current&&actor.current===snapshot.owner)setPending(false);}
 }
 async function submit(payload:Command,counts:Counts){
  if(!active.current||!actor.current||completed.current)return;
  if(attempt.current)return run(attempt.current);
  if(!globalThis.crypto?.randomUUID||!crypto.subtle){setError(Error('Use a secure browser connection to save this report safely.'));return;}
  const snapshot:Attempt={owner:actor.current,key:crypto.randomUUID(),serialized:JSON.stringify(payload),counts:{...counts},expectedId:'',sent:false,uncertainEver:false};attempt.current=snapshot;return run(snapshot);
 }
 return {submit,retry:()=>attempt.current?run(attempt.current):Promise.resolve(undefined),pending,uncertain,error,saved,checkHref:saved?'/microbiome?sample='+encodeURIComponent(saved.sampleId):attempt.current?.expectedId?'/microbiome?sample='+encodeURIComponent(attempt.current.expectedId):'/microbiome'};
}
