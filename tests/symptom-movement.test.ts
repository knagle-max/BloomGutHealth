import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {movementProgressionSafety} from '../shared/symptom-movement';
import {localizedSymptomSchema,symptomRegionSource,symptomRegionChoices} from '../shared/localized-symptoms';
import {exerciseCatalogue,exerciseCatalogueVersion} from '../shared/exercise-catalogue';
import type {ExperienceRecord} from '../shared/experience';
const exercise={id:exerciseCatalogue.find(e=>e.name==='Barbell bench press')!.id,version:exerciseCatalogueVersion,match:'selected' as const,confirmed:true};
const asOf='2026-11-28T12:00:00Z';
function record(patch:any={}):ExperienceRecord{return{kind:'localized-symptom',id:'synthetic-observation',createdAt:'2026-11-28T10:00:00Z',updatedAt:'2026-11-28T10:00:00Z',payload:localizedSymptomSchema.parse({version:1,lifecycleId:randomUUID(),revision:randomUUID(),previousRevision:null,type:'pain',location:{source:symptomRegionSource,view:'front',regionId:symptomRegionChoices.front[0].id,laterality:'unspecified'},observedAt:'2026-11-28T10:00:00Z',timeZone:'UTC',onsetAt:null,severity:null,durationMinutes:null,ongoing:null,notes:'Synthetic observation',source:'user-reported',...patch})};}
const movement={exercise,label:'Barbell bench press',response:'worse',confirmedByUser:true};
const evaluate=(records:ExperienceRecord[],available=true)=>movementProgressionSafety(exercise,{ownerId:'synthetic-a',available,records},{actorId:'synthetic-a',asOf});
test('only explicit owned currently relevant worsening holds the selected movement; body location and intensity alone do not',()=>{
 assert.equal(evaluate([record({severity:10})]).state,'NO_REPORTED_HOLD');assert.equal(evaluate([record({movement})]).state,'SAFETY_HOLD');
 const other={...exercise,id:exerciseCatalogue.find(e=>e.name!== 'Barbell bench press')!.id};assert.equal(evaluate([record({movement:{...movement,exercise:other}})]).state,'NO_REPORTED_HOLD');
});
test('correction, unlink and deletion withdraw only their source hold; response and ongoing missingness stay explicit',()=>{
 const worse=record({movement}),better={...worse,updatedAt:'2026-11-28T11:00:00Z',payload:{...worse.payload,movement:{...movement,response:'better' as const}}}as ExperienceRecord;
 assert.equal(evaluate([worse,better]).state,'NO_REPORTED_HOLD');assert.equal(evaluate([better,worse]).state,'NO_REPORTED_HOLD');assert.equal(evaluate([]).state,'NO_REPORTED_HOLD');
 assert.equal(evaluate([record({movement:null})]).state,'NO_REPORTED_HOLD');
 for(const response of ['better','unchanged','unsure'])assert.equal(evaluate([record({movement:{...movement,response}})]).state,'NO_REPORTED_HOLD');
 assert.equal(evaluate([record({movement,ongoing:false})]).state,'NO_REPORTED_HOLD');
 assert.equal(evaluate([record({movement,severity:0})]).state,'SAFETY_HOLD','Explicit worsening, not intensity, supplies the hold');
});
test('source window, future records, explicit ongoing reports and account/source failure never become a health clearance',()=>{
 assert.equal(evaluate([record({movement,observedAt:'2026-10-01T10:00:00Z'})]).state,'NO_REPORTED_HOLD');
 assert.equal(evaluate([record({movement,ongoing:true,observedAt:'2026-10-01T10:00:00Z'})]).state,'SAFETY_HOLD');
 assert.equal(evaluate([record({movement,observedAt:'2026-11-29T10:00:00Z'})]).state,'NO_REPORTED_HOLD');
 assert.equal(evaluate([record({movement})],false).state,'SOURCE_UNAVAILABLE');
 assert.throws(()=>movementProgressionSafety(exercise,{ownerId:'b',available:true,records:[]},{actorId:'a',asOf}),/SCOPE/);
 assert.throws(()=>evaluate([{...record({movement}),userId:'foreign'}as ExperienceRecord]),/SCOPE/);
 assert.match(evaluate([]).qualification,/not medical clearance/);
});
test('ambiguous matching revisions withhold affected suggestions independent of input order, without inventing missing linkage',()=>{
 const worse=record({movement}),unlink={...worse,payload:{...worse.payload,movement:null}}as ExperienceRecord;
 assert.equal(evaluate([worse,unlink]).state,'SOURCE_UNAVAILABLE');assert.equal(evaluate([unlink,worse]).state,'SOURCE_UNAVAILABLE');
 assert.equal(evaluate([{...worse,updatedAt:'unknown'}]).state,'SOURCE_UNAVAILABLE');
 assert.equal(evaluate([record({movement:{...movement,exercise:{...exercise,version:'different-version'}}})]).state,'NO_REPORTED_HOLD');
 assert.equal(localizedSymptomSchema.safeParse({...worse.payload,movement:{...movement,confirmedByUser:false}}).success,false);
 assert.equal(localizedSymptomSchema.safeParse({...worse.payload,movement:{...movement,exercise:{...exercise,confirmed:false}}}).success,false);
});
