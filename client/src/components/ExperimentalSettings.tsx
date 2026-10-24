import {useEffect,useState} from "react";
import {useMutation,useQuery} from "@tanstack/react-query";
import {apiRequest,queryClient} from "@/lib/queryClient";
import {useAuth} from "@/lib/auth";
export default function ExperimentalSettings(){
 const [requested,setRequested]=useState<boolean|null>(null);
 const {user}=useAuth();const key=['/api/capabilities',user?.id];
 const status=useQuery<{eligible:boolean;experimentalEnabled:boolean;note:string}>({queryKey:key,enabled:!!user,queryFn:async()=>(await apiRequest('GET','/api/capabilities')).json(),refetchInterval:q=>q.state.data?.eligible?5000:false,refetchOnWindowFocus:true});
 const save=useMutation({onMutate:(enabled:boolean)=>{if(!enabled){queryClient.setQueryData(key,(previous:any)=>previous?{...previous,experimentalEnabled:false}:previous);void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedCapability===true});queryClient.removeQueries({predicate:q=>q.meta?.restrictedCapability===true});}},mutationFn:async(enabled:boolean)=>(await apiRequest('PATCH','/api/capabilities/experimental',{enabled})).json(),onSettled:async()=>{await queryClient.invalidateQueries({queryKey:key});setRequested(null);}});
 useEffect(()=>{if(!status.data?.experimentalEnabled){void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedCapability===true});queryClient.removeQueries({predicate:q=>q.meta?.restrictedCapability===true});}},[status.data?.experimentalEnabled]);
 if(!status.data?.eligible||status.isError)return null;
 return <div className="experimental-preference space-y-2 w-full rounded-lg border border-slate-500 p-3"><label className="flex gap-2 items-center"><input type="checkbox" checked={requested??status.data.experimentalEnabled} disabled={requested!==null||save.isPending||status.isFetching} onChange={e=>{const next=e.target.checked;setRequested(next);save.mutate(next);}}/>Show development features</label><p className="panel-note">DEV ONLY — NOT APPROVED FOR PUBLIC RELEASE. Isolated synthetic testing only. No restricted services are cleared by this switch alone.</p>{save.error&&<p role="alert">{save.error.message}</p>}</div>;
}
