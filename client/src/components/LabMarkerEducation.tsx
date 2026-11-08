import {labEditorialFor,labEditorialSources} from '@shared/biology-labs';
import {sourceIntervalPosition} from '@shared/biology-lab-observation';
import {resolveRecordedLabPoint} from '@shared/lab-history';
import type {PrecisionReport} from '@shared/precision-nutrition';
export default function LabMarkerEducation({markerId,points,selectedPointId}:{markerId:string;points:PrecisionReport['trends'][number]['points'];selectedPointId:string}){
 const profile=labEditorialFor(markerId);
 if(!profile)return <p className="lab-marker-education panel-note">The source label does not establish a supported analyte identity. Its original measurement and assay remain available below.</p>;
 const selected=resolveRecordedLabPoint(points,selectedPointId);
 const latestTime=Math.max(...points.map(point=>Date.parse(point.date))),latest=points.filter(point=>Date.parse(point.date)===latestTime);
 // An explicit unavailable selection must not silently become another record.
 const point=selectedPointId?selected:latest.length===1?latest[0]:undefined;
 const position=sourceIntervalPosition(point);
 const assayUncertain=profile.assayIdentityRequired&&!/25[\s-]*(?:oh|hydroxy)|1\s*,\s*25|dihydroxy/i.test(point?.method||'');
 const framing=position==='unknown'||assayUncertain?null:position==='above'?'The selected observation is above its supplied source interval.':position==='below'?'The selected observation is below its supplied source interval.':'The selected observation lies within its supplied source interval.';
 return <section className="lab-marker-education space-y-3" aria-label={`${profile.name} biological context`}>
  <div className="space-y-2"><h4>What it does</h4><p>{profile.whatItDoes}</p></div>
  <div className="space-y-2"><h4>Why values vary</h4><p>{profile.higher}</p>{profile.lower&&<p>{profile.lower}</p>}</div>
  <div className="space-y-2"><h4>Why it matters</h4><p>{profile.whyItMatters}</p></div>
  <div className="space-y-2"><h4>What to discuss</h4><p>{profile.whatToDiscuss}</p></div>
  <details><summary>What this might mean for this record</summary>
   {framing?<p>{framing} A source interval comparison does not diagnose a condition or establish its cause.</p>:<p>{assayUncertain?'Confirm the vitamin D assay before relating this result to status guidance.':!point?'Choose one available source observation to relate the context to its recorded interval.':'The supplied source bounds do not support a directional comparison.'}</p>}
   {position==='above'&&!assayUncertain&&<p>{profile.higher}</p>}
   {position==='below'&&!assayUncertain&&<p>{profile.lower||'This profile does not define a harmful low threshold or a goal to raise this marker.'}</p>}
   {profile.limitations.map(text=><p className="panel-note" key={text}>{text}</p>)}
  </details>
  <details><summary>Sources, studies & limitations</summary><p className="panel-note">General scientific context is separate from your measured findings. Editorial source review does not constitute independent clinical approval.</p>{labEditorialSources(profile).map(source=><article className="space-y-2 mt-3" key={source.id}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p>{source.design}{source.pmid?` · PMID ${source.pmid}`:''}{source.doi?` · DOI ${source.doi}`:''}</p><p className="panel-note">{source.scopeLimit}</p></article>)}</details>
 </section>;
}
