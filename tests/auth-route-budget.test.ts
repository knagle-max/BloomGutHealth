import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import {PGlite} from '@electric-sql/pglite';
import {registerAuthRoutes} from '../server/auth-routes';
import {SharedRateLimiter} from '../server/shared-rate-limit';

async function serve(limiter:SharedRateLimiter,lookedUp:()=>void=()=>{}){
 const app=express();app.use(express.json());app.use((req,_res,next)=>{req.session={userId:'synthetic-owner'} as any;next();});app.use(limiter.middleware());
 registerAuthRoutes(app,{getUserByUsername:async()=>{lookedUp();return undefined;},getUser:async()=>undefined,createUser:async()=>{throw Error('No fixture account should be created');}} as any);
 app.delete('/api/account',(_req,res)=>{lookedUp();res.status(401).json({error:'Synthetic password mismatch'});});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 return {base:`http://127.0.0.1:${(server.address() as any).port}`,close:async()=>{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}};
}
const credentials={username:'PRIVATE_USERNAME',password:'synthetic-wrong-password'};
const request=(base:string,path:string,method='POST')=>fetch(base+path,{method,headers:{'content-type':'application/json'},body:JSON.stringify(credentials)});
test('all Express-accepted authentication and deletion path variants deny before credential work when shared budgets are unavailable',async()=>{
 let lookups=0,budgetCalls=0;const limiter=new SharedRateLimiter({query:async()=>{budgetCalls++;throw Error('PRIVATE_CONNECTION_SENTINEL');}},'synthetic-shared-auth-secret');const server=await serve(limiter,()=>lookups++);
 try{for(const [path,method] of [['/api/auth/login','POST'],['/API/AUTH/LOGIN/','POST'],['/Api/Auth/Signup/','POST'],['/api/account/','DELETE'],['/API/ACCOUNT','DELETE']]){
  const response=await request(server.base,path,method);assert.equal(response.status,503,path);assert.equal(response.headers.get('retry-after'),'60');assert.doesNotMatch(await response.text(),/PRIVATE_|synthetic-wrong-password/);
 }assert.equal(lookups,0);assert.equal(budgetCalls,5);}finally{await server.close();}
});
test('case and trailing slash variants share one authentication allowance across replicas rather than per-route/local budgets',async()=>{
 const db=new PGlite();const left=new SharedRateLimiter(db as any,'synthetic-shared-auth-secret'),right=new SharedRateLimiter(db as any,'synthetic-shared-auth-secret');await left.initialize();let lookups=0;
 const servers=await Promise.all([serve(left,()=>lookups++),serve(right,()=>lookups++)]);const variants=['/api/auth/login','/API/AUTH/LOGIN/','/Api/Auth/Login','/api/auth/login/'];
 try{for(let i=0;i<20;i++)assert.equal((await request(servers[i%2].base,variants[i%variants.length])).status,401);assert.equal(lookups,20);
  const denied=await request(servers[1].base,'/API/AUTH/LOGIN/');assert.equal(denied.status,429);assert.equal(denied.headers.get('retry-after'),'900');assert.equal(lookups,20);
  assert.ok(!JSON.stringify((await db.query('SELECT * FROM request_budgets')).rows).includes(credentials.username));
 }finally{await Promise.all(servers.map(server=>server.close()));await db.close();}
});
