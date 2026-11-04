import type { ReportOrganism } from './structured-report';
export type ReportedTaxon = {
 id:string; bacterialName:string; taxonomyLevel?:string|null; abundance?:number|null;
 reportedAbundance?:string|null; reportedStatus?:string|null; reportedNotes?:string|null; reportedOrganismSourceId?:string;
};
/** Read-only original-source projection. Exact unique spellings may link the two
 * source sections; ambiguous/duplicate or strain-specific observations stay separate.
 * Read counts/qualitative amounts are never converted to relative percentages. */
export function reportedTaxa(sample:{id:string;structuredData?:unknown},composition:ReportedTaxon[]):ReportedTaxon[]{
 const structured=sample.structuredData as {schemaVersion?:unknown;organisms?:ReportOrganism[]}|undefined;
 if(structured?.schemaVersion!=='bloom-report-v2'||!Array.isArray(structured.organisms))return [...composition];
 const organisms=structured.organisms,joined=new Set<number>();
 const sourceFields=(organism:ReportOrganism,index:number)=>({reportedAbundance:organism.reportedAbundance,reportedStatus:organism.reportedStatus,reportedNotes:organism.notes,reportedOrganismSourceId:`reported-organism:${sample.id}:${index}`});
 const byName=new Map<string,{organism:ReportOrganism;index:number}[]>(),counts=new Map<string,number>();
 organisms.forEach((organism,index)=>{if(organism&&typeof organism.name==="string")byName.set(organism.name,[...(byName.get(organism.name)||[]),{organism,index}]);});
 composition.forEach(row=>counts.set(row.bacterialName,(counts.get(row.bacterialName)||0)+1));
 const result=composition.map(row=>{
  const matches=byName.get(row.bacterialName)||[];
  if(matches.length!==1||counts.get(row.bacterialName)!==1)return row;
  const {organism,index}=matches[0];joined.add(index);return{...row,...sourceFields(organism,index)};
 });
 organisms.forEach((organism,index)=>{
  if(joined.has(index)||!organism||typeof organism.name!=='string'||!organism.name)return;
  const fields=sourceFields(organism,index);
  result.push({id:fields.reportedOrganismSourceId,bacterialName:organism.name,taxonomyLevel:null,abundance:null,...fields});
 });
 return result;
}
export function reportedTaxonAmount(taxon:ReportedTaxon):string{
 if(typeof taxon.abundance==='number'&&Number.isFinite(taxon.abundance))return `${taxon.abundance}%`;
 return typeof taxon.reportedAbundance==='string'&&taxon.reportedAbundance.trim()?taxon.reportedAbundance:'Not reported';
}

export type ReportedTaxonMatch={status:'matched';taxon:ReportedTaxon}|{status:'ambiguous'|'unmatched'|'unknown-resolution'};
/** Side-by-side source lookup only, never assay compatibility or biological change.
 * Require one exact source spelling/rank in each report; do not select the first
 * duplicate, normalize strain names or treat unreported rank as species. */
export function matchReportedTaxon(row:ReportedTaxon,current:readonly ReportedTaxon[],other:readonly ReportedTaxon[]):ReportedTaxonMatch{
 const rank=row.taxonomyLevel;
 if(!rank||!['domain','kingdom','phylum','class','order','family','genus','species','subspecies','strain'].includes(rank))return{status:'unknown-resolution'};
 const same=(candidate:ReportedTaxon)=>candidate.bacterialName===row.bacterialName&&candidate.taxonomyLevel===rank;
 const own=current.filter(same),matches=other.filter(same);
 if(own.length>1||matches.length>1)return{status:'ambiguous'};
 if(own.length!==1||own[0].id!==row.id||matches.length!==1)return{status:'unmatched'};
 return{status:'matched',taxon:matches[0]};
}
