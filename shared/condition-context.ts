import {z} from 'zod';
const assertion=z.enum(['unknown','none-reported','reported']);
/** User assertion and server revision only. Never clinical verification or
 * permission to transfer health context to a provider. Names remain canonical
 * encrypted conditions[], including original legacy/custom wording. */
export const conditionSourceSchema=z.object({version:z.literal(1),revision:z.uuid(),previousRevision:z.string().regex(/^[a-f0-9]{64}$/),sharingRevision:z.uuid(),assertion,confirmedAt:z.iso.datetime({offset:true})}).strict();
export const conditionContextCommandSchema=z.object({revision:z.string().regex(/^[a-f0-9]{64}$/),conditions:z.array(z.string().trim().min(1).max(200)).max(30),assertion,confirmed:z.literal(true)}).strict().refine(value=>new Set(value.conditions.map(name=>name.toLocaleLowerCase('en-CA'))).size===value.conditions.length,'Choose each entry once').refine(value=>value.assertion==='reported'?value.conditions.length>0:value.conditions.length===0,'Keep unknown and none-reported distinct from selected entries');
export type ConditionContextCommand=z.infer<typeof conditionContextCommandSchema>;
export const conditionContextViewSchema=z.object({revision:z.string().regex(/^[a-f0-9]{64}$/),conditions:z.array(z.string().min(1).max(200)).max(30),assertion,source:z.enum(['legacy-unverified','user-selected-unverified'])}).strict();
export type ConditionContextView=z.infer<typeof conditionContextViewSchema>;
/** A blank/declined or internally inconsistent condition response cannot act
 * as reviewed absence in existing nutrition eligibility. No new capability. */
export function conditionContextNeedsReview(context:{conditions:readonly string[];conditionSource?:{assertion:string}}){const source=context.conditionSource;return !!source&&(source.assertion==='unknown'||((source.assertion==='reported')!==(context.conditions.length>0)));}
