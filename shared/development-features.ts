import type {ImplementationReadiness} from './capability-state';
export interface DevelopmentFeature {id:'bloom.food.photo_ai';readiness:ImplementationReadiness;category:string;approval:string;label:string;outputClass:'synthetic-ui-only';}
export interface CapabilitySnapshot {eligible:boolean;experimentalEnabled:boolean;note?:string;foodEntry?:Partial<Record<'barcode'|'search'|'restaurant'|'photo'|'describe',boolean>>;developmentFeatures?:DevelopmentFeature[];capabilities?:string[];featureAdministration?:{canRead:boolean;canChange:false};}
/** Client rendering only; this never authorizes an API operation. */
export function activeDevelopmentPhoto(snapshot:CapabilitySnapshot|undefined):DevelopmentFeature|null {
 if(snapshot?.eligible!==true||snapshot.experimentalEnabled!==true||!Array.isArray(snapshot.developmentFeatures))return null;
 return snapshot.developmentFeatures.find(feature=>feature&&typeof feature.label==='string'&&feature.label.trim()&&feature.id==='bloom.food.photo_ai'&&feature.outputClass==='synthetic-ui-only'&&['GENERAL_RELEASE','HIDDEN_PENDING_APPROVAL'].includes(feature.category)&&['PROPOSED','UNDER_REVIEW','APPROVED'].includes(feature.approval)&&['PLANNED','IN_DEVELOPMENT','TESTABLE','FUNCTIONALLY_COMPLETE','VERIFIED'].includes(feature.readiness))||null;
}
