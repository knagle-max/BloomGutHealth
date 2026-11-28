import {organismBiography} from '@shared/biology-content';
import {explainOrganism} from '@shared/report-explanations';
import {functionalResearchFor} from '@shared/functional-microbiome';
import type {ReportedTaxon} from '@shared/reported-taxa';

/** Shared presentation of canonical education; no interpretation of abundance. */
export default function OrganismPrimer({taxon}:{taxon:ReportedTaxon}){
 const biography=organismBiography(taxon.bacterialName,taxon.taxonomyLevel);
 const explanation=explainOrganism(taxon.bacterialName,taxon.taxonomyLevel);
 const useful=explanation.label!=='Identity unresolved'?explanation:undefined;
 const research=functionalResearchFor(taxon);
 const what=biography?.firstLayer.meetThisOrganism||useful?.meaning||research?.introduction||explanation.meaning;
 const why=biography?(biography.presentation==='identity-context'?biography.limits||biography.firstLayer.whyResearchersStudyIt:biography.firstLayer.whyResearchersStudyIt):useful?.why||research?.measurementLimit||'Species-specific findings cannot be established from this report label alone.';
 return <section className="microbial-organism-intro organism-primer">
  <div><h3>What this organism is</h3><p>{what}</p></div>
  <div><h3>Why it matters in context</h3><p>{why}</p>{!biography&&useful?.takeaway&&<p>{useful.takeaway}</p>}</div>
 </section>;
}
