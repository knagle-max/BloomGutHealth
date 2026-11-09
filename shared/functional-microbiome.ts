import {organismBiography,biologyContentVersion} from './biology-content';
import {EVIDENCE_VERSION,evidenceSources,pathways,type EvidenceSource} from "./science-coach";
import type {ReportedTaxon} from "./reported-taxa";

export const FUNCTIONAL_PROFILE_VERSION=biologyContentVersion;
/** Read-only existing citations. Exact names only; a family reference is explicitly
 * not evidence that its members/your reported organism carry a studied capacity. */
export function functionalResearchFor(taxon:Pick<ReportedTaxon,"bacterialName"|"taxonomyLevel">,sources:readonly EvidenceSource[]=evidenceSources){
 const profile=organismBiography(taxon.bacterialName,taxon.taxonomyLevel),reference=profile?.functionalResearch;
 if(!profile||!reference||profile.reportedName.toLowerCase()!==taxon.bacterialName.trim().replace(/\s+/g,' ').toLowerCase())return null;
 const rank=taxon.taxonomyLevel?.trim().toLowerCase();
 if(rank&&!['unknown','not reported',profile.taxonomyRankInferredForInventoryOnly||''].includes(rank))return null;
 const pathway=pathways.find(p=>p.id===reference.pathwayId),source=sources.find(s=>s.id===reference.sourceId&&s.doi===reference.doi);
 if(!pathway||!source||!pathway.sourceIds.includes(source.id))return null;
 return{groupId:pathway.id,groupLabel:reference.groupLabel,version:FUNCTIONAL_PROFILE_VERSION,evidenceVersion:EVIDENCE_VERSION,source,substrate:pathway.substrate,introduction:profile.firstLayer.meetThisOrganism+" "+profile.firstLayer.whyResearchersStudyIt,scopeLabel:reference.scopeLabel,measurementLimit:reference.measurementLimit,dietLimit:reference.dietLimit} as const;
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
