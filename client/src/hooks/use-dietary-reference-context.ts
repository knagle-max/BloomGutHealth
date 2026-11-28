import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {apiRequest} from '@/lib/queryClient';
import {accountContextGuard} from '@/lib/request-actor';
import {ownedDietaryReferenceContext} from '@shared/dietary-reference-eligibility';
import {dietaryReferenceSubset,dietaryReferencesFor,type DietaryReferenceLifeStage} from '@shared/dietary-references';
export const dietaryReferenceContextPath='/api/experience/dietary-reference-context';
/** One owned reference query, shared by disclosure and source-overlap context. */
export function useDietaryReferenceContext(nutrient:string,date:string|null|undefined,timeZone:string|null|undefined,lifeStage:DietaryReferenceLifeStage,enabled:boolean){
 const {user}=useAuth(),rows=dietaryReferencesFor(nutrient,lifeStage);
 return useQuery({queryKey:[dietaryReferenceContextPath,user?.id,dietaryReferenceSubset.version,date,timeZone,nutrient,lifeStage],enabled:enabled&&!!user&&!!date&&!!timeZone&&rows.length>0,queryFn:async({signal})=>{
  const owner=user!.id,assertCurrent=accountContextGuard(owner);assertCurrent();
  const result=ownedDietaryReferenceContext(await(await apiRequest('GET',dietaryReferenceContextPath+'?'+new URLSearchParams({date:date!,timeZone:timeZone!,nutrientKey:nutrient,lifeStage}),undefined,undefined,signal)).json(),owner,{date:date!,timeZone:timeZone!,nutrientKey:nutrient,lifeStage});assertCurrent();
  if(!result)throw Error('Reference context does not match its source.');
  return result;
 }});
}
