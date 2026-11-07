import type { AthleteProfile } from './experience';
export type AthleteBlockerReason = 'profile_unreviewed' | 'reference_mass_missing' | 'health_context_requires_review' | 'targets_unconfirmed' | 'target_conflict' | 'data_stale' | 'source_unavailable' | 'unsupported_context';
export const athleteBlockerMessage: Record<AthleteBlockerReason, string> = {
  profile_unreviewed: 'Review the athlete health context before using personal numerical targets.',
  reference_mass_missing: 'Save an Athlete reference body mass before using mass-based targets.',
  health_context_requires_review: 'Your recorded health context needs individual professional review before automated fueling guidance.',
  targets_unconfirmed: 'Review and confirm the current target set before using personal numerical guidance.',
  target_conflict: 'The energy and macro targets conflict: minimum carbohydrate and protein leave less than 20% of energy for fat. Review the target set with your support team before using it.',
  data_stale: 'Current source data is being checked. Previous numerical targets are withheld.',
  source_unavailable: 'Current fueling sources could not be checked. Numerical guidance is unavailable.',
  unsupported_context: 'Adult and pregnancy eligibility is unconfirmed or unsupported for automated fueling. Individual professional planning may be needed.',
};
/** Shared eligibility only; never turns self-report into clinical clearance.
 * The workload band is supplied by the calling day/session context. */
export function athleteBlockers(profile: AthleteProfile, minimumCarbsGkg: number): AthleteBlockerReason[] {
  const reasons: AthleteBlockerReason[] = [];
  if (!profile.healthReviewed) reasons.push('profile_unreviewed');
  if (!profile.weightKg || !Number.isFinite(profile.weightKg)) reasons.push('reference_mass_missing');
  if (profile.needsClinicalReview) reasons.push('health_context_requires_review');
  if (!profile.adult || !profile.pregnancyNo) reasons.push('unsupported_context');
  if (!profile.targetsConfirmed) reasons.push('targets_unconfirmed');
  if (profile.weightKg && profile.energyKcal !== null) {
    const minimum = profile.carbGkgMin ?? minimumCarbsGkg;
    const carbEnergy = Math.round(minimum * profile.weightKg) * 4;
    const proteinEnergy = Math.round(profile.proteinGkg * profile.weightKg) * 4;
    if (carbEnergy + proteinEnergy > profile.energyKcal * .8) reasons.push('target_conflict');
  }
  return reasons;
}
