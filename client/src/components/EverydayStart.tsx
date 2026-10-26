import {useSavedPreferences,preferenceValues,preferenceHeaders,type SavedPreferences} from "@/lib/preferences-source";
import {invalidatePlanningInputs} from "@/lib/planning-cache";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { useExperience, refreshExperience } from "@/lib/experience";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import BloomBrand from "./BloomBrand";
import { Button } from "./ui/button";
export default function EverydayStart() {
  const { patch, saving, error } = useExperience(), [, navigate] = useLocation();
  const prefs = useSavedPreferences();
  const [goal,setGoal]=useState(""), [exclusions,setExclusions]=useState<string[]>([]);
  const {user}=useAuth();
  const actor=useRef(user?.id), mounted=useRef(false);
  actor.current=user?.id;
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  const currentPrefs=prefs.fetchStatus==="idle"&&!prefs.isError&&!prefs.isStale ? prefs.data : undefined;
  const save=useMutation({mutationFn:async(v:{owner:string;preferences:SavedPreferences;goal:string;exclusions:string[]})=>{
    if(!mounted.current || actor.current!==v.owner) throw Error("Setup was interrupted. Your saved preferences can be reviewed when you return.");
    await apiRequest("PUT","/api/preferences",{...preferenceValues(v.preferences),
      goals:v.goal ? [v.goal] : v.preferences.goals,
      exclusions:Array.from(new Set([...v.preferences.exclusions,...v.exclusions]))},preferenceHeaders(v.preferences.preferenceRevision));
    if(!mounted.current || actor.current!==v.owner) throw Error("Setup was interrupted. Your saved preferences can be reviewed when you return.");
    await apiRequest("PATCH","/api/experience/settings",{onboarding:{status:"complete"}});
  },onSettled:async()=>{refreshExperience();await Promise.all([queryClient.invalidateQueries({queryKey:["/api/preferences"]}),invalidatePlanningInputs()]);},
    onSuccess:(_data,v)=>{if(mounted.current&&actor.current===v.owner)navigate("/log-meal");}});
  return <section className="bloom-panel quick-start space-y-4" aria-label="Optional Everyday setup">
    <div className="quick-start-heading"><BloomBrand icon/><div><p className="eyebrow">START SMALL · OPTIONAL SETUP</p><h2>Build your first food snapshot</h2></div></div>
    <p>Start with one meal. You can use Bloom without lab results, genetics or a microbiome test.</p>
    <fieldset disabled={save.isPending || saving} className="min-w-0 space-y-4">
    <label className="block">What would you like to focus on?
      <select className="bloom-input" value={goal} onChange={e=>setGoal(e.target.value)}><option value="">Keep my existing goal / decide later</option>{["Balanced nutrition","Build muscle","Digestive comfort","Cardiovascular health"].map(v=><option key={v}>{v}</option>)}</select>
    </label>
    <details><summary>Foods I prefer to avoid (optional)</summary><p className="panel-note">Preferences are not an allergy assessment. Existing exclusions are retained. Add medical allergies and safety context in My biology before personalized planning.</p>
      {(["seafood","dairy","gluten","nuts","eggs","soy"] as const).map(v=><label key={v}><input type="checkbox" checked={exclusions.includes(v)} onChange={e=>setExclusions(e.target.checked?[...exclusions,v]:exclusions.filter(x=>x!==v))}/>{v.charAt(0).toUpperCase()+v.slice(1)}</label>)}
    </details>
    <div className="flex flex-wrap gap-3"><Button disabled={save.isPending || !currentPrefs || !user || saving} onClick={()=>{if(currentPrefs&&user)save.mutate({owner:user.id,preferences:currentPrefs,goal,exclusions:[...exclusions]});}}>{save.isPending?"Saving…":"Save & log my first meal"}</Button><Button variant="ghost" disabled={saving||save.isPending} onClick={()=>patch({onboarding:{status:"skipped"}})}>Skip setup</Button></div>
    </fieldset>
    {!currentPrefs&&<p role="status">{prefs.isError?"Preferences could not load.":"Refreshing your preferences…"} You can skip setup to log a meal. {prefs.isError&&<Button variant="ghost" onClick={()=>prefs.refetch()}>Retry preferences</Button>}</p>}
    <p className="panel-note">You can change preferences later in Profile. Skipping does not confirm that you have no allergies or grant data-processing consent.</p>
    {(error||save.error||prefs.error)&&<p role="alert">{error||save.error?.message||prefs.error?.message}</p>}
  </section>;
}
