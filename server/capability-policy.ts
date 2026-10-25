import type {RequestHandler} from "express";
import registry from "../docs/architecture/LEGAL_PROVISIONAL_FEATURE_REGISTRY_2026-10-24.json";
/** Preserve the provisional source; no legacy review state becomes an approval. */
export const capabilityPolicyVersion=registry.version;
export function capabilityApproval(value:string) {
  if(value==="REVIEW_REQUIRED")return "UNDER_REVIEW";
  if(value==="NOT_APPROVED")return "PROPOSED";
  return ["PROPOSED","UNDER_REVIEW","APPROVED","REJECTED","SUSPENDED"].includes(value)?value:"PROPOSED";
}
export function restrictedCapabilityAllowed(id:string) {
  const entry=registry.features.find(f=>f.feature_id===id);
  return !!entry&&entry.release_category==="GENERAL_RELEASE"&&capabilityApproval(entry.approval_status)==="APPROVED"&&entry.public_enabled===true;
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
