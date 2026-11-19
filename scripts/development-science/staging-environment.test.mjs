import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { stagingCallerEnvironment } from "./staging-environment.mjs";
import { runStagingCaller } from "./render-caller.mjs";
const env = { NODE_ENV:"production", BLOOM_DEPLOYMENT_CLASS:"staging", RENDER_SERVICE_ID:"synthetic-runtime",
  BLOOM_DEV_APPROVED_RENDER_SERVICE_ID:"synthetic-runtime", BLOOM_DEV_MAC_CALLER_ENABLED:"true",
  BLOOM_DEV_MAC_URL:"https://synthetic-node.synthetic-tailnet.ts.net",BLOOM_DEV_TAILSCALE_PROXY_URL:"http://127.0.0.1:1055",
  BLOOM_DEV_MAC_ML_TOKEN:"synthetic-dedicated-ml-token-1234567890",BLOOM_DEV_SCIENCE_TOKEN:"synthetic-dedicated-science-token-1234567890",
  DATABASE_URL:"synthetic-must-not-forward",GEMINI_API_KEY:"synthetic-must-not-forward",ML_SERVICE_TOKEN:"synthetic-normal-app-token" };
test("staging child gets only dedicated credentials and flags, not normal app/data/provider environment",()=>{
  const child = stagingCallerEnvironment(env);
  assert.equal(child.NODE_ENV,"development");assert.equal(env.NODE_ENV,"production");
  assert.equal(child.ML_SERVICE_TOKEN,env.BLOOM_DEV_MAC_ML_TOKEN);
  for(const key of ["DATABASE_URL","GEMINI_API_KEY","RENDER_SERVICE_ID","BLOOM_DEV_APPROVED_RENDER_SERVICE_ID"])assert.equal(child[key],undefined);
  for(const change of [{BLOOM_DEPLOYMENT_CLASS:"production"},{RENDER_SERVICE_ID:"other"},{BLOOM_DEV_MAC_CALLER_ENABLED:"false"},{NODE_DEBUG:"child_process"}])
    assert.throws(()=>stagingCallerEnvironment({...env,...change}));
});
test("staging preflight spawns nothing; approved auxiliary command is fixed and failure does not control normal app",async()=>{
  const checked = await runStagingCaller({environment:env,spawnChild:()=>assert.fail("must not start")});
  assert.equal(checked.status,"configuration-checked-no-network");
  const result=await runStagingCaller({environment:env,approvedNetworkCheck:true,spawnChild:(command,args,options)=>{
    assert.equal(command,process.execPath);assert.equal(args.length,1);assert.ok(args[0].endsWith("/reference-probe.mjs"));
    assert.equal(options.shell,false);assert.equal(options.stdio,"ignore");assert.equal(options.env.DATABASE_URL,undefined);
    const child=new EventEmitter();queueMicrotask(()=>child.emit("exit",2));return child;
  }});
  assert.equal(result.status,"synthetic-reference-unavailable");
});
