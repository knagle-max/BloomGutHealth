import {catalogueExercise} from './exercise-catalogue';
import type {ExperienceRecord,ActualSets} from './experience';
import {descriptiveMuscles,exerciseMuscleCatalogVersion,exerciseMuscleAcceptance,matchCuratedExercise,exerciseAssociations,type DescriptiveMuscleId} from './exercise-muscles';
import type {LocalizedSymptom} from './localized-symptoms';
export type MuscleHistoryOptions={asOf:string;timeZone:string;days:7|14|30};
export function muscleCalendarDate(at:string,timeZone:string){const parts=new Intl.DateTimeFormat('en',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date(at));const get=(key:string)=>parts.find(p=>p.type===key)!.value;return`${get('year')}-${get('month')}-${get('day')}`;}
const addDays=(date:string,n:number)=>new Date(Date.parse(date+'T12:00:00Z')+n*86400000).toISOString().slice(0,10);
export type MuscleContribution={key:string;sourceRecordId:string;sourceRecordKind:'activity'|'session';sourceUpdatedAt:string;linkedRecordIds:string[];setId:string|null;componentId:string|null;reportedExercise:string;catalogueExerciseId:string|null;catalogueReferenceVersion:string|null;exerciseId:string;catalogVersion:string;matchBasis:'exact-recorded-name';associationStates:ReturnType<typeof exerciseAssociations>['associations'];at:string;date:string;timestampBasis:'reported-start'|'reported-day';side:'left'|'right'|'both'|'unspecified';reps:number|null;loadKg:number|null;externalVolumeKgReps:number|null;primary:readonly DescriptiveMuscleId[];secondary:readonly DescriptiveMuscleId[];stabilizers:readonly DescriptiveMuscleId[]};
/** Account ownership is enforced by the canonical collector/API. Pure, uncached
 * projection never mutates source records, matches approximate exercise names,
 * converts missing load into zero or interprets symptoms as clinical outcomes. */
export function buildMuscleHistory(records:readonly ExperienceRecord[],options:MuscleHistoryOptions){
 const {asOf,timeZone,days}=options;const now=Date.parse(asOf);if(!Number.isFinite(now)||![7,14,30].includes(days))throw Error('Choose a valid history window');const to=muscleCalendarDate(asOf,timeZone),from=addDays(to,1-days);
 const eligibleDate=(date:string)=>date>=from&&date<=to;
 const byId=new Map<string,ExperienceRecord>();for(const row of records){const old=byId.get(row.id);if(!old||Date.parse(row.updatedAt)>Date.parse(old.updatedAt))byId.set(row.id,row);}
 const candidates:MuscleContribution[]=[],unmapped:{recordId:string;setId:string|null;exercise:string}[]=[],excluded:{recordId:string;reason:string;sets:number}[]=[];
 function sets(record:ExperienceRecord,items:ActualSets['sets'],at:string,componentId:string|null,day?:string){
  const date=day??muscleCalendarDate(at,timeZone);if(Date.parse(at)>now||!eligibleDate(date)){excluded.push({recordId:record.id,reason:Date.parse(at)>now?'future':'outside-window',sets:items.length});return;}
  for(const[index,set]of Array.from(items.entries())){
   if(!set.completed||set.state==='planned'||set.state==='cancelled'){excluded.push({recordId:record.id,reason:'completion-not-confirmed',sets:1});continue;}
   const canonical=set.catalogueRef?.confirmed?catalogueExercise(set.catalogueRef.id):null;
   const match=matchCuratedExercise(canonical?.name??set.exercise);if(!match){unmapped.push({recordId:record.id,setId:set.id??null,exercise:set.exercise});continue;}
   if(candidates.length>=20000)throw Error('MUSCLE_HISTORY_WINDOW_TOO_LARGE');
   const resolved=exerciseAssociations(match,canonical?.id??null);
   const volume=set.reps!==null&&set.loadKg!==null?set.reps*set.loadKg:null;
   candidates.push({key:set.id?'set:'+set.id.toLowerCase():`legacy:${record.id}:${componentId??'parent'}:${index}`,sourceRecordId:record.id,sourceRecordKind:record.kind as 'activity'|'session',sourceUpdatedAt:record.updatedAt,linkedRecordIds:[record.id],setId:set.id??null,componentId,reportedExercise:set.exercise,catalogueExerciseId:set.catalogueRef?.id??null,catalogueReferenceVersion:set.catalogueRef?.version??null,exerciseId:match.id,catalogVersion:exerciseMuscleCatalogVersion,matchBasis:'exact-recorded-name',at,date,timestampBasis:day?'reported-day':'reported-start',side:set.side??'unspecified',reps:set.reps,loadKg:set.loadKg,externalVolumeKgReps:volume,associationStates:resolved.associations,primary:resolved.primary,secondary:resolved.secondary,stabilizers:resolved.stabilizers});
  }
 }
 for(const record of Array.from(byId.values())){
  if(record.kind==='activity'){
   const p=record.payload,day=p.routineSource?.timestampBasis==='log-time'?p.routineSource.localDate:undefined;
   if(p.components)for(const part of p.components.items)sets(record,part.actualSets?.sets??[],p.startedAt,part.id,day);
   else sets(record,p.actualSets?.sets??[],p.startedAt,null,day);
  }else if(record.kind==='session'){
   if(record.payload.status!=='completed'){excluded.push({recordId:record.id,reason:'session-not-completed',sets:record.payload.actualSets?.sets.length??0});continue;}
   sets(record,record.payload.actualSets?.sets??[],record.payload.startsAt,null);
  }
 }
 // Stable shared child identity is evidence of a shared set; a similar label or
 // timestamp is not. Conflicting values under one identity stay unresolved.
 const unique=new Map<string,MuscleContribution>(),conflicts=new Set<string>();
 for(const row of candidates.sort((a,b)=>Number(a.sourceRecordKind==='session')-Number(b.sourceRecordKind==='session')||a.sourceRecordId.localeCompare(b.sourceRecordId))){const old=unique.get(row.key);if(!old){unique.set(row.key,row);continue;}
  const basis=(c:MuscleContribution)=>JSON.stringify([c.exerciseId,c.date,c.side,c.reps,c.loadKg]);
  if(basis(old)!==basis(row)){conflicts.add(row.key);continue;}
  old.linkedRecordIds=Array.from(new Set([...old.linkedRecordIds,...row.linkedRecordIds])).sort();
 }
 for(const key of Array.from(conflicts))unique.delete(key);
 const contributions=Array.from(unique.values()).sort((a,b)=>a.at.localeCompare(b.at)||a.key.localeCompare(b.key));
 const potentialDuplication:{date:string;exerciseId:string;recordIds:string[]}[]=[];
 const overlap=new Map<string,MuscleContribution[]>();for(const c of contributions){const key=c.date+'|'+c.exerciseId;overlap.set(key,[...(overlap.get(key)??[]),c]);}
 for(const rows of Array.from(overlap.values())){if(new Set(rows.map(r=>r.sourceRecordKind)).size>1)potentialDuplication.push({date:rows[0].date,exerciseId:rows[0].exerciseId,recordIds:Array.from(new Set(rows.flatMap(r=>r.linkedRecordIds)))});}
 const muscles=(Object.keys(descriptiveMuscles)as DescriptiveMuscleId[]).map(id=>{
  const direct=contributions.filter(c=>c.primary.includes(id)),secondary=contributions.filter(c=>c.secondary.includes(id)),associated=Array.from(new Map([...direct,...secondary].map(c=>[c.key,c])).values());const known=associated.filter(c=>c.externalVolumeKgReps!==null),dates=Array.from(new Set(associated.map(c=>c.date))).sort();const last=dates.at(-1)??null;
  return{id,label:descriptiveMuscles[id].label,reference:descriptiveMuscles[id].reference,directSetRecords:direct.length,secondarySetRecords:secondary.length,reviewedSetRecords:associated.filter(c=>c.associationStates.some(a=>a.muscle===id&&a.role!=='stabilizers'&&a.state==='reviewed')).length,preliminarySetRecords:associated.filter(c=>c.associationStates.some(a=>a.muscle===id&&a.role!=='stabilizers'&&a.state==='preliminary')).length,stabilizerSetRecords:contributions.filter(c=>c.stabilizers.includes(id)).length,recordedTrainingDays:dates.length,lastRecordedDate:last,calendarDaysSinceLastRecorded:last?Math.round((Date.parse(to+'T12:00:00Z')-Date.parse(last+'T12:00:00Z'))/86400000):null,knownExternalVolumeKgReps:known.length?known.reduce((sum,c)=>sum+c.externalVolumeKgReps!,0):null,volumeCoverage:known.length===associated.length&&known.length>0?'complete' as const:known.length?'partial' as const:'unknown' as const,missingVolumeRecords:associated.length-known.length,contributionKeys:associated.map(c=>c.key)};
 });
 const symptoms=Array.from(byId.values()).flatMap(row=>row.kind==='localized-symptom'&&Date.parse(row.payload.observedAt)<=now&&eligibleDate(muscleCalendarDate(row.payload.observedAt,timeZone))?[{id:row.id,updatedAt:row.updatedAt,payload:row.payload as LocalizedSymptom}]:[]).sort((a,b)=>a.payload.observedAt.localeCompare(b.payload.observedAt));
 const comparison=Array.from({length:days},(_,index)=>{const date=addDays(from,index);return{date,completedSetRecordKeys:contributions.filter(c=>c.date===date).map(c=>c.key),symptomRecordIds:symptoms.filter(s=>muscleCalendarDate(s.payload.observedAt,timeZone)===date).map(s=>s.id)};});
 return{version:1 as const,catalogVersion:exerciseMuscleCatalogVersion,acceptance:exerciseMuscleAcceptance,asOf,timeZone,from,to,days,muscles,contributions,symptoms,comparison,unmapped,excluded,conflictingSharedSetIds:Array.from(conflicts),potentialDuplication,coverageCaveat:'Recorded observations only. Missing logs are not no activity or no symptoms. Muscle associations are curated exercise roles, not measured activation. Do not sum muscle counts/volumes as unique whole-workout totals. Similar activity/session logs may be duplicates; no causal or recovery conclusion is made.'};
}
export type MuscleHistory=ReturnType<typeof buildMuscleHistory>;
