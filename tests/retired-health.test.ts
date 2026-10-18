import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { registerRetiredHealthRoutes } from "../server/retired-health-routes";
test("retired prototype health APIs never emit invented measurements and retain authentication and ownership",async()=>{
 const app=express();app.use((req,_res,next)=>{req.session={userId:req.get("x-user")} as any;next();});
 registerRetiredHealthRoutes(app,((req:any,res:any,next:any)=>req.session.userId?next():res.sendStatus(401)) as any,{getMeal:async id=>({userId:"a",id})} as any);
 const server=app.listen(0,"127.0.0.1");await new Promise<void>(r=>server.once("listening",r));const root=`http://127.0.0.1:${(server.address() as any).port}`;
 try{for(const kind of ["analysis","recommendations","progress","adherence"]){
  assert.equal((await fetch(root+`/api/health/${kind}/a`)).status,401);
  assert.equal((await fetch(root+`/api/health/${kind}/a`,{headers:{"x-user":"b"}})).status,403);
  const response=await fetch(root+`/api/health/${kind}/a`,{headers:{"x-user":"a"}});assert.equal(response.status,410);assert.equal(response.headers.get("cache-control"),"no-store");const body=await response.json();assert.equal(body.code,"UNVALIDATED_MODEL_RETIRED");for(const key of ["molecules","healthScores","bacterialGaps","adherenceStats"])assert.equal(body[key],undefined);
 }assert.equal((await fetch(root+"/api/meals/private/check-adherence",{method:"POST",headers:{"x-user":"b"}})).status,404);assert.equal((await fetch(root+"/api/meals/private/check-adherence",{method:"POST",headers:{"x-user":"a"}})).status,410);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
