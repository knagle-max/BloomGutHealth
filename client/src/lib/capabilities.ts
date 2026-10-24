import {useEffect} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from './auth';
import {apiRequest,queryClient} from './queryClient';
import {activeDevelopmentPhoto,type CapabilitySnapshot} from '@shared/development-features';
export function useCapabilities(){
 const {user}=useAuth();const key=['/api/capabilities',user?.id];
 const query=useQuery<CapabilitySnapshot>({queryKey:key,enabled:!!user,queryFn:async()=>(await apiRequest('GET','/api/capabilities')).json(),refetchInterval:q=>q.state.data?.eligible?5000:false,refetchOnWindowFocus:'always'});
 const active=!query.isError&&query.data?.eligible===true&&query.data.experimentalEnabled===true;
 useEffect(()=>{if(!active){void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedCapability===true});queryClient.removeQueries({predicate:q=>q.meta?.restrictedCapability===true});}},[active]);
 return {...query,key,photoPreview:active?activeDevelopmentPhoto(query.data):null};
}
