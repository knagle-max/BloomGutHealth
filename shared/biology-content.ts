import registry from "./biology-registry";

/** Educational descriptions are displayable even while independent evidence review is pending.
 * This module never interprets a user's observations or changes their source records. */
export const biologyContentVersion = registry.schemaVersion;

export type BiologyCitation = {title:string;url:string;evidenceType?:string;studyDesign?:string;reviewStatus?:string;verification?:string;pmid?:string;doi?:string;scopeLimit?:string;verifiedOn?:string|null};
export type LabBiography = {
  id:string;coverageStatus:string;reviewStatus:string;
  firstLayer:{whatItDoes:string;whyLowHigh:string;whyItMatters:string;whatToDiscuss:string};
  citations:BiologyCitation[];
};
export type OrganismBiography = {
  id:string;reportedName:string;reportedGroup:string;coverageStatus:string;reviewStatus:string;
  presentation?:string;rankMustBeVerified?:boolean;taxonomyRankInferredForInventoryOnly?:string;aliases?:string[];
  firstLayer:{meetThisOrganism:string;whyResearchersStudyIt:string;foodMetabolicConnections:string};
  citations:BiologyCitation[];limits?:string;
  functionalResearch?:{pathwayId:string;sourceId:string;doi:string;groupLabel:string;scopeLabel:string;measurementLimit:string;dietLimit:string};
};

const labs = new Map<string,LabBiography>(registry.labMarkerDefinitions.map(x=>[x.id,x as LabBiography]));
const normalize=(s:string)=>s.toLocaleLowerCase("en").trim().replace(/\s+/g," ");
export const organismBiographies:readonly OrganismBiography[]=[...registry.reportedFixtureOrganisms,...registry.additionalOrganismProfiles];
const organisms=new Map<string,OrganismBiography>(organismBiographies.map(x=>[normalize(x.reportedName),x]));

export function labBiography(markerId:string):LabBiography|undefined{return labs.get(markerId);}

/** Exact original label match only. Never infer species identity from genus, substrings,
 * old synonyms or a provider's unspecified strain. */
export function organismBiography(reportedName:string,taxonomyLevel?:string|null):OrganismBiography|undefined{
 const key=normalize(reportedName);
 const match=organisms.get(key)||Array.from(organisms.values()).find(entry=>entry.aliases?.some(alias=>normalize(alias)===key));
 if(!match)return undefined;
 // The source's explicit rank wins over an inventory inference. Missing rank
 // permits name-level education only; it never confirms the assay's resolution.
 const rank=normalize(taxonomyLevel||'');
 if(rank&&rank!=='unknown'&&rank!=='not reported'){
  const expected=match.taxonomyRankInferredForInventoryOnly;
  if(rank!==expected&&!(rank==='strain'&&expected==='species')&&!(rank==='genus'&&expected==='genus_or_unresolved'))return undefined;
 }
 return match;
}

export const biologyContentCoverage={
 labProfiles:registry.labMarkerDefinitions.length,
 additionalContextProfiles:registry.additionalOrganismProfiles.length,
 listedOrganisms:registry.reportedFixtureOrganisms.length,
 draftProfiles:registry.reportedFixtureOrganisms.filter(x=>x.coverageStatus==="reviewed_draft").length,
 limitedOrUnresolved:registry.reportedFixtureOrganisms.filter(x=>x.coverageStatus!=="reviewed_draft").length,
 independentApproval:registry.scientificApproval,
} as const;
