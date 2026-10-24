import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {analyzeReportedComposition} from '../server/report-analysis';

test('reported composition summarizes original values locally, saves no inferred biology or fictitious compared cohorts and never contacts a processing service',async()=>{
 const writes:any[]=[],analyses:any[]=[],bacteria:any[]=[];let sidecarCalls=0;
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-user')} as any;next();});
 app.post('/api/ml/analyze',(_req,res)=>{sidecarCalls++;res.json({privateSentinel:'unvalidated-legacy-health-score'});});
 const store={getMicrobiomeSample:async(id:string)=>({id,userId:'owner',structuredData:{bacteria_percentages:{Roseburia:0,'Reported taxon':25}}}),updateMicrobiomeSample:async(id:string,update:any)=>{writes.push({id,...update});},insertMlAnalysis:async(row:any)=>{analyses.push(row);return 'synthetic-analysis';},getBacterialComposition:async()=>[{bacterialName:'Roseburia'}],insertBacterialComposition:async(row:any)=>{bacteria.push(row);}};
 app.post('/api/microbiome/analyze/:sampleId',analyzeReportedComposition(store as any));
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.on('listening',resolve));
 const base=`http://127.0.0.1:${(server.address() as any).port}`;
 const previous=process.env.ML_SERVICE_URL;process.env.ML_SERVICE_URL=base;
 try{
  const response=await fetch(base+'/api/microbiome/analyze/source',{method:'POST',headers:{'x-user':'owner','content-type':'application/json'},body:JSON.stringify({userId:'other',cohortsToCompare:['centenarians','elite_athletes'],raw_data:{bacteria_percentages:{Fake:100}}})});
  assert.equal(response.status,200);const body=await response.json();
  assert.equal(body.results.model_version,'reported-abundance-v3');assert.equal(body.results.confidence,null);
  assert.equal(body.results.bacterial_composition[0].abundance,0);assert.equal(body.results.bacterial_composition[1].abundance,25);
  assert.deepEqual(body.results.metabolites,[]);assert.deepEqual(body.results.recommendations,[]);assert.deepEqual(body.results.cohort_comparisons,{});
  assert.deepEqual(analyses[0].comparedCohorts,[]);assert.equal(analyses[0].analysisType,'reported-composition');assert.equal(analyses[0].confidence,null);
  assert.equal(bacteria.length,1);assert.equal(bacteria[0].genomeData,null);assert.equal(bacteria[0].abundance,25);
  assert.equal(writes.at(-1).processingStatus,'completed');assert.equal(writes.at(-1).diversityIndex,0);
  assert.equal(sidecarCalls,0);assert.doesNotMatch(JSON.stringify(body),/unvalidated-legacy-health-score|Fake|centenarians|elite_athletes/);
 }finally{if(previous===undefined)delete process.env.ML_SERVICE_URL;else process.env.ML_SERVICE_URL=previous;server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});

test('local report summary denies missing identity, foreign/missing samples and nonquantitative reports before mutation; failures stay private',async()=>{
 let writes=0,fail=false;const updates:any[]=[];
 const store={getMicrobiomeSample:async(id:string)=>id==='missing'?undefined:({id,userId:id==='foreign'?'other':'owner',structuredData:id==='functional'?{scores:[{score:80}]}:{bacteria_percentages:{Roseburia:0}}}),updateMicrobiomeSample:async(_id:string,row:any)=>{writes++;updates.push(row);},insertMlAnalysis:async()=>{if(fail)throw Error('private database/health sentinel');return 'id';},getBacterialComposition:async()=>[],insertBacterialComposition:async()=>{}};
 const app=express();app.use((req,_res,next)=>{req.session={userId:req.get('x-user')} as any;next();});app.post('/api/microbiome/analyze/:sampleId',analyzeReportedComposition(store as any));
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.on('listening',resolve));const base=`http://127.0.0.1:${(server.address() as any).port}`;
 try{
  for(const [id,user,status] of [['source','',401],['missing','owner',404],['foreign','owner',403],['functional','owner',422]] as const){const response=await fetch(base+'/api/microbiome/analyze/'+id,{method:'POST',headers:user?{'x-user':user}:{}});assert.equal(response.status,status);}
  assert.equal(writes,0);fail=true;
  const response=await fetch(base+'/api/microbiome/analyze/source',{method:'POST',headers:{'x-user':'owner'}});assert.equal(response.status,503);assert.doesNotMatch(await response.text(),/private database|health sentinel/);assert.equal(updates.at(-1).processingStatus,'failed');
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
