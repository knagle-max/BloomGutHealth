import {eq,sql} from 'drizzle-orm';
import {biologyVersions,biologyEntities,biologySources,biologyRelationships,biologyRelationshipSources,biologyScientificReleases,biologyScientificWithdrawals,biologyScientificCandidateReceipts} from '../shared/schema';
import {BiologyStorage,registryFingerprint} from './biology-storage';
import {verifyScientificRelease} from './scientific-release';
import {retrieveReviewedScientificEvidence,type ScientificWithdrawals} from './scientific-evidence-retrieval';
import type {db as applicationDatabase} from './db';
import type {ReviewedPublicResearchTask} from './scientific-question-boundary';
import {scientificCandidateDigest,parseScientificCandidateProvenance,buildScientificCandidateProvenance,verifyScientificCandidateProvenance,ScientificCandidateUnavailable,type CandidateRetentionAuthority} from './scientific-candidate-provenance';

export type CurrentScientificAuthority={revision:string;approvedReleaseDigests:ReadonlySet<string>;withdrawals:ScientificWithdrawals;now:number;
 publicTasks?:readonly ReviewedPublicResearchTask[];approvedCandidateReceiptDigests?:ReadonlySet<string>};
const authorityBinding=(value:CurrentScientificAuthority)=>JSON.stringify([value.revision,value.approvedReleaseDigests,value.withdrawals.relationshipIds,value.withdrawals.sourceIds,value.withdrawals.reviewIds,value.withdrawals.rightsIds].map(value=>value instanceof Set?Array.from(value).sort():value));
type ScienceTransaction=Parameters<Parameters<typeof applicationDatabase.transaction>[0]>[0];
const candidateBinding=(value:CurrentScientificAuthority)=>JSON.stringify([authorityBinding(value),value.publicTasks??[],Array.from(value.approvedCandidateReceiptDigests??[]).sort()]);
const candidateAuthority=(current:CurrentScientificAuthority,withdrawals:ScientificWithdrawals):CandidateRetentionAuthority=>({
 revision:current.revision,now:current.now,publicTasks:current.publicTasks??[],
 approvedCandidateReceiptDigests:current.approvedCandidateReceiptDigests??new Set(),withdrawals,
});
/** Knowledge ingestion only, not an HTTP route. Composition supplies a current
 * external source-review/withdrawal authority. An old release never supplies
 * its own permission or tombstones. No runtime installation is provisioned. */
export class ScientificReleaseStorage{
 constructor(private readonly db:Pick<typeof applicationDatabase,'transaction'>,private readonly authority:()=>Promise<CurrentScientificAuthority>){}
 private async latchObservedWithdrawals(observed:readonly CurrentScientificAuthority[]){
  const snapshots=observed.filter(value=>Boolean(value.revision));
  if(!snapshots.length)return;
  // This independent transaction only appends trusted policy withdrawals. It
  // cannot approve a candidate or undo a revocation when its write rolls back.
  await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(724991812)`);
   for(const snapshot of snapshots)await this.candidateWithdrawals(tx,snapshot);
  });
 }
 /** Observe trusted withdrawals independently from a candidate write. A refused
  * candidate must not roll back an already stable, observed source revocation. */
 async observeCurrentWithdrawals(){
  const before=structuredClone(await this.authority());if(!before.revision)throw Error('SCIENTIFIC_AUTHORITY_UNAVAILABLE');
  const observed=[before];
  try{await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(724991812)`);
   await this.candidateWithdrawals(tx,before);
   const after=structuredClone(await this.authority());
   observed.push(after);
   if(authorityBinding(before)!==authorityBinding(after))throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
  });}finally{await this.latchObservedWithdrawals(observed);}
 }
 private async candidateWithdrawals(tx:ScienceTransaction,current:CurrentScientificAuthority):Promise<ScientificWithdrawals>{
  const merged={relationshipIds:new Set(current.withdrawals.relationshipIds),sourceIds:new Set(current.withdrawals.sourceIds),
   reviewIds:new Set(current.withdrawals.reviewIds),rightsIds:new Set(current.withdrawals.rightsIds)};
  const kinds={relationship:merged.relationshipIds,source:merged.sourceIds,review:merged.reviewIds,rights:merged.rightsIds};
  for(const row of await tx.select().from(biologyScientificWithdrawals)){
   const target=kinds[row.kind as keyof typeof kinds];if(!target)throw Error('SCIENTIFIC_WITHDRAWAL_INVALID');target.add(row.targetId);
  }
  for(const [kind,ids] of Object.entries(kinds))for(const targetId of Array.from(ids))
   await tx.insert(biologyScientificWithdrawals).values({kind,targetId}).onConflictDoNothing();
  return merged;
 }
 async retainCandidateProvenance(untrusted:unknown){
  scientificCandidateDigest(untrusted); // Strict DTO rejection before persistence.
  const input=structuredClone(untrusted);
  return this.persistCandidate(authority=>buildScientificCandidateProvenance(input,authority));
 }
 /** Restore approved metadata without keeping/replaying provider text. */
 async restoreCandidateProvenance(untrusted:unknown){
  const receipt=parseScientificCandidateProvenance(untrusted);
  return this.persistCandidate(authority=>verifyScientificCandidateProvenance(receipt,authority));
 }
 private async persistCandidate(build:(authority:CandidateRetentionAuthority)=>ReturnType<typeof buildScientificCandidateProvenance>){
  await this.observeCurrentWithdrawals();
  const before=structuredClone(await this.authority());
  const observed=[before];
  try{return await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(724991812)`);
   const withdrawals=await this.candidateWithdrawals(tx,before);
   const receipt=build(candidateAuthority(before,withdrawals));
   await tx.insert(biologyScientificCandidateReceipts).values({id:receipt.id,candidateDigest:receipt.payload.candidateDigest,receipt}).onConflictDoNothing();
   const rows=await tx.select().from(biologyScientificCandidateReceipts).where(eq(biologyScientificCandidateReceipts.id,receipt.id));
   if(rows.length!==1||rows[0].candidateDigest!==receipt.payload.candidateDigest)throw Error('SCIENTIFIC_CANDIDATE_INTEGRITY');
   const stored=verifyScientificCandidateProvenance(rows[0].receipt,candidateAuthority(before,withdrawals));
   if(stored.id!==receipt.id||stored.payload.candidateDigest!==rows[0].candidateDigest)throw Error('SCIENTIFIC_CANDIDATE_INTEGRITY');
   const after=structuredClone(await this.authority());
   observed.push(after);
   verifyScientificCandidateProvenance(rows[0].receipt,candidateAuthority(after,withdrawals));
   if(candidateBinding(before)!==candidateBinding(after))throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
   return receipt;
  });}finally{await this.latchObservedWithdrawals(observed);}
 }
 async retrieveCandidateProvenance(id:string){
  if(!/^[a-f0-9]{64}$/.test(id))throw new ScientificCandidateUnavailable();
  await this.observeCurrentWithdrawals();
  const before=structuredClone(await this.authority());
  const observed=[before];
  try{return await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(724991812)`);
   const withdrawals=await this.candidateWithdrawals(tx,before);
   const rows=await tx.select().from(biologyScientificCandidateReceipts).where(eq(biologyScientificCandidateReceipts.id,id));
   let result:null|{id:string;status:'withheld';knowledgePromotionPermitted:false}|ReturnType<typeof verifyScientificCandidateProvenance>=null;
   if(rows.length){
    try{
     const receipt=verifyScientificCandidateProvenance(rows[0].receipt,candidateAuthority(before,withdrawals));
     if(receipt.id!==id||receipt.payload.candidateDigest!==rows[0].candidateDigest)throw new ScientificCandidateUnavailable();
     result=receipt;
    }catch(error){if(!(error instanceof ScientificCandidateUnavailable))throw error;result={id,status:'withheld',knowledgePromotionPermitted:false};}
   }
   const after=structuredClone(await this.authority());
   observed.push(after);
   if(candidateBinding(before)!==candidateBinding(after))throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
   if(result&&'payload' in result){
    try{verifyScientificCandidateProvenance(result,candidateAuthority(after,withdrawals));}
    catch(error){if(!(error instanceof ScientificCandidateUnavailable))throw error;result={id,status:'withheld',knowledgePromotionPermitted:false};}
   }
   return result;
  });}finally{await this.latchObservedWithdrawals(observed);}
 }
 async restore(untrusted:unknown){
  const before=structuredClone(await this.authority());
  if(!before.revision)throw Error('SCIENTIFIC_AUTHORITY_UNAVAILABLE');
  // Reject unreviewed/private/corrupt payloads before entering persistence.
  const initiallyVerified=verifyScientificRelease(untrusted,before);
  if(!before.approvedReleaseDigests.has(initiallyVerified.release.digest))throw Error('SCIENTIFIC_RELEASE_NOT_APPROVED');
  const originalAuthority=authorityBinding(before);
  const observed=[before];
  try{return await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(724991812)`);
   const stored=await tx.select().from(biologyScientificWithdrawals);
   const merged:ScientificWithdrawals={relationshipIds:new Set(before.withdrawals.relationshipIds),sourceIds:new Set(before.withdrawals.sourceIds),reviewIds:new Set(before.withdrawals.reviewIds),rightsIds:new Set(before.withdrawals.rightsIds)};
   const kinds={relationship:merged.relationshipIds,source:merged.sourceIds,review:merged.reviewIds,rights:merged.rightsIds};
   for(const row of stored){const target=kinds[row.kind as keyof typeof kinds];if(!target)throw Error('SCIENTIFIC_WITHDRAWAL_INVALID');(target as Set<string>).add(row.targetId);}
   const checked=verifyScientificRelease(untrusted,{...before,withdrawals:merged}),release=checked.release;
   const existing=await tx.select().from(biologyScientificReleases).where(eq(biologyScientificReleases.id,release.payload.id));
   if(existing.length&&existing[0].digest!==release.digest)throw Error('SCIENTIFIC_RELEASE_ID_COLLISION');
   const registry=release.payload.registry,fingerprint=registryFingerprint(registry);
   const versions=await tx.select().from(biologyVersions).where(eq(biologyVersions.version,registry.version));
   if(versions.length&&versions[0].fingerprint!==fingerprint)throw Error('SCIENTIFIC_REGISTRY_VERSION_COLLISION');
   await tx.insert(biologyVersions).values({version:registry.version,fingerprint,summary:registry.summary}).onConflictDoNothing();
   for(const row of registry.entities)await tx.insert(biologyEntities).values({...row,version:registry.version}).onConflictDoNothing();
   for(const row of registry.sources)await tx.insert(biologySources).values({...row,version:registry.version}).onConflictDoNothing();
   for(const row of registry.relationships){
    const {id,from,to,evidence,confidence,rule,sourceIds,...details}=row;
    await tx.insert(biologyRelationships).values({version:registry.version,id,from,to,evidence,confidence,rule,details}).onConflictDoNothing();
    for(const sourceId of sourceIds)await tx.insert(biologyRelationshipSources).values({version:registry.version,relationshipId:id,sourceId}).onConflictDoNothing();
   }
   for(const [kind,ids] of Object.entries(kinds))for(const targetId of Array.from(ids))await tx.insert(biologyScientificWithdrawals).values({kind,targetId}).onConflictDoNothing();
   await tx.insert(biologyScientificReleases).values({id:release.payload.id,digest:release.digest,manifest:release}).onConflictDoNothing();
   const restored=await new BiologyStorage(tx).getBiologicalRegistry(registry.version);
   if(registryFingerprint(restored)!==fingerprint)throw Error('SCIENTIFIC_REGISTRY_CONTENT_MISMATCH');
   const after=structuredClone(await this.authority());
   observed.push(after);
   verifyScientificRelease(untrusted,{...after,withdrawals:merged});
   if(authorityBinding(after)!==originalAuthority)throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
   return {releaseId:release.payload.id,digest:release.digest,currentEvidenceVersion:checked.currentEvidenceVersion,clinicalReleasePermitted:false as const};
  });}finally{await this.latchObservedWithdrawals(observed);}
 }
 /** Fresh retrieval for a future investigation. No historical permission/cache
  * can override the external authority plus monotone stored tombstones. */
 async retrieve(releaseId:string,entityIds:readonly string[]){
  if(!/^[a-zA-Z0-9_-]{5,100}$/.test(releaseId))throw Error('SCIENTIFIC_RELEASE_ID');
  const before=structuredClone(await this.authority());if(!before.revision)throw Error('SCIENTIFIC_AUTHORITY_UNAVAILABLE');
  const observed=[before];
  try{return await this.db.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(724991812)`);
   const records=await tx.select().from(biologyScientificReleases).where(eq(biologyScientificReleases.id,releaseId));
   if(records.length!==1)throw Error('SCIENTIFIC_RELEASE_NOT_INSTALLED');
   const stored=await tx.select().from(biologyScientificWithdrawals);
   const merged:ScientificWithdrawals={relationshipIds:new Set(before.withdrawals.relationshipIds),sourceIds:new Set(before.withdrawals.sourceIds),reviewIds:new Set(before.withdrawals.reviewIds),rightsIds:new Set(before.withdrawals.rightsIds)};
   const kinds={relationship:merged.relationshipIds,source:merged.sourceIds,review:merged.reviewIds,rights:merged.rightsIds};
   for(const row of stored){const target=kinds[row.kind as keyof typeof kinds];if(!target)throw Error('SCIENTIFIC_WITHDRAWAL_INVALID');(target as Set<string>).add(row.targetId);}
   // Persist newly observed authority withdrawals as well: a later rollback
   // cannot revive a claim merely because the reader saw its revocation first.
   for(const [kind,ids] of Object.entries(kinds))for(const targetId of Array.from(ids))await tx.insert(biologyScientificWithdrawals).values({kind,targetId}).onConflictDoNothing();
   const verified=verifyScientificRelease(records[0].manifest,{...before,withdrawals:merged});
   if(!before.approvedReleaseDigests.has(verified.release.digest))throw Error('SCIENTIFIC_RELEASE_NOT_APPROVED');
   if(verified.release.digest!==records[0].digest)throw Error('SCIENTIFIC_RELEASE_INTEGRITY');
   const registry=await new BiologyStorage(tx).getBiologicalRegistry(verified.release.payload.registry.version);
   if(registryFingerprint(registry)!==registryFingerprint(verified.release.payload.registry))throw Error('SCIENTIFIC_REGISTRY_CONTENT_MISMATCH');
   const result=retrieveReviewedScientificEvidence({registry,reviews:verified.release.payload.reviews,withdrawals:merged,query:{entityIds:[...entityIds]},now:before.now});
   const after=structuredClone(await this.authority());observed.push(after);if(authorityBinding(after)!==authorityBinding(before))throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
   verifyScientificRelease(records[0].manifest,{...after,withdrawals:merged});
   return result;
  });}finally{await this.latchObservedWithdrawals(observed);}
 }

}
