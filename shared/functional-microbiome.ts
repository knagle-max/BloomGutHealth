import {EVIDENCE_VERSION,evidenceSources,pathways,type EvidenceSource} from "./science-coach";
import type {ReportedTaxon} from "./reported-taxa";

export const FUNCTIONAL_PROFILE_VERSION="2026-11-07.2";
const references=[
 {name:"ruminococcus bromii",pathwayId:"starch-butyrate",sourceId:"resistant-starch-2012",doi:"10.1038/ismej.2012.4",groupLabel:"Resistant-starch research",scopeLabel:"Species-name study context",introduction:"Researchers have studied this bacterium’s ability to break down resistant starch in human-derived cultures. This is background research, not a measurement of activity in your report.",measurementLimit:"This record does not measure starch breakdown, fermentation products or butyrate production in you.",dietLimit:"This source describes mechanistic experiments, not a personal food or serving recommendation. It does not establish that eating a particular food will increase this organism in you."},
 {name:"veillonella atypica",pathwayId:"athlete-lactate",sourceId:"athletes-2019",doi:"10.1038/s41591-019-0485-4",groupLabel:"Lactate research",scopeLabel:"Species-name study context",introduction:"Researchers linked Veillonella-associated lactate metabolism with athlete observations and studied V. atypica in mice. A matching species name does not establish the strain, pathway activity or a performance benefit in you.",measurementLimit:"This record does not measure lactate consumption, propionate production or exercise performance effects in you.",dietLimit:"Human athlete observations and mouse experiments do not establish a human food, probiotic or serving prescription. Exercise-derived lactate is not a dietary substrate recommendation."},
 {name:"odoribacteraceae",pathwayId:"longevity-bile",sourceId:"centenarians-2021",doi:"10.1038/s41586-021-03832-5",groupLabel:"Bile-acid research",scopeLabel:"Family-level background only",introduction:"Some isolates in this bacterial family were studied for specific bile-acid transformations in a centenarian research programme. The family name in your report does not identify those isolates or establish that other family members share their capacity.",measurementLimit:"This record does not identify the studied isolates, their genes, or bile-acid production, consumption or host concentrations in you.",dietLimit:"A centenarian association and culture experiments do not show that a food will reproduce those pathways or extend your lifespan. More total secondary bile acids is not a goal."},
] as const;
/** Read-only existing citations. Exact names only; a family reference is explicitly
 * not evidence that its members/your reported organism carry a studied capacity. */
export function functionalResearchFor(taxon:Pick<ReportedTaxon,"bacterialName"|"taxonomyLevel">,sources:readonly EvidenceSource[]=evidenceSources){
 const reference=references.find(r=>r.name===taxon.bacterialName.trim().replace(/\s+/g," ").toLowerCase());
 if(!reference)return null;
 const rank=taxon.taxonomyLevel?.trim().toLowerCase();
 if(rank&&!['unknown','not reported',reference.name==='odoribacteraceae'?'family':'species'].includes(rank))return null;
 const pathway=pathways.find(p=>p.id===reference.pathwayId),source=sources.find(s=>s.id===reference.sourceId&&s.doi===reference.doi);
 if(!pathway||!source||!pathway.sourceIds.includes(source.id))return null;
 return{groupId:pathway.id,groupLabel:reference.groupLabel,version:FUNCTIONAL_PROFILE_VERSION,evidenceVersion:EVIDENCE_VERSION,source,substrate:pathway.substrate,introduction:reference.introduction,scopeLabel:reference.scopeLabel,measurementLimit:reference.measurementLimit,dietLimit:reference.dietLimit} as const;
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
