import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { registerHealthSourceRoutes } from "../server/health-source-routes";

test("health source routes enforce authentication, export account scope and explicit erasure",async()=>{
 const calls:string[]=[];
 const store:any={
   getConsents:async(user:string)=>[{provider:"apple_health",allowedKinds:["steps"],grantedAt:"2026-10-18T00:00:00Z",revokedAt:null,userMarker:user}],
   getObservations:async(user:string)=>[{marker:user,kind:"steps",endAt:"2026-10-18T12:00:00Z",source:{provider:"apple_health",recordId:"r-1"}}],
   clearProvider:async(user:string,provider:string)=>{calls.push(user+":"+provider);},
   clearAccount:async(user:string)=>{calls.push(user+":all");},
 };
 const app=express();app.use((req,_res,next)=>{req.session={userId:req.headers["x-test-user"] as string} as any;next();});
 const auth:any=(req:any,res:any,next:any)=>req.session.userId?next():res.status(401).end();
 registerHealthSourceRoutes(app,auth,store);
 const server=app.listen(0,"127.0.0.1");await new Promise<void>(resolve=>server.on("listening",resolve));
 const base="http://127.0.0.1:"+(server.address() as any).port;
 const send=(path:string,method="GET",user="a",confirm?:string)=>fetch(base+"/api/health-sources"+path,{method,headers:{"x-test-user":user,...(confirm?{"x-bloom-confirm":confirm}:{})}});
 try {
   assert.equal((await send("/export","GET","")).status,401);
   const observations=await (await send("/observations")).json();
   assert.equal(observations.returned,1);
   assert.equal(observations.observations[0].marker,"a");
   assert.equal((await send("/observations?kind=steps")).status,200);
   assert.equal((await send("/observations?limit=1")).status,200);
   assert.equal((await send("/observations?limit=50")).status,200);
   assert.equal((await send("/observations?limit=0")).status,400);
   assert.equal((await send("/observations?limit=201")).status,400);
   assert.equal((await send("/observations?limit=12oops")).status,400);
   assert.equal((await send("/observations?kind=unknown")).status,400);
   assert.equal((await send("/observations?provider=manual")).status,400);
   assert.equal((await send("/observations","GET","")).status,401);
   const a=await send("/export");assert.equal(a.status,200);
   assert.equal(a.headers.get("cache-control"),"no-store");
   assert.match(a.headers.get("content-disposition")||"",/attachment/);
   const body=await a.json();assert.equal(body.observations[0].marker,"a");
   const b=await (await send("/export","GET","b")).json();assert.equal(b.observations[0].marker,"b");
   assert.equal((await send("/apple_health","DELETE")).status,400);
   assert.equal((await send("/unknown","DELETE","a","delete-health-source")).status,404);
   assert.equal((await send("/apple_health","DELETE","a","delete-health-source")).status,204);
   assert.equal((await send("","DELETE","a","delete-all-health-sources")).status,204);
   assert.deepEqual(calls,["a:apple_health","a:all"]);
 } finally {server.closeAllConnections();await new Promise<void>(resolve=>server.close(resolve));}
});
