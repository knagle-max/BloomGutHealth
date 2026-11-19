import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ScientificReleaseStorage,type CurrentScientificAuthority} from '../server/scientific-release-storage';
import {biologyScientificCandidateReceipts,biologyScientificWithdrawals,biologyRelationships,biologyScientificReleases} from '../shared/schema';
import {isMigrationManagedTable,APPLICATION_TABLE_FILTER} from '../shared/schema-management';
import * as applicationSchema from '../shared/application-schema';
import {scientificCandidateFixture} from './fixtures/scientific-candidate';
import {prepareScientificCandidateProvenance} from '../server/scientific-candidate-provenance';
import {scientificReleaseFixture} from './fixtures/scientific-release';
import {scientificRegistryBinding} from '../server/scientific-evidence-retrieval';
import {scientificReleasePayloadDigest} from '../server/scientific-release';

async function clean(){
 const pg=new PGlite();
 await pg.exec(readFileSync(new URL('../migrations/0005_biological_registry.sql',import.meta.url),'utf8').split('INSERT INTO')[0]);
 for(const file of ['0018_biology_scientific_releases.sql','0019_biology_scientific_candidate_receipts.sql'])
  await pg.exec(readFileSync(new URL('../migrations/proposed/'+file,import.meta.url),'utf8'));
 return {pg,db:drizzle(pg)};
}
function authorityFixture(){
 const f=scientificCandidateFixture();
 const current:CurrentScientificAuthority={...f.authority,approvedReleaseDigests:new Set()};
 return {...f,current};
}
test('candidate receipt schema is proposed/migration-only, outside ordinary application schema push',()=>{
 assert.equal(isMigrationManagedTable('biology_scientific_candidate_receipts'),true);
 assert.ok(APPLICATION_TABLE_FILTER.includes('!biology_*'));
 assert.equal(Object.hasOwn(applicationSchema,'biologyScientificCandidateReceipts'),false);
});
test('two clean isolated databases retain/reuse the same immutable receipt without prose or graph promotion',async()=>{
 const f=authorityFixture(),receipts=[];
 for(let i=0;i<2;i++){
  const {pg,db}=await clean();
  try{
   const store=new ScientificReleaseStorage(db as any,async()=>f.current);
   // The second database sees metadata only, never the raw model candidate.
   const retained=i===0?await store.retainCandidateProvenance(f.result)
    :await store.restoreCandidateProvenance(JSON.parse(JSON.stringify(receipts[0])));
   assert.deepEqual(await store.restoreCandidateProvenance(retained),retained);
   assert.deepEqual(await store.retrieveCandidateProvenance(retained.id),retained);
   const rows=await db.select().from(biologyScientificCandidateReceipts);assert.equal(rows.length,1);
   const serialized=JSON.stringify(rows);
   for(const text of [f.request.question,f.request.sources[0].excerpt,f.result.claims.hypotheses[0].claim])assert.equal(serialized.includes(text),false);
   assert.equal((await db.select().from(biologyRelationships)).length,0);
   assert.equal((await db.select().from(biologyScientificReleases)).length,0);
   // Retention review must never be confused with scientific publication.
   (f.current.approvedReleaseDigests as Set<string>).add(retained.id);
   await assert.rejects(store.restore(retained));
   assert.equal((await db.select().from(biologyRelationships)).length,0);
   await assert.rejects(pg.exec('DELETE FROM biology_scientific_candidate_receipts'),/append-only/);
   receipts.push(retained);
  }finally{await pg.close();}
 }
 assert.deepEqual(receipts[0],receipts[1]);
});
test('rights-review withdrawal persists through old authority replay and rejects receipt restoration',async()=>{
 const {pg,db}=await clean(),f=authorityFixture();
 try{
  const store=new ScientificReleaseStorage(db as any,async()=>f.current),receipt=await store.retainCandidateProvenance(f.result);
  (f.current.withdrawals.rightsIds as Set<string>).add(f.task.review.id);f.current.revision='public-task-rights-withdrawn';
  assert.equal((await store.retrieveCandidateProvenance(receipt.id) as any).status,'withheld');
  (f.current.withdrawals.rightsIds as Set<string>).clear();f.current.revision='earlier-authority-replayed';
  await assert.rejects(store.restoreCandidateProvenance(receipt));
  assert.equal((await store.retrieveCandidateProvenance(receipt.id) as any).status,'withheld');
  const rows=await db.select().from(biologyScientificWithdrawals);
  assert.ok(rows.some(row=>row.kind==='rights'&&row.targetId===f.task.review.id));
 }finally{await pg.close();}
});
test('privacy containers are rejected before any transaction, and missing exact approval retains no candidate',async()=>{
 const f=authorityFixture();let transactions=0;
 const forbidden=new ScientificReleaseStorage({transaction:async()=>{transactions++;throw Error('must not persist');}} as any,async()=>f.current);
 await assert.rejects(forbidden.retainCandidateProvenance({...f.result,userId:'synthetic-account'}));assert.equal(transactions,0);
 await assert.rejects(forbidden.restoreCandidateProvenance({id:'a'.repeat(64),rawModelText:'synthetic discarded prose'}));assert.equal(transactions,0);
 const {pg,db}=await clean();
 try{
  (f.current.approvedCandidateReceiptDigests as Set<string>).clear();
  await assert.rejects(new ScientificReleaseStorage(db as any,async()=>f.current).retainCandidateProvenance(f.result));
  assert.equal((await db.select().from(biologyScientificCandidateReceipts)).length,0);
 }finally{await pg.close();}
});
test('write readback refuses a row containing a different separately approved receipt',async()=>{
 const {pg,db}=await clean(),f=authorityFixture();
 try{
  const expected=prepareScientificCandidateProvenance(f.result,f.authority);
  const other=structuredClone(f.result);other.claims.hypotheses[0].claim='Another synthetic candidate, not the retained result.';
  const substituted=prepareScientificCandidateProvenance(other,f.authority);
  (f.current.approvedCandidateReceiptDigests as Set<string>).add(substituted.id);
  await db.insert(biologyScientificCandidateReceipts).values({id:expected.id,candidateDigest:expected.payload.candidateDigest,receipt:substituted});
  const store=new ScientificReleaseStorage(db as any,async()=>f.current);
  await assert.rejects(store.retainCandidateProvenance(f.result));
  assert.equal((await store.retrieveCandidateProvenance(expected.id) as any).status,'withheld');
 }finally{await pg.close();}
});
test('observed source withdrawal remains latched after catalog/policy rollback',async()=>{
 const {pg,db}=await clean(),f=authorityFixture();
 try{
  const store=new ScientificReleaseStorage(db as any,async()=>f.current),receipt=await store.retainCandidateProvenance(f.result);
  (f.current.withdrawals.sourceIds as Set<string>).add('synthetic-public-source');f.current.revision='source-withdrawn';
  assert.equal((await store.retrieveCandidateProvenance(receipt.id) as any).status,'withheld');
  (f.current.withdrawals.sourceIds as Set<string>).clear();f.current.revision='older-policy-restored';
  assert.equal((await store.retrieveCandidateProvenance(receipt.id) as any).status,'withheld');
  await assert.rejects(store.retainCandidateProvenance(f.result));
  const rows=await db.select().from(biologyScientificWithdrawals);
  assert.ok(rows.some(row=>row.kind==='source'&&row.targetId==='synthetic-public-source'));
 }finally{await pg.close();}
});
test('withdrawal observed during candidate transaction aborts write and survives the rejected transaction',async()=>{
 const {pg,db}=await clean(),f=authorityFixture();let calls=0;
 try{
  const store=new ScientificReleaseStorage(db as any,async()=>{
   if(++calls===4){f.current.revision='new-source-withdrawal';(f.current.withdrawals.sourceIds as Set<string>).add('synthetic-public-source');}
   return f.current;
  });
  await assert.rejects(store.retainCandidateProvenance(f.result));
  assert.equal((await db.select().from(biologyScientificCandidateReceipts)).length,0);
  const rows=await db.select().from(biologyScientificWithdrawals);
  assert.ok(rows.some(row=>row.kind==='source'&&row.targetId==='synthetic-public-source'));
 }finally{await pg.close();}
});
test('retention approval revocation and expired public review withhold an old receipt',async()=>{
 const {pg,db}=await clean(),f=authorityFixture();
 try{
  const store=new ScientificReleaseStorage(db as any,async()=>f.current),receipt=await store.retainCandidateProvenance(f.result);
  (f.current.approvedCandidateReceiptDigests as Set<string>).clear();f.current.revision='retention-revoked';
  assert.equal((await store.retrieveCandidateProvenance(receipt.id) as any).status,'withheld');
  (f.current.approvedCandidateReceiptDigests as Set<string>).add(receipt.id);
  f.current.publicTasks![0].review.validUntil='2020-01-01T00:00:00Z';
  assert.equal((await store.retrieveCandidateProvenance(receipt.id) as any).status,'withheld');
 }finally{await pg.close();}
});
test('candidate source withdrawal invalidates matching reviewed evidence across rollback while unrelated evidence survives',async()=>{
 const {pg,db}=await clean(),f=authorityFixture(),science=scientificReleaseFixture();
 try{
  const registry=science.payload.registry,sourceId=f.request.sources[0].sourceId;
  registry.sources[0].id=sourceId;
  registry.relationships[0].sourceIds=[sourceId];
  science.payload.reviews[0].sourceId=sourceId;
  const otherSource={...registry.sources[0],id:'unrelated-synthetic-source',url:'https://example.org/unrelated'};
  const otherClaim={...registry.relationships[0],id:'unrelated-claim',sourceIds:[otherSource.id]};
  registry.sources.push(otherSource);registry.relationships.push(otherClaim);
  const otherReview=structuredClone(science.payload.reviews[0]);
  otherReview.id='unrelated-review';otherReview.relationshipId=otherClaim.id;otherReview.sourceId=otherSource.id;
  otherReview.review.id='unrelated-source-decision';otherReview.rights.id='unrelated-rights';otherReview.rights.sourceUrl=otherSource.url;
  science.payload.reviews.push(otherReview);
  for(const review of science.payload.reviews){
   const claim=registry.relationships.find(row=>row.id===review.relationshipId)!;
   review.registryBinding=scientificRegistryBinding(registry,claim,review.sourceId);
  }
  science.publication.approvedPayloadDigest=scientificReleasePayloadDigest(science.payload);
  const release=JSON.parse(science.bytes());
  (f.current.approvedReleaseDigests as Set<string>).add(release.digest);
  const store=new ScientificReleaseStorage(db as any,async()=>f.current);
  const candidate=await store.retainCandidateProvenance(f.result);
  await store.restore(release);
  assert.equal((await store.retrieve(release.payload.id,['a'])).cards.length,2);
  // Observe the shared source withdrawal through the candidate path only.
  (f.current.withdrawals.sourceIds as Set<string>).add(sourceId);f.current.revision='source-withdrawn';
  assert.equal((await store.retrieveCandidateProvenance(candidate.id) as any).status,'withheld');
  (f.current.withdrawals.sourceIds as Set<string>).clear();f.current.revision='old-root-replayed';
  await store.restore(release);
  const evidence=await store.retrieve(release.payload.id,['a']);
  assert.deepEqual(evidence.cards.map(card=>card.relationship.id),['unrelated-claim']);
  assert.equal(evidence.withheld,1);
  assert.equal((await store.retrieveCandidateProvenance(candidate.id) as any).status,'withheld');
 }finally{await pg.close();}
});
