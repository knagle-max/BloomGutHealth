import type {GeneticHighlightProjection} from "@shared/genetics-relevance";
import {useState} from "react";

const focusTarget=(id:string)=>{requestAnimationFrame(()=>document.getElementById(id)?.focus());};
export default function GeneticHighlights({projection,hasSource}:{projection:GeneticHighlightProjection;hasSource:boolean}){
 const {counts}=projection;
 const [all,setAll]=useState(false),[sort,setSort]=useState("relevance");
 const findings=all?[...projection.eligible]:projection.highlights;
 if(all&&sort==="gene")findings.sort((a,b)=>a.claim.gene.localeCompare(b.claim.gene)||a.claim.id.localeCompare(b.claim.id));
 if(all&&sort==="evidence"){
  const order={replicated:0,supported:1,limited:2,unknown:3};
  findings.sort((a,b)=>order[a.claim.evidence.credibility]-order[b.claim.evidence.credibility]||a.claim.id.localeCompare(b.claim.id));
 }
 return <section className="bloom-panel space-y-4" aria-labelledby="genetic-highlights-title">
  <div><p className="eyebrow">YOUR GENETICS OVERVIEW</p><h2 id="genetic-highlights-title">Relevant findings for you</h2>
   <p>Reviewed educational highlights from your saved genetic source.</p></div>
  <p className="panel-note">{counts.measured} measured calls · {counts.personalEligible} eligible highlights</p>
  {!counts.selected?<div className="rounded-xl bg-muted/50 p-4 space-y-2"><h3>No eligible personal highlights yet.</h3>
   <p>{hasSource?"Your saved calls remain available below. Personal highlights require separate source, assay and claim review.":"No genetic source is selected."}</p>
   {!hasSource&&<p>Explore genes without uploading DNA.</p>}</div>:
   <><p role="status">Showing {all?counts.personalEligible:counts.selected} of {counts.personalEligible} eligible educational claims. {all?"Related claims are shown separately here; they do not establish independent additive effects.":"Related findings may be grouped."}</p>
    {counts.personalEligible>counts.selected&&<button className="text-link min-h-11 focus-visible:outline focus-visible:outline-2" type="button" aria-expanded={all} onClick={()=>setAll(!all)}>{all?"Show selected highlights":"See all eligible findings"}</button>}
    {all&&<label className="block">Sort eligible findings<select className="bloom-input w-full" value={sort} onChange={event=>setSort(event.target.value)}><option value="relevance">Relevant to me</option><option value="evidence">Evidence</option><option value="gene">Gene</option></select></label>}
    <div className="space-y-3">{findings.map(({claim,why,sourceId,sourceRevision})=><article key={`${claim.id}:${claim.version}`} className="rounded-xl border border-border p-4 space-y-3" aria-label={`${claim.gene} reviewed highlight`}>
     <div><p className="eyebrow">REVIEWED EDUCATIONAL ASSOCIATION</p><h3>{claim.gene} · {claim.phenotype}</h3></div><p>{claim.meaning}</p>
     <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Why this is shown</summary><ul className="list-disc pl-5 space-y-2">{why.map(reason=><li key={reason}>{reason}</li>)}</ul></details>
     <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Evidence, source & limitations</summary><div className="space-y-2">
      <p>{claim.evidence.design}. {claim.evidence.direction}</p><p>Effect size: {claim.evidence.effectSize||"Unknown / not supplied"}. Confidence interval: {claim.evidence.confidenceInterval||"Unknown / not supplied"}.</p>
      <p>Study contrast: {claim.contrast.effectAllele} compared with {claim.contrast.otherAllele}, forward strand. This describes the reviewed comparison, not a normal/protective classification.</p>
      <p>{claim.evidence.replication}</p><p>{claim.evidence.contradictions}</p><p>{claim.population.description}</p><p>{claim.evidence.limitations}</p>
      <p className="panel-note">Claim {claim.id} · {claim.version}; reviewed {claim.review.reviewedOn}. Source record {sourceId}; revision {sourceRevision}. These are internal source references, not provider test IDs.</p>
      <ul>{claim.evidence.citations.map(citation=><li key={citation.url}><a className="text-link inline-flex min-h-11 items-center" href={citation.url} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{citation.title}</a></li>)}</ul>
     </div></details>
    </article>)}</div></>}
  <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Genetics views">
   {hasSource&&<a className="text-link inline-flex min-h-11 items-center" href="#genotype-explanations" onClick={()=>focusTarget("genotype-explanations")}>See all saved results</a>}
   <a className="text-link inline-flex min-h-11 items-center" href="#genetics-catalogue" onClick={()=>focusTarget("genetics-catalogue")}>Explore genes</a>
  </nav>
  <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">How highlights are selected</summary><div className="space-y-2">
   <p>{counts.catalogued} catalogued candidates · {counts.matchedEducation} matched educational {counts.matchedEducation===1?"explanation":"explanations"} · {counts.reviewedExplanations} reviewed highlight claims · {counts.personalEligible} personally eligible</p>
   <p>Eligibility comes first: an observed compatible call, source placement, verified assay, consent, reviewed variant–phenotype claim and suitable population evidence. Sensitive, clinical and medication interpretations are excluded.</p>
   <p>Evidence credibility comes before goal or separately recorded measurement context. Related claims are grouped, then stable gene and claim ordering breaks ties. At most five are selected; the list is never padded. This is an ordinal display order, not a health or risk score.</p>
   <p>Legacy comparisons remain separate education. Genotypes do not establish nutrient deficiency, measured metabolites, athletic ability or a supplement dose.</p>
   <p>{counts.interpretable} observed variants qualify for reviewed personal interpretation. Matched educational comparisons and user-reported calls are counted separately; self-entered calls are not clinical confirmation.</p>
   <p>A missing highlight does not mean a normal, negative or protective result. This selection does not describe your whole genome or establish a treatment.</p>
   <p className="panel-note">Selection version {projection.version}; claim registry {projection.registryVersion}. Source changes and claim withdrawal are evaluated on each refreshed report. No personal highlight is written into a food or training plan.</p>
  </div></details>
 </section>;
}
