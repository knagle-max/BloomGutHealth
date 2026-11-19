import {eq,sql} from 'drizzle-orm';
import {biologyVersions,biologyEntities,biologySources,biologyRelationships,biologyRelationshipSources,biologyScientificReleases,biologyScientificWithdrawals} from '../shared/schema';
import {BiologyStorage,registryFingerprint} from './biology-storage';
import {verifyScientificRelease} from './scientific-release';
import {retrieveReviewedScientificEvidence,type ScientificWithdrawals} from './scientific-evidence-retrieval';
import type {db as applicationDatabase} from './db';

export type CurrentScientificAuthority={revision:string;approvedReleaseDigests:ReadonlySet<string>;withdrawals:ScientificWithdrawals;now:number};
const authorityBinding=(value:CurrentScientificAuthority)=>JSON.stringify([value.revision,value.approvedReleaseDigests,value.withdrawals.relationshipIds,value.withdrawals.sourceIds,value.withdrawals.reviewIds,value.withdrawals.rightsIds].map(value=>value instanceof Set?Array.from(value).sort():value));
/** Knowledge ingestion only, not an HTTP route. Composition supplies a current
 * external source-review/withdrawal authority. An old release never supplies
 * its own permission or tombstones. No runtime installation is provisioned. */
export class ScientificReleaseStorage{
 constructor(private readonly db:Pick<typeof applicationDatabase,'transaction'>,private readonly authority:()=>Promise<CurrentScientificAuthority>){}
 async restore(untrusted:unknown){
  const before=structuredClone(await this.authority());
  if(!before.revision)throw Error('SCIENTIFIC_AUTHORITY_UNAVAILABLE');
  // Reject unreviewed/private/corrupt payloads before entering persistence.
  const initiallyVerified=verifyScientificRelease(untrusted,before);
  if(!before.approvedReleaseDigests.has(initiallyVerified.release.digest))throw Error('SCIENTIFIC_RELEASE_NOT_APPROVED');
  const originalAuthority=authorityBinding(before);
  return this.db.transaction(async tx=>{
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
   verifyScientificRelease(untrusted,{...after,withdrawals:merged});
   if(authorityBinding(after)!==originalAuthority)throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
   return {releaseId:release.payload.id,digest:release.digest,currentEvidenceVersion:checked.currentEvidenceVersion,clinicalReleasePermitted:false as const};
  });
 }
 /** Fresh retrieval for a future investigation. No historical permission/cache
  * can override the external authority plus monotone stored tombstones. */
 async retrieve(releaseId:string,entityIds:readonly string[]){
  if(!/^[a-zA-Z0-9_-]{5,100}$/.test(releaseId))throw Error('SCIENTIFIC_RELEASE_ID');
  const before=structuredClone(await this.authority());if(!before.revision)throw Error('SCIENTIFIC_AUTHORITY_UNAVAILABLE');
  return this.db.transaction(async tx=>{
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
   const after=structuredClone(await this.authority());if(authorityBinding(after)!==authorityBinding(before))throw Error('SCIENTIFIC_AUTHORITY_CHANGED');
   verifyScientificRelease(records[0].manifest,{...after,withdrawals:merged});
   return result;
  });
 }

}
