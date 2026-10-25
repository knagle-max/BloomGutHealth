import type {PrecisionContext} from '../shared/precision-nutrition';
/** Reconcile self-reported sources conservatively; never verify age, grant a
 * capability, upgrade an unknown/under18 context, or overwrite stored inputs. */
export function resolvePlanningContext(recorded:PrecisionContext,profileAge:unknown){
 const absent=profileAge===null||profileAge===undefined;
 const valid=typeof profileAge==='number'&&Number.isInteger(profileAge)&&profileAge>=1&&profileAge<=120;
 const profileGroup=absent?'not-recorded':!valid?'invalid':(profileAge as number)<18?'under18':'adult';
 const blocks:string[]=[];
 let context=recorded;
 if(profileGroup==='under18'){
  context={...recorded,ageGroup:'under18',safetyReviewed:false};
  blocks.push('Your Profile records an age under 18. Adult nutrition planning is unavailable; review the recorded Profile and health context.');
 }else if(profileGroup==='invalid'){
  context={...recorded,ageGroup:recorded.ageGroup==='under18'?'under18':'unknown',safetyReviewed:false};
  blocks.push('Your recorded Profile age needs review. Adult nutrition planning is unavailable while these inputs are inconsistent.');
 }
 return {context,blocks,ageSources:{nutritionProfile:profileGroup,precisionContext:recorded.ageGroup,effectivePlanningGroup:context.ageGroup}};
}
