import {useEffect,useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Link} from 'wouter';
import {useAuth} from '@/lib/auth';
import {useCapabilities} from '@/lib/capabilities';
import {apiRequest,queryClient} from '@/lib/queryClient';
import {Button} from '@/components/ui/button';
import type {FeatureReviewManifest} from '@shared/feature-administration';

export default function FeatureManagement(){
 const {user}=useAuth(),capabilities=useCapabilities(),[search,setSearch]=useState(''),[status,setStatus]=useState('all');
 const review=useQuery<FeatureReviewManifest>({queryKey:['/api/admin/features',user?.id],enabled:capabilities.canReadFeatureAdmin,meta:{restrictedAdmin:true},queryFn:async({signal})=>(await apiRequest('GET','/api/admin/features',undefined,undefined,signal)).json()});
 useEffect(()=>{if(review.isError)void queryClient.invalidateQueries({queryKey:capabilities.key});},[review.isError]);
 const entries=review.data?.entries.filter(entry=>(status==='all'||entry.status===status)&&`${entry.id} ${entry.name} ${entry.group}`.toLowerCase().includes(search.trim().toLowerCase()))||[];
 return <main className="science-page space-y-5">
  <header className="science-heading"><p className="eyebrow">ADMINISTRATION</p><h1>Feature management</h1><Link href="/" className="text-link">Return to Today</Link></header>
  {capabilities.isLoading?<p role="status">Checking administrator access…</p>:!capabilities.canReadFeatureAdmin?<section className="bloom-panel space-y-3"><h2>Administrator access unavailable</h2><p>This page requires a separate server-provisioned administrator review role. The development-features preference does not grant it.</p><Button variant="outline" onClick={()=>capabilities.refetch()}>Recheck access</Button></section>:<>
   <section className="bloom-panel space-y-3"><h2>Review source metadata</h2><p id="feature-change-unavailable">Read-only review. Activation, pause, rollback and emergency controls are not implemented in this build.</p><p className="panel-note">Approval, implementation readiness, deployment availability and activation are separate. Source flags do not certify a feature as live.</p>
    <a className="text-link" href="https://github.com/knagle-max/BloomGutHealth/blob/enhance/bloom-experience/docs/architecture/PERSISTENT_TASK_INDEX.md" target="_blank" rel="noopener noreferrer">Review requirements and outstanding tasks</a>
    <div className="precision-grid"><label>Search capabilities<input type="search" aria-label="Search capabilities" className="bloom-input w-full" value={search} onChange={event=>setSearch(event.target.value)}/></label><label>Review status<select aria-label="Review status" className="bloom-input w-full" value={status} onChange={event=>setStatus(event.target.value)}>{['all','Live','Eligible but off','Pending review','In development','Internal research','Incident disabled','Verification pending','Unavailable'].map(value=><option key={value} value={value}>{value==='all'?'All statuses':value}</option>)}</select></label></div>
   </section>
   {review.isLoading&&<p role="status">Loading feature review…</p>}
   {review.isError?<section className="bloom-panel"><p role="alert">Feature review could not load or access changed. Cached metadata is hidden.</p><Button variant="outline" onClick={()=>review.refetch()}>Retry feature review</Button></section>:review.data&&<>
    <p className="panel-note break-words">{entries.length} of {review.data.entries.length} capabilities · registry {review.data.registryVersion}. Build revision: <code className="break-all">{review.data.buildRevision||'Not supplied'}</code></p>
    {entries.length===0&&<p>No capabilities match these filters. No release status was changed.</p>}
    <ul className="space-y-3">{entries.map(entry=><li key={entry.id}><details className="bloom-panel space-y-3"><summary><strong>{entry.name}</strong><span className="block text-sm font-normal">{entry.status} · <code className="break-all">{entry.id}</code></span></summary>
     <dl className="precision-grid"><div><dt>Legal classification</dt><dd className="break-all">{entry.category}</dd></div><div><dt>Approval</dt><dd>{entry.approval}</dd></div><div><dt>Implementation readiness</dt><dd>Not independently verified</dd></div><div><dt>Deployed availability</dt><dd>Unverified</dd></div><div><dt>Activation and rollout</dt><dd>Not configured</dd></div><div><dt>Last change and audit history</dt><dd>Not available in this read-only view</dd></div></dl>
     <p>No independently approved scope is recorded here. Proposed source jurisdiction: {entry.review.proposedJurisdiction}</p>
     <details><summary>Source and required review</summary><p>Source report: {entry.reportedImplementation}</p><p>Registry public flag: {entry.registryPublicEnabled?'On':'Off'} (source flag only).</p><p>Required review: {entry.review.requirements}</p><p>{entry.review.evidence}</p><p>Source review commit: <code className="break-all">{entry.review.commit||'Not verified'}</code></p></details>
     <ul className="list-disc pl-5 space-y-2">{entry.blockers.map(reason=><li key={reason}>{reason}</li>)}</ul>
     <a className="text-link" href="https://github.com/knagle-max/BloomGutHealth/blob/enhance/bloom-experience/docs/operations/CAPABILITY_EXPOSURE_MAP.json" target="_blank" rel="noopener noreferrer">Inspect source crosswalk (review required)</a>
     <div className="flex flex-wrap gap-2">{['Enable','Pause','Roll back','Emergency disable'].map(action=><Button key={action} disabled variant="outline" aria-label={`${action} ${entry.name}`} aria-describedby="feature-change-unavailable">{action}</Button>)}</div>
    </details></li>)}</ul>
   </>}
  </>}
 </main>;
}
