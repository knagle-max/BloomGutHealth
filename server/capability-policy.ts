import type {RequestHandler} from "express";
import {effectiveCapabilityDecision} from './effective-capability';
import {normalizeCapabilityApproval as capabilityApproval} from '../shared/capability-state';
export {capabilityApproval};
import registry from "../docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json";
/** Preserve the provisional source; no legacy review state becomes an approval. */
export const capabilityPolicyVersion=registry.version;
export function restrictedCapabilityAllowed(id:string) {
  // Existing restricted callsites have no installed reviewed execution facts.
  // A source-flag promotion alone must never activate them. The shared evaluator
  // is ready for trusted scope/control adapters; those remain unconfigured.
  return effectiveCapabilityDecision({featureId:id,now:Date.now()}).allowed;
}
/** For restricted handlers only. This does not reclassify existing safe T1 preview routes. */
export function requireRestrictedCapability(id:string):RequestHandler {
  return (_req,res,next)=>{
    if(restrictedCapabilityAllowed(id))return next();
    res.status(403).json({code:"CAPABILITY_UNAVAILABLE",capability:id,error:"This capability is unavailable in this build. Use a supported manual or educational alternative."});
  };
}

/** Server lookup only. Callers must project safe metadata, not expose the full provisional record. */
export function capabilityRecord(id:string){const feature=registry.features.find(feature=>feature.feature_id===id);return feature?structuredClone(feature):null;}
export function capabilityRecords(){return structuredClone(registry.features);}
