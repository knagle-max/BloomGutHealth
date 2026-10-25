import {queryClient} from './queryClient';
// These responses depend on recorded health context, food preferences or
// profile inputs. Public composition/catalogue data has no such dependency.
const affected = (query: {queryKey:readonly unknown[]}) => {
 const path=String(query.queryKey[0]);
 return ['/api/precision','/api/nutrition','/api/biology/foods','/api/meal-planner']
  .some(root=>path===root||path.startsWith(root+'/'));
};
export const invalidatePlanningInputs=()=>queryClient.invalidateQueries({predicate:affected});
// Successful erasure must discard old derived personal values, including
// inactive query variants, before active screens fetch the remaining inputs.
export const resetPlanningInputs=()=>queryClient.resetQueries({predicate:affected});
