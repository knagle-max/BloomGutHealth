import {functionalResearchFor} from "@shared/functional-microbiome";
import OrganismPortrait from "./OrganismPortrait";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { microbiomeSourceFacts } from "@shared/structured-report";
import { reportDateText } from "@shared/report-dates";

import { type ReportedTaxon, reportedTaxonAmount } from "@shared/reported-taxa";

const sections = ["What research has studied", "Nutrients & molecules", "Food research", "Sources & limitations"];
export default function MicrobialProfile({ taxon, sample, onClose, onRestoreFocus }: {
  taxon: ReportedTaxon | null; sample: any; onClose: () => void; onRestoreFocus: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => setExpanded(null), [taxon?.id]);
  const facts=microbiomeSourceFacts(sample?.structuredData||{});
  const sourceValues=(kind:"assay"|"method"|"taxonomy"|"qc")=>facts.filter(f=>f.kind===kind).map(f=><span className="block" key={f.sourcePath}>{f.value}<small className="block text-muted-foreground">{f.sourcePath}</small></span>);
  const research=taxon?functionalResearchFor(taxon):null;
  const origin = sample?.structuredData?.dataOrigin;
  return <Dialog.Root open={!!taxon} onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="microbial-profile-overlay" />
      <Dialog.Content className="microbial-profile-sheet" onKeyDownCapture={e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();onClose();}}} onCloseAutoFocus={e => { e.preventDefault(); onRestoreFocus(); }}>
        <div className="microbial-profile-handle" aria-hidden="true" />
        <Dialog.Close className="microbial-profile-close" aria-label="Close organism profile"><X aria-hidden="true" size={22}/></Dialog.Close>
        <p className="eyebrow">YOUR REPORT · ORGANISM</p>
        <Dialog.Title className="microbial-profile-title"><i>{taxon?.bacterialName}</i></Dialog.Title>
        <Dialog.Description>The organism name comes from your report.</Dialog.Description>
        {taxon && <>
          <OrganismPortrait size="portrait" sourceName={taxon.bacterialName}/>
          <p className="inline-flex rounded-full border border-border px-3 py-1 my-3 text-sm">Listed in your report</p>
          <p>{reportedTaxonAmount(taxon)} · Reported observation</p>
          <section className="microbial-organism-intro"><h3>What this organism is</h3>
            {taxon.bacterialName.toLowerCase().trim() === "methanobrevibacter smithii" && <p>This is an archaeon, rather than a bacterium. Detection does not diagnose intestinal methanogen overgrowth.</p>}
            <p>{research?research.introduction:"Research explanation not available yet."}</p>
            <p className="panel-note">A listing or percentage does not measure microbial activity.</p>
          </section>
          <details className="microbial-observation"><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Your report</summary>
          <section aria-label="Reported observation">
            <h3>Your reported observation</h3>
            <dl>
              <div><dt>Source-reported amount</dt><dd>{reportedTaxonAmount(taxon)}</dd></div>
              {typeof taxon.abundance==="number"&&taxon.reportedAbundance&&<div><dt>Original organism-list amount</dt><dd>{taxon.reportedAbundance}</dd></div>}
              <div><dt>Source-reported status</dt><dd>{taxon.reportedStatus || "Not reported"}</dd></div>
              <div><dt>Taxonomic resolution</dt><dd>{taxon.taxonomyLevel || "Not reported"}</dd></div>
              <div><dt>Report date</dt><dd>{reportDateText(sample)}</dd></div>
              <div><dt>Source</dt><dd>{sample?.testingCompany || sample?.structuredData?.sourceLabel || "Not reported"}</dd></div>
              <div><dt>Sample / report ID</dt><dd>{sample?.id || "Not reported"}</dd></div>
              {taxon.reportedOrganismSourceId&&<div><dt>Organism-list source entry</dt><dd>{taxon.reportedOrganismSourceId}</dd></div>}
              {taxon.reportedNotes&&<div><dt>Original organism note</dt><dd>{taxon.reportedNotes}</dd></div>}
              <div><dt>Assay type</dt><dd>{facts.some(f=>f.kind==="assay")?sourceValues("assay"):"Not reported"}</dd></div>
              <div><dt>Assay method</dt><dd>{facts.some(f=>f.kind==="method")?sourceValues("method"):"Not reported in this composition record"}</dd></div>
              {facts.some(f=>f.kind==="taxonomy")&&<div><dt>Source taxonomy version</dt><dd>{sourceValues("taxonomy")}</dd></div>}
              {facts.some(f=>f.kind==="qc")&&<div><dt>Source QC text · not independently verified</dt><dd>{sourceValues("qc")}</dd></div>}
              <div><dt>Data origin</dt><dd>{typeof origin === "string" && origin ? origin : "User-supplied report; not independently verified. Synthetic status not reported."}</dd></div>
            </dl>
          </section></details>
          <div className="microbial-profile-disclosures">{sections.map(title => <details key={title} open={expanded === title}>
            <summary onClick={e => { e.preventDefault(); setExpanded(value => value === title ? null : title); }}>{title}</summary>
            {research&&title==="What research has studied"?<>
              <p>{research.source.finding}</p><p className="panel-note">{research.scopeLabel}. Study setting: {research.source.design}. Strain details are not specified in Bloom’s source summary; compatibility with your reported organism has not been established.</p>
            </>:research&&title==="Nutrients & molecules"?<>
              <p>Studied substrate: {research.substrate}. A substrate is material that organisms can use.</p>
              <p>{research.measurementLimit} No producer–consumer interaction is inferred from the organisms listed together.</p>
            </>:research&&title==="Food research"?<>
              <p>{research.dietLimit}</p>
            </>:research&&title==="Sources & limitations"?<>
              <p><a className="text-link" href={research.source.url} target="_blank" rel="noopener noreferrer">{research.source.title}</a></p>
              <p>{research.source.authors} · {research.source.year} · DOI: {research.source.doi}</p>
              <p>{research.source.design}</p><p>{research.source.limitation}</p>
              <p className="panel-note">Source summary: {research.evidenceVersion} · Profile: {research.version}. This source summary does not specify study strain identifiers or sample size; individual applicability and conflicting evidence are not established here.</p>
            </>:<p>Reviewed research profile not yet available. No supported claim, nutrient transformation, diet effect or personal action is inferred from this observation.</p>}
{title==="Sources & limitations"&&<>
              <p>Relative abundance does not measure gene expression, butyrate, methane, toxins, infection or disease risk. Missing percentages stay unknown. There is no personal optimal percentage or treatment recommendation from this record.</p>
              {/^(escherichia coli|klebsiella pneumoniae)$/i.test(taxon.bacterialName.trim()) && <p>Species detection does not establish a virulent strain.</p>}
              <p>Assay compatibility and strain resolution have not been established. Cross-report differences are not interpreted as health changes.</p>
            </>}
          </details>)}</div>
        </>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
