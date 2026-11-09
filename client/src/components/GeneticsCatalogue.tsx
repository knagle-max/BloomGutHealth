import RecordedGeneticVariants from "./RecordedGeneticVariants";
import { useEffect,useState } from "react";
import { genotypeAnnotations, type GenotypeExplanation } from "@shared/genotype-explanations";
import { recordedGeneticsCatalogue, geneticsCatalogueCounts, geneticsDomains, searchGeneticsCatalogue, type GeneticsDomain } from "@shared/genetics-catalogue";

/** Education uses static public source material; it never creates a measured call. */
export default function GeneticsCatalogue({ explanations }: { explanations: GenotypeExplanation[] }) {
  const [scope,setScope]=useState<"all"|"recorded">("all");
  const [domain, setDomain] = useState<GeneticsDomain | "all">("all");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const counts = geneticsCatalogueCounts(explanations);
  const catalogue = searchGeneticsCatalogue(query, domain),recorded=recordedGeneticsCatalogue(explanations,query,domain),shown=scope==="all"?catalogue:recorded;
  const noCalls=recordedGeneticsCatalogue(explanations).filter(group=>!group.hasReadableCall).length;
  useEffect(()=>setExpanded(false),[scope,query,domain,explanations]);
  return <section id="genetics-catalogue" tabIndex={-1} className="bloom-panel space-y-4 scroll-mt-20" aria-labelledby="genetics-catalogue-title">
    <div><p className="eyebrow">LEARN WITHOUT UPLOADING DNA</p><h2 id="genetics-catalogue-title">Explore genetics</h2>
      <p>Browse scientific topics and the limits of what a genetic result can tell you. A research entry does not mean your DNA was tested or establish a personal action.</p></div>
    <p className="panel-note">{counts.savedCalls} saved calls · {counts.matchedExplanations} matched explanations. Self-reported calls are not clinical confirmation.</p>
    <a className="text-link inline-flex min-h-11 items-center" href="#genetics-source-entry">Review or add a genetic source</a>
    <fieldset className="flex flex-wrap gap-3"><legend className="font-medium">Variant view</legend>{([['all','All genetics'],['recorded',`My recorded variants (${counts.savedCalls})`]] as const).map(([value,label])=><label key={value} className="inline-flex min-h-11 items-center gap-2"><input type="radio" name="genetics-catalogue-scope" value={value} checked={scope===value} onChange={()=>{setScope(value);setExpanded(false);}}/>{label}</label>)}</fieldset>
    {scope==='recorded'&&<p className="panel-note">Active selected-source records only; {noCalls} variants have no readable genotype. Unclassified recorded rsIDs appear under All domains. Research topics never substitute for an assayed call.</p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block min-w-0">Scientific domain<select className="bloom-input w-full min-w-0" value={domain} onChange={e => { setDomain(e.target.value as GeneticsDomain | "all"); setExpanded(false); }}>
        <option value="all">All 17 domains</option>{geneticsDomains.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
      </select></label>
      <label className="block min-w-0">Search catalogue<input className="bloom-input w-full" type="search" value={query} onChange={e => { setQuery(e.target.value); setExpanded(false); }} placeholder="Gene, rsID or variant type" /></label>
    </div>
    <p role="status">{shown.length} {shown.length === 1 ? "result" : "results"}</p>
    {!shown.length && <p>{scope==="recorded"?counts.savedCalls?"No recorded variants match this search and domain.":"No variants are recorded for the current account and selected source.":query.trim() ? "No matching entries. Try another gene, rsID or domain." : "No sourced entries in this domain yet."}</p>}
    {scope==="recorded"?<RecordedGeneticVariants groups={expanded?recorded:recorded.slice(0,8)}/>:<div className="divide-y divide-border">
      {(expanded ? catalogue : catalogue.slice(0,8)).map(candidate => {
        const content = candidate.content;
        const education = content.status === "existing-education" ? genotypeAnnotations.find(a => a.rsid === content.explanationRsid) : undefined;
        const rsid = "rsid" in candidate.identity ? candidate.identity.rsid : null;
        const saved = rsid ? explanations.find(e => e.rsid === rsid) : undefined;
        return <details className="py-2 break-words" key={candidate.id}>
          <summary className="min-h-11 cursor-pointer py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"><span className="font-medium">{candidate.label}</span><span className="block text-sm text-muted-foreground">{candidate.identity.kind === "gene" ? "Gene-only research topic" : candidate.content.status === "review-pending" ? "Research candidate · review pending" : "Existing educational explanation"}</span></summary>
          <div className="space-y-3 pb-3 pl-3">
            <p className="panel-note">{candidate.domains.map(id => geneticsDomains.find(d => d.id === id)!.title).join(" · ")}</p>
            {education ? <><p>{education.geneRole}</p><p>{education.variantMeaning}</p><p className="panel-note">Research evidence: {education.evidence}</p><p>{education.limitations}</p></> : <p>Evidence review pending. No genotype interpretation, health prediction or personal recommendation is available for this entry.</p>}
            <p>{candidate.identity.kind === "gene" ? "This gene-only topic does not register a variant or result. Separate sourced variant entries may be listed; none implies that your DNA was tested." : saved ? `Saved source call: ${saved.status === "matched" ? "matched to an existing explanation" : saved.status === "no-call" ? "no readable call" : saved.status === "orientation-unconfirmed" ? "orientation not confirmed" : "not interpreted"}.` : "No saved call. Catalogue membership does not establish that this variant was assayed."}</p>
            <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Assay, sources & limitations</summary><div className="space-y-2 pb-2">
              <p>{candidate.assayRequirement}</p>
              {candidate.identity.kind === "snv" && candidate.identity.placement && <p className="panel-note">Reference: {candidate.identity.placement.assembly} · chromosome {candidate.identity.placement.chromosome}, position {candidate.identity.placement.position} · forward strand. This does not verify a source assay.</p>}
              {candidate.bibliography&&<><p className="panel-note">Publication metadata and indexed abstracts checked; full study, assay and independent scientific review remain pending. These references do not authorize an interpretation or personal action.</p><ul className="space-y-3">{candidate.bibliography.map(source=><li key={source.pmid}><a className="text-link inline-flex min-h-11 items-center" href={`https://pubmed.ncbi.nlm.nih.gov/${source.pmid}/`} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">{source.title}</a><p className="panel-note">{source.scope} Source metadata checked {source.checkedOn}; review pending.</p></li>)}</ul></>}
              {education ? <ul className="space-y-2">{education.sources.map(source => <li key={source.url}><a className="text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a></li>)}</ul> : <p className="panel-note">Registered for research coverage; source-specific scientific review is incomplete. Common SNP files do not establish complex, structural or phased results.</p>}
            </div></details>
            {saved && <a className="text-link inline-flex min-h-11 items-center" href="#genotype-explanations">View saved-source explanations</a>}
            {candidate.sensitivity === "sensitive" && <p className="panel-note">Sensitive topic. No APOE isoform, diagnosis or medication dose is inferred.</p>}
          </div>
        </details>;
      })}
    </div>}
    {shown.length > 8 && !expanded && <button className="text-link min-h-11 focus-visible:outline focus-visible:outline-2" type="button" onClick={() => setExpanded(true)}>Show all {shown.length} entries (8 shown)</button>}
    <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Catalogue coverage & boundaries</summary><div className="space-y-3">
      <p>{counts.candidates} unique variant / complex candidates and {counts.geneTopics} gene-only topics. {counts.existingExplanations} existing explanations; {counts.pendingCandidates} new candidates await review. New independently reviewed candidates: {counts.independentlyReviewedNewCandidates}; new personal action rules: {counts.newPersonalActionRules}.</p>
      <p>Progressive research target: {counts.targetMinimum}–{counts.targetMaximum} candidate records; {counts.shortfall} below the research target. This is not a minimum number of personal interpretations or a release quota. Counts do not represent measured results or clinical approval. Coverage remains incomplete while source curation continues.</p>
      <p>Domain membership is navigation, not evidence of a causal effect or an individual intervention. A missing, unsupported or ambiguous result never means normal or negative.</p>
      <p>Sensitive interpretations are not enabled. APOE common isoform typing would require both rs429358 and rs7412, appropriate assay support and separate explicit consent. Pharmacogenetic star alleles require validated phase/copy-number/assay-specific typing.</p>
    </div></details>
  </section>;
}
