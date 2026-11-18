import {queryClient} from "./queryClient";
import {invalidatePlanningInputs} from "./planning-cache";

// Unknown write outcomes must also recheck linked source-derived values.
export function refreshMealSources(){return Promise.all([
  queryClient.invalidateQueries({predicate:query=>["/api/meals","/api/health/","/api/microbiome/diet-prediction","/api/experience/records","/api/experience/recorded-intake-sources"].some(prefix=>String(query.queryKey[0]).startsWith(prefix))}),
  invalidatePlanningInputs(),
]);}

