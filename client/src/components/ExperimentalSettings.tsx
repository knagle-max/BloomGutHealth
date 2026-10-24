import {useCapabilities} from "@/lib/capabilities";
import {useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {apiRequest,queryClient} from "@/lib/queryClient";
export default function ExperimentalSettings(){
 const [requested,setRequested]=useState<boolean|null>(null);
 const status=useCapabilities();const key=status.key;
 const save=useMutation({onMutate:(enabled:boolean)=>{if(!enabled){queryClient.setQueryData(key,(previous:any)=>previous?{...previous,experimentalEnabled:false}:previous);void queryClient.cancelQueries({predicate:q=>q.meta?.restrictedCapability===true});queryClient.removeQueries({predicate:q=>q.meta?.restrictedCapability===true});}},mutationFn:async(enabled:boolean)=>(await apiRequest('PATCH','/api/capabilities/experimental',{enabled})).json(),onSettled:async()=>{await queryClient.invalidateQueries({queryKey:key});setRequested(null);}});
 if(!status.data?.eligible||status.isError)return null;
 return <div className="experimental-preference space-y-2 w-full rounded-lg border border-slate-500 p-3"><label className="flex gap-2 items-center"><input type="checkbox" checked={requested??status.data.experimentalEnabled} disabled={requested!==null||save.isPending||status.isFetching} onChange={e=>{const next=e.target.checked;setRequested(next);save.mutate(next);}}/>Show development features</label><p className="panel-note">DEV ONLY — NOT APPROVED FOR PUBLIC RELEASE. Isolated synthetic testing only. No restricted services are cleared by this switch alone.</p>{status.data.experimentalEnabled&&!status.photoPreview&&<p className="panel-note">No development modules are available for this account.</p>}{save.error&&<p role="alert">{save.error.message}</p>}</div>;
}
