import {z} from 'zod';

/** Captured at review, alongside the immutable source label. Never inferred
 * from display strings, grams or a current product lookup. */
export const labelPortionSchema=z.object({version:z.literal('label-portion-v1'),servings:z.number().finite().positive().max(100)}).strict();
export type LabelPortion=z.infer<typeof labelPortionSchema>;

/** The canonical label-serving multiplication, shared by review and read-only
 * saved-source projection. No chemistry, equivalents or intake assessment. */
export function scaleLabelAmount(amount:unknown,servings:unknown):number|null {
 if(typeof amount!=='number'||!Number.isFinite(amount)||amount<0||typeof servings!=='number'||!Number.isFinite(servings)||servings<=0||servings>100)return null;
 const result=amount*servings;return Number.isFinite(result)?result:null;
}
