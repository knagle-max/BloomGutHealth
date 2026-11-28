import source from '../design/bloom/anatomy/canonical-baseline44-20261126/bloom_exercise_db_staging_canonical_mapped.json';
import crosswalk from '../design/bloom/anatomy/canonical-baseline44-20261126/canonical_to_svg_crosswalk.json';
import {exerciseCatalogue,catalogueExercise,normalizeExercise} from './exercise-catalogue';
import {muscleDescriptorNames,type DescriptiveMuscleId,type MuscleRole} from './exercise-muscles';
export const fullAssociationVersion='bloom-553-3102-baseline44-20261126';
const byName=new Map(source.map(row=>[row.exercise_name,row]));
const byDescriptor=new Map<string,DescriptiveMuscleId>(Object.entries(muscleDescriptorNames).map(([id,name])=>[name,id as DescriptiveMuscleId]));
/** Explicit identity or unique exact alias only. No fuzzy biological attribution. */
export function exactCatalogueIdentity(text:string){const key=normalizeExercise(text);const rows=exerciseCatalogue.filter(e=>[e.name,...e.aliases].some(name=>normalizeExercise(name)===key));return rows.length===1?rows[0]:null;}
/** Owner authorizes preliminary descriptive use, not a change to source review. */
export function catalogueMuscleAssociations(id:string){
 const identity=catalogueExercise(id);if(!identity)return null;const row=byName.get(identity.name);if(!row)return null;
 const associations=(['primary','secondary','stabilizers'] as const).flatMap(role=>{
  const names=row[role==='primary'?'primary_muscles':role==='secondary'?'secondary_muscles':'stabilizing_muscles'];
  return names.map(name=>{const muscle=byDescriptor.get(name);if(!muscle)throw Error('Unsupported source muscle descriptor');return{muscle,role:role as MuscleRole,state:row.review_status==='reviewed'?'reviewed' as const:'preliminary' as const,reviewId:null,exerciseRevision:fullAssociationVersion,sourceReferences:row.evidence_source_references};});
 });
 return{identity,row,associations,primary:associations.filter(a=>a.role==='primary').map(a=>a.muscle),secondary:associations.filter(a=>a.role==='secondary').map(a=>a.muscle),stabilizers:associations.filter(a=>a.role==='stabilizers').map(a=>a.muscle)};
}
/** Surface projection preserves coarse nonadditive anchors and deep text-only rows. */
export function exerciseRoleSurfaces(id:string){
 const data=catalogueMuscleAssociations(id);if(!data)return{surfaces:[],textOnly:[],data:null};
 const surfaces=crosswalk.svg_path_bindings.flatMap(bind=>{const roles=(['primary','secondary','stabilizers']as const).filter(role=>data.row.anatomical_map_ids[role==='stabilizers'?'stabilizer':role].some(map=>map.map_id===bind.anatomy_id&&map.mapping_status==='canonical_baseline'));return roles.length?[{...bind,roles}]:[];});
 const textOnly=data.associations.filter(a=>{const descriptor=crosswalk.muscle_descriptor_bindings.find(d=>d.muscle_descriptor===muscleDescriptorNames[a.muscle]);return !descriptor||descriptor.mapping_status!=='canonical_baseline';});
 return{surfaces,textOnly,data};
}

/** Explicit coarse surface filter, not a nearest-muscle anatomical guess. */
export function catalogueIdsForSurfacePath(pathId:string){
 const bind=crosswalk.svg_path_bindings.find(b=>b.svg_path_id===pathId);if(!bind)return [];
 return exerciseCatalogue.filter(exercise=>{const row=byName.get(exercise.name);return row&&(['primary','secondary','stabilizer']as const).some(role=>row.anatomical_map_ids[role].some((map:{map_id:string|null;mapping_status:string})=>map.map_id===bind.anatomy_id&&map.mapping_status==='canonical_baseline'));}).map(exercise=>exercise.id);
}
