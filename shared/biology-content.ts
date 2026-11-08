import registry from "./data/bloom_biology_content_coverage_r4m1_2026-11-08.json";

/** Educational descriptions are displayable even while independent evidence review is pending.
 * This module never interprets a user's observations or changes their source records. */
export const biologyContentVersion = registry.schemaVersion;

export type BiologyCitation = {title:string;url:string;evidenceType?:string;studyDesign?:string;reviewStatus?:string;verification?:string};
export type LabBiography = {
  id:string;coverageStatus:string;reviewStatus:string;
  firstLayer:{whatItDoes:string;whyLowHigh:string;whyItMatters:string;whatToDiscuss:string};
  citations:BiologyCitation[];
};
export type OrganismBiography = {
  id:string;reportedName:string;reportedGroup:string;coverageStatus:string;reviewStatus:string;
  rankMustBeVerified?:boolean;
  firstLayer:{meetThisOrganism:string;whyResearchersStudyIt:string;foodMetabolicConnections:string};
  citations:BiologyCitation[];limits?:string;
};

const labs = new Map<string,LabBiography>(registry.labMarkerDefinitions.map(x=>[x.id,x as LabBiography]));
const normalize=(s:string)=>s.toLocaleLowerCase("en").trim().replace(/\s+/g," ");
const organisms=new Map<string,OrganismBiography>(
 registry.reportedFixtureOrganisms.map(x=>[normalize(x.reportedName),x as OrganismBiography])
);

export function labBiography(markerId:string):LabBiography|undefined{return labs.get(markerId);}

/** Exact original label match only. Never infer species identity from genus, substrings,
 * old synonyms or a provider's unspecified strain. */
export function organismBiography(reportedName:string):OrganismBiography|undefined{
 return organisms.get(normalize(reportedName));
}

export const biologyContentCoverage={
 labProfiles:registry.labMarkerDefinitions.length,
 listedOrganisms:registry.reportedFixtureOrganisms.length,
 draftProfiles:registry.reportedFixtureOrganisms.filter(x=>x.coverageStatus==="reviewed_draft").length,
 limitedOrUnresolved:registry.reportedFixtureOrganisms.filter(x=>x.coverageStatus!=="reviewed_draft").length,
 independentApproval:registry.scientificApproval,
} as const;
