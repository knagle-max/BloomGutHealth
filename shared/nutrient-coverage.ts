import type {z} from 'zod';
import {recordedNutrientDefinitionDetails} from './nutrient-definitions';
import type {recordedIntakeViewSchema,IntakeSourceRow} from './recorded-intake-sources';
import {intakeCalendarDate} from './recorded-intake-sources';
import {vitaminB6ReferenceContext} from './supplement-reference-context';
import type {ConsumerValueCandidate} from './scientific-contracts';

export const NUTRIENT_COVERAGE_VERSION='recorded-source-coverage-2026-11-18-v2';
export interface RecordedB6Overlap extends ConsumerValueCandidate {
 evidenceClass:'source-arithmetic';referenceApplicability:'not-established';
 knownSupplementalMg:number;distinctLabels:number;
 unknownSupplementEntries:number;
 members:Array<{eventKey:string;recordId:string;revision:string;name:string;labelId:string;labelVersion:string|null;amountMg:number;occurredAt:string}>;
 referenceContextVersion:string;
}

type SourceView=z.infer<typeof recordedIntakeViewSchema>;
export interface KnownSourceSubtotal {
 sourceKind:IntakeSourceRow['sourceKind'];unit:string;
 chemicalForm:string|null;activityUnit:string|null;mineralBasis:IntakeSourceRow['mineralBasis'];
 knownSubtotal:number|null;knownRows:number;zeroRows:number;unknownRows:number;incompatibleRows:number;
}
const formSensitive=new Set(['vitamin_a_ug','vitamin_d_ug','vitamin_e_mg','vitamin_k_ug','folate_ug','niacin_mg']);
const minerals=new Set(['iron_mg','magnesium_mg','zinc_mg']);
/** Roll up only compatible observations from the existing canonical owned view.
 * Separate source classes and chemical bases never acquire a combined total.
 * This describes recorded sources, not missing meals or nutritional adequacy. */
export function knownNutrientCoverage(view:SourceView,actor:string,nutrientKey:string){
 if(!actor||view.userId!==actor)throw Error('INTAKE_SCOPE_UNAVAILABLE');
 const definition=recordedNutrientDefinitionDetails().find(item=>item.key===nutrientKey);
 if(!definition)throw Error('UNSUPPORTED_NUTRIENT');
 const groups=new Map<string,KnownSourceSubtotal>(),seenEvents=new Set<string>();
 let unavailableEvents=0;
 for(const event of view.events){
  // The canonical reader already resolves repeats/revisions. Refuse malformed
  // projections rather than silently making their repeated amounts plausible.
  if(seenEvents.has(event.key))throw Error('DUPLICATE_INTAKE_EVENT');seenEvents.add(event.key);
  const rows=event.rows.filter(row=>row.nutrientKey===nutrientKey),seenRows=new Set<string>();
  if(!rows.length)unavailableEvents++;
  for(const row of rows){
   if(row.eventKey!==event.key||row.recordId!==event.recordId||row.revision!==event.revision||row.eventKind!==event.kind||(row.sourceKind==='supplement-label')!==(event.kind==='supplement'))throw Error('INTAKE_ROW_IDENTITY');
   const rowKey=JSON.stringify([row.sourceKind,row.sourceIndex,row.nutrientKey]);
   if(seenRows.has(rowKey))throw Error('DUPLICATE_INTAKE_ROW');seenRows.add(rowKey);
   const key=JSON.stringify([row.sourceKind,row.unit,row.chemicalForm,row.activityUnit,row.mineralBasis]);
   let group=groups.get(key);if(!group){group={sourceKind:row.sourceKind,unit:row.unit,chemicalForm:row.chemicalForm,activityUnit:row.activityUnit,mineralBasis:row.mineralBasis,knownSubtotal:null,knownRows:0,zeroRows:0,unknownRows:0,incompatibleRows:0};groups.set(key,group);}
   const generic=row.sourceKind==='generic-food';
   const compatible=row.unit===definition.amountUnit&&row.state!=='conflicting'&&!!row.source.id.trim()&&
    (generic?(definition.sourceMappings.usda!==null&&row.chemicalForm===definition.chemicalForm&&row.activityUnit===definition.activityUnit):
     !formSensitive.has(nutrientKey)&&(!minerals.has(nutrientKey)||row.mineralBasis==='elemental-label'));
   if(row.unit!==definition.amountUnit||row.state==='conflicting'||!row.source.id.trim()){group.incompatibleRows++;continue;}
   if(row.amount===null||row.state==='unknown'){group.unknownRows++;continue;}
   if(!compatible||!Number.isFinite(row.amount)||row.amount<0){group.incompatibleRows++;continue;}
   const subtotal=(group.knownSubtotal??0)+row.amount;
   if(!Number.isFinite(subtotal))throw Error('INTAKE_SUBTOTAL_OVERFLOW');
   group.knownSubtotal=subtotal;group.knownRows++;if(row.sourceReportedZero===true)group.zeroRows++;
  }
 }
 const overlap=nutrientKey==='vitamin_b6_mg'?recordedB6Overlap(view):null;
 return{nutrientKey,groups:Array.from(groups.values()),unavailableEvents,excludedRecords:view.undatedEvents+view.futureEvents+view.unsupportedEvents+view.conflictingEvents,overlap,
  valueKind:'recorded_source_subtotals' as const,adequacyAssessment:false as const,usualIntakeAssessment:false as const};
}

/** A bounded discovery over the already admitted current source view. Neither
 * a saved product nor a food journal timestamp establishes supplement intake.
 * No safety/clinical reference applicability or complete-day intake is inferred. */
function recordedB6Overlap(view:SourceView):RecordedB6Overlap|null{
 const members:RecordedB6Overlap['members']=[];let unknownSupplementEntries=0;
 for(const event of view.events){
  if(event.kind!=='supplement')continue;
  if(intakeCalendarDate(event.occurredAt,view.timeZone)!==view.date||Date.parse(event.occurredAt)>Date.parse(view.asOf))throw Error('INTAKE_EVENT_TIME');
  if(event.sourceStatus==='unavailable'){unknownSupplementEntries++;continue;}
  const rows=event.rows.filter(row=>row.nutrientKey==='vitamin_b6_mg');
  if(rows.length!==1){unknownSupplementEntries++;continue;}
  const row=rows[0];if(row.occurredAt!==event.occurredAt)throw Error('INTAKE_ROW_TIME');
  if(row.sourceKind!=='supplement-label'||row.state!=='label-reported'||row.unit!=='mg'||row.activityUnit!==null||row.mineralBasis!==null||!row.source.id.trim()||row.amount===null||!Number.isFinite(row.amount)){unknownSupplementEntries++;continue;}
  if(row.amount<=0)continue;
  members.push({eventKey:event.key,recordId:event.recordId,revision:event.revision,name:event.name,labelId:row.source.id,labelVersion:row.source.version,amountMg:row.amount,occurredAt:event.occurredAt});
 }
 const distinctLabels=new Set(members.map(row=>row.labelId)).size;
 if(members.length<2||distinctLabels<2)return null;
 const knownSupplementalMg=members.reduce((sum,row)=>sum+row.amountMg,0);if(!Number.isFinite(knownSupplementalMg))throw Error('INTAKE_SUBTOTAL_OVERFLOW');
 return{candidateId:'recorded-b6-label-overlap',findingType:'source-observed',evidenceClass:'source-arithmetic',referenceApplicability:'not-established',
  finding:`Vitamin B6 repeats across ${members.length} separately confirmed taken entries from ${distinctLabels} saved labels.`,
  biologicalMeaning:'Vitamin B6 is contributed more than once on this recorded day. Reviewing individual entries can miss the cumulative supplemental amount.',
  knownSupplementalMg,distinctLabels,unknownSupplementEntries,members,
  observationRefs:members.map(row=>({sourceId:row.recordId,revision:row.revision,date:row.occurredAt})),relevantUserGoalIds:[],
  evidenceRuleIds:['native-b6-mg-label-overlap-v1'],referenceContextVersion:vitaminB6ReferenceContext.version,
  applicability:'conditional',practicalNextStepId:null,priorityReason:null,releaseState:'detail-only',
  materialUnknowns:['Food and unrecorded supplements are not included; this is not complete-day or usual intake.','Personal reference applicability, prescribed use and clinical significance are not established.',...(unknownSupplementEntries?[`${unknownSupplementEntries} other recorded supplement ${unknownSupplementEntries===1?'entry has':'entries have'} no compatible known B6 amount.`]:[])],
  prohibitedClaims:['toxicity diagnosis','safe dose','complete-day total','individual nutrient adequacy','unilateral prescribed-dose change'],
  sourceEpoch:JSON.stringify([view.userId,view.date,view.timeZone,view.asOf,NUTRIENT_COVERAGE_VERSION,vitaminB6ReferenceContext.version,view.events.map(event=>[event.key,event.revision,event.occurredAt,event.rows.filter(row=>row.nutrientKey==='vitamin_b6_mg').map(row=>[row.amount,row.unit,row.state,row.source.id,row.source.version])])]),
 };
}
