import {foodEntryImplementationReady} from "../shared/food-entry";
import {createHash} from "node:crypto";
import {z} from "zod";
import {eq} from "drizzle-orm";
import type {Express,RequestHandler} from "express";
import {capabilityPreferences} from "../shared/schema";
import {capabilityPolicyVersion} from "./capability-policy";
import type {db as appDatabase} from "./db";
const grantSchema=z.object({userId:z.string().min(1).max(100),grantId:z.string().min(1).max(100),expiresAt:z.string().datetime({offset:true}),territories:z.array(z.string().regex(/^[A-Z]{2}$/)).min(1).max(10),reviewReference:z.string().trim().min(1).max(200),allowedCapabilities:z.array(z.string().min(1).max(100)).max(52)}).strict();
export function internalPreviewGrant(userId:string,environment:Record<string,string|undefined>=process.env,now=Date.now()) {
 if(environment.BLOOM_EXPERIMENTAL_ENVIRONMENT!=="isolated-synthetic"||environment.BLOOM_EXPERIMENTAL_KILL_SWITCH==="true")return null;
 try{const parsed=z.array(grantSchema).max(100).parse(JSON.parse(environment.BLOOM_INTERNAL_TESTERS||"[]"));const grants=parsed.filter(g=>g.userId===userId);if(grants.length!==1)return null;const grant=grants[0];
  if(+new Date(grant.expiresAt)<=now||!grant.territories.includes(environment.BLOOM_PREVIEW_TERRITORY||"")||!grant.allowedCapabilities.includes("bloom.dev.preview"))return null;
  return {fingerprint:createHash("sha256").update(JSON.stringify(grant)).digest("hex")};
 }catch{return null;}
}
export interface CapabilityPreferenceStore {get(userId:string):Promise<{enabled:boolean;grantFingerprint:string}|null>;put(userId:string,enabled:boolean,grantFingerprint:string):Promise<void>;}
export class CapabilityPreferenceStorage implements CapabilityPreferenceStore {
 constructor(private readonly db:Pick<typeof appDatabase,"select"|"insert">){}
 async get(userId:string){const [row]=await this.db.select().from(capabilityPreferences).where(eq(capabilityPreferences.userId,userId));return row||null;}
 async put(userId:string,enabled:boolean,grantFingerprint:string){await this.db.insert(capabilityPreferences).values({userId,enabled,grantFingerprint}).onConflictDoUpdate({target:capabilityPreferences.userId,set:{enabled,grantFingerprint,updatedAt:new Date()}});}
}
export function registerCapabilityAccess(app:Express,auth:RequestHandler,store:CapabilityPreferenceStore,grantFor:(userId:string)=>ReturnType<typeof internalPreviewGrant>=internalPreviewGrant){
 app.use('/api/capabilities',auth,(_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();});
 app.get('/api/capabilities',async(req,res)=>{try{const id=req.session.userId!,grant=grantFor(id);const pref=grant?await store.get(id):null;res.json({version:capabilityPolicyVersion,foodEntry:foodEntryImplementationReady,eligible:!!grant,experimentalEnabled:!!grant&&!!pref?.enabled&&pref.grantFingerprint===grant.fingerprint,capabilities:[],note:'Internal synthetic preview only. This setting does not grant clinical, research, provider, territory or licensing approval. Restricted services remain unavailable until individually cleared.'});}catch{res.status(503).json({error:'Experimental eligibility could not be checked.'});}});
 app.patch('/api/capabilities/experimental',async(req,res)=>{
  const parsed=z.object({enabled:z.boolean()}).strict().safeParse(req.body);if(!parsed.success)return void res.status(400).json({error:'Choose an experimental preference only.'});
  const id=req.session.userId!,grant=grantFor(id);if(!grant)return void res.status(403).json({error:'Internal preview access is not available for this account.'});
  try{await store.put(id,parsed.data.enabled,grant.fingerprint);if(grantFor(id)?.fingerprint!==grant.fingerprint){await store.put(id,false,grant.fingerprint);return void res.status(403).json({error:'Internal preview access changed. The preference was turned off.'});}res.json({experimentalEnabled:parsed.data.enabled});}catch{res.status(503).json({error:'Experimental preference could not be saved.'});}
 });
}
