import { useExperience } from "@/lib/experience";
import { formatHeightEntry, formatMassEntry, parseHeightEntry, parseMassEntry, switchHeightUnit, switchMassUnit, type HeightEntry, type MassEntry } from "@shared/measurement-entry";
import type { DisplayUnits } from "@shared/experience";
import ExperienceDataControls from "@/components/ExperienceDataControls";
import { useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import DietaryPreferenceSummary from "@/components/DietaryPreferenceSummary";
import { Link } from "wouter";
interface ProfileProps {
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}
export default function Profile({
  isDarkMode = false,
  onToggleDarkMode,
}: ProfileProps) {
  const { user, logout } = useAuth();
  const { patch, settings, saving: savingUnits, loading: loadingUnits, error: unitsError } = useExperience();
  const units = settings.displayUnits;
  const [heightEntry,setHeightEntry] = useState<HeightEntry>({unit:"cm",primary:"",inches:""});
  const [massEntry,setMassEntry] = useState<MassEntry>({unit:"kg",value:""});
  const [entryError,setEntryError] = useState("");
  const lastHydratedProfile = useRef<string | null>(null);
  const profile = useQuery<any>({ queryKey: ["/api/profile"] });
  const [form, setForm] = useState({
    sex: "",
    age: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
  });
  useEffect(() => {
    if (profile.data)
      setForm({
        sex: profile.data.sex || "",
        age: profile.data.age?.toString() || "",
        heightCm: profile.data.heightCm?.toString() || "",
        weightKg: profile.data.weightKg?.toString() || "",
        activityLevel: profile.data.activityLevel || "moderate",
      });
  }, [profile.data]);
  const selectedUnits = units;
  const save = useMutation({
    mutationFn: async () => {
      const data = {
        sex: form.sex || null,
        age: form.age ? Number(form.age) : null,
        heightCm: heightParsed.kind==="valid" ? heightParsed.canonical : null,
        weightKg: massParsed.kind==="valid" ? massParsed.canonical : null,
        activityLevel: form.activityLevel,
      };
      await apiRequest("PATCH", `/api/user/${user!.id}/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({
        predicate: (q) => String(q.queryKey[0]).startsWith("/api/nutrition/"),
      });
    },
  });
  // Convert drafts only after the shared preference has actually saved.
  // Do not reconstruct them from saved Profile values after a preference PATCH:
  // doing so silently discards unsaved measurements.
  useEffect(()=>{
    if (loadingUnits || profile.isLoading || !profile.data || !user) return;
    // Hydrate only when the account or *saved measurement* changes, not when
    // unrelated settings requests finish. This protects unsaved edits.
    const stamp = JSON.stringify([user.id, profile.data.heightCm ?? null, profile.data.weightKg ?? null]);
    if (lastHydratedProfile.current === stamp) return;
    lastHydratedProfile.current = stamp;
    setHeightEntry(formatHeightEntry(profile.data.heightCm ?? null,units.height));
    setMassEntry(formatMassEntry(profile.data.weightKg ?? null,units.bodyWeight));
  },[profile.data?.heightCm,profile.data?.weightKg,user?.id,loadingUnits,profile.isLoading]);
  useEffect(()=>{
    if(loadingUnits)return;
    setHeightEntry(old=>{const next=switchHeightUnit(old,units.height);return "unit" in next?next:old;});
    setMassEntry(old=>{const next=switchMassUnit(old,units.bodyWeight);return "unit" in next?next:old;});
  },[units.height,units.bodyWeight,loadingUnits]);
  const heightParsed=parseHeightEntry(heightEntry);
  const massParsed=parseMassEntry(massEntry);
  const incomplete=heightParsed.kind==="invalid"||heightParsed.kind==="incomplete"||
    massParsed.kind==="invalid"||massParsed.kind==="incomplete";
  const changeDisplayUnit = (key: keyof DisplayUnits, value: string) => {
    if(key==="height"){
      const changed=switchHeightUnit(heightEntry,value as DisplayUnits["height"]);
      if(!("unit" in changed)){setEntryError("Finish or clear the height before switching units.");return;}
    }
    if(key==="bodyWeight"){
      const changed=switchMassUnit(massEntry,value as DisplayUnits["bodyWeight"]);
      if(!("unit" in changed)){setEntryError("Finish or clear the weight before switching units.");return;}
    }
    setEntryError("");
    patch({displayUnits:{...selectedUnits,[key]:value} as DisplayUnits});
  };
  return (
    <main className="science-page space-y-5">
      <div className="science-heading">
        <h1>Profile & settings</h1>
        <p>Signed in as {user?.username}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link className="text-link" href="/meal-planner">
          Meal planner
        </Link>
        <Link className="text-link" href="/health-insights">
          Health Insights
        </Link>
        {onToggleDarkMode && (
          <Button variant="outline" onClick={onToggleDarkMode}>
            {isDarkMode ? "Light mode" : "Dark mode"}
          </Button>
        )}
        <Button variant="outline" onClick={() => logout()}>
          Log out
        </Button>
      </div>
      <form
        className="bloom-panel space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <h2>Nutrition profile</h2>
        {profile.isLoading ? (
          <p>Loading profile…</p>
        ) : profile.isError ? (
          <p role="alert">
            Profile could not load.{" "}
            <Button type="button" onClick={() => profile.refetch()}>
              Retry
            </Button>
          </p>
        ) : (
          <>
            <label className="block">
              Sex used in energy equation
              <select
                className="bloom-input"
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
              >
                <option value="">Not specified</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </label>
            <label className="block">Age
              <input className="bloom-input w-full" type="number" min="1" max="120" value={form.age} onChange={e=>setForm({...form,age:e.target.value})}/>
            </label>
            <fieldset className="space-y-3" id="measurement-units">
              <legend className="font-medium">Measurement units</legend>
              <p className="panel-note">Choose units independently. Saved profile measurements remain in canonical centimetres and kilograms; laboratory source units are not changed.</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["height","Height",["cm","m","ft-in"]],
                  ["bodyWeight","Body weight",["kg","lb"]],
                  ["circumference","Circumference",["cm","in"]],
                  ["hydration","Hydration",["mL","L","US-fl-oz"]],
                  ["temperature","Temperature",["C","F"]],
                  ["energy","Energy",["kcal","kJ"]],
                  ["foodWeight","Food weight",["g","oz"]],
                ] as const).map(([key,label,options])=><label className="block" key={key}>{label}
                  <select className="bloom-input w-full" aria-label={`${label} unit`} disabled={savingUnits||loadingUnits} value={selectedUnits[key]} onChange={e=>changeDisplayUnit(key,e.target.value)}>
                    {options.map(option=><option key={option} value={option}>{option}</option>)}
                  </select>
                </label>)}
              </div>
              <p className="panel-note">Unit preferences save automatically here. Completed measurement drafts convert after a successful save; unfinished drafts keep their labelled entry units.</p>
              {savingUnits&&<p role="status">Saving measurement units…</p>}
              {unitsError&&<p role="alert">Could not save measurement units: {unitsError}</p>}
            </fieldset>
            <div className="space-y-2"><span className="font-medium">Height ({heightEntry.unit==="ft-in"?"feet + inches":heightEntry.unit})</span>
              <div className="flex gap-2">
                <input aria-label={heightEntry.unit==="ft-in"?"Height feet":"Height"} className="bloom-input w-full"
                  inputMode="decimal" value={heightEntry.primary}
                  onChange={e=>{setEntryError("");setHeightEntry({...heightEntry,primary:e.target.value});}}/>
                {heightEntry.unit==="ft-in"&&<input aria-label="Height inches" className="bloom-input w-full"
                  inputMode="decimal" value={heightEntry.inches}
                  onChange={e=>{setEntryError("");setHeightEntry({...heightEntry,inches:e.target.value});}}/>}
              </div>
            </div>
            <div className="space-y-2"><span className="font-medium">Body weight ({massEntry.unit})</span>
              <input aria-label="Body weight" className="bloom-input w-full" inputMode="decimal"
                value={massEntry.value} onChange={e=>{setEntryError("");setMassEntry({...massEntry,value:e.target.value});}}/>
            </div>
            {(incomplete||entryError)&&<p role="alert">{entryError || "Finish the height and weight entries, or clear them before saving."}</p>}
            <label className="block">
              Activity level
              <select
                className="bloom-input"
                value={form.activityLevel}
                onChange={(e) =>
                  setForm({ ...form, activityLevel: e.target.value })
                }
              >
                {[
                  "sedentary",
                  "light",
                  "moderate",
                  "active",
                  "very_active",
                ].map((v) => (
                  <option key={v} value={v}>
                    {v.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <p className="panel-note">
              Targets are formula-based estimates. Missing profile values
              currently use defaults.
            </p>
            <Button disabled={save.isPending||incomplete||savingUnits||loadingUnits}>Save nutrition profile</Button>
          </>
        )}
        {save.isSuccess && <p role="status">Profile saved.</p>}
        {save.isError && <p role="alert">{save.error.message}</p>}
      </form>
      <DietaryPreferenceSummary />
      <section className="bloom-panel space-y-3" id="privacy">
        <h2>Privacy & data controls</h2>
        <p>Training and saved-meal exports and deletion are below. Genetic and laboratory records have separate controls in My biology.</p>
        <a href="/precision" className="text-link">Manage biology records & exports</a>
        <p className="panel-note">These controls do not yet provide a complete account export or erasure. Journal entries, gut reports and backup retention require additional coverage. Contact the app operator before uploading information you need fully erased.</p>
      </section>
      <section className="bloom-panel space-y-3"><h2>Your data & choices</h2><p>Review the privacy and export controls below, or revisit optional Everyday setup.</p><Button variant="outline" onClick={()=>patch({onboarding:{status:"not-started"},mode:"everyday"})}>Revisit Everyday setup</Button><img src="/brand/bloom-icon-monochrome.svg" width={32} height={32} alt="" /></section>
      <ExperienceDataControls/>
    </main>
  );
}
