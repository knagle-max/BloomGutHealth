import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from './auth';
import {apiRequest,queryClient} from './queryClient';
import {activeDevelopmentPhoto,type CapabilitySnapshot} from '@shared/development-features';
export function useCapabilities(){
 const {user}=useAuth();const key=['/api/capabilities',user?.id];
 // Transient account-scoped visibility suppression after an unconfirmed OFF.
 // It only narrows this page's UI; auth cache clear or explicit success clears it.
 const holdKey=['internal-review-visibility-hold',user?.id];
 const hold=useQuery<boolean>({queryKey:holdKey,queryFn:async()=>false,initialData:false,enabled:false,gcTime:Infinity});
 const visibilityHeld=hold.data===true;
 const query=useQuery<CapabilitySnapshot>({queryKey:key,enabled:!!user,queryFn:async({signal})=>(await apiRequest('GET','/api/capabilities',undefined,undefined,signal)).json(),refetchInterval:q=>q.state.data?.eligible||q.state.data?.featureAdministration?.canRead?5000:false,refetchOnWindowFocus:'always'});
 const active=!visibilityHeld&&!query.isError&&query.data?.eligible===true&&query.data.experimentalEnabled===true;
 useEffect(()=>{if(!active){void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedCapability===true});queryClient.removeQueries({predicate:q=>q.meta?.restrictedCapability===true});}},[active]);
 const canReadFeatureAdmin=!query.isError&&query.data?.featureAdministration?.canRead===true;
 useEffect(()=>{if(!canReadFeatureAdmin){void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedAdmin===true});queryClient.removeQueries({predicate:q=>q.meta?.restrictedAdmin===true});}},[canReadFeatureAdmin]);
 const data=query.data&&visibilityHeld?{...query.data,experimentalEnabled:false,developmentFeatures:[]}:query.data;
 return {...query,data,key,holdKey,visibilityHeld,photoPreview:active?activeDevelopmentPhoto(data):null,canReadFeatureAdmin};
}
