import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { reportDateText } from "@shared/report-dates";

import { type ReportedTaxon, reportedTaxonAmount } from "@shared/reported-taxa";

const sections = ["What research has found", "Nutrients & molecules", "Diet studies", "Your report: what it does and doesn't show", "Studies & limitations"];
export default function MicrobialProfile({ taxon, sample, onClose, onRestoreFocus }: {
  taxon: ReportedTaxon | null; sample: any; onClose: () => void; onRestoreFocus: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => setExpanded(null), [taxon?.id]);
  const origin = sample?.structuredData?.dataOrigin;
  return <Dialog.Root open={!!taxon} onOpenChange={open => { if (!open) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="microbial-profile-overlay" />
      <Dialog.Content className="microbial-profile-sheet" onKeyDownCapture={e=>{if(e.key==="Escape"){e.preventDefault();e.stopPropagation();onClose();}}} onCloseAutoFocus={e => { e.preventDefault(); onRestoreFocus(); }}>
        <div className="microbial-profile-handle" aria-hidden="true" />
        <Dialog.Close className="microbial-profile-close" aria-label="Close organism profile"><X aria-hidden="true" size={22}/></Dialog.Close>
        <p className="eyebrow">ORGANISM PROFILE · RESEARCH</p>
        <Dialog.Title className="microbial-profile-title"><i>{taxon?.bacterialName}</i></Dialog.Title>
        <Dialog.Description>Source observation, separate from general research.</Dialog.Description>
        {taxon && <>
          <section className="microbial-observation" aria-label="Reported observation">
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
              <div><dt>Assay method</dt><dd>Not reported in this composition record</dd></div>
              <div><dt>Data origin</dt><dd>{typeof origin === "string" && origin ? origin : "User-supplied report; not independently verified. Synthetic status not reported."}</dd></div>
            </dl>
          </section>
          <section className="microbial-organism-intro"><h3>What this organism is</h3>
            {taxon.bacterialName.toLowerCase().trim() === "methanobrevibacter smithii" && <p>This is an archaeon, rather than a bacterium. Detection does not diagnose intestinal methanogen overgrowth.</p>}
            <p>Reviewed research profile not yet available</p>
            <p className="panel-note">The source name and reported resolution identify this record. Bloom has no individually approved claim-level research profile to show here.</p>
          </section>
          <div className="microbial-profile-disclosures">{sections.map(title => <details key={title} open={expanded === title}>
            <summary onClick={e => { e.preventDefault(); setExpanded(value => value === title ? null : title); }}>{title}</summary>
            {title === "Your report: what it does and doesn't show" ? <>
              <p>Relative abundance does not measure gene expression, butyrate, methane, toxins, infection or disease risk. Missing percentages stay unknown. There is no personal optimal percentage or treatment recommendation from this record.</p>
              {/^(escherichia coli|klebsiella pneumoniae)$/i.test(taxon.bacterialName.trim()) && <p>Species detection does not establish a virulent strain.</p>}
              <p>Assay compatibility and strain resolution have not been established. Cross-report differences are not interpreted as health changes.</p>
            </> : <p>Reviewed research profile not yet available. No supported claim, nutrient transformation, diet effect or personal action is inferred from this observation.</p>}
          </details>)}</div>
        </>}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
