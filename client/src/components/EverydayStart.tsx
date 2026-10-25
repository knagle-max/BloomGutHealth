import {invalidatePlanningInputs} from "@/lib/planning-cache";
import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useExperience, refreshExperience } from "@/lib/experience";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { type DietaryPreferences } from "@shared/meal-intelligence";
import BloomBrand from "./BloomBrand";
import { Button } from "./ui/button";
export default function EverydayStart() {
  const { patch, saving, error } = useExperience(), [, navigate] = useLocation();
  const prefs = useQuery<DietaryPreferences>({queryKey:["/api/preferences"]});
  const [goal,setGoal]=useState(""), [exclusions,setExclusions]=useState<string[]>([]);
  const save=useMutation({mutationFn:async()=>{
    if(prefs.error || !prefs.data) throw Error("Your preferences could not load. Retry, or skip setup to log a meal.");
    await apiRequest("PUT","/api/preferences",{...prefs.data,
      goals:goal ? [goal] : prefs.data.goals,
      exclusions:Array.from(new Set([...prefs.data.exclusions,...exclusions]))});
    await apiRequest("PATCH","/api/experience/settings",{onboarding:{status:"complete"}});
  },onSuccess:async()=>{await Promise.all([queryClient.invalidateQueries({queryKey:["/api/preferences"]}),invalidatePlanningInputs()]);refreshExperience();navigate("/log-meal");}});
  return <section className="bloom-panel quick-start space-y-4" aria-label="Optional Everyday setup">
    <div className="quick-start-heading"><BloomBrand icon/><div><p className="eyebrow">START SMALL · OPTIONAL SETUP</p><h2>Build your first food snapshot</h2></div></div>
    <p>Start with one meal. You can use Bloom without lab results, genetics or a microbiome test.</p>
    <label className="block">What would you like to focus on?
      <select className="bloom-input" value={goal} onChange={e=>setGoal(e.target.value)}><option value="">Keep my existing goal / decide later</option>{["Balanced nutrition","Build muscle","Digestive comfort","Cardiovascular health"].map(v=><option key={v}>{v}</option>)}</select>
    </label>
    <details><summary>Foods I prefer to avoid (optional)</summary><p className="panel-note">Preferences are not an allergy assessment. Existing exclusions are retained. Add medical allergies and safety context in My biology before personalized planning.</p>
      {(["seafood","dairy","gluten","nuts","eggs","soy"] as const).map(v=><label key={v}><input type="checkbox" checked={exclusions.includes(v)} onChange={e=>setExclusions(e.target.checked?[...exclusions,v]:exclusions.filter(x=>x!==v))}/>{v.charAt(0).toUpperCase()+v.slice(1)}</label>)}
    </details>
    <div className="flex flex-wrap gap-3"><Button disabled={save.isPending || prefs.isLoading || saving} onClick={()=>save.mutate()}>{save.isPending?"Saving…":"Save & log my first meal"}</Button><Button variant="ghost" disabled={saving||save.isPending} onClick={()=>patch({onboarding:{status:"skipped"}})}>Skip setup</Button></div>
    <p className="panel-note">You can change preferences later in Profile. Skipping does not confirm that you have no allergies or grant data-processing consent.</p>
    {(error||save.error||prefs.error)&&<p role="alert">{error||save.error?.message||prefs.error?.message}</p>}
  </section>;
}
