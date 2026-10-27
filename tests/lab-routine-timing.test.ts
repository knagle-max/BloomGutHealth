import test from 'node:test';
import assert from 'node:assert/strict';
import {labRoutineTiming} from '../shared/lab-routine-timing';
const trial={mode:'everyday',title:'Regular breakfast',startsOn:'2026-10-10',endsOn:'2026-10-20',action:'Eat a familiar breakfast',outcome:'Self-reported energy',status:'planned',design:{baselineStartsOn:'2026-10-01',baselineEndsOn:'2026-10-07',metricUnit:'rating',measurementMethod:'Same daily scale',expectedDirection:'observe',confoundersToTrack:'Sleep and illness'}};
const point=(id:string,date:string,extra:any={})=>({id,date,value:0,sourceValue:0,unit:'mmol/L',sourceUnit:'mmol/L',sourceReport:{importId:'00000000-0000-4000-8000-000000000001',enteredDate:date.slice(0,10)},...extra});
test('trial timing uses entered/corrected calendar context, includes boundaries, preserves unknown precision and never computes effects',()=>{
 const points=[point('before','2026-09-30T00:00:00Z'),point('baseline','2026-10-01T00:00:00Z'),point('baseline-end','2026-10-07T00:00:00Z'),point('between','2026-10-09T00:00:00Z'),point('start','2026-10-10T00:00:00Z'),point('end','2026-10-20T00:00:00Z'),point('after','2026-10-21T00:00:00Z'),point('unknown','2026-10-12T00:00:00Z',{sourceReport:undefined}),point('corrected','2026-10-11T06:00:00Z',{dateCorrection:{enteredDate:'2026-10-07'}}),point('offset','2026-10-10T02:00:00Z',{sourceReport:{enteredDate:'2026-10-09'}}),point('invalid','2026-10-12T00:00:00Z',{sourceReport:{enteredDate:'2026-02-30'}})];
 const trends=[{name:'Glucose',points,comparable:false,change:null,note:'Different assay methods'}]as any;
 const result=labRoutineTiming(trial,trends)!;const phase=(id:string)=>result.rows.find(row=>row.id===id)!.phase;
 assert.equal(phase('before'),'before');for(const id of ['baseline','baseline-end','corrected'])assert.equal(phase(id),'baseline');for(const id of ['start','end'])assert.equal(phase(id),'trial');for(const id of ['between','offset'])assert.equal(phase(id),'between');assert.equal(phase('after'),'after');for(const id of ['unknown','invalid'])assert.equal(phase(id),'unknown');assert.equal(result.rows.find(r=>r.id==='corrected')!.dateLabel,'2026-10-07');
 assert.equal(result.trial.status,'planned','Calendar placement must not turn a planned trial into completion');assert.equal('change' in result,false);assert.equal('effect' in result,false);assert.equal(trends[0].points[0].value,0);assert.equal(trends[0].comparable,false);
 assert.equal(labRoutineTiming({...trial,endsOn:'2026-10-01'},trends),null);assert.equal(labRoutineTiming({...trial,benefit:100},trends),null);assert.deepEqual(labRoutineTiming(trial,[])!.rows,[]);
 const unstructured=labRoutineTiming({...trial,design:null},trends)!;assert.equal(unstructured.rows.find(row=>row.id==='baseline')!.phase,'before');
 assert.equal(labRoutineTiming(trial,[...trends,...trends])!.rows.length,points.length,'Repeated references do not duplicate an observation');
});
