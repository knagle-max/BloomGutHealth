import type {Express,RequestHandler} from 'express';
import {z} from 'zod';
import {capabilityApproval,capabilityPolicyVersion,capabilityRecords} from './capability-policy';
import type {FeatureReviewEntry,FeatureReviewManifest} from '../shared/feature-administration';
const id=z.string().regex(/^[A-Za-z0-9_.:/-]{1,120}$/);
const environment=z.enum(['development-review','isolated-synthetic']);
const grantSchema=z.object({userId:z.string().min(1).max(200),grantId:id,role:z.literal('feature-admin'),scopes:z.tuple([z.literal('features:read')]),serviceId:z.string().regex(/^srv-[a-z0-9]+$/),environment,purpose:z.literal('feature-metadata-review'),reviewReference:id,expiresAt:z.string().datetime({offset:true})}).strict();
/** Separate server-provisioned role: never inherited from the tester UI preference. */
export function featureAdminReadGrant(userId:string,env:Record<string,string|undefined>=process.env,now=Date.now()):boolean{
 if(!userId||!Number.isFinite(now)||!environment.safeParse(env.BLOOM_FEATURE_ADMIN_ENVIRONMENT).success||(env.BLOOM_FEATURE_ADMIN_KILL_SWITCH!==undefined&&env.BLOOM_FEATURE_ADMIN_KILL_SWITCH!=='false'))return false;
 try{
  const raw=env.BLOOM_FEATURE_ADMINS||'[]';if(raw.length>65536)return false;
  const grants=z.array(grantSchema).max(100).parse(JSON.parse(raw)).filter(grant=>grant.userId===userId);
  return grants.length===1&&grants[0].serviceId===env.RENDER_SERVICE_ID&&grants[0].environment===env.BLOOM_FEATURE_ADMIN_ENVIRONMENT&&Date.parse(grants[0].expiresAt)>now;
 }catch{return false;}
}
/** Provisional source flags/reported implementation are not deployment or approval proof. */
export function featureReviewManifest(env:Record<string,string|undefined>=process.env,records=capabilityRecords()):FeatureReviewManifest{
 const entries:FeatureReviewEntry[]=records.map(record=>{
  const approval=capabilityApproval(record.approval_status),category=record.release_category;
  const status=category==='DISABLED_INCIDENT'?'Incident disabled':category==='INTERNAL_RESEARCH_ONLY'?'Internal research':['REJECTED','SUSPENDED'].includes(approval)?'Unavailable':approval!=='APPROVED'?'Pending review':'Verification pending';
  const blockers=['Read-only review: feature changes are not implemented.','Implementation and deployed availability require independent verification.','Current version, territory, population, purpose and approvals require a structured review.','Rollout, step-up, audit and rollback controls are not configured.'];
  if(approval!=='APPROVED')blockers.unshift(`Independent release approval: ${approval}.`);
  if(record.public_enabled!==true)blockers.push('The source registry public-release flag is off.');
  if(!/^[a-f0-9]{40}$/.test(env.RENDER_GIT_COMMIT||'')||record.reviewed_commit!==env.RENDER_GIT_COMMIT)blockers.push('The source review is not verified for this deployed revision.');
  if(category==='DISABLED_INCIDENT')blockers.unshift('Incident-disabled capabilities cannot be enabled by an administrator.');
  if(category==='INTERNAL_RESEARCH_ONLY')blockers.unshift('Research isolation cannot be converted to public release by a flag.');
  return {id:record.feature_id,name:record.feature,group:record.group,category,approval,reportedImplementation:record.implementation_status,implementationReadiness:null,registryPublicEnabled:record.public_enabled===true,review:{commit:/^[a-f0-9]{40}$/.test(record.reviewed_commit)?record.reviewed_commit:null,evidence:record.evidence,requirements:record.release_requirements,proposedJurisdiction:record.jurisdiction,approvedScopes:[]},deploymentAvailability:'UNVERIFIED',activation:{state:'UNCONFIGURED',rolloutPercent:null,targetCohort:null,lastChange:null},status,blockers};
 });
 return {mode:'READ_ONLY',registryVersion:capabilityPolicyVersion,buildRevision:/^[a-f0-9]{40}$/.test(env.RENDER_GIT_COMMIT||'')?env.RENDER_GIT_COMMIT!:null,entries,limitations:['Source metadata is not release approval or measured deployment availability. Existing development preview behavior is separate.','No feature can be enabled, paused, rolled back or disabled through this read-only interface.','Implementation readiness, approved scope, live controls, step-up and audited mutations remain unfinished.']};
}
export function registerFeatureAdministration(app:Express,auth:RequestHandler,grantFor:(id:string)=>boolean=featureAdminReadGrant,manifest:()=>FeatureReviewManifest=featureReviewManifest){
 app.use('/api/admin',(_req,res,next)=>{res.setHeader('Cache-Control','no-store');next();},auth,(req,res,next)=>{
  if(!req.session.userId||!grantFor(req.session.userId))return void res.status(403).json({code:'ADMIN_ACCESS_UNAVAILABLE',error:'Feature administration is not available for this account.'});
  next();
 });
 app.get('/api/admin/features',(req,res)=>{
  if(Object.keys(req.query).length)return void res.status(400).json({error:'Feature review accepts no policy or account overrides.'});
  try{const snapshot=manifest();if(!grantFor(req.session.userId!))return void res.status(403).json({code:'ADMIN_ACCESS_UNAVAILABLE',error:'Feature administration access changed.'});res.json(snapshot);}catch{res.status(503).json({error:'Feature review metadata could not load.'});}
 });
 app.post('/api/admin/features/:featureId/control',(_req,res)=>{res.status(403).json({code:'FEATURE_CHANGES_UNAVAILABLE',error:'This build supports metadata review only. Activation, pause, rollback and emergency controls are not implemented.'});});
 app.use('/api/admin',(_req,res)=>{res.status(404).json({error:'Administration route not found.'});});
}
