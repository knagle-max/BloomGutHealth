import type {z} from 'zod';
import {nutrientDefinitionDetails} from './nutrient-definitions';
import type {recordedIntakeViewSchema,IntakeSourceRow} from './recorded-intake-sources';

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
 const definition=nutrientDefinitionDetails().find(item=>item.key===nutrientKey);
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
    (generic?(row.chemicalForm===definition.chemicalForm&&row.activityUnit===definition.activityUnit):
     !formSensitive.has(nutrientKey)&&(!minerals.has(nutrientKey)||row.mineralBasis==='elemental-label'));
   if(row.unit!==definition.amountUnit||row.state==='conflicting'||!row.source.id.trim()){group.incompatibleRows++;continue;}
   if(row.amount===null||row.state==='unknown'){group.unknownRows++;continue;}
   if(!compatible||!Number.isFinite(row.amount)||row.amount<0){group.incompatibleRows++;continue;}
   const subtotal=(group.knownSubtotal??0)+row.amount;
   if(!Number.isFinite(subtotal))throw Error('INTAKE_SUBTOTAL_OVERFLOW');
   group.knownSubtotal=subtotal;group.knownRows++;if(row.sourceReportedZero===true)group.zeroRows++;
  }
 }
 return{nutrientKey,groups:Array.from(groups.values()),unavailableEvents,excludedRecords:view.undatedEvents+view.futureEvents+view.unsupportedEvents+view.conflictingEvents,
  valueKind:'recorded_source_subtotals' as const,adequacyAssessment:false as const,usualIntakeAssessment:false as const};
}
