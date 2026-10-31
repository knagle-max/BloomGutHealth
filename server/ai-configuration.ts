import {z} from 'zod';
import {maximumTokenCostMicroUsd} from './ai-costing';
import {MeteredAIExecutor,type AIFeature} from './metered-ai';
import {SpendLedger,type SpendTransaction} from './spend-ledger';
import {SharedProviderCircuit} from './provider-circuit';
import {restrictedCapabilityAllowed} from './capability-policy';

const identifier=z.string().regex(/^[A-Za-z0-9_.:/-]{1,120}$/);
const instant=z.string().datetime({offset:true});
const positive=z.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const money=positive.max(1000000000000);
const features=['ingredient-parsing','recipe-ranking','recipe-generation','science-ranking'] as const;
const tariff=z.object({reference:identifier,provider:z.literal('openai'),model:identifier,effectiveFrom:instant,expiresAt:instant,inputMicroUsdPerMillion:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),cachedInputMicroUsdPerMillion:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),outputMicroUsdPerMillion:z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER)}).strict();
const bounds=z.object({maximumRequestBytes:positive.max(2*1024*1024),maximumInputTokens:positive,maximumOutputTokens:positive,boundsReviewReference:identifier}).strict();
const circuit=z.object({maximumFailures:positive.max(10000),cooldownSeconds:positive.max(86400),probeLeaseSeconds:positive.min(30).max(300)}).strict();
const schema=z.object({
 version:z.literal('bloom-metered-ai-policy-v1'),reviewReference:identifier,model:identifier,effectiveFrom:instant,expiresAt:instant,
 limits:z.object({accountDaily:money,accountMonthly:money,featureDaily:money,providerMonthly:money,platformMonthly:money,accountConcurrency:positive.max(10000),platformConcurrency:positive.max(10000)}).strict(),
 policies:z.object({'ingredient-parsing':bounds.extend({tariff}).strict().optional(),'recipe-ranking':bounds.extend({tariff}).strict().optional(),'recipe-generation':bounds.extend({tariff}).strict().optional(),'science-ranking':bounds.extend({tariff}).strict().optional()}).strict(),
 circuits:z.object({'platform:ai':circuit,'provider:openai':circuit}).strict(),
 grants:z.array(z.object({userId:z.string().min(1).max(200),features:z.array(z.enum(features)).min(1).max(features.length),expiresAt:instant,reviewReference:identifier}).strict()).min(1).max(100),
}).strict();
export type AIConfiguration=z.infer<typeof schema>;
/** Shape/currentness only: a review reference is not proof of legal or tariff approval. */
export function validateAIConfiguration(input:unknown,now=Date.now()):AIConfiguration{
 const parsed=schema.safeParse(input);
 if(!parsed.success||!Number.isFinite(now))throw Error('AI configuration unavailable');
 const config=parsed.data,from=Date.parse(config.effectiveFrom),until=Date.parse(config.expiresAt),limits=config.limits;
 if(from>=until||now<from||now>=until||limits.featureDaily>limits.accountDaily||limits.accountDaily>limits.accountMonthly||limits.accountMonthly>limits.providerMonthly||limits.providerMonthly>limits.platformMonthly||limits.accountConcurrency>limits.platformConcurrency)throw Error('AI configuration unavailable');
 if(!Object.keys(config.policies).length||new Set(config.grants.map(grant=>grant.userId)).size!==config.grants.length)throw Error('AI configuration unavailable');
 for(const grant of config.grants){
  if(Date.parse(grant.expiresAt)<=now||Date.parse(grant.expiresAt)>until||new Set(grant.features).size!==grant.features.length||grant.features.some(feature=>!config.policies[feature]))throw Error('AI configuration unavailable');
 }
 for(const policy of Object.values(config.policies)){
  if(!policy)continue;
  const bound=maximumTokenCostMicroUsd(policy.maximumInputTokens,policy.maximumOutputTokens,policy.tariff,config.model,now);
  if(policy.tariff.model!==config.model||Date.parse(policy.tariff.effectiveFrom)>from||Date.parse(policy.tariff.expiresAt)<until||bound===null||bound<=0||[limits.accountDaily,limits.accountMonthly,limits.featureDaily,limits.providerMonthly,limits.platformMonthly].some(limit=>bound>limit))throw Error('AI configuration unavailable');
 }
 return config;
}
const capabilityFor:Record<AIFeature,string>={'ingredient-parsing':'bloom.food.meal_logging','recipe-ranking':'bloom.coach.general','recipe-generation':'bloom.coach.general','science-ranking':'bloom.coach.general'};
/** Explicit trusted server composition, never an environment/HTTP installer.
 * Production startup intentionally does not call this or install an executor.
 * Synthetic tests may inject approval; the real default checks the Legal registry. */
export function composeMeteredAI(input:unknown,deps:{transaction:SpendTransaction;identitySecret:string;runtimeAllowed:()=>boolean;featureCleared?:(id:string)=>boolean;now?:()=>number}){
 const now=deps.now||Date.now,config=validateAIConfiguration(input,now());
 if(typeof deps.identitySecret!=='string'||Buffer.byteLength(deps.identitySecret,'utf8')<32||deps.identitySecret.length>512||/\s/.test(deps.identitySecret))throw Error('AI configuration unavailable');
 const cleared=deps.featureCleared||restrictedCapabilityAllowed;
 const authorize=(feature:AIFeature,userId:string)=>{
  try {
   const time=now();
   return Number.isFinite(time)&&deps.runtimeAllowed()===true&&time>=Date.parse(config.effectiveFrom)&&time<Date.parse(config.expiresAt)&&cleared(capabilityFor[feature])===true&&config.grants.some(grant=>grant.userId===userId&&grant.features.includes(feature)&&time<Date.parse(grant.expiresAt));
  } catch { return false; }
 };
 return new MeteredAIExecutor(new SpendLedger(deps.transaction,deps.identitySecret),(feature,userId)=>authorize(feature,userId)&&config.policies[feature]?{...config.policies[feature]!,limits:config.limits}:null,authorize,new SharedProviderCircuit(deps.transaction,config.circuits),now);
}
