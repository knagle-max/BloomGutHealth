import {Link} from 'wouter';
import {labFamilyGuidance} from '@shared/lab-family-guidance';
import type {recordedLabPanelReview} from '@shared/lab-panel-review';
/** Existing canonical source text, explicitly separate from personal findings. */
export default function LabFamilyGuidance({family}:{family:ReturnType<typeof recordedLabPanelReview>['families'][number]}){
 const guidance=labFamilyGuidance(family);if(!guidance.rows.length)return null;
 return <details className="lab-family-guidance"><summary className="min-h-11">General sources &amp; questions to discuss</summary>
  <p className="panel-note">General educational context, separate from your measured results and remembered answers. These sources do not establish what caused an individual change.</p>
  {guidance.rows.map(row=><section key={row.markerId} className="space-y-2 py-3" aria-label={`${row.name} source guidance`}>
   <h4>{row.name}</h4><p>{row.discussion}</p>
   {row.citations.some(source=>source.verification==='citation-not-retrieved')&&<p className="panel-note">Citation retrieval and independent review are pending; this is not personal treatment guidance.</p>}
   <details><summary className="min-h-11">Evidence &amp; limitations</summary>{row.limitations.map(text=><p className="panel-note" key={text}>{text}</p>)}{row.citations.map(source=><article key={source.id} className="space-y-2 py-2"><a className="text-link inline-flex min-h-11 items-center" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a><p className="panel-note">{source.design} · {source.scopeLimit}</p></article>)}</details>
  </section>)}
  {guidance.action&&<Link className="text-link inline-flex min-h-11 items-center" href={guidance.action.href}>{guidance.action.label}</Link>}
 </details>;
}
