import type {PrecisionContext} from "./precision-nutrition";
import type {DietaryPreferences} from "./meal-intelligence";
import type {goalGuidance,goalSources} from "./goal-guidance";

/** Read-only first v0.6 context. Missing source dates stay unknown; a view time
 * never becomes a collection date or grants permission for another purpose. */
export interface WellnessContext {
  version:"wellness-context-2026-11-07.1";
  accountScope:string;
  purpose:"personal-wellness";
  asOf:string;
  revision:string;
  evidenceVersion:string;
  goals:ReturnType<typeof goalGuidance>[];
  sources:typeof goalSources;
  constraints:Pick<PrecisionContext,"ageGroup"|"pregnancy"|"safetyReviewed"> & {
    allergies:string[]|null;
    intolerances:string[]|null;
    conditions:string[]|null;
    medications:string[]|null;
  };
  preferences:{exclusions:DietaryPreferences["exclusions"]|null;dislikes:string[]|null;dietaryPattern:DietaryPreferences["dietaryPattern"]|null};
  inputSources:{sourceId:"saved-health-context"|"nutrition-profile";revision:string;observedAt:null;dateStatus:"not-recorded";valueKind:"self-reported";permissionScope:"own-account-app"}[];
  missing:string[];
  conflicts:string[];
}
