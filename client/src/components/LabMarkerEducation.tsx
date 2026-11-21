import {BookOpen,HeartPulse} from 'lucide-react';
import EditorialMedia from './EditorialMedia';
import type {PsaSourceFamilyIdentity} from '@shared/lab-source-identity';
import {labEditorialFor,labEditorialSources} from '@shared/biology-labs';
import {supportedSourceIntervalPosition} from '@shared/biology-lab-observation';
import {hasConfirmedLabIdentity} from '@shared/lab-assay-identity';
import {markerDefinitions} from '@shared/precision-nutrition';
import {resolveRecordedLabPoint} from '@shared/lab-history';
import type {PrecisionReport} from '@shared/precision-nutrition';
export default function LabMarkerEducation({markerId,points,selectedPointId,familyIdentity,presentation='all'}:{presentation?:'all'|'primer'|'deeper';familyIdentity?:PsaSourceFamilyIdentity;markerId:string;points:PrecisionReport['trends'][number]['points'];selectedPointId:string}){
 if(familyIdentity){if(presentation==='deeper')return null;const totalProfile=labEditorialFor('psa_total');return <section className="lab-marker-education space-y-3" aria-label="PSA analyte family context"><h4>About PSA</h4><p>The source identifies the PSA analyte family. Total PSA, free PSA and free-to-total ratios are different measurements.</p><p className="panel-note">{familyIdentity.status}. The source observation remains available below; no total-PSA trend or interpretation is calculated from this unconfirmed source.</p>{totalProfile&&<details><summary>PSA background &amp; source</summary><p>General background does not confirm the assay type or diagnose a condition.</p>{labEditorialSources(totalProfile).map(source=><p key={source.id}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></p>)}</details>}</section>;}
 const profile=labEditorialFor(markerId);
 if(!profile&&presentation==='deeper')return null;
 if(!profile)return <p className="lab-marker-education panel-note">The source label does not establish a supported analyte identity. Its original measurement and assay remain available below.</p>;
 const selected=resolveRecordedLabPoint(points,selectedPointId);
 const latestTime=Math.max(...points.map(point=>Date.parse(point.date))),latest=points.filter(point=>Date.parse(point.date)===latestTime);
 // An explicit unavailable selection must not silently become another record.
 const point=selectedPointId?selected:latest.length===1?latest[0]:undefined;
 const position=supportedSourceIntervalPosition(markerId,markerDefinitions.find(marker=>marker.id===markerId)?.units||[],point);
 const assayUncertain=profile.assayIdentityRequired&&!hasConfirmedLabIdentity(markerId,point);
 const framing=position==='unknown'||assayUncertain?null:position==='above'?'The selected observation is above its supplied source interval.':position==='below'?'The selected observation is below its supplied source interval.':'The selected observation lies within its supplied source interval.';
 return <section className="lab-marker-education space-y-3" aria-label={`${profile.name} ${presentation==='deeper'?'deeper biological context':'biological context'}`}>
  {presentation!=='deeper'&&assayUncertain&&<p className="panel-note">{markerId==='bilirubin'?"The bilirubin fraction is not recorded. Confirm total, direct or indirect identity before interpreting this observation. Its original value, unit and source remain available.":"The recorded vitamin D assay is not confirmed as 25-hydroxy vitamin D. The general explanation below does not interpret this observation; its original value, unit and source remain available."}</p>}
  {presentation!=='deeper'&&labEditorialSources(profile).some(source=>source.verification==='citation-not-retrieved')&&<p className="panel-note">General educational draft; citation retrieval and independent review are pending.</p>}
  {presentation!=='deeper'&&<div className="lab-marker-primer">
   <div className="lab-marker-primer-row" data-primer="what"><div className="lab-marker-primer-visual" aria-hidden="true">{markerId==='ldl'&&<EditorialMedia slot="lab-detail-ldl-particle" sizes="88px" showCaption={false}/>}<BookOpen size={28} strokeWidth={1.5}/></div><div><h4>{presentation==='all'?'What it does':`What is ${profile.name}?`}</h4><p>{profile.whatItDoes}</p></div></div>
   <div className="lab-marker-primer-row" data-primer="why"><div className="lab-marker-primer-visual" aria-hidden="true">{markerId==='ldl'&&<EditorialMedia slot="lab-detail-ldl-artery" sizes="88px" showCaption={false}/>}{markerId==='ferritin'&&presentation==='primer'?<EditorialMedia slot="bloodwork-iron" sizes="88px" showCaption={false}/>:<HeartPulse size={28} strokeWidth={1.5}/>}</div><div><h4>{presentation==='all'?'Why it matters':'Why does it matter?'}</h4><p>{profile.whyItMatters}</p>{markerId==='ferritin'&&presentation==='primer'&&<p className="panel-note">Conceptual blood-cell illustration, not a ferritin measurement.</p>}</div></div>
  </div>}
  {presentation!=='primer'&&<>
  <div className="space-y-2"><h4>Why values vary</h4><p>{profile.higher}</p>{profile.lower&&<p>{profile.lower}</p>}</div>
  <div className="space-y-2"><h4>What to discuss</h4><p>{profile.whatToDiscuss}</p></div>
  <details><summary>What this might mean for this record</summary>
   {framing?<p>{framing} A source interval comparison does not diagnose a condition or establish its cause.</p>:<p>{assayUncertain?(markerId==='bilirubin'?'Confirm the bilirubin fraction before relating this result to status guidance.':'Confirm the vitamin D assay before relating this result to status guidance.'):!point?'Choose one available source observation to relate the context to its recorded interval.':'The supplied source bounds do not support a directional comparison.'}</p>}
   {position==='above'&&!assayUncertain&&<p>{profile.higher}</p>}
   {position==='below'&&!assayUncertain&&<p>{profile.lower||'This profile does not define a harmful low threshold or a goal to raise this marker.'}</p>}
   {profile.limitations.map(text=><p className="panel-note" key={text}>{text}</p>)}
  </details>
  <details><summary>Sources, studies & limitations</summary><p className="panel-note">General scientific context is separate from your measured findings. Editorial source review does not constitute independent clinical approval.</p>{labEditorialSources(profile).map(source=><article className="space-y-2 mt-3" key={source.id}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p>{source.design}{source.pmid?` · PMID ${source.pmid}`:''}{source.doi?` · DOI ${source.doi}`:''}</p><p className="panel-note">{source.scopeLimit}</p></article>)}</details>
  </>}
 </section>;
}
