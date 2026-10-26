import { createContext, useContext, useRef, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "./auth";
import { apiRequest, queryClient } from "./queryClient";
import { experienceSettingsSchema, type ExperienceSettings, type ExperienceSettingsPatch, type ExperienceEntry, type ExperienceRecord } from "@shared/experience";
const defaults=experienceSettingsSchema.parse({});
const Context=createContext({settings:defaults,mode:"everyday" as ExperienceSettings["mode"],loading:false,hasSettings:false,ready:false,retry:()=>{},saving:false,error:"",patch:(_v:ExperienceSettingsPatch)=>{}});
export function refreshExperience(){queryClient.invalidateQueries({predicate:q=>String(q.queryKey[0]).startsWith("/api/experience")});}
export function ExperienceProvider({children}:{children:ReactNode}){
 const {user}=useAuth(), [,navigate]=useLocation();
 const activeActor=useRef(user?.id);activeActor.current=user?.id;
 const key=["/api/experience/settings",user?.id];
 const q=useQuery({queryKey:key,enabled:!!user,queryFn:async()=>experienceSettingsSchema.parse(await (await apiRequest("GET","/api/experience/settings")).json())});
 const mutation=useMutation({mutationFn:async(v:{patch:ExperienceSettingsPatch;actorId:string})=>experienceSettingsSchema.parse(await(await apiRequest("PATCH","/api/experience/settings",v.patch)).json()),onSuccess:(data,v)=>{if(v.actorId!==activeActor.current)return;queryClient.setQueryData(["/api/experience/settings",v.actorId],data);refreshExperience();if(v.patch.mode)navigate(v.patch.mode==="athlete"?"/athlete":"/");},onError:(_error,v)=>{if(v.actorId===activeActor.current)refreshExperience();}});
 const saving=mutation.isPending&&mutation.variables?.actorId===user?.id;
 const ready=!!q.data&&q.fetchStatus==="idle"&&!q.isStale&&!q.isError&&!saving;

 const settings=q.data||defaults;
 return <Context.Provider value={{settings,hasSettings:!!q.data,mode:settings.mode,loading:q.isPending||q.fetchStatus!=="idle"||q.isStale&&!q.isError,ready,retry:refreshExperience,saving,error:((mutation.variables?.actorId===user?.id?mutation.error:null)||q.error)?.message||"",patch:v=>{if(user?.id)mutation.mutate({patch:v,actorId:user.id});}}}>{children}</Context.Provider>;
}
export const useExperience=()=>useContext(Context);
export function ExperienceModeToggle(){const {mode,patch,saving,error,loading,ready}=useExperience();return <div className="experience-switch"><label><span className="sr-only">Experience mode</span><select aria-label="Experience mode" value={mode} disabled={saving||loading||!ready} onChange={e=>patch({mode:e.target.value as ExperienceSettings["mode"]})}><option value="everyday">Everyday</option><option value="athlete">Athlete</option></select></label>{error&&<span role="alert" className="mode-error" title={error}>Mode unavailable</span>}</div>;}
export function useExperienceRecords(kind?:ExperienceEntry["kind"]){const{user}=useAuth();return useQuery<ExperienceRecord[]>({queryKey:["/api/experience/records",user?.id,kind||"all"],enabled:!!user,queryFn:async()=>(await apiRequest("GET","/api/experience/records"+(kind?"?kind="+kind:""))).json()});}
export function useExperienceMutation(){return useMutation({mutationFn:async(v:{id?:string;entry?:ExperienceEntry;remove?:boolean})=>{if(v.remove)return apiRequest("DELETE","/api/experience/records/"+v.id);return(await apiRequest(v.id?"PUT":"POST","/api/experience/records"+(v.id?"/"+v.id:""),v.entry)).json();},onSuccess:refreshExperience});}
export const localDate=(date=new Date())=>new Date(+date-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
export const localTime=()=>{const d=new Date();return new Date(+d-d.getTimezoneOffset()*60000).toISOString().slice(0,16);};
export const dayClock=(date=localDate())=>({date,timezoneOffset:new Date(date+"T12:00:00").getTimezoneOffset(),hour:new Date().getHours()});
