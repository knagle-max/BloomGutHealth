import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {ScientificReleaseStorage} from '../server/scientific-release-storage';
import {BiologyStorage,registryFingerprint} from '../server/biology-storage';
import {biologyScientificReleases,biologyScientificWithdrawals} from '../shared/schema';
import {scientificReleaseFixture} from './fixtures/scientific-release';
import {serializeScientificRelease,scientificReleasePayloadDigest} from '../server/scientific-release';
async function clean(){
 const pg=new PGlite();
 const existing=readFileSync(new URL('../migrations/0005_biological_registry.sql',import.meta.url),'utf8').split('INSERT INTO')[0];
 await pg.exec(existing);
 await pg.exec(readFileSync(new URL('../migrations/proposed/0018_biology_scientific_releases.sql',import.meta.url),'utf8'));
 return{pg,db:drizzle(pg)};
}
test('two fully clean isolated databases restore the same immutable release into existing graph tables and replay exactly',async()=>{
 const fixture=scientificReleaseFixture(),release=JSON.parse(fixture.bytes());
 const snapshots=[];
 for(let i=0;i<2;i++){
  const {pg,db}=await clean();
  try{
   const approvals={approvedReleaseDigests:new Set([JSON.parse(fixture.bytes()).digest])};const store=new ScientificReleaseStorage(db as any,async()=>({...fixture.current,...approvals,revision:'authority-v1'}));
   const first=await store.restore(release),replay=await store.restore(release);assert.deepEqual(replay,first);
   const retrieved=await store.retrieve('synthetic-release',['a']);assert.equal(retrieved.cards.length,1);assert.equal(retrieved.cards[0].review.findingDirection,'null');
   const registry=await new BiologyStorage(db as any).getBiologicalRegistry('synthetic-v1');
   assert.equal(registryFingerprint(registry),registryFingerprint(fixture.payload.registry));
   const manifests=await db.select().from(biologyScientificReleases);assert.equal(manifests.length,1);
   snapshots.push({digest:first.digest,registry:registryFingerprint(registry),manifest:manifests[0].manifest});
  }finally{await pg.close();}
 }
 assert.deepEqual(snapshots[0],snapshots[1]);
});
test('durable withdrawal is append-only across old release replay and current authority cannot silently erase it',async()=>{
 const {pg,db}=await clean(),fixture=scientificReleaseFixture(),release=JSON.parse(fixture.bytes());
 try{
  let revision='authority-v1';const approvals={approvedReleaseDigests:new Set([JSON.parse(fixture.bytes()).digest])};const store=new ScientificReleaseStorage(db as any,async()=>({...fixture.current,...approvals,revision}));
  const before=await store.restore(release);
  (fixture.current.withdrawals.relationshipIds as Set<string>).add('claim');revision='authority-v2';
  const withdrawn=await store.restore(release);assert.notEqual(withdrawn.currentEvidenceVersion,before.currentEvidenceVersion);
  (fixture.current.withdrawals.relationshipIds as Set<string>).clear();revision='authority-v3';
  const rollback=await store.restore(release);assert.equal(rollback.currentEvidenceVersion,withdrawn.currentEvidenceVersion);
  const retrieved=await store.retrieve('synthetic-release',['a']);assert.equal(retrieved.cards.length,0);assert.equal(retrieved.withheld,1);
  await assert.rejects(pg.exec('DELETE FROM biology_scientific_withdrawals'),/append-only/);
  await assert.rejects(pg.exec("UPDATE biology_scientific_releases SET digest = 'changed'"),/append-only/);
  const tombstones=await db.select().from(biologyScientificWithdrawals);assert.deepEqual(tombstones.map(row=>({kind:row.kind,id:row.targetId})),[{kind:'relationship',id:'claim'}]);
 }finally{await pg.close();}
});
test('a valid changed manifest cannot overwrite an immutable release ID; transaction leaves original graph untouched',async()=>{
 const {pg,db}=await clean(),fixture=scientificReleaseFixture();
 try{
  const approvals={approvedReleaseDigests:new Set([JSON.parse(fixture.bytes()).digest])};const store=new ScientificReleaseStorage(db as any,async()=>({...fixture.current,...approvals,revision:'authority-v1'}));
  const original=JSON.parse(fixture.bytes());await store.restore(original);
  fixture.payload.registry.summary='A different independently reviewed fixture summary';fixture.publication.approvedPayloadDigest=scientificReleasePayloadDigest(fixture.payload);
  const changed=JSON.parse(serializeScientificRelease(fixture.payload,fixture.publication,fixture.current));
  await assert.rejects(store.restore(changed),/NOT_APPROVED/);
  approvals.approvedReleaseDigests.add(changed.digest);
  await assert.rejects(store.restore(changed),/ID_COLLISION/);
  const manifests=await db.select().from(biologyScientificReleases);assert.equal(manifests.length,1);assert.equal(manifests[0].digest,original.digest);
  fixture.payload.id='another-release';fixture.publication.approvedPayloadDigest=scientificReleasePayloadDigest(fixture.payload);
  const newVersionCollision=JSON.parse(serializeScientificRelease(fixture.payload,fixture.publication,fixture.current));approvals.approvedReleaseDigests.add(newVersionCollision.digest);
  await assert.rejects(store.restore(newVersionCollision),/VERSION_COLLISION/);
  assert.equal((await db.select().from(biologyScientificReleases)).length,1);
 }finally{await pg.close();}
});
test('authority revocation during restore rolls back every graph and manifest write',async()=>{
 const {pg,db}=await clean(),fixture=scientificReleaseFixture();
 try{
  let calls=0;const approvals={approvedReleaseDigests:new Set([JSON.parse(fixture.bytes()).digest])};const store=new ScientificReleaseStorage(db as any,async()=>({...fixture.current,...approvals,revision:++calls===1?'v1':'v2'}));
  await assert.rejects(store.restore(JSON.parse(fixture.bytes())),/AUTHORITY_CHANGED/);
  assert.equal((await db.select().from(biologyScientificReleases)).length,0);
  await assert.rejects(new BiologyStorage(db as any).getBiologicalRegistry('synthetic-v1'),/not installed/);
 }finally{await pg.close();}
});

test('corrupted persisted graph is refused on reuse rather than trusted from its version label',async()=>{
 const {pg,db}=await clean(),fixture=scientificReleaseFixture();
 try{
  const approvals={approvedReleaseDigests:new Set([JSON.parse(fixture.bytes()).digest])};const store=new ScientificReleaseStorage(db as any,async()=>({...fixture.current,...approvals,revision:'authority-v1'}));
  await store.restore(JSON.parse(fixture.bytes()));
  await pg.exec("UPDATE biology_entities SET label = 'Corrupt replacement' WHERE id = 'a'");
  await assert.rejects(store.retrieve('synthetic-release',['a']),/fingerprint mismatch/);
 }finally{await pg.close();}
});

test('source/rights revocation observed during retrieval persists even without restoring a new release',async()=>{
 for(const kind of ['source','rights'] as const){
  const {pg,db}=await clean(),fixture=scientificReleaseFixture();
  try{
   let revision='v1';const approvals={approvedReleaseDigests:new Set([JSON.parse(fixture.bytes()).digest])};const store=new ScientificReleaseStorage(db as any,async()=>({...fixture.current,...approvals,revision}));
   await store.restore(JSON.parse(fixture.bytes()));
   const ids=kind==='source'?fixture.current.withdrawals.sourceIds:fixture.current.withdrawals.rightsIds;
   (ids as Set<string>).add(kind==='source'?'source':'synthetic-rights');revision='v2';
   assert.equal((await store.retrieve('synthetic-release',['a'])).cards.length,0);
   (ids as Set<string>).clear();revision='v3';
   assert.equal((await store.retrieve('synthetic-release',['a'])).cards.length,0);
   assert.equal((await db.select().from(biologyScientificWithdrawals)).length,1);
  }finally{await pg.close();}
 }
});
