import registry from './biology-registry';
import type {BiologyCitation,LabEditorialProfile} from './biology-content-types';
/** Adapters only: the versioned canonical Biology registry owns all scientific text. */
export const labEditorialProfiles:readonly LabEditorialProfile[]=registry.labMarkerDefinitions.map(entry=>({
 id:entry.id,name:entry.name,whatItDoes:entry.firstLayer.whatItDoes,
 higher:entry.directionalContext.higher,lower:entry.directionalContext.lower,
 whyItMatters:entry.firstLayer.whyItMatters,whatToDiscuss:entry.firstLayer.whatToDiscuss,
 limitations:entry.limitations,citationIds:entry.citations.map(source=>source.id),
 assayIdentityRequired:entry.assayIdentityRequired,
}));
export const labEditorialCitations:readonly BiologyCitation[]=Array.from(new Map(registry.labMarkerDefinitions.flatMap<BiologyCitation>(entry=>entry.citations.map(source=>source as BiologyCitation)).map(source=>[source.id,source])).values());
export function labEditorialFor(id:string){return labEditorialProfiles.find(profile=>profile.id===id);}
export function labEditorialSources(profile:LabEditorialProfile){return profile.citationIds.map(id=>labEditorialCitations.find(source=>source.id===id)).filter((source):source is BiologyCitation=>!!source);}
export function markerEducation(id:string){const profile=labEditorialFor(id);if(!profile)throw new Error(`Missing marker editorial profile: ${id}`);return{definition:profile.whatItDoes,context:profile.whyItMatters,sources:labEditorialSources(profile).map(source=>({title:source.title,url:source.url,accessedOn:source.verifiedOn}))};}
