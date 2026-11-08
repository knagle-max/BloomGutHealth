import type {Express} from 'express';
import binding from './config/isolated-review-binding.json';
type RuntimeObservation={serviceId?:string;commit?:string;configuredNeonEndpoint?:string;databaseNameHash?:string;configuration?:{isolatedSyntheticFlag?:boolean}};
/** This is a narrowly pinned review-environment attestation, not dataset approval,
 * clinical clearance or a user/account capability. No request input affects it. */
export function qualifiedReview(runtime:RuntimeObservation,schema:{status:string;phase?:string},now=Date.now()) {
 if(!Number.isFinite(now)||now>=Date.parse(binding.expiresAt)||
  runtime.serviceId!==binding.serviceId||runtime.configuredNeonEndpoint!==binding.endpointId||
  runtime.databaseNameHash!==binding.databaseNameHash||runtime.configuration?.isolatedSyntheticFlag!==true||
  schema.status!=='catalog-ready'||schema.phase!=='runtime'||!runtime.commit||!/^[a-f0-9]{40}$/.test(runtime.commit))return null;
 return {kind:'isolated-review' as const,commit:runtime.commit,expiresAt:binding.expiresAt};
}
export function registerReviewQualification(app:Express,runtime:RuntimeObservation,schema:{status:string;phase?:string}) {
 app.get('/api/review/qualification',(_req,res)=>{
  res.setHeader('Cache-Control','no-store');
  const result=qualifiedReview(runtime,schema);
  if(!result)return void res.status(404).json({available:false});
  res.json(result);
 });
}
