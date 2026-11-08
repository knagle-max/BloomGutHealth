import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {experimentSchema} from '../../shared/experience.ts';

// Writes only ephemeral, script-owned synthetic accounts. Never infer isolation
// from a CI flag: the app must attest its pinned observed endpoint/database/schema.
const base='https://bloomguthealth.onrender.com';
assert.equal(process.env.BLOOM_HOSTED_RC_ISOLATED,'true');
const expected=process.env.BLOOM_HOSTED_RC_EXPECTED_COMMIT;
assert.match(expected||'',/^[a-f0-9]{40}$/);
async function qualify(){
 const response=await fetch(base+'/api/review/qualification',{signal:AbortSignal.timeout(30000),redirect:'error'});
 assert.equal(response.status,200,'Hosted review binding is not qualified; no writes permitted');
 assert.match(response.headers.get('content-type')||'',/application\/json/);
 const value=await response.json();assert.equal(value.kind,'isolated-review');assert.equal(value.commit,expected,'Review build differs from the tested commit; no writes permitted');assert.ok(Date.parse(value.expiresAt)>Date.now());
}
const input=experimentSchema.parse({mode:'everyday',title:'Synthetic hosted RC source',startsOn:'2026-11-08',endsOn:'2026-11-15',action:'One familiar routine',outcome:'Self-reported source note',design:{baselineStartsOn:'2026-11-01',baselineEndsOn:'2026-11-07',metricUnit:'source units',measurementMethod:'Same synthetic source question',expectedDirection:'observe',confoundersToTrack:'Sleep'},observations:[{date:'2026-11-08',value:0,adherence:null,confounders:'Synthetic context'}]});
const accounts=[];
async function request(account,path,method='GET',body,status=200,headers={}){
 if(method!=='GET')await qualify();
 const response=await fetch(base+path,{method,redirect:'error',signal:AbortSignal.timeout(30000),headers:{origin:base,...(account.cookie?{cookie:account.cookie}:{}),...(body?{'content-type':'application/json'}:{}),...headers},...(body?{body:JSON.stringify(body)}:{})});
 const cookies=response.headers.getSetCookie();
 const session=cookies.find(value=>value.startsWith('connect.sid='));
 if(session){if(!session.startsWith('connect.sid=;')){assert.match(session,/;\s*Secure/i,'Hosted cookie must be Secure');assert.match(session,/;\s*HttpOnly/i,'Hosted cookie must be HttpOnly');}account.cookie=session.split(';')[0];}
 assert.equal(response.status,status,`Unexpected hosted response: ${method} ${path}`);
 return response.status===204?null:response.json();
}
async function signup(){const account={username:'rc-synthetic-'+randomUUID(),password:randomBytes(24).toString('base64url'),cookie:'',deleted:false};accounts.push(account);const result=await request(account,'/api/auth/signup','POST',{username:account.username,password:account.password});account.id=result.user.id;assert.ok(account.cookie);return account;}
let cleanupFailed=false;
try {
 // Wait only for deployment propagation, and never register while mismatched.
 let qualified=false;for(let attempt=0;attempt<24;attempt++){try{await qualify();qualified=true;break;}catch{if(attempt<23)await delay(5000);}}
 assert.ok(qualified,'Exact hosted review build/binding not ready; no accounts created');
 const first=await signup(),second=await signup();
 assert.equal((await request(first,'/api/auth/me')).user.id,first.id);
 const profile=await request(first,'/api/profile');assert.equal(profile.measurementSource.available,true);
 const fields={weight:{unit:'lb',value:'150.000'}};
 await request(first,`/api/user/${first.id}/profile`,'PATCH',{weightKg:150/2.2046226218487757,measurementSource:{version:1,expectedRevision:profile.measurementSource.revision,fields}},200,{'If-Match':`"${profile.profileRevision}"`});
 const savedProfile=await request(first,'/api/profile');assert.deepEqual(savedProfile.measurementSource.fields,fields);
 await request(second,`/api/user/${first.id}/profile`,'PATCH',{weightKg:70},403,{'If-Match':`"${savedProfile.profileRevision}"`});
 const original=await request(first,'/api/experience/records','POST',{kind:'experiment',payload:input},201);
 const corrected={...original.payload,observations:[{...original.payload.observations[0],value:0.00000123,adherence:0}]};
 for(let attempt=0;attempt<2;attempt++)await request(first,`/api/experience/records/${original.id}`,'PUT',{kind:'experiment',payload:corrected});
 const history=await request(first,`/api/experience/records/${original.id}/history`);assert.equal(history.status,'available');assert.equal(history.versions.length,1);assert.deepEqual(history.versions[0].payload,original.payload);
 await request(second,`/api/experience/records/${original.id}/history`,'GET',undefined,404);
 const additionalSession={...first,cookie:''};await request(additionalSession,'/api/auth/login','POST',{username:first.username,password:first.password});
 assert.equal((await request(additionalSession,'/api/profile')).measurementSource.fields.weight.value,'150.000');
 const download=await request(first,'/api/account/export');assert.equal(download.format,'bloom-account-records-v2');assert.equal(download.profile.id,first.id);assert.equal(download.profileMeasurementSource.fields.weight.value,'150.000');assert.equal(download.experience.history.versions.length,1);
 const other=await request(second,'/api/account/export');assert.equal(other.experience.records.length,0);assert.deepEqual(other.profileMeasurementSource.fields,{});
 const erased=await request(first,'/api/account','DELETE',{password:first.password,confirmation:'DELETE ACCOUNT'});assert.equal(erased.scope,'active-application-records');first.deleted=true;
 await request(first,'/api/account/export','GET',undefined,401);await request(additionalSession,'/api/account/export','GET',undefined,401);
 assert.equal((await request(second,'/api/auth/me')).user.id,second.id);
 console.log('PASS: exact hosted isolated binding, secure cookies, Profile original lb source/save/login, immutable routine history/retry, other-account denial, private export, deletion and session revocation');
} finally {
 for(const account of accounts){if(account.deleted)continue;try{if(!account.id){const logged=await request(account,'/api/auth/login','POST',{username:account.username,password:account.password});account.id=logged.user.id;}await request(account,'/api/account','DELETE',{password:account.password,confirmation:'DELETE ACCOUNT'});account.deleted=true;}catch{cleanupFailed=true;}}
 if(cleanupFailed)throw Error('Synthetic hosted account cleanup could not be confirmed; do not qualify this run');
 if(accounts.length)console.log('PASS: all script-owned synthetic hosted accounts erased; unrelated accounts were not changed');
}
