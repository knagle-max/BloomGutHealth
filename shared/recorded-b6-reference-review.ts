import type {z} from 'zod';
import {ownedDietaryReferenceContext} from './dietary-reference-eligibility';
import {dietaryReferenceSubset} from './dietary-references';
import {knownNutrientCoverage} from './nutrient-coverage';
import {intakeCalendarDate,type recordedIntakeViewSchema} from './recorded-intake-sources';
/** Lower-bound comparison only: a partial known subtotal can reach a total-intake
 * limit, but being below it cannot establish clearance. No usual exposure,
 * toxicity, treatment or complete-day intake is established. */
export function recordedB6ReferenceReview(view:z.infer<typeof recordedIntakeViewSchema>,actor:string,input:unknown){
 const overlap=knownNutrientCoverage(view,actor,'vitamin_b6_mg').overlap,context=ownedDietaryReferenceContext(input,actor,{date:view.date,timeZone:view.timeZone,nutrientKey:'vitamin_b6_mg'});
 if(!overlap||!context||intakeCalendarDate(context.asOf,context.timeZone)!==context.date)return null;
 const limits=context.rows.filter(row=>row.eligible&&row.reference.kind==='UL'&&row.reference.intakeScope==='total-intake'&&row.reference.unit==='mg/day');
 if(limits.length!==1||overlap.knownSupplementalMg<limits[0].reference.amount)return null;
 const reference=limits[0].reference,source=dietaryReferenceSubset.sources.find(row=>row.id===reference.sourceId)!;
 return{...overlap,referenceApplicability:'matched-published-context' as const,releaseState:'feature-eligible' as const,
  finding:`The known combined B6 amount ${overlap.knownSupplementalMg===reference.amount?'reaches':'exceeds'} the matched Health Canada adult upper intake level.`,
  biologicalMeaning:'This reference covers food and supplements together. The confirmed supplemental portion alone reaches it; reviewing each label separately can miss this overlap. A single recorded day does not establish usual exposure or harm.',
  reference,source,referenceRevision:context.revision,
  discussion:'Review the contributing labels together for duplicate B6. Discuss the combined use with your clinician or pharmacist, especially if a product was prescribed; do not change a prescribed dose based on this view.',
  evidenceRuleIds:[...overlap.evidenceRuleIds,'hc-b6-known-subtotal-total-intake-bound-v1',reference.id],
  materialUnknowns:['Food and unrecorded supplements are not included; this is not complete-day or usual intake.','Prescribed use and individual clinical significance are not established.'],
  priorityReason:'Confirmed overlapping contributions alone reach a source-matched total-intake limit; no clinical urgency is inferred.',
  sourceEpoch:JSON.stringify([overlap.sourceEpoch,context.revision,context.referenceVersion,context.asOf,reference.id]),
 };
}
