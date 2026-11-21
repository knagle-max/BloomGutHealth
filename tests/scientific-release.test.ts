import {test} from 'node:test';
import assert from 'node:assert/strict';
import {biologicalRegistrySchema} from '../shared/biological-model';
import {scientificRegistryBinding,scientificExcerptDigest,type ScientificWithdrawals} from '../server/scientific-evidence-retrieval';
import {scientificReleasePayloadDigest,serializeScientificRelease,verifyScientificRelease} from '../server/scientific-release';
import {scientificReleaseFixture as fixture} from './fixtures/scientific-release';
test('same public graph has deterministic immutable bytes independent of record collection order',()=>{
 const f=fixture(),first=f.bytes();f.payload.registry.entities.reverse();assert.equal(f.bytes(),first);
 const verified=verifyScientificRelease(JSON.parse(first),f.current);assert.equal(verified.clinicalReleasePermitted,false);assert.equal(verified.modelTrainingPermitted,false);assert.match(verified.release.digest,/^[a-f0-9]{64}$/);
});
test('tampered claim, excerpt or manifest digest cannot restore as an approved release',()=>{
 const f=fixture();
 for(const mutate of [(r:any)=>{r.payload.registry.relationships[0].claim='Altered unsupported claim';},(r:any)=>{r.payload.reviews[0].excerpt='Altered source excerpt';},(r:any)=>{r.digest='0'.repeat(64);}]){const release=JSON.parse(f.bytes());mutate(release);assert.throws(()=>verifyScientificRelease(release,f.current));}
});
test('private metadata, observations, prompts and direct provider candidates are structurally excluded',()=>{
 const f=fixture();
 for(const key of ['accountId','observations','prompt','providerResponse'])assert.throws(()=>scientificReleasePayloadDigest({...f.payload,[key]:'private'}));
 (f.payload.registry.entities[0].metadata as any).userId='private';assert.throws(()=>f.bytes());
 assert.throws(()=>verifyScientificRelease({status:'candidate_unreviewed',claims:[]},f.current));
});
test('independent publication approval cannot be manufactured by the serializer or reused after changes',()=>{
 const f=fixture();assert.throws(()=>serializeScientificRelease(f.payload,{},f.current));
 f.payload.registry.summary='An edited public summary';assert.throws(()=>f.bytes(),/INTEGRITY/);
});
test('restoring old release retains current withdrawal effects and cannot regain clinical authority',()=>{
 const f=fixture(),release=JSON.parse(f.bytes()),before=verifyScientificRelease(release,f.current);
 (f.current.withdrawals.relationshipIds as Set<string>).add('claim');
 const after=verifyScientificRelease(release,f.current);assert.notEqual(before.currentEvidenceVersion,after.currentEvidenceVersion);assert.equal(after.release.digest,before.release.digest);assert.equal(after.clinicalReleasePermitted,false);
});
test('graph edges without exact current original-source review cannot be packaged even if publication digest is approved',()=>{
 const f=fixture();f.payload.reviews[0].registryBinding='b'.repeat(64);f.publication.approvedPayloadDigest=scientificReleasePayloadDigest(f.payload);assert.throws(()=>f.bytes(),/UNREVIEWED/);
});
