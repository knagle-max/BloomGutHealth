import test from "node:test";
import assert from "node:assert/strict";
import { athleteProfileSchema } from "../shared/experience";
import { buildAthleteDay } from "../shared/athlete";
const recordedAt="2026-10-23T18:00:00Z";
test("legacy Athlete mass stays independent with unknown source/date",()=>{
 const p=athleteProfileSchema.parse({weightKg:75});
 assert.equal(p.massReference,null);
 assert.equal(p.weightKg,75);
});
test("explicit Profile-copy provenance matches the reference and grants no safety clearance",()=>{
 const p=athleteProfileSchema.parse({weightKg:80,massReference:{source:"profile-copy",recordedAt,profileWeightKg:80}});
 assert.equal(p.massReference?.profileWeightKg,80);
 assert.equal(p.adult,false);assert.equal(p.healthReviewed,false);assert.equal(p.targetsConfirmed,false);
 assert.equal(buildAthleteDay(p,[],[],[]).blocked,true);
 for(const weightKg of [null,75])assert.equal(athleteProfileSchema.safeParse({...p,weightKg}).success,false);
 assert.equal(athleteProfileSchema.safeParse({...p,massReference:{source:"profile-copy",recordedAt,profileWeightKg:null}}).success,false);
});
test("manual reference records do not claim a Profile source",()=>{
 assert.equal(athleteProfileSchema.safeParse({weightKg:81,massReference:{source:"manual",recordedAt,profileWeightKg:null}}).success,true);
 assert.equal(athleteProfileSchema.safeParse({weightKg:81,massReference:{source:"manual",recordedAt,profileWeightKg:80}}).success,false);
 assert.equal(athleteProfileSchema.safeParse({weightKg:null,massReference:{source:"manual",recordedAt,profileWeightKg:null}}).success,false);
});
