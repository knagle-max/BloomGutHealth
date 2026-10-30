import test from 'node:test';
import assert from 'node:assert/strict';
import {describeActivity,describeActivityParts,activityProjection,activityAmountText,confirmDraftLoadUnit,unresolvedActivityLoads,defaultActivityLoadUnits,canonicalActivityParts} from '../shared/activity-capture';
import {activitySchema,activityComponentsSchema} from '../shared/experience';

test('local activity review parses only explicit bounded reported amounts; ambiguous choices and unknown metrics remain missing',()=>{
 assert.equal(describeActivity('  Walked 35 minutes  ').capture.description,'  Walked 35 minutes  ');
 const walk=describeActivity('Walked 35 minutes');assert.equal(walk.capture.activityId,'walk');assert.equal(walk.minutes,35);assert.equal(walk.distanceM,null);
 const run=describeActivity('Ran 5km in 30 min');assert.equal(run.distanceM,5000);assert.equal(run.minutes,30);assert.equal(run.capture.description,'Ran 5km in 30 min');
 for(const text of ['Played ball','Walked -35 minutes','Walked 90000 min','Walked 30 min and ran 15 min'])assert.equal(describeActivity(text).minutes,null,text);
 assert.equal(describeActivity('Played ball').capture.interpretation,'unclassified');
 const strength=describeActivity('3 sets of 8 bench press at 60 kg');assert.equal(strength.minutes,null);assert.equal(strength.actualSets?.sets.length,3);assert.equal(strength.actualSets?.sets[0].loadKg,60);assert.equal(strength.actualSets?.sets[0].completed,false);
 assert.equal(describeActivity('3 x 8 bench at 60 kg').capture.activityId,'strength');assert.equal(describeActivity('3 x 8 bench at 60 kg').actualSets?.sets[0].exercise,'bench');
 assert.deepEqual(describeActivity('3000 sets of 8 bench press at 60 kg').actualSets?.sets,[]);
 const activity=activitySchema.parse({title:strength.title,startedAt:'2026-10-30T12:00:00Z',minutes:null,actualSets:strength.actualSets,capture:strength.capture});assert.equal(activity.effort,null);assert.equal('calories' in activity,false);assert.equal('heartRate' in activity,false);assert.equal(activityAmountText(activity),'Duration not recorded');assert.equal(activityAmountText({...activity,distanceM:0}),'Duration not recorded · 0 km reported');
 assert.equal(activitySchema.safeParse({...activity,capture:{...activity.capture,clinicalReadiness:100}}).success,false);
});

test('v1.2 compound review keeps parents, individual set identities, unknown duration and distinct known summary dimensions',()=>{
 let sequence=0;const id=()=>`fb001030-1030-4030-8030-${String(++sequence).padStart(12,'0')}`;
 const source='Walked 30 minutes, then did 3 sets of bench press at 60 kg for 8 reps';
 const parts=describeActivityParts(source,id);assert.equal(parts.length,2);assert.equal(parts[0].minutes,30);assert.equal(parts[1].minutes,null);assert.equal(parts[1].title,'Bench press');assert.equal(parts[1].actualSets?.sets.length,3);
 const original=structuredClone(parts),sets=parts[1].actualSets!.sets;
 sets[1]={...sets[1],reps:6,loadKg:55};
 assert.deepEqual(parts[0],original[0]);assert.deepEqual(sets.map(set=>[set.reps,set.loadKg]),[[8,60],[6,55],[8,60]]);assert.equal(sets[1].id,original[1].actualSets!.sets[1].id);
 const projection=activityProjection(parts);assert.equal(projection.minutes,30);assert.equal(projection.actualSets.sets.reduce((n,set)=>n+set.reps!,0),22);assert.match(activityAmountText({...projection,components:{version:1,items:parts}}),/1 duration\(s\) unrecorded/);
 assert.equal(sets.every(set=>!set.completed),true);assert.equal(new Set(parts.flatMap(part=>[part.id,...(part.actualSets?.sets.map(set=>set.id)||[])])).size,5);
 const thirdId=sets[2].id;sets.splice(0,1);assert.equal(sets[1].id,thirdId);assert.equal(activityComponentsSchema.safeParse({version:1,items:parts}).success,true);
 const duplicate=structuredClone(parts);duplicate[1].actualSets!.sets[1].id=duplicate[1].actualSets!.sets[0].id;assert.equal(activityComponentsSchema.safeParse({version:1,items:duplicate}).success,false);
 const planned=structuredClone(parts);planned[1].actualSets!.sets[0].state='planned';planned[1].actualSets!.sets[0].completed=true;assert.equal(activityComponentsSchema.safeParse({version:1,items:planned}).success,false);
 const partial=structuredClone(parts);partial[1].actualSets!.sets[0].reps=null;partial[1].actualSets!.sets[0].loadKg=null;assert.equal(activityComponentsSchema.safeParse({version:1,items:partial}).success,true);
});

test('owner v1.3 five-set pounds list preserves order, repeated loads, unknown run duration and independent stable rows',()=>{
 const source='Ran then did 5 sets of 10 reps of bench press for 50,50,50,55,55 lbs';
 const parts=describeActivityParts(source);assert.equal(parts.length,2);assert.equal(parts[0].title,'Running');assert.equal(parts[0].minutes,null);assert.equal(parts[0].distanceM,null);
 const bench=parts[1],sets=bench.actualSets!.sets;assert.equal(bench.title,'Bench press');assert.equal(sets.length,5);assert.deepEqual(sets.map(set=>set.reps),[10,10,10,10,10]);assert.deepEqual(sets.map(set=>set.loadUnit),['lb','lb','lb','lb','lb']);
 assert.deepEqual(sets.map(set=>Number((set.loadKg!/0.45359237).toFixed(3))),[50,50,50,55,55]);assert.ok(sets.every(set=>!set.completed));assert.equal(new Set(sets.map(set=>set.id)).size,5);
 const saved=activitySchema.parse({startedAt:'2026-10-30T12:00:00Z',capture:{version:1,method:'describe',description:source,activityId:'other',interpretation:'rule-suggestion'},components:{version:1,items:parts},...activityProjection(parts)});
 const original=structuredClone(saved);saved.components!.items[1].actualSets!.sets[3]={...sets[3],reps:9,loadKg:60*0.45359237};
 const reloaded=activitySchema.parse(JSON.parse(JSON.stringify({...saved,...activityProjection(saved.components!.items)})));assert.equal(reloaded.minutes,null);assert.equal(reloaded.capture!.description,source);assert.equal(reloaded.components!.items[1].actualSets!.sets[3].id,sets[3].id);assert.equal(reloaded.components!.items[1].actualSets!.sets[3].reps,9);
 for(const index of [0,1,2,4])assert.deepEqual(reloaded.components!.items[1].actualSets!.sets[index],original.components!.items[1].actualSets!.sets[index]);
 for(const text of ['5 sets of 10 reps of bench press for 50,50,55 lbs','5 sets of 10 reps of bench press for 50,50,50,55,55,60 lbs','5 sets of 10 reps of bench press for -50,50,50,55,55 lbs','5 sets of 10 reps of bench press for 50,,50,55,55 lbs','5 sets of 10 reps of bench press for 50,50,50,55,99999 lbs','five sets of bench press']){
  const result=describeActivityParts(text)[0];assert.equal(result.title,'Bench press',text);assert.equal(result.match,'unclassified');assert.deepEqual(result.actualSets!.sets,[]);
 }
 const uniform=describeActivityParts('5 sets of 10 reps of bench press at 50 lb')[0];assert.equal(uniform.actualSets!.sets.length,5);assert.equal(uniform.actualSets!.sets[4].loadUnit,'lb');
});

test('unitless parenthesized loads stay visible draft facts until explicitly resolved, never assumed kg or lb',()=>{
 const text='Ran 45 min then did 5 sets of 10 reps of bench press (50,50,55,55,60)',parts=describeActivityParts(text);
 assert.equal(parts[0].title,'Running');assert.equal(parts[0].minutes,45);assert.equal(parts[1].title,'Bench press');const sets=parts[1].actualSets!.sets;
 assert.equal(sets.length,5);assert.deepEqual(sets.map(set=>set.reps),[10,10,10,10,10]);assert.deepEqual(sets.map(set=>set.unconfirmedLoad),[50,50,55,55,60]);assert.ok(sets.every(set=>set.loadKg===null&&set.loadUnit===undefined&&!set.completed));assert.equal(parts[1].minutes,null);assert.equal(unresolvedActivityLoads(parts),5);
 const payload=()=>({...activityProjection(parts),components:{version:1,items:parts},startedAt:'2026-10-30T12:00:00Z'});
 assert.equal(activitySchema.safeParse(payload()).success,false,'Strict canonical API schema cannot save unresolved draft quantities');
 const ids=sets.map(set=>set.id);sets[3]={...sets[3],reps:9,unconfirmedLoad:60};sets[0]=confirmDraftLoadUnit(sets[0],'kg');assert.equal(sets[0].loadKg,50);assert.equal(unresolvedActivityLoads(parts),4);assert.equal('unconfirmedLoad' in sets[0],false);
 parts[1].actualSets!.sets=sets.map(set=>set.unconfirmedLoad!==undefined?confirmDraftLoadUnit(set,'lb'):set);
 const saved=activitySchema.parse(payload()),reloaded=activitySchema.parse(JSON.parse(JSON.stringify(saved))),actual=reloaded.components!.items[1].actualSets!.sets;
 assert.equal(unresolvedActivityLoads(parts),0);assert.deepEqual(actual.map(set=>set.id),ids);assert.deepEqual(actual.map(set=>set.reps),[10,10,10,9,10]);assert.equal(actual[0].loadKg,50);assert.equal(actual[0].loadUnit,'kg');assert.deepEqual(actual.slice(1).map(set=>Number((set.loadKg!/0.45359237).toFixed(3))),[50,55,60,60]);assert.ok(actual.every(set=>!set.completed));assert.equal(reloaded.minutes,45);
 const zero=describeActivityParts('1 set of 0 reps of bench press (0)')[0].actualSets!.sets[0];assert.equal(zero.unconfirmedLoad,0);assert.equal(confirmDraftLoadUnit(zero,'lb').loadKg,0);
 for(const phrase of ['5 sets of 10 reps of bench press (50,50,55)','5 sets of 10 reps of bench press (50)','5 sets of 10 reps of bench press (50,-50,55,55,60)'])assert.deepEqual(describeActivityParts(phrase)[0].actualSets!.sets,[]);
 const explicit=describeActivityParts('2 sets of 10 reps of bench press (50,55) lbs')[0].actualSets!.sets;assert.equal(explicit[1].loadUnit,'lb');assert.equal(explicit[1].unconfirmedLoad,undefined);
});

test('body-weight unit is an editable default; correcting its unit reinterprets reported numbers without changing sibling overrides',()=>{
 const original=describeActivityParts('Ran 45 min then did 5 sets of 10 reps of bench press (50,50,55,55,60)');
 for(const unit of ['kg','lb'] as const){const draft=defaultActivityLoadUnits(structuredClone(original),unit),sets=draft[1].actualSets!.sets;assert.equal(unresolvedActivityLoads(draft),0);assert.ok(sets.every(set=>set.defaultedLoadUnit&&set.loadUnit===unit));assert.deepEqual(sets.map(set=>set.unconfirmedLoad),[50,50,55,55,60]);sets[3]={...sets[3],reps:9,unconfirmedLoad:60};sets[0]=confirmDraftLoadUnit(sets[0],unit==='kg'?'lb':'kg');assert.equal(sets[0].loadKg,unit==='kg'?50*0.45359237:50);assert.equal(sets[1].loadUnit,unit);
 const canonical=canonicalActivityParts(draft),saved=activitySchema.parse({...activityProjection(canonical),components:{version:1,items:canonical},startedAt:'2026-10-30T12:00:00Z'});assert.equal(saved.minutes,45);assert.deepEqual(saved.components!.items[1].actualSets!.sets.map(set=>set.id),original[1].actualSets!.sets.map(set=>set.id));assert.equal(saved.components!.items[1].actualSets!.sets[3].loadKg,unit==='kg'?60:60*0.45359237);assert.equal(JSON.stringify(saved).includes('defaultedLoadUnit'),false);assert.equal(JSON.stringify(saved).includes('unconfirmedLoad'),false);assert.strictEqual(defaultActivityLoadUnits(draft,unit==='kg'?'lb':'kg'),draft,'Later preference refresh does not silently overwrite a visible draft');}
 assert.throws(()=>canonicalActivityParts(original),/Resolve reported load units/);assert.equal(unresolvedActivityLoads(original),5);
 const explicit=describeActivityParts('1 set of 10 reps of bench press for 50 lb');assert.strictEqual(defaultActivityLoadUnits(explicit,'kg'),explicit);assert.equal(explicit[0].actualSets!.sets[0].loadUnit,'lb');
});
