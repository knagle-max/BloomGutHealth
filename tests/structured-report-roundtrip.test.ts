import test from 'node:test';import assert from 'node:assert/strict';
import{parseStructuredReport,parseReportDocument}from'../shared/structured-report';
const source={testing_company:'Synthetic source lab',data_origin:'Synthetic fixture — not independently verified',test_period:'2026-10-01',score_interpretation_warning:'Provider-defined scale; no personal health grade',scores:[{name:'Source score',score:0,scale:'0–100',status:'Source category'},{name:'Qualitative source score',score:'Not available',status:'Unverified'}],organisms:[{name:'Methanobrevibacter smithii',abundance:{value:8,unit:'reads'},status:'Source lists organism',notes:'Original source note'},{name:'Unknown organism',abundance:null,status:'Not detected'}],missing_data:['Assay method not supplied']};
test('Bloom normalized report round-trip preserves exact source fields without growing provenance or promoting capabilities',()=>{
 const first=parseStructuredReport(source),second=parseReportDocument(JSON.stringify(first),'json').parsed;
 assert.deepEqual(second.organisms,first.organisms);assert.deepEqual(second.scores,first.scores);assert.deepEqual(second,first);
 const third=parseStructuredReport(JSON.parse(JSON.stringify(second)));assert.deepEqual(third,first);assert.equal(JSON.stringify(third).length,JSON.stringify(first).length);
 const forged=parseStructuredReport({...first,capabilities:{...first.capabilities,quantitativeAbundance:true,measuredMetabolites:true,measuredGenes:true}});assert.equal(forged.capabilities.quantitativeAbundance,false);assert.equal(forged.capabilities.measuredMetabolites,false);assert.equal(forged.capabilities.measuredGenes,false);assert.equal(forged.organisms[0].reportedAbundance,'8 reads');
});
test('canonical zero percentages remain distinct from absent quantities; canonical imports retain normal source bounds',()=>{
 const first=parseStructuredReport({bacteria_percentages:{'Source organism':0}});assert.deepEqual(parseStructuredReport(JSON.parse(JSON.stringify(first))),first);
 const functional=parseStructuredReport(source);assert.throws(()=>parseStructuredReport({...functional,bacteria_percentages:{'Source organism':'Detected'}}));assert.throws(()=>parseStructuredReport({...functional,scores:[{...functional.scores[0],score:101}]}));assert.throws(()=>parseStructuredReport({...functional,organisms:[{name:'Source organism',reportedAbundance:{value:'not numeric'}}]}));
});

test('actual report import preserves normalized observations and source under the authenticated owner',async()=>{
 const express=(await import('express')).default;const{registerReportRoutes}=await import('../server/report-routes');
 const samples:any[]=[],children:any[]=[];
 const store:any={insertMicrobiomeSample:async(data:any)=>{const row={id:'source-'+samples.length,...data};samples.push(row);return row;},updateMicrobiomeSample:async(id:string,updates:any)=>Object.assign(samples.find(row=>row.id===id),updates),insertBacterialComposition:async(row:any)=>children.push(row),insertMlAnalysis:async(row:any)=>{assert.equal(row.modelVersion,'structured-report-v2');assert.equal(row.confidence,null);assert.equal(row.results.measuredGenes,false);assert.equal(row.results.measuredMetabolites,false);return row;}};
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:req.get('x-test-user')}as any;next();});registerReportRoutes(app,(req,res,next)=>req.session.userId?next():void res.sendStatus(401),store);
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const base='http://127.0.0.1:'+(server.address()as any).port;
 const send=(body:unknown,user='owner-a')=>fetch(base+'/api/microbiome/import',{method:'POST',headers:{'content-type':'application/json','x-test-user':user},body:JSON.stringify(body)});
 try{
  assert.equal((await send({report:source},'')).status,401);assert.equal(samples.length,0);
  const canonical=parseStructuredReport(source);assert.equal((await send({report:canonical,userId:'owner-b'})).status,400);assert.equal(samples.length,0);
  assert.equal((await send({report:source})).status,200);assert.equal((await send({report:canonical},'owner-b')).status,200);
  assert.deepEqual(samples.map(row=>row.userId),['owner-a','owner-b']);assert.equal(children.length,0);
  const first=samples[0].structuredData,second=samples[1].structuredData;for(const key of ['organisms','scores','sourceLabel','dataOrigin','testPeriod','scoreInterpretationWarning','sourceMissingData','capabilities','sourceReport'])assert.deepEqual(second[key],first[key],key);
  assert.equal(second.organisms[0].reportedAbundance,'8 reads');assert.equal(second.organisms[1].reportedAbundance,null);assert.equal(second.scores[0].score,0);assert.equal(second.capabilities.quantitativeAbundance,false);assert.equal(samples[1].testingCompany,'Synthetic source lab');
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
