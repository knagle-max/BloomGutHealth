import {recordedIntakeViewSchema,intakeCalendarDate} from './recorded-intake-sources';
import {dateKey} from './experience';
import {knownNutrientCoverage} from './nutrient-coverage';
import {ownedDietaryReferenceContext} from './dietary-reference-eligibility';
import {recordedB6ReferenceReview} from './recorded-b6-reference-review';
import {vitaminB6ReferenceContext} from './supplement-reference-context';
import type {NutrientPersonalAssessment} from './scientific-contracts';
export const NUTRIENT_PERSONAL_ASSESSMENT_VERSION='nutrient-personal-assessment-2026-11-18-v1' as const;
/** First NI03 adapter over already validated M2 B6 facts. It does not estimate
 * usual exposure, absorbed amount, biological status or an individual dose. */
export function assessRecordedVitaminB6(input:{actor:string;purpose:'personal-wellness';sources:unknown;referenceContext?:unknown}){
 if(input.purpose!=='personal-wellness')throw Error('ASSESSMENT_PURPOSE_UNAVAILABLE');
 const view=recordedIntakeViewSchema.parse(input.sources),actor=input.actor;
 if(!dateKey.safeParse(view.date).success||!intakeCalendarDate(view.asOf,view.timeZone)||view.events.some(event=>intakeCalendarDate(event.occurredAt,view.timeZone)!==view.date||Date.parse(event.occurredAt)>Date.parse(view.asOf)))throw Error('ASSESSMENT_WINDOW_INVALID');
 const coverage=knownNutrientCoverage(view,actor,'vitamin_b6_mg'),context=ownedDietaryReferenceContext(input.referenceContext,actor,{date:view.date,timeZone:view.timeZone,nutrientKey:'vitamin_b6_mg'}),sourceReview=recordedB6ReferenceReview(view,actor,context);
 const matched=context?.rows.some(row=>row.eligible)??false,requirementContext=context?.rows.some(row=>row.eligible&&['EAR','RDA','AI'].includes(row.reference.kind))??false;
 const sourceEpoch=JSON.stringify([NUTRIENT_PERSONAL_ASSESSMENT_VERSION,coverage.sourceEpoch,context?.revision??null,context?.referenceVersion??null,context?.asOf??null,vitaminB6ReferenceContext.version]);
 const assessment:NutrientPersonalAssessment={version:NUTRIENT_PERSONAL_ASSESSMENT_VERSION,scope:'account-private',accountScope:actor,purpose:'personal-wellness',nutrientId:'vitamin_b6_mg',asOf:view.asOf,period:{date:view.date,timeZone:view.timeZone},sourceEpoch,evidenceVersion:vitaminB6ReferenceContext.version,
  sourceRevisions:view.events.map(event=>({id:event.recordId,revision:event.revision,occurredAt:event.occurredAt,dateBasis:event.kind==='food'?'food-record-time':'confirmed-taken-time'})),
  intake:{groups:coverage.groups,coverage:view.events.length?'partial':'unknown',recordedFoodEvents:view.events.filter(event=>event.kind==='food').length,confirmedSupplementEvents:view.events.filter(event=>event.kind==='supplement').length,unavailableEvents:coverage.unavailableEvents,excludedRecords:coverage.excludedRecords,usualExposure:{state:'not-established',amount:null,reason:'A recorded day and source-known rows do not establish representative habitual exposure or unlogged intake.'}},
  availability:{state:'not-measured',absorbedAmount:null},populationReferences:{status:context?(matched?'matched':'unmatched'):'unavailable',version:context?.referenceVersion??null,revision:context?.revision??null,rows:context?.rows??[]},
  biologicalStatus:{state:'not-assessed',biomarkerRefs:[]},requirements:{kind:requirementContext?'population-reference-context':'unknown',individualAmount:null,validationId:null},
  safety:{state:sourceReview?'potential-reference-overlap':'not-assessed',toxicity:'not-assessed',doseChangePermitted:false,contraindicationsChecked:[],importantUnknowns:['Unlogged food and supplements and usual exposure are not established.','Absorption, biological status, prescribed use and individual harm are not established.','Published reference eligibility is not a complete clinical interaction review.']},
  outcomes:{goalStatus:'not-provided',goalIds:[],protectedGoalIds:[],predictedPersonalBenefit:null},
  decision:{category:sourceReview?'reference-overlap-review':'source-details',approvedActionId:null,rationale:sourceReview?'Confirmed overlapping label contributions alone reach a source-matched total-intake reference; review their sources without a toxicity or dose inference.':'Keep the recorded source groups and unknowns; no meaningful individualized limit comparison or intervention is established.'},candidate:sourceReview,
 };
 return{assessment,sourceReview};
}
