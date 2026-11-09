/** Editorial evidence is separate from a person's measured report observations. */
import registry from './data/biology-content-r4m1-v2.json';
export const BIOLOGY_CONTENT_VERSION=registry.schemaVersion;
export const BIOLOGY_CONTENT_REVIEW_DATE='2026-11-08';
export type BiologyEvidenceLevel='clinical guidance'|'human intervention'|'human association'|'mechanistic'|'taxonomy'|'mixed evidence';
export type BiologyCoverageStatus='reviewed'|'limited'|'unresolved identity';
export type BiologyCitation={
 id:string;title:string;url:string;pmid?:string;doi?:string;
 design:string;evidenceLevel:BiologyEvidenceLevel;scopeLimit:string;
 verifiedOn:string;
};
export type LabEditorialProfile={
 id:string;name:string;whatItDoes:string;higher:string;lower:string|null;
 whyItMatters:string;whatToDiscuss:string;limitations:readonly string[];
 citationIds:readonly string[];assayIdentityRequired?:boolean;
};
export type TaxonomicScope='species'|'genus'|'family'|'order'|'class'|'phylum'|'domain'|'virus'|'group';
export type TaxonEditorialProfile={
 id:string;name:string;rank:TaxonomicScope;aliases:readonly string[];
 label:string;meet:string;research:string;foodConnections:string;scopeLimit:string;
 citationIds:readonly string[];coverageStatus:Exclude<BiologyCoverageStatus,'unresolved identity'>;
 reviewedOn:string;lastRevised:string;
 functionalGroup?:{pathwayId:string;sourceId:string;doi:string;groupLabel:string;scopeLabel:string;measurementLimit:string;dietLimit:string};
};
