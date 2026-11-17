import {updateUserProfileSchema} from '../shared/schema';
import {profileMeasurementWriteSchema} from '../shared/profile-measurement-source';
import test from 'node:test';import assert from 'node:assert/strict';
import {ageInYear,labProfileDemographics} from '../shared/profile-demographics';
test('birth year derives each source year without using current age or inventing a birthday',()=>{
 const profile={birthYear:1970,age:99,sex:'female'};
 assert.equal(ageInYear(1970,2020),50);assert.equal(ageInYear(1970,2026),56);
 assert.deepEqual(labProfileDemographics(profile,'2020-02-01','2026-11-17T12:00:00Z'),{ageAtCollection:50,sexReferenceCategory:'F',ageBasis:'birth-year-collection',year:2020});
 assert.deepEqual(labProfileDemographics(profile,'','2022-11-17T12:00:00Z'),{ageAtCollection:52,sexReferenceCategory:'F',ageBasis:'birth-year-recorded',year:2022});
 assert.equal(labProfileDemographics(profile,'1960-01-01','2026-11-17T12:00:00Z').ageAtCollection,null,'A result before birth never uses the current age');
 assert.equal(labProfileDemographics(profile,'bad','bad').ageAtCollection,null);assert.equal(labProfileDemographics({age:40,sex:'male'},'2020-01-01','').ageAtCollection,null,'Current age is not copied into historical dates without a birth year');assert.equal(labProfileDemographics({sex:'unknown'},'2020-01-01','').sexReferenceCategory,null);
 for(const birthYear of [null,undefined,NaN,1970.5,'1970',1800,2300])assert.equal(ageInYear(birthYear,2026),null);
});

test('Profile birth year is an optional bounded year, not a guessed birthday or an alternate original-unit write path',()=>{
 assert.equal(updateUserProfileSchema.safeParse({birthYear:1970}).success,true);assert.equal(updateUserProfileSchema.safeParse({birthYear:null}).success,true);
 for(const year of ['1970',NaN,1970.5,1800,new Date().getUTCFullYear()+1])assert.equal(updateUserProfileSchema.safeParse({birthYear:year}).success,false);
 assert.equal(updateUserProfileSchema.safeParse({birthYear:1970,birthMonth:1}).success,false);
 assert.equal(profileMeasurementWriteSchema.safeParse({version:1,expectedRevision:'none',fields:{birthYear:1970}}).success,false);
});
