import {symptomMovementSchema} from './symptom-movement';
import {z} from 'zod';
import front from '../design/bloom/anatomy/unified-symptom/v1/assets/front-regions-provisional.json';
import back from '../design/bloom/anatomy/unified-symptom/v1/assets/back-regions-provisional.json';
/** Reuse delivered region identities as source locations, not canonical muscles
 * or diagnostic anatomy. Laterality is explicitly user reported, never inferred
 * from unreviewed posterior path labels or a user's global soreness score. */
export const symptomRegionSource='bva-0087-0089-v1' as const;
export const localizedSymptomKinds=['pain','soreness','stiffness','discomfort'] as const;
export const localizedSymptomSides=['left','right','bilateral','midline','unspecified'] as const;
export const symptomRegionChoices={front:front.map(r=>({id:r.id,label:r.label})),back:back.map(r=>({id:r.id,label:r.label}))};
const stamp=z.string().datetime({offset:true});
const zone=z.string().min(1).max(100).refine(value=>{try{new Intl.DateTimeFormat('en',{timeZone:value});return true;}catch{return false;}},'Use a recognized time zone');
export const localizedSymptomSchema=z.object({
 version:z.literal(1),lifecycleId:z.string().uuid(),revision:z.string().uuid(),previousRevision:z.string().uuid().nullable().default(null),
 type:z.enum(localizedSymptomKinds),
 location:z.object({source:z.literal(symptomRegionSource),view:z.enum(['front','back']),regionId:z.string().min(1).max(100),laterality:z.enum(localizedSymptomSides)}).strict().superRefine((location,ctx)=>{if(!symptomRegionChoices[location.view].some(r=>r.id===location.regionId))ctx.addIssue({code:'custom',path:['regionId'],message:'Choose a region from the selected source view'});}),
 observedAt:stamp,timeZone:zone.nullable(),onsetAt:stamp.nullable(),
 severity:z.number().int().min(0).max(10).nullable(),durationMinutes:z.number().finite().min(0).max(5256000).nullable(),ongoing:z.boolean().nullable(),
 notes:z.string().trim().max(2000).default(''),source:z.literal('user-reported'),
 movement:symptomMovementSchema.nullable().optional(),
}).strict().superRefine((record,ctx)=>{
 if(record.revision===record.previousRevision)ctx.addIssue({code:'custom',path:['revision'],message:'A changed observation needs a new revision'});
 if(record.onsetAt!==null&&Date.parse(record.onsetAt)>Date.parse(record.observedAt))ctx.addIssue({code:'custom',path:['onsetAt'],message:'Onset cannot follow the observation time'});
});
export type LocalizedSymptom=z.infer<typeof localizedSymptomSchema>;
