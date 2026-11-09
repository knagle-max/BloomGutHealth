import test from "node:test";
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {createHash} from "node:crypto";
import {runSyntheticMolecular} from "../server/synthetic-molecular";
const command={version:"synthetic-molecular-v1",scenario:"crossfeed-default"};
const token="synthetic-research-service-token-123456789";
const fixture=()=>({version:command.version,scenario:command.scenario,requestHash:createHash("sha256").update(JSON.stringify(["synthetic-molecular-request-v1",command.scenario])).digest("hex"),engine:"synthetic-vertex-lp-v1",modelVersion:"synthetic-crossfeed-v1",scope:"synthetic",unit:"synthetic-flux-unit",evidenceState:"modelled_reaction_flux",personalPrediction:false,applyToUser:false,status:"optimal",objective:"6",fluxes:{entry:"10",producer:"10",consumer:"4",exit:"4",exchange:"6"},balanceResiduals:{a:"0",b:"0",shared:"0"},limitations:["Synthetic mathematical control only"]});
test("synthetic adapter rejects personal fields before transfer and validates response scope, balance, version and exact request",async()=>{
 let received=0,reply:any=fixture(),status=200;
 const server=createServer(async(req,res)=>{received++;assert.equal(req.url,"/api/ml/research/synthetic");assert.equal(req.headers.authorization,"Bearer "+token);assert.equal(req.headers.cookie,undefined);let body="";for await(const chunk of req)body+=chunk;assert.deepEqual(JSON.parse(body),command);assert.ok(body.length<512);res.writeHead(status,{"content-type":"application/json"});res.end(JSON.stringify(reply));}).listen(0,"127.0.0.1");
 await new Promise<void>(r=>server.once("listening",r));const env={ML_SERVICE_URL:`http://127.0.0.1:${(server.address()as any).port}`,ML_SERVICE_TOKEN:token};
 try{
  for(const extras of [{userId:"private"},{taxa:[]},{foods:[]},{scenario:"arbitrary"}])await assert.rejects(runSyntheticMolecular({...command,...extras},env));
  assert.equal(received,0);assert.equal((await runSyntheticMolecular(command,env)).objective,"6");
  for(const bad of [{scope:"personal"},{unit:"mmol/gDW/h"},{applyToUser:true},{requestHash:"0".repeat(64)},{scenario:"substrate-absent"},{balanceResiduals:{a:"1",b:"0",shared:"0"}},{status:"infeasible"}]){reply={...fixture(),...bad};await assert.rejects(runSyntheticMolecular(command,env));}
  reply={...fixture(),status:"infeasible",objective:null,fluxes:null,balanceResiduals:null};assert.equal((await runSyntheticMolecular(command,env)).objective,null);
  status=503;await assert.rejects(runSyntheticMolecular(command,env),/unavailable/);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
