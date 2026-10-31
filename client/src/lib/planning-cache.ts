import {queryClient} from './queryClient';
// These responses depend on recorded health context, food preferences or
// profile inputs. Public composition/catalogue data has no such dependency.
const affected = (query: {queryKey:readonly unknown[]}) => {
 const path=String(query.queryKey[0]);
 return ['/api/precision','/api/nutrition','/api/biology/foods','/api/meal-planner','/api/experience/athlete-day','/api/experience/day-choices']
  .some(root=>path===root||path.startsWith(root+'/'));
};
export const invalidatePlanningInputs=()=>queryClient.invalidateQueries({predicate:affected});
// Successful erasure must discard old derived personal values, including
// inactive query variants, before active screens fetch the remaining inputs.
export const resetPlanningInputs=()=>{
 // Completed source-write responses may contain the original deleted lab or
 // genetic record. Discard browser mutation receipts after confirmed erasure;
 // this does not cancel requests or delete unrelated persisted journal data.
 queryClient.getMutationCache().clear();
 return queryClient.resetQueries({predicate:affected});
};
