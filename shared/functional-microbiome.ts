import {EVIDENCE_VERSION,evidenceSources,pathways,type EvidenceSource} from "./science-coach";
import type {ReportedTaxon} from "./reported-taxa";

export const FUNCTIONAL_PROFILE_VERSION="2026-11-07.1";
/** A read-only presentation of an existing cited study, not an assay interpretation.
 * Exact full names only: genus and strain-like source labels never inherit a role.
 * Removing the source or its pathway reference withdraws this educational lookup.
 */
export function functionalResearchFor(taxon:Pick<ReportedTaxon,"bacterialName">,sources:readonly EvidenceSource[]=evidenceSources){
  if(taxon.bacterialName.trim().replace(/\s+/g," ").toLowerCase()!=="ruminococcus bromii")return null;
  const pathway=pathways.find(p=>p.id==="starch-butyrate");
  const source=sources.find(s=>s.id==="resistant-starch-2012"&&s.doi==="10.1038/ismej.2012.4");
  if(!pathway||!source||!pathway.sourceIds.includes(source.id))return null;
  return {
    groupId:pathway.id,
    groupLabel:"Resistant-starch research",
    version:FUNCTIONAL_PROFILE_VERSION,
    evidenceVersion:EVIDENCE_VERSION,
    source,
    substrate:pathway.substrate,
    introduction:"Researchers have studied this bacterium’s ability to break down resistant starch in human-derived cultures. This is background research, not a measurement of activity in your report.",
  } as const;
}
export function functionalResearchGroups(taxa:readonly ReportedTaxon[]){
  const groups=new Map<string,{id:string;label:string;observationIds:string[]}>();
  for(const taxon of taxa){
    const research=functionalResearchFor(taxon);
    if(!research)continue;
    const group=groups.get(research.groupId)??{id:research.groupId,label:research.groupLabel,observationIds:[]};
    group.observationIds.push(taxon.id);groups.set(group.id,group);
  }
  return Array.from(groups.values());
}
