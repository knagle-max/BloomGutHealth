import type { AthleteProfile } from './experience';
export const athleteTargetReviewFields = ['weightKg','proteinGkg','carbGkgMin','carbGkgMax','energyKcal','discipline','adult','pregnancyNo','needsClinicalReview','gutTrained'] as const;
export const athleteHealthReviewFields = ['adult','pregnancyNo','needsClinicalReview'] as const;
const equal = (key: keyof AthleteProfile, a: AthleteProfile, b: AthleteProfile) => key==='weightKg'&&a.weightKg!==null&&b.weightKg!==null ? Math.abs(a.weightKg-b.weightKg)<.00001 : a[key]===b[key];
/** Called with the current saved version under the account's storage lock.
 * Existing review cannot silently carry into changed reference/eligibility inputs.
 * A previously unconfirmed user may explicitly review newly entered values. */
export function athleteTargetInputKey(profile:AthleteProfile):string {
 return JSON.stringify(['athlete-target-inputs-v1',...athleteTargetReviewFields.map(key=>key==='weightKg'&&profile.weightKg!==null?Math.round(profile.weightKg*1e5)/1e5:profile[key])]);
}
export function athleteHealthInputKey(profile:AthleteProfile):string {
 return JSON.stringify(['athlete-health-inputs-v1',...athleteHealthReviewFields.map(key=>profile[key])]);
}
export function invalidateAthleteReview(current: AthleteProfile, proposed: AthleteProfile, review?:{base?:string;targets?:string;health?:string}): AthleteProfile {
 const targetChanged=athleteTargetReviewFields.some(key=>!equal(key,current,proposed));
 const healthChanged=athleteHealthReviewFields.some(key=>!equal(key,current,proposed));
 const targetNeedsReview=targetChanged||!current.targetsConfirmed;
 const healthNeedsReview=healthChanged||!current.healthReviewed;
 const reviewIsCurrent=review?.base===athleteProfileSourceKey(current);
 const targetsConfirmed=proposed.targetsConfirmed&&(!targetNeedsReview||reviewIsCurrent&&review?.targets===athleteTargetInputKey(proposed));
 const healthReviewed=proposed.healthReviewed&&(!healthNeedsReview||reviewIsCurrent&&review?.health===athleteHealthInputKey(proposed));
 return {...proposed,targetsConfirmed,healthReviewed,...(targetChanged&&!targetsConfirmed?{reviewDate:null}:{})};
}
/** Non-secret source identity, not authorization or proof of clinical review.
 * No free-text health/team notes; canonical mass tolerates conversion roundoff. */
export function athleteProfileSourceKey(profile: AthleteProfile): string {
  return JSON.stringify(['athlete-reference-v1',...athleteTargetReviewFields.map(key=>key==='weightKg'&&profile.weightKg!==null?Math.round(profile.weightKg*1e5)/1e5:profile[key]),profile.healthReviewed,profile.targetsConfirmed,profile.trainingPhase,profile.level]);
}
