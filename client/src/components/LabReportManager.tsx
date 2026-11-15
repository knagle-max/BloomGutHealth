import {Link} from 'wouter';
import {publishedLabRanges} from '@shared/lab-provider-ranges';
import {useEffect,useRef,useState} from 'react';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError,queryClient} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {labSourcesKey,useLabSources} from '@/lib/lab-sources';
import {useLabReportOverlays} from '@/lib/lab-report-overlays';
import {labManagedSourceSchema,labReportMetadataCommandSchema,labProvinces,reportProviderName,sourceOverlayKey,laboratorySourceTitle,type LabManagedSource,type LabReportMetadataCommand} from '@shared/lab-report-metadata';
import {emptyLabOverlayChoice} from '@shared/lab-overlay-preference';
import {Button} from './ui/button';
import {Dialog,DialogContent,DialogTitle,DialogDescription} from './ui/dialog';
import LabRangeSelector from './LabRangeSelector';

export default function LabReportManager({source,onClose}:{source:LabManagedSource;onClose:()=>void}){
 const {user}=useAuth(),sources=useLabSources(),overlays=useLabReportOverlays(),key=sourceOverlayKey(source);
 const [basis,setBasis]=useState(source),[identity,setIdentity]=useState(source.metadata?.current?.identity??null),[reviewed,setReviewed]=useState(false),[pending,setPending]=useState(false),[held,setHeld]=useState<{body:LabReportMetadataCommand;receipt:string}|null>(null),[definite,setDefinite]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const active=useRef(true),busy=useRef(false);useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 const latest=sources.data?.find(row=>row.id===source.id),ready=sources.fetchStatus==='idle'&&!sources.isError&&!sources.isStale,stale=!!latest&&(latest.revision!==basis.revision||latest.metadata?.current?.revision!==basis.metadata?.current?.revision),missing=ready&&!latest;
 const preference=overlays.state.preferences[key]??basis.metadata?.current?.overlay??emptyLabOverlayChoice(),locked=pending||!!held,available=basis.metadata?.available===true;
 const fields=identity??{provider:'unknown' as const,otherProvider:'',province:'' as const,location:'',assertion:'user-confirmed' as const};
 function changeIdentity(patch:Partial<NonNullable<typeof identity>>){const next={...fields,...patch,otherProvider:patch.provider&&patch.provider!=='other'?'':patch.otherProvider??fields.otherProvider};setIdentity(next.provider==='unknown'&&!next.province&&!next.location&&!next.otherProvider?null:next);setReviewed(false);overlays.preference(key,emptyLabOverlayChoice());}
 async function save(attempt:{body:LabReportMetadataCommand;receipt:string}){
  if(!user||busy.current||!active.current)return;const owner=user.id,guard=accountContextGuard(owner);busy.current=true;setPending(true);setHeld(attempt);setDefinite(false);setError('');setNotice('');
  try{
   const response=labManagedSourceSchema.parse(await(await apiRequest('POST',`/api/precision/labs/sources/${source.id}/metadata`,attempt.body,{'Idempotency-Key':attempt.receipt,'X-Bloom-Labs-Actor':owner})).json());guard();
   if(response.id!==source.id||!response.metadata?.available||!response.metadata.current)throw Error('The report metadata save could not be confirmed. Retry this same save.');
   await queryClient.cancelQueries({queryKey:labSourcesKey(owner)});guard();queryClient.setQueryData<LabManagedSource[]>(labSourcesKey(owner),old=>old?.map(row=>row.id===response.id?response:row));overlays.hydrate([response]);
   if(active.current){setHeld(null);setBasis(response);setIdentity(response.metadata.current.identity);setReviewed(false);setNotice(response.metadata.current.revision===attempt.receipt?'Report details and reference preference saved. Original observations are unchanged.':'That save was already recorded; a newer report annotation is now current.');}
   await queryClient.invalidateQueries({queryKey:labSourcesKey(owner)});
  }catch(error){try{guard();if(active.current){setDefinite(error instanceof ApiRequestError&&error.status>=400&&error.status<500);setError(error instanceof Error?error.message:'The save could not be confirmed. Your draft is retained.');}}catch{/* A former account cannot restore this report draft. */}}
  finally{busy.current=false;if(active.current){setPending(false);}}
 }
 function submit(event:React.FormEvent){event.preventDefault();if(locked||!available||stale||missing||!ready)return;try{const body=labReportMetadataCommandSchema.parse({sourceRevision:basis.revision,metadataRevision:basis.metadata?.current?.revision??null,identity,identityReviewed:reviewed,overlay:{provider:preference.provider,province:preference.province,otherProvider:preference.otherProvider}});void save({body,receipt:crypto.randomUUID()});}catch{setError('Check the provider name, jurisdiction and reference preference. Unknown source details may stay unknown.');}}
 function close(){if(pending)return;overlays.preference(key,latest?.metadata?.current?.overlay??emptyLabOverlayChoice());onClose();}
 return <Dialog open onOpenChange={open=>!open&&close()}><DialogContent className="max-h-[90dvh] overflow-y-auto min-w-0 grid-cols-[minmax(0,1fr)] [&>*]:min-w-0 [&_button]:max-w-full [&_button]:whitespace-normal [&_button]:min-h-11 [overflow-wrap:anywhere]">
  <DialogTitle>Manage laboratory & reference ranges</DialogTitle><DialogDescription>{laboratorySourceTitle(basis)} · {basis.dates.join(', ')} · {basis.results===null?'result count unavailable':`${basis.results} results`}. {basis.scope==='report'?'Shared only by this original report group.':'This is one independent result; dates do not link it to other reports.'}</DialogDescription>
  <div className="space-y-2"><p>Original laboratory label: {(basis.originalLaboratories||[]).join(' · ')||'Unknown original provider'}.</p><p className="panel-note">Imported labels, numbers, dates, units and reference limits stay unchanged. A confirmation below is a separate annotation.</p>{basis.metadata?.current&&!basis.metadata.sourceCurrent&&<p role="status">The source changed since the previous confirmation. Recheck the source before confirming these laboratory details again.</p>}</div>
  {!available&&<p role="status">Report metadata storage is unavailable in this application version. Original results and references remain readable.</p>}
  {reportProviderName(identity)&&identity?.province&&!publishedLabRanges.some(range=>range.scientificReviewStatus==='verified'&&range.provider===reportProviderName(identity)&&range.province===identity.province)&&<p role="status">No verified provider comparison available for {reportProviderName(identity)} {identity.province}. Original report limits remain usable; pending entries from another province are not substituted.</p>}
  <form onSubmit={submit} className="space-y-4"><fieldset disabled={locked||!available} className="space-y-3 min-w-0">
   <label className="block">Performing laboratory<select aria-label="Performing laboratory" className="bloom-input w-full min-h-11" value={fields.provider} onChange={e=>changeIdentity({provider:e.target.value as typeof fields.provider})}><option value="unknown">Unknown / not supplied</option><option value="LifeLabs">LifeLabs</option><option value="Dynacare">Dynacare</option><option value="other">Other laboratory</option></select></label>
   {fields.provider==='other'&&<label className="block">Laboratory name on report<input className="bloom-input w-full" maxLength={120} value={fields.otherProvider} onChange={e=>changeIdentity({otherProvider:e.target.value})}/></label>}
   <label className="block">Testing province or territory<select aria-label="Testing province or territory" className="bloom-input w-full min-h-11" value={fields.province} onChange={e=>changeIdentity({province:e.target.value as typeof fields.province})}><option value="">Unknown / not supplied</option>{labProvinces.map(province=><option key={province} value={province}>{province}</option>)}</select></label><p className="panel-note">Use where this report says testing occurred, rather than your home province. An unknown jurisdiction stays unknown.</p>
   <label className="block">Reported testing location (optional)<input className="bloom-input w-full" maxLength={160} value={fields.location} onChange={e=>changeIdentity({location:e.target.value})}/></label>
   <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={reviewed} onChange={e=>setReviewed(e.target.checked)}/>I checked these laboratory details against this report; absent details stay unknown.</label>
   <div className="border-t pt-3 space-y-2"><h3>Reference display preference</h3><LabRangeSelector id={`manage-${source.id}`} selected preferenceOnly value={{...emptyLabOverlayChoice(),...preference}} onChange={next=>overlays.preference(key,next)}/><p className="panel-note">This selector shares the same preview as the charts. Save to retain the report preference after reload. Performing laboratory identity does not automatically enable a provider comparison. Original report limits retain priority.</p><p>Collection-specific assay, method, fasting and historical demographic checks stay with each result; current profile values are never substituted.</p></div>
   <Button type="submit" disabled={stale||missing||!ready}>Save report details & preference</Button>
  </fieldset></form>
  {(stale||missing)&&<p role="alert">This source or its annotation changed. Your draft is retained; load the current saved values before making another save.</p>}
  {!pending&&(stale||definite)&&latest&&<Button type="button" variant="outline" onClick={()=>{setBasis(latest);setIdentity(latest.metadata?.current?.identity??null);setReviewed(false);setHeld(null);setDefinite(false);setError('');overlays.preference(key,latest.metadata?.current?.overlay??emptyLabOverlayChoice());}}>Load latest saved values (replaces draft)</Button>}
  {held&&!pending&&!definite&&<Button type="button" onClick={()=>void save(held)}>Retry same report save</Button>}{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {basis.metadata?.current&&<details><summary>Annotation history ({basis.metadata.historyCount} earlier versions)</summary><p>Current confirmation: {basis.metadata.current.identity?'User-confirmed':'No confirmed performing laboratory'} · saved {basis.metadata.current.recordedAt}.</p>{basis.metadata.history.map(row=><p key={row.revision}>{row.recordedAt}: {reportProviderName(row.identity)||'Laboratory not confirmed'} {row.identity?.province||''} · reference choice {row.overlay.provider}.</p>)}{basis.metadata.historyCount>basis.metadata.history.length&&<p>Showing the latest {basis.metadata.history.length} earlier versions. Complete owned annotation history is included in account export.</p>}</details>}
  {basis.detailRecordId&&<Link className="text-link inline-flex min-h-11 items-center" onClick={close} href={`/precision?tab=labs&labResult=${encodeURIComponent(basis.detailRecordId)}`}>View report results and charts</Link>}
  <Button type="button" variant="ghost" disabled={pending} onClick={close}>Close report management</Button>
 </DialogContent></Dialog>;
}
