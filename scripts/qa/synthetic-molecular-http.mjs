import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {runSyntheticMolecular} from '../../server/synthetic-molecular.ts';
const token=randomBytes(32).toString('hex');
const child=spawn(process.env.BLOOM_PYTHON||'python3',['-m','uvicorn','ml_service.main:app','--host','127.0.0.1','--port','0','--log-level','info'],{cwd:new URL('../../',import.meta.url),env:{PATH:process.env.PATH,ML_SERVICE_TOKEN:token,PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});
let startup='';let timer;
const ready=new Promise((resolve,reject)=>{
 timer=setTimeout(()=>reject(Error('Synthetic Python fixture startup timed out')),15000);
 child.once('error',()=>reject(Error('Synthetic Python fixture could not start')));
 child.once('exit',()=>reject(Error('Synthetic Python fixture stopped before startup')));
 child.stderr.on('data',bytes=>{startup=(startup+bytes.toString()).slice(-8192);const match=startup.match(/Uvicorn running on (http:\/\/127\.0\.0\.1:\d+)/);if(match)resolve(match[1]);});
});
try{
 const base=await ready;clearTimeout(timer);
 const env={ML_SERVICE_URL:base,ML_SERVICE_TOKEN:token};
 const unauthenticated=await fetch(base+'/api/ml/research/synthetic',{method:'POST',body:'invalid'});assert.equal(unauthenticated.status,401);
 const path=base+'/api/ml/research/synthetic',headers={Authorization:'Bearer '+token,'Content-Type':'application/json'};
 for(const [scenario,expected]of [['crossfeed-default','6'],['substrate-absent','0'],['consumption-exceeds-supply',null],['uptake-reversal','-3']]){
  const result=await runSyntheticMolecular({version:'synthetic-molecular-v1',scenario},env);
  assert.equal(result.objective,expected);assert.equal(result.scope,'synthetic');assert.equal(result.applyToUser,false);
  assert.equal(result.status,expected===null?'infeasible':'optimal');
 }
 const oversized=await fetch(path,{method:'POST',headers,body:'x'.repeat(513)});assert.equal(oversized.status,413);
 const denied=await fetch(path,{method:'POST',headers,body:JSON.stringify({version:'synthetic-molecular-v1',scenario:'crossfeed-default',taxa:{'Synthetic forbidden input':10}})});assert.equal(denied.status,422);assert.ok(!(await denied.text()).includes('Synthetic forbidden input'));
 await assert.rejects(runSyntheticMolecular({version:'synthetic-molecular-v1',scenario:'crossfeed-default',userId:'synthetic-account'},env));
 const ordinary=await fetch(base+'/api/ml/analyze',{method:'POST',headers,body:JSON.stringify({sample_id:'synthetic',user_id:'synthetic',raw_data:{bacteria_percentages:{'Synthetic reported taxon':3}}})});assert.equal(ordinary.status,200);
 const composition=await ordinary.json();assert.equal(composition.interpretation_status,'reported_composition_only');assert.deepEqual(composition.metabolites,[]);assert.deepEqual(composition.health_impacts,[]);assert.deepEqual(composition.recommendations,[]);assert.equal(composition.confidence,null);
 assert.equal((await fetch(base+'/health')).status,200);
 console.log('PASS: actual Node adapter→authenticated localhost Python HTTP→CPU exact synthetic solver→validated response; four signed/zero/infeasible controls, no personal fields, auth-before-parse, bounded body, no database/provider/user-data writes. No public model or biological validation.');
}finally{
 clearTimeout(timer);child.kill('SIGTERM');
 await new Promise(resolve=>{const kill=setTimeout(()=>{child.kill('SIGKILL');resolve();},5000);child.once('close',()=>{clearTimeout(kill);resolve();});if(child.exitCode!==null){clearTimeout(kill);resolve();}});
}
