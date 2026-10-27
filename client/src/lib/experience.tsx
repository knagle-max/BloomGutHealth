import {createContext,useContext,useRef,useMemo,useEffect,type ReactNode} from "react";
import {useQuery,useMutation} from "@tanstack/react-query";
import {useLocation} from "wouter";
import {useAuth} from "./auth";
import {apiRequest,ApiRequestError,queryClient} from "./queryClient";
import {experienceSettingsSchema,type ExperienceSettings,type ExperienceSettingsPatch,type ExperienceEntry,type ExperienceRecord} from "@shared/experience";
const defaults=experienceSettingsSchema.parse({});
type SettingsSource=ExperienceSettings&{readonly sourceRevision?:string};
type SettingsAttempt={patch:ExperienceSettingsPatch;actorId:string;basis:ExperienceSettings;revision?:string;canWrite:boolean};
async function readSettings(response:Response):Promise<SettingsSource>{
 const settings=experienceSettingsSchema.parse(await response.json()),revision=response.headers.get("X-Bloom-Settings-Revision");
 if(revision===null)return settings;
 if(!/^[a-f0-9]{64}$/.test(revision))throw Error("Saved settings revision could not be verified.");
 return{...settings,sourceRevision:revision};
}
const Context=createContext({settings:defaults,mode:"everyday" as ExperienceSettings["mode"],loading:false,hasSettings:false,ready:false,retry:()=>{},saving:false,error:"",patch:(_v:ExperienceSettingsPatch)=>{},patchAsync:async(_v:ExperienceSettingsPatch):Promise<void>=>{}});
export function refreshExperience(){queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith("/api/experience")});}
export function ExperienceProvider({children}:{children:ReactNode}){
 const{user}=useAuth(),[,navigate]=useLocation(),activeActor=useRef(user?.id),navigated=useRef<SettingsAttempt|null>(null);activeActor.current=user?.id;
 const key=["/api/experience/settings",user?.id];
 const q=useQuery({queryKey:key,enabled:!!user,queryFn:async({signal})=>readSettings(await apiRequest("GET","/api/experience/settings",undefined,{"X-Bloom-Settings-Fields":"practical-region-v1"},signal))});
 const adopted=useMemo(()=>{const{sourceRevision,...settings}=q.data||defaults as SettingsSource;return settings;},[q.data]);
 const mutation=useMutation({mutationFn:async(v:SettingsAttempt)=>{
  if(v.actorId!==activeActor.current||!v.canWrite)throw Error("Reload current saved settings before saving.");
  return readSettings(await apiRequest("PATCH","/api/experience/settings",v.patch,{"X-Bloom-Settings-Fields":"practical-region-v1",...(v.revision?{"If-Match":`"${v.revision}"`}:{})}));
 },onSuccess:(data,v)=>{if(v.actorId!==activeActor.current)return;queryClient.setQueryData(["/api/experience/settings",v.actorId],data);refreshExperience();},onError:(_error,v)=>{if(v.actorId===activeActor.current)refreshExperience();}});
 const attempt=mutation.variables?.actorId===user?.id?mutation.variables:undefined;
 const holding=!!attempt&&(mutation.isPending||mutation.isError),saving=!!attempt&&mutation.isPending;
 // The query remains authoritative. Only the form's adopted basis is retained while
 // a write settles or needs explicit review, so refreshed keys cannot erase a draft.
 const settings=holding?attempt!.basis:adopted;
 const retained=!!attempt&&mutation.isError,conflict=mutation.error instanceof ApiRequestError&&mutation.error.status===409;
 const sourceCurrent=!!q.data&&q.fetchStatus==="idle"&&!q.isStale&&!q.isError;
 const sameBasis=!!attempt&&JSON.stringify(adopted)===JSON.stringify(attempt.basis)&&q.data?.sourceRevision===attempt.revision;
 const ready=sourceCurrent&&!saving&&(!retained||(sameBasis&&!conflict));
 const patchAsync=async(patch:ExperienceSettingsPatch)=>{if(!user?.id)throw Error("Sign in before saving settings.");await mutation.mutateAsync({patch,actorId:user.id,basis:settings,revision:q.data?.sourceRevision,canWrite:ready});};
 async function reload(){const actor=user?.id,result=await q.refetch();if(actor===activeActor.current&&!result.isError&&result.fetchStatus==="idle"&&!result.isStale){queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith("/api/experience")&&q.queryKey[0]!=="/api/experience/settings"});mutation.reset();}}
 useEffect(()=>{const v=mutation.variables;if(mutation.isSuccess&&v&&v!==navigated.current&&v.actorId===activeActor.current){navigated.current=v;if(v.patch.mode)navigate(v.patch.mode==="athlete"?"/athlete":"/");}},[mutation.isSuccess,mutation.variables,navigate]);
 return <Context.Provider value={{settings,hasSettings:!!q.data,mode:settings.mode,loading:!holding&&(q.isPending||q.fetchStatus!=="idle"||q.isStale&&!q.isError),ready,retry:refreshExperience,saving,error:((attempt?mutation.error:null)||q.error)?.message||"",patch:v=>{void patchAsync(v).catch(()=>{});},patchAsync}}>
  {retained&&<aside role="alert" className="bloom-panel space-y-2"><p>{conflict?"Another saved settings update was found. Your draft was not applied.":"The settings save could not be confirmed."} Your form is retained. {ready?"You can review the fields and retry saving.":"Check the latest saved settings before saving again."} Loading the latest saved settings replaces unsaved settings fields.</p><button type="button" className="text-link" disabled={q.isFetching} onClick={()=>{void reload();}}>Load latest saved settings</button></aside>}
  {children}
 </Context.Provider>;
}
export const useExperience=()=>useContext(Context);
export function ExperienceModeToggle(){const {mode,patch,saving,error,loading,ready}=useExperience();return <div className="experience-switch"><label><span className="sr-only">Experience mode</span><select aria-label="Experience mode" value={mode} disabled={saving||loading||!ready} onChange={e=>patch({mode:e.target.value as ExperienceSettings["mode"]})}><option value="everyday">Everyday</option><option value="athlete">Athlete</option></select></label>{error&&<span role="alert" className="mode-error" title={error}>Mode unavailable</span>}</div>;}
export function useExperienceRecords(kind?:ExperienceEntry["kind"]){const{user}=useAuth();return useQuery<ExperienceRecord[]>({queryKey:["/api/experience/records",user?.id,kind||"all"],enabled:!!user,queryFn:async()=>(await apiRequest("GET","/api/experience/records"+(kind?"?kind="+kind:""))).json()});}
export function useExperienceMutation(){return useMutation({mutationFn:async(v:{id?:string;entry?:ExperienceEntry;remove?:boolean})=>{if(v.remove)return apiRequest("DELETE","/api/experience/records/"+v.id);return(await apiRequest(v.id?"PUT":"POST","/api/experience/records"+(v.id?"/"+v.id:""),v.entry)).json();},onSuccess:refreshExperience});}
export const localDate=(date=new Date())=>new Date(+date-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
export const localTime=()=>{const d=new Date();return new Date(+d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
export const dayClock=(date=localDate())=>({date,timezoneOffset:new Date(date+"T12:00:00").getTimezoneOffset(),hour:new Date().getHours()});
