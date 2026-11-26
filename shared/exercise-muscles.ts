/** Authored descriptive anatomy catalogue. Associations describe conventional
 * exercise roles, never measured activation %, tissue load, injury or recovery.
 * Technique/variation changes participation. No external dataset was imported. */
export const exerciseMuscleCatalogVersion='bloom-anatomical-exercise-v1-20261126';
/** This small authored catalog is distinct from the supplied 553-row staging
 * package. Methodology acceptance never becomes individual record acceptance. */
export const exerciseMuscleAcceptance={methodology:'approved',methodologyReviewId:'BIO-EXERCISE-553-01',catalogue:'engineering-authored',individualSpecialistAcceptance:'not-claimed',sourcePackage553:'unreviewed',visualCrosswalk:'independent'} as const;
const upper='https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs';
const lower='https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs';
const axial='https://openstax.org/books/anatomy-and-physiology-2e/pages/11-3-axial-muscles-of-the-head-neck-and-back';
const abdomen='https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax';
export const descriptiveMuscles={
 pectoralis_major:{label:'Pectoralis major',reference:upper},anterior_deltoid:{label:'Anterior deltoid',reference:upper},lateral_deltoid:{label:'Lateral deltoid',reference:upper},posterior_deltoid:{label:'Posterior deltoid',reference:upper},
 biceps_brachii:{label:'Biceps brachii',reference:upper},triceps_brachii:{label:'Triceps brachii',reference:upper},latissimus_dorsi:{label:'Latissimus dorsi',reference:upper},trapezius:{label:'Trapezius',reference:upper},rhomboids:{label:'Rhomboids',reference:upper},serratus_anterior:{label:'Serratus anterior',reference:upper},forearm_flexors:{label:'Forearm flexor group',reference:upper},
 erector_spinae:{label:'Erector spinae',reference:axial},rectus_abdominis:{label:'Rectus abdominis',reference:abdomen},obliques:{label:'Abdominal oblique group',reference:abdomen},
 gluteus_maximus:{label:'Gluteus maximus',reference:lower},gluteus_medius:{label:'Gluteus medius',reference:lower},quadriceps:{label:'Quadriceps group',reference:lower},hamstrings:{label:'Hamstring group',reference:lower},adductor_magnus:{label:'Adductor magnus',reference:lower},gastrocnemius:{label:'Gastrocnemius',reference:lower},soleus:{label:'Soleus',reference:lower},
} as const;
export type DescriptiveMuscleId=keyof typeof descriptiveMuscles;
export type MuscleRole='primary'|'secondary'|'stabilizers';
export type AssociationReview={role:MuscleRole;muscle:DescriptiveMuscleId;state:'reviewed'|'rejected';exerciseRevision:string;reviewId:string;sourceReferences:readonly string[]};
export type CuratedExercise={revision?:string;associationReviews?:readonly AssociationReview[];id:string;label:string;aliases:readonly string[];primary:readonly DescriptiveMuscleId[];secondary:readonly DescriptiveMuscleId[];stabilizers:readonly DescriptiveMuscleId[];note:string};
const entry=(id:string,label:string,aliases:string[],primary:DescriptiveMuscleId[],secondary:DescriptiveMuscleId[],note='Conventional version; grip, range, equipment and technique can change the association.',stabilizers:DescriptiveMuscleId[]=[]):CuratedExercise=>({id,label,aliases,primary,secondary,stabilizers,note});
export const curatedExercises:readonly CuratedExercise[]=[
 entry('bench_press','Bench press',['barbell bench press','flat bench press','flat barbell bench press','dumbbell bench press'],['pectoralis_major'],['triceps_brachii','anterior_deltoid']),
 entry('incline_press','Incline press',['incline bench press','incline dumbbell press','incline barbell bench press'],['pectoralis_major','anterior_deltoid'],['triceps_brachii']),
 entry('overhead_press','Overhead press',['shoulder press','standing dumbbell overhead press','barbell overhead press','dumbbell overhead press'],['anterior_deltoid'],['lateral_deltoid','triceps_brachii']),
 entry('lateral_raise','Lateral raise',['dumbbell lateral raise','lateral raises'],['lateral_deltoid'],['trapezius']),
 entry('row','Strength row',['barbell row','dumbbell row','chest-supported row','chest supported row','seated cable row'],['latissimus_dorsi','rhomboids'],['biceps_brachii','posterior_deltoid','trapezius']),
 entry('lat_pulldown','Lat pulldown',['lat pull-down','lat pulldowns'],['latissimus_dorsi'],['biceps_brachii']),
 entry('pull_up','Pull-up',['pull up','pull ups','pull-ups','chin-up','chin up'],['latissimus_dorsi'],['biceps_brachii']),
 entry('push_up','Push-up',['push up','push ups','push-ups'],['pectoralis_major'],['triceps_brachii','anterior_deltoid','serratus_anterior']),
 entry('squat','Squat',['barbell back squat','back squat','bodyweight squat','goblet squat','heel-elevated squat'],['quadriceps','gluteus_maximus'],['adductor_magnus']),
 entry('deadlift','Deadlift',['conventional deadlift','barbell deadlift'],['gluteus_maximus','quadriceps'],['hamstrings'],'Conventional floor deadlift. Erector/grip roles are stabilizers, excluded from direct/secondary set totals.',['erector_spinae','forearm_flexors']),
 entry('romanian_deadlift','Romanian deadlift',['rdl','barbell rdl','dumbbell rdl','romanian deadlifts'],['hamstrings','gluteus_maximus'],[],'Hip-hinge association; erector stabilization is not counted as direct/secondary work.',['erector_spinae']),
 entry('lunge','Lunge',['walking lunge','walking lunges','reverse lunge','lunges'],['quadriceps','gluteus_maximus'],['gluteus_medius']),
 entry('leg_extension','Leg extension',['leg extensions'],['quadriceps'],[]),
 entry('leg_curl','Leg curl',['hamstring curl','hamstring curls','lying leg curl','seated leg curl'],['hamstrings'],[]),
 entry('calf_raise','Calf raise',['standing calf raise','calf raises'],['gastrocnemius','soleus'],[]),
 entry('seated_calf_raise','Seated calf raise',['seated calf raises'],['soleus'],['gastrocnemius']),
 entry('biceps_curl','Biceps curl',['bicep curl','biceps curls','barbell curl','dumbbell curl'],['biceps_brachii'],[],'Conventional curl; forearm grip stabilization is reported separately.',['forearm_flexors']),
 entry('triceps_extension','Triceps extension',['tricep extension','triceps pushdown','tricep pushdown','triceps extensions'],['triceps_brachii'],[]),
 entry('hip_thrust','Hip thrust',['barbell hip thrust','glute bridge','hip thrusts'],['gluteus_maximus'],['hamstrings']),
 entry('plank','Plank',['front plank'],['rectus_abdominis','obliques'],['serratus_anterior'],'An isometric exercise; recorded sets do not supply missing duration, external load or physiological effort.'),
];
const normalize=(value:string)=>value.normalize('NFKC').trim().toLowerCase().replace(/[–—]/g,'-').replace(/\s+/g,' ');
const aliases=new Map<string,CuratedExercise>();
for(const exercise of curatedExercises)for(const text of [exercise.label,...exercise.aliases]){const key=normalize(text),old=aliases.get(key);if(old&&old.id!==exercise.id)throw Error('Ambiguous curated exercise alias');aliases.set(key,exercise);}
/** Exact authored aliases only. No fuzzy/LLM matching or guessed participation. */
export function matchCuratedExercise(text:string):CuratedExercise|null{return aliases.get(normalize(text))??null;}

/** Amendment A: disposition belongs to each association, independently of its
 * visual anchor. Unreviewed plausible associations are preliminary, not absent.
 * A review of a previous revision cannot silently certify a corrected mapping. */
export function exerciseAssociations(exercise:CuratedExercise){
 const revision=exercise.revision??exerciseMuscleCatalogVersion;
 const associations=(['primary','secondary','stabilizers'] as const).flatMap(role=>exercise[role].map(muscle=>{
  const review=exercise.associationReviews?.find(r=>r.role===role&&r.muscle===muscle&&r.exerciseRevision===revision);
  const valid=review&&review.reviewId.trim()&&review.sourceReferences.length>0&&review.sourceReferences.every(s=>s.trim());
  return{muscle,role,state:valid?review.state:'preliminary' as const,reviewId:valid?review.reviewId:null,exerciseRevision:revision,sourceReferences:valid?Array.from(review.sourceReferences):[descriptiveMuscles[muscle].reference]};
 }));
 return{associations,primary:associations.filter(a=>a.role==='primary'&&a.state!=='rejected').map(a=>a.muscle),secondary:associations.filter(a=>a.role==='secondary'&&a.state!=='rejected').map(a=>a.muscle),stabilizers:associations.filter(a=>a.role==='stabilizers'&&a.state!=='rejected').map(a=>a.muscle)};
}
