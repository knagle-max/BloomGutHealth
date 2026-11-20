import {z} from 'zod';
import type {ImplementationReadiness} from './capability-state';
export interface DevelopmentFeature {id:'bloom.food.photo_ai';readiness:ImplementationReadiness;category:string;approval:string;label:string;outputClass:'synthetic-ui-only';}
export interface CapabilitySnapshot {eligible:boolean;experimentalEnabled:boolean;note?:string;foodEntry?:Partial<Record<'barcode'|'search'|'restaurant'|'photo'|'describe',boolean>>;developmentFeatures?:DevelopmentFeature[];experimentalWorkspaceVersion?:string;experimentalEntries?:ExperimentalPresentationEntry[];capabilities?:string[];featureAdministration?:{canRead:boolean;canChange:false};}
/** Client rendering only; this never authorizes an API operation. */
export function activeDevelopmentPhoto(snapshot:CapabilitySnapshot|undefined):DevelopmentFeature|null {
 if(snapshot?.eligible!==true||snapshot.experimentalEnabled!==true||!Array.isArray(snapshot.developmentFeatures))return null;
 return snapshot.developmentFeatures.find(feature=>feature&&typeof feature.label==='string'&&feature.label.trim()&&feature.id==='bloom.food.photo_ai'&&feature.outputClass==='synthetic-ui-only'&&['GENERAL_RELEASE','HIDDEN_PENDING_APPROVAL'].includes(feature.category)&&['PROPOSED','UNDER_REVIEW','APPROVED'].includes(feature.approval)&&['PLANNED','IN_DEVELOPMENT','TESTABLE','FUNCTIONALLY_COMPLETE','VERIFIED'].includes(feature.readiness))||null;
}

export const experimentalWorkspaceVersion='2026-11-20.1';
export const experimentalDisplayIds=['bloom.food.photo_ai','bloom.exercise.advanced','bloom.microbiome.flux','bloom.genetics.diet_rank','bloom.coach.athlete','bloom.healthkit','bloom.research.evidence_bridge'] as const;
export const experimentalMetadataScope=z.object({purpose:z.literal('development-status-review'),features:z.array(z.enum(experimentalDisplayIds)).min(1).max(7).refine(ids=>new Set(ids).size===ids.length)}).strict();
export const experimentalEntrySchema=z.object({
 id:z.enum(experimentalDisplayIds),group:z.enum(['AI_FOOD','ATHLETE','BIOLOGY','GENETICS','COACH','INTEGRATIONS','RESEARCH']),
 title:z.string().trim().min(1).max(80),description:z.string().trim().min(1).max(180),
 readiness:z.enum(['PLANNED','IN_DEVELOPMENT','TESTABLE','FUNCTIONALLY_COMPLETE','VERIFIED']),
 visibilityStatus:z.enum(['AVAILABLE_FOR_TESTING','DEVELOPMENT_PREVIEW','IN_DEVELOPMENT','PLANNED','RESTRICTED']),
 metadataVisible:z.literal(true),actionAllowed:z.boolean(),interaction:z.enum(['OPEN_SYNTHETIC_PREVIEW','INFO_ONLY']),
 route:z.literal('/log-meal?method=photo').optional(),sourceClass:z.enum(['SYNTHETIC_ONLY','EDUCATIONAL']).optional(),
 limitations:z.array(z.string().trim().min(1).max(180)).max(3).optional(),prerequisites:z.array(z.string().trim().min(1).max(180)).max(3).optional(),
}).strict().superRefine((entry,ctx)=>{
 const preview=entry.id==='bloom.food.photo_ai'&&entry.group==='AI_FOOD'&&entry.actionAllowed&&entry.interaction==='OPEN_SYNTHETIC_PREVIEW'&&entry.route==='/log-meal?method=photo'&&entry.sourceClass==='SYNTHETIC_ONLY'&&entry.visibilityStatus==='DEVELOPMENT_PREVIEW';
 const consistentReadiness=(entry.visibilityStatus!=='PLANNED'||entry.readiness==='PLANNED')&&(entry.visibilityStatus!=='IN_DEVELOPMENT'||entry.readiness==='IN_DEVELOPMENT');
 const informational=consistentReadiness&&!entry.actionAllowed&&entry.interaction==='INFO_ONLY'&&entry.route===undefined&&!['AVAILABLE_FOR_TESTING','DEVELOPMENT_PREVIEW'].includes(entry.visibilityStatus);
 if(!preview&&!informational)ctx.addIssue({code:'custom',message:'Unsupported action or inconsistent presentation'});
});
export type ExperimentalPresentationEntry=z.infer<typeof experimentalEntrySchema>;
/** Rendering validation only. Execution still requires fresh server authorization. */
export function activeExperimentalEntries(snapshot:CapabilitySnapshot|undefined):ExperimentalPresentationEntry[]{
 if(snapshot?.eligible!==true||snapshot.experimentalEnabled!==true||snapshot.experimentalWorkspaceVersion!==experimentalWorkspaceVersion)return [];
 const parsed=z.array(experimentalEntrySchema).max(7).refine(rows=>new Set(rows.map(row=>row.id)).size===rows.length).safeParse(snapshot.experimentalEntries);
 if(!parsed.success)return [];
 return parsed.data.filter(row=>!row.actionAllowed||!!activeDevelopmentPhoto(snapshot));
}
