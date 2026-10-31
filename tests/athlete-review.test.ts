import test from 'node:test';import assert from 'node:assert/strict';
import {athleteProfileSchema}from'../shared/experience';
import {invalidateAthleteReview,athleteTargetInputKey,athleteHealthInputKey,athleteProfileSourceKey}from'../shared/athlete-review';
const saved=athleteProfileSchema.parse({weightKg:70,adult:true,pregnancyNo:true,healthReviewed:true,targetsConfirmed:true,energyKcal:2500,reviewDate:'2026-10-25'});
test('material edits invalidate carried review and replay cannot silently confirm the changed target set',()=>{
 const changed={...saved,weightKg:72};const oldProof={base:athleteProfileSourceKey(saved),targets:athleteTargetInputKey(saved),health:athleteHealthInputKey(saved)};
 assert.equal(invalidateAthleteReview(saved,changed,{...oldProof,targets:athleteTargetInputKey(changed)}).targetsConfirmed,true);
 const first=invalidateAthleteReview(saved,changed,oldProof);assert.equal(first.targetsConfirmed,false);assert.equal(first.healthReviewed,true);assert.equal(first.reviewDate,null);
 const replay=invalidateAthleteReview(first,changed,oldProof);assert.equal(replay.targetsConfirmed,false);
 const reviewed=invalidateAthleteReview(first,changed,{...oldProof,base:athleteProfileSourceKey(first),targets:athleteTargetInputKey(changed)});assert.equal(reviewed.targetsConfirmed,true);
 assert.equal(invalidateAthleteReview(reviewed,saved,oldProof).targetsConfirmed,false,"An acknowledgement from a superseded saved source must not restore old reviewed state");
 const healthChanged={...reviewed,pregnancyNo:false};const blocked=invalidateAthleteReview(reviewed,healthChanged,oldProof);assert.equal(blocked.healthReviewed,false);assert.equal(blocked.targetsConfirmed,false);
 assert.equal(saved.weightKg,70);assert.equal(saved.targetsConfirmed,true);assert.notEqual(athleteProfileSourceKey(saved),athleteProfileSourceKey(first));
});
test('source keys and acknowledgement preserve notes, canonical unit roundoff and independent reference provenance',()=>{
 const notes={...saved,teamPlanNotes:'Private team note',sport:'Cycling'};assert.equal(invalidateAthleteReview(saved,notes).targetsConfirmed,true);assert.equal(athleteProfileSourceKey(notes),athleteProfileSourceKey(saved));assert.equal(athleteProfileSourceKey(notes).includes('Private'),false);
 const roundoff={...saved,weightKg:70.000001};assert.equal(invalidateAthleteReview(saved,roundoff).targetsConfirmed,true);assert.equal(athleteTargetInputKey(roundoff),athleteTargetInputKey(saved));
 const initial=athleteProfileSchema.parse({});assert.equal(invalidateAthleteReview(initial,saved).targetsConfirmed,false);assert.equal(invalidateAthleteReview(initial,saved).healthReviewed,false);const explicit=invalidateAthleteReview(initial,saved,{base:athleteProfileSourceKey(initial),targets:athleteTargetInputKey(saved),health:athleteHealthInputKey(saved)});assert.equal(explicit.targetsConfirmed,true);assert.equal(explicit.healthReviewed,true);
});
