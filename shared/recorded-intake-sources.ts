import {z} from 'zod';
import {nutrientDefinitionDetails} from './nutrient-definitions';
import {recognizedMealTimeZone} from './meal-time';
import {recordedNutrientObservations,type RecordedFoodRecord} from './nutrient-observations';
import {recordedLabelContributions} from './label-nutrient-sources';
import {supplementIntakeRecordSchema,supplementSourceContributions} from './supplement-intake';
import type {MealIntelligence} from './meal-intelligence';

export interface RecordedFoodSource extends RecordedFoodRecord {
 revision:string;name?:string;
 analysis:Pick<MealIntelligence,'nutrientSourceSnapshots'|'productDetails'>|null;
}
const timestamp=z.iso.datetime({offset:true});
const nutrientNames=new Map(nutrientDefinitionDetails().map(def=>[def.key,def.name]));
function instant(value:unknown):string|null {
 if(value instanceof Date)return Number.isFinite(+value)?value.toISOString():null;
 return timestamp.safeParse(value).success?new Date(value as string).toISOString():null;
}
/** A selected calendar date in a named zone, including historical DST. The zone
 * selects the view, never rewrites source timestamps or claims collection time. */
export function intakeCalendarDate(value:string,timeZone:string){
 if(!recognizedMealTimeZone(timeZone)||!timestamp.safeParse(value).success)return null;
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(value));
 const part=(type:string)=>parts.find(item=>item.type===type)?.value;
 return `${part('year')}-${part('month')}-${part('day')}`;
}
export interface IntakeSourceRow {
 eventKey:string;recordId:string;revision:string;eventKind:'food'|'supplement';
 sourceKind:'generic-food'|'food-label'|'supplement-label';sourceIndex:number;
 occurredAt:string;nutrientKey:string;name:string;unit:string;amount:number|null;
 sourceReportedZero:boolean|null;state:'estimated'|'label-reported'|'unknown'|'conflicting';
 chemicalForm:string|null;activityUnit:string|null;
 mineralBasis:'elemental-label'|'compound-weight'|'unknown'|null;
 source:{id:string;version:string|null;retrievedAt:string|null;url:string|null};
}
export interface IntakeSourceEvent {
 key:string;recordId:string;revision:string;name:string;kind:'food'|'supplement';occurredAt:string;
 sourceStatus:'available'|'partial'|'unavailable';rows:IntakeSourceRow[];
}
/** Composition of existing saved-source readers, not another nutrition engine.
 * Only current owned events participate. Names, similar products, schedules,
 * originals and corrections never establish additional ingestion events.
 * No cross-form sum, adequacy or usual-intake assessment is performed here. */
export function recordedIntakeSources(input:{actor:string;date:string;timeZone:string;asOf:string;foods:readonly RecordedFoodSource[];supplements:readonly unknown[]}){
 const {actor,date,timeZone,asOf}=input;
 if(!timestamp.safeParse(asOf).success||!actor||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date||!recognizedMealTimeZone(timeZone))throw Error('INVALID_INTAKE_WINDOW');
 const supplements=input.supplements.map(record=>supplementIntakeRecordSchema.safeParse(record));
 // A supposedly owned source feed must not silently become a plausible partial
 // result if it contains another account. No foreign source facts are returned.
 if(input.foods.some(food=>food.userId!==actor)||input.supplements.some(record=>!!record&&typeof record==='object'&&'userId'in record&&record.userId!==actor))throw Error('INTAKE_SCOPE_UNAVAILABLE');
 const seen=new Map<string,string>(),conflicts=new Set<string>();
 const remember=(key:string,signature:string)=>{const previous=seen.get(key);if(previous!==undefined&&previous!==signature)conflicts.add(key);else seen.set(key,signature);};
 // Check duplicate revisions before date filtering: an edited event moved to
 // another day must not leave its older copy in this window.
 for(const food of input.foods)if(food.id)remember(`food:${food.id}`,JSON.stringify([food.revision,instant(food.loggedAt),food.analysis]));
 for(const parsed of supplements)if(parsed.success)remember(`supplement:${parsed.data.payload.intentId}`,JSON.stringify(parsed.data));
 const candidates:{key:string;signature:string;build:()=>IntakeSourceEvent|null}[]=[];
 const undatedKeys=new Set<string>(),futureKeys=new Set<string>();
 let unsupportedEvents=supplements.filter(record=>!record.success).length;
 for(const food of input.foods){
  if(!food.id||!food.revision){unsupportedEvents++;continue;}
  const occurredAt=instant(food.loggedAt);
  if(!occurredAt){undatedKeys.add(`food:${food.id}`);continue;}
  if(intakeCalendarDate(occurredAt,timeZone)!==date)continue;
  if(Date.parse(occurredAt)>Date.parse(asOf)){futureKeys.add(`food:${food.id}`);continue;}
  const key=`food:${food.id}`;
  candidates.push({key,signature:JSON.stringify([food.revision,occurredAt,food.analysis]),build:()=>{
   const common={eventKey:key,recordId:food.id,revision:food.revision,eventKind:'food' as const,occurredAt};
   const generic=recordedNutrientObservations(food.analysis??{},food,actor);
   const labels=recordedLabelContributions(food.analysis?.productDetails,food,actor);
   const rows:IntakeSourceRow[]=[...generic.observations.map(row=>({...common,sourceKind:'generic-food' as const,sourceIndex:row.sourceIndex,nutrientKey:row.nutrientKey,name:nutrientNames.get(row.nutrientKey)??row.nutrientKey,unit:row.unit,amount:row.amount,sourceReportedZero:row.sourceReportsZero,state:row.state==='conflicting'?'conflicting' as const:row.amount===null?'unknown' as const:'estimated' as const,chemicalForm:row.chemicalForm,activityUnit:row.activityUnit,mineralBasis:null,source:{id:row.source.id,version:row.source.version,retrievedAt:null,url:row.source.url}})),
    ...labels.sources.flatMap(source=>source.fields.map(row=>({...common,sourceKind:'food-label' as const,sourceIndex:source.sourceIndex,nutrientKey:row.key,name:row.name,unit:row.unit,amount:row.amount,sourceReportedZero:row.sourceReportsZero,state:row.amount===null?'unknown' as const:'label-reported' as const,chemicalForm:null,activityUnit:null,mineralBasis:null,source:{id:source.sourceId,version:null,retrievedAt:source.sourceRetrievedAt,url:source.sourceUrl}})))];
   return{key,recordId:food.id,revision:food.revision,name:food.name?.trim()||'Saved meal',kind:'food',occurredAt,sourceStatus:rows.length?(generic.status==='unsupported'||labels.status==='unsupported'||labels.status==='partial'?'partial':'available'):'unavailable',rows};
  }});
 }
 for(const parsed of supplements){
  if(!parsed.success)continue;
  const record=parsed.data,occurredAt=record.payload.current.takenAt;
  if(intakeCalendarDate(occurredAt,timeZone)!==date)continue;
  if(Date.parse(occurredAt)>Date.parse(asOf)||Date.parse(record.payload.current.confirmedAt)>Date.parse(asOf)){futureKeys.add(`supplement:${record.payload.intentId}`);continue;}
  const key=`supplement:${record.payload.intentId}`;
  candidates.push({key,signature:JSON.stringify(record),build:()=>{
   const source=supplementSourceContributions(record,actor);
   if(source.status==='confirmation-before-intake'){unsupportedEvents++;return null;}
   const rows:IntakeSourceRow[]=source.observations.map(row=>({eventKey:key,recordId:record.id,revision:record.payload.revision,eventKind:'supplement',sourceKind:'supplement-label',sourceIndex:0,occurredAt,nutrientKey:row.nutrientKey,name:row.name,unit:row.unit,amount:row.amount,sourceReportedZero:row.sourceReportsZero,state:row.amount===null?'unknown':'label-reported',chemicalForm:row.chemicalForm,activityUnit:row.activityUnit,mineralBasis:row.mineralBasis,source:{id:row.sourceId,version:record.payload.current.formulation.labelVersion,retrievedAt:row.sourceRetrievedAt,url:record.payload.current.label?.url??null}}));
   return{key,recordId:record.id,revision:record.payload.revision,name:record.payload.current.label?.name??record.payload.current.unlabelled?.name??'Supplement',kind:'supplement',occurredAt,sourceStatus:source.status==='available'?'available':'unavailable',rows};
  }});
 }
 for(const candidate of candidates){const previous=seen.get(candidate.key);if(previous!==undefined&&previous!==candidate.signature)conflicts.add(candidate.key);else seen.set(candidate.key,candidate.signature);}
 const emitted=new Set<string>(),events:IntakeSourceEvent[]=[];
 for(const candidate of candidates){if(emitted.has(candidate.key)||conflicts.has(candidate.key))continue;emitted.add(candidate.key);const event=candidate.build();if(event)events.push(event);}
 return{userId:actor,date,timeZone,asOf,valueKind:'recorded_source_contributions' as const,events,undatedEvents:undatedKeys.size,futureEvents:futureKeys.size,unsupportedEvents,conflictingEvents:conflicts.size,adequacyAssessment:false as const,usualIntakeAssessment:false as const};
}

const sourceRowSchema=z.object({eventKey:z.string(),recordId:z.string(),revision:z.string(),eventKind:z.enum(['food','supplement']),sourceKind:z.enum(['generic-food','food-label','supplement-label']),sourceIndex:z.number().int().nonnegative(),occurredAt:timestamp,nutrientKey:z.string(),name:z.string(),unit:z.string(),amount:z.number().finite().nonnegative().nullable(),sourceReportedZero:z.boolean().nullable(),state:z.enum(['estimated','label-reported','unknown','conflicting']),chemicalForm:z.string().nullable(),activityUnit:z.string().nullable(),mineralBasis:z.enum(['elemental-label','compound-weight','unknown']).nullable(),source:z.object({id:z.string(),version:z.string().nullable(),retrievedAt:timestamp.nullable(),url:z.string().refine(value=>{try{return ['https:','http:'].includes(new URL(value).protocol);}catch{return false;}}).nullable()}).strict()}).strict();
export const recordedIntakeViewSchema=z.object({userId:z.string().min(1),date:z.string(),timeZone:z.string(),asOf:timestamp,valueKind:z.literal('recorded_source_contributions'),events:z.array(z.object({key:z.string(),recordId:z.string(),revision:z.string(),name:z.string().min(1).max(500),kind:z.enum(['food','supplement']),occurredAt:timestamp,sourceStatus:z.enum(['available','partial','unavailable']),rows:z.array(sourceRowSchema).max(1000)}).strict()).max(2000),undatedEvents:z.number().int().nonnegative(),futureEvents:z.number().int().nonnegative(),unsupportedEvents:z.number().int().nonnegative(),conflictingEvents:z.number().int().nonnegative(),adequacyAssessment:z.literal(false),usualIntakeAssessment:z.literal(false)}).strict();
