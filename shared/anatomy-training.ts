import crosswalk from '../design/bloom/anatomy/canonical-baseline44-20261126/canonical_to_svg_crosswalk.json';
import {type DescriptiveMuscleId} from './exercise-muscles';
import type {MuscleHistory} from './muscle-history';
/** Muscle identities remain distinct from coarse surface identities. Aliases
 * below are explicit anatomical terms, never guessed SVG-name matches. */
const descriptors:Record<DescriptiveMuscleId,string>={pectoralis_major:'Pectoralis major',anterior_deltoid:'Anterior deltoid',lateral_deltoid:'Middle deltoid',posterior_deltoid:'Posterior deltoid',biceps_brachii:'Biceps brachii',triceps_brachii:'Triceps brachii',latissimus_dorsi:'Latissimus dorsi',trapezius:'Trapezius',rhomboids:'Rhomboids',serratus_anterior:'Serratus anterior',forearm_flexors:'Forearm flexors',erector_spinae:'Erector spinae',rectus_abdominis:'Rectus abdominis',obliques:'External obliques',gluteus_maximus:'Gluteus maximus',gluteus_medius:'Gluteus medius',quadriceps:'Quadriceps femoris',hamstrings:'Hamstrings',adductor_magnus:'Adductor magnus',gastrocnemius:'Gastrocnemius',soleus:'Soleus'};
export type SurfaceTraining={anatomyId:string;pathId:string;view:'front'|'back';side:string;primaryKeys:string[];secondaryKeys:string[]};
export function projectTrainingSurfaces(contributions:MuscleHistory['contributions']){
 const surfaces=new Map<string,SurfaceTraining>(),unsidedSetKeys:string[]=[],unmappedMuscles=new Set<DescriptiveMuscleId>();
 for(const set of contributions){
  if(set.side==='unspecified'){unsidedSetKeys.push(set.key);continue;}
  for(const role of ['primary','secondary']as const)for(const muscle of set[role]){
   const descriptor=crosswalk.muscle_descriptor_bindings.find(d=>d.muscle_descriptor===descriptors[muscle]);
   if(!descriptor||descriptor.mapping_status!=='canonical_baseline'){unmappedMuscles.add(muscle);continue;}
   for(const anatomyId of descriptor.mapped_anatomy_ids){const bind=crosswalk.svg_path_bindings.find(b=>b.anatomy_id===anatomyId);if(!bind||(set.side!=='both'&&set.side!==bind.side))continue;
    const surface=surfaces.get(anatomyId)??{anatomyId,pathId:bind.svg_path_id,view:bind.view as 'front'|'back',side:bind.side,primaryKeys:[],secondaryKeys:[]};
    if(role==='primary'){if(!surface.primaryKeys.includes(set.key))surface.primaryKeys.push(set.key);surface.secondaryKeys=surface.secondaryKeys.filter(k=>k!==set.key);}
    else if(!surface.primaryKeys.includes(set.key)&&!surface.secondaryKeys.includes(set.key))surface.secondaryKeys.push(set.key);
    surfaces.set(anatomyId,surface);
   }
  }
 }
 return{surfaces:Array.from(surfaces.values()),unsidedSetKeys,unmappedMuscles:Array.from(unmappedMuscles)};
}
