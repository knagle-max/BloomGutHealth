import {z} from 'zod';
import {dietaryReferencesFor,dietaryReferenceSubset,dietaryReferenceRowSchema} from './dietary-references';
import {ageInYear} from './profile-demographics';
import {intakeCalendarDate} from './recorded-intake-sources';
import {contextSchema} from './precision-nutrition';

/** Current saved context only. The existing health question explicitly combines
 * pregnancy, breastfeeding and pregnancy planning; yes/unknown never imply the
 * nonpregnant/nonlactating category, including for a male Profile. No smoking
 * status exists in the canonical context, so nonsmoking rows cannot be matched.
 * Source effective dates and historical life-stage facts are not established. */
export function dietaryReferenceEligibility(input:{actor:string;profile:{id:string;sex?:unknown};birthYear:unknown;healthContext:unknown;nutrientKey:string;date:string;timeZone:string;asOf:string}){
 const {actor,profile,nutrientKey,date,timeZone,asOf}=input;
 if(!actor||profile.id!==actor)throw Error('REFERENCE_SCOPE_UNAVAILABLE');
 if(!z.iso.date().safeParse(date).success||!z.iso.datetime({offset:true}).safeParse(asOf).success||!intakeCalendarDate(asOf,timeZone))throw Error('REFERENCE_WINDOW_INVALID');
 const yearAge=ageInYear(input.birthYear,Number(date.slice(0,4))),ageRange=yearAge===null?null:{min:Math.max(0,yearAge-1),max:yearAge};
 const sex=profile.sex==='male'?'M':profile.sex==='female'?'F':null;
 const parsed=input.healthContext===undefined?null:contextSchema.safeParse(input.healthContext);
 if(parsed&&!parsed.success)throw Error('REFERENCE_CONTEXT_UNAVAILABLE');
 const context=parsed?.success?parsed.data:null;
 const common:string[]=[];
 if(date!==intakeCalendarDate(asOf,timeZone))common.push('historical-life-stage-and-reference-era-not-established');
 if(!ageRange)common.push('birth-year-not-recorded');
 if(ageRange&&ageRange.max<19)common.push('adult-19plus-category-not-applicable');
 if(!context||context.pregnancy!=='no')common.push('nonpregnant-nonlactating-context-not-confirmed');
 if(!context?.safetyReviewed)common.push('health-context-not-reviewed');
 if(context&&(context.conditions.length||context.medications.length))common.push('clinical-context-not-assessed');
 if(context?.ageGroup==='under18'&&ageRange&&ageRange.min>=18)common.push('age-sources-conflict');
 const rows=dietaryReferencesFor(nutrientKey).map(row=>{
  const reasons=[...common];
  if(ageRange){
   if(ageRange.max<row.ageMinYears||(row.ageMaxYears!==null&&ageRange.min>row.ageMaxYears))reasons.push('different-age-category');
   else if(ageRange.min<row.ageMinYears||(row.ageMaxYears!==null&&ageRange.max>row.ageMaxYears))reasons.push('age-category-not-established');
  }
  if(row.sexReferenceCategory!=='all'&&row.sexReferenceCategory!==sex)reasons.push(sex?'different-reference-sex-category':'reference-sex-category-not-recorded');
  if(row.dietaryPatternBasis)reasons.push('dietary-pattern-not-established');
  if(row.menstrualBasis)reasons.push('menstrual-context-not-established');
  if(row.smokingApplicability==='non-smoker')reasons.push('smoking-status-not-recorded');
  return{reference:row,eligible:reasons.length===0,reasons};
 });
 return{userId:actor,date,timeZone,asOf,referenceVersion:dietaryReferenceSubset.version,ageRange,ageBasis:'birth-year-possible-age-range' as const,
  sexReferenceCategory:sex,rows,valueKind:'published-reference-context' as const,adequacyAssessment:false as const,usualIntakeAssessment:false as const};
}

export const dietaryReferenceContextSchema=z.object({
 userId:z.string().min(1),date:z.iso.date(),timeZone:z.string(),asOf:z.iso.datetime({offset:true}),referenceVersion:z.string().min(1),revision:z.string().regex(/^[a-f0-9]{64}$/),
 ageRange:z.object({min:z.number().int().min(0),max:z.number().int().max(130)}).strict().refine(range=>range.min<=range.max).nullable(),ageBasis:z.literal('birth-year-possible-age-range'),sexReferenceCategory:z.enum(['M','F']).nullable(),
 rows:z.array(z.object({reference:dietaryReferenceRowSchema.extend({referenceVersion:z.string().min(1)}),eligible:z.boolean(),reasons:z.array(z.string().min(1)).max(15)}).strict().refine(row=>row.eligible===(row.reasons.length===0))).max(30),
 valueKind:z.literal('published-reference-context'),adequacyAssessment:z.literal(false),usualIntakeAssessment:z.literal(false),
}).strict();
