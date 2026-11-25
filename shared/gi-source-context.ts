import {z} from 'zod';
import {recognizedMealTimeZone} from './meal-time';
const zone=z.string().max(100).refine(recognizedMealTimeZone).nullable().optional();
/** Reported precision only. Missing clocks/zone remain unknown; capture time is
 * separate server metadata, never substituted for symptom or exposure onset. */
export const giSourceTimeSchema=z.discriminatedUnion('precision',[
 z.object({precision:z.literal('unknown')}).strict(),
 z.object({precision:z.literal('date'),date:z.iso.date(),timeZone:zone}).strict(),
 z.object({precision:z.literal('timestamp'),at:z.iso.datetime({offset:true}),timeZone:zone}).strict(),
]);
const tri=z.enum(['yes','no','unknown']);
const rating=z.number().int().min(0).max(10).nullable();
const time=giSourceTimeSchema.optional();
const uniqueIds=(rows:readonly {id:string}[])=>new Set(rows.map(row=>row.id)).size===rows.length;
const exposureSchema=z.object({
 id:z.uuid(),kind:z.enum(['medication','supplement']),name:z.string().trim().min(1).max(160),
 change:z.enum(['started','stopped','dose-changed','none-reported','unknown']),
 useStatus:z.enum(['reported-taken','reported-not-taken','prescribed-only','planned','unknown']),
 effective:time,
 dose:z.object({amount:z.number().finite().nonnegative().max(1e9).nullable(),unit:z.string().trim().min(1).max(50).nullable()}).strict().refine(dose=>dose.amount===null||dose.unit!==null,'Keep a unit with a reported amount').optional(),
 ingredientSource:z.object({provenance:z.literal('user-reported-label-text'),text:z.string().trim().min(1).max(2000)}).strict().nullable().optional(),
}).strict();
const conditionSchema=z.object({id:z.uuid(),name:z.string().trim().min(1).max(160),state:z.enum(['user-reported-diagnosis','suspected','user-reported-ruled-out','unknown']),effective:time}).strict();
/** Optional adjunct to the existing canonical precision check-in. Syntactic
 * resource limits below are not diagnostic/clinical thresholds or dose advice. */
export const giSourceContextSchema=z.object({
 version:z.literal(1),
 symptoms:z.array(z.object({id:z.uuid(),type:z.enum(['bloating','gas','abdominal-pain','constipation','diarrhea','nausea','other']),severity:rating.optional(),onset:time,durationMinutes:z.number().finite().min(0).max(5256000).nullable().optional(),recurrence:z.enum(['single','intermittent','persistent','unknown']).optional()}).strict()).max(8).refine(uniqueIds).optional(),
 bowel:z.object({frequency:z.object({count:z.number().finite().min(0).max(1000),periodDays:z.number().finite().positive().max(3650)}).strict().nullable().optional(),bristol:z.number().int().min(1).max(7).nullable().optional(),straining:tri.optional(),incompleteEmptying:tri.optional(),reliefAfterBowelMovement:z.enum(['yes','no','partial','unknown']).optional(),effective:time}).strict().optional(),
 warnings:z.object({bloodInStool:tri.optional(),majorActiveBleeding:tri.optional(),fainting:tri.optional(),severePersistentPain:tri.optional(),persistentNewBowelChange:tri.optional(),effective:time}).strict().optional(),
 exposures:z.array(exposureSchema).max(20).refine(uniqueIds).optional(),
 conditions:z.object({assertion:z.enum(['unknown','none-reported','reported']),entries:z.array(conditionSchema).max(20).refine(uniqueIds)}).strict().refine(value=>value.assertion==='reported'?value.entries.length>0:value.entries.length===0,'Keep reported conditions separate from unknown or none-reported').optional(),
 weightLoss:z.object({intent:z.enum(['intentional','unintentional','unknown']),amount:z.number().finite().min(0).max(500).nullable().optional(),unit:z.enum(['kg','lb']).optional(),overDays:z.number().finite().positive().max(3650).nullable().optional(),effective:time}).strict().refine(value=>value.amount===undefined||value.amount===null||value.unit!==undefined,'Keep the original reported mass unit').optional(),
 menstrualPelvic:z.object({periods:z.array(z.object({startedOn:z.iso.date(),endedOn:z.iso.date().nullable().optional()}).strict().refine(value=>!value.endedOn||value.endedOn>=value.startedOn,'Keep a valid reported period window')).max(6).optional(),bleeding:tri.optional(),pelvicPain:rating.optional(),dysmenorrhea:tri.optional(),reportedCycleDay:z.number().int().min(1).max(180).nullable().optional(),effective:time}).strict().optional(),
}).strict().refine(value=>Object.keys(value).some(key=>key!=='version'),'Record at least one context field');
export type GiSourceContext=z.infer<typeof giSourceContextSchema>;
/** Server-supplied source mutation metadata, never a diagnosis verification. */
export const giSourceMetadataSchema=z.object({version:z.literal(1),revision:z.uuid(),learnedAt:z.iso.datetime({offset:true}),previousSourceRevision:z.string().regex(/^[a-f0-9]{64}$/).nullable()}).strict();
export const investigationSharingSchema=z.object({version:z.literal(1),revision:z.uuid(),changedAt:z.iso.datetime({offset:true}),medicationChronology:z.boolean(),menstrualPelvic:z.boolean()}).strict();
export type InvestigationSharing=z.infer<typeof investigationSharingSchema>;
export const investigationSharingCommandSchema=z.object({revision:z.uuid(),medicationChronology:z.boolean(),menstrualPelvic:z.boolean(),confirmed:z.literal(true)}).strict();
export type InvestigationSharingCommand=z.infer<typeof investigationSharingCommandSchema>;
export function privateGiView(value:GiSourceContext,sharing:Pick<InvestigationSharing,'medicationChronology'|'menstrualPelvic'>){
 const {exposures,menstrualPelvic,...ordinary}=value;
 return {...ordinary,...(sharing.medicationChronology&&exposures!==undefined?{exposures}:{}),...(sharing.menstrualPelvic&&menstrualPelvic!==undefined?{menstrualPelvic}:{})};
}
export class GiSourceError extends Error{constructor(readonly status:400|404|409|503,message:string){super(message);}}
