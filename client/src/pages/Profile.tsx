import { useExperience } from "@/lib/experience";
import { formatHeightEntry, formatMassEntry, parseHeightEntry, parseMassEntry, switchHeightUnit, switchMassUnit, type HeightEntry, type MassEntry } from "@shared/measurement-entry";
import type { DisplayUnits } from "@shared/experience";
import ExperienceDataControls from "@/components/ExperienceDataControls";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { DietaryPreferenceEditor } from "./MealPlanner";
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
  const { patch, settings } = useExperience();
  const units = settings.displayUnits;
  const [heightEntry,setHeightEntry] = useState<HeightEntry>({unit:"cm",primary:"",inches:""});
  const [massEntry,setMassEntry] = useState<MassEntry>({unit:"kg",value:""});
  const [entryError,setEntryError] = useState("");
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
  const [unitDraft, setUnitDraft] = useState<DisplayUnits | null>(null);
  const selectedUnits = unitDraft || units;
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
  useEffect(()=>{
    setHeightEntry(formatHeightEntry(profile.data?.heightCm ?? null,units.height));
    setMassEntry(formatMassEntry(profile.data?.weightKg ?? null,units.bodyWeight));
  },[profile.data?.heightCm,profile.data?.weightKg,units.height,units.bodyWeight,user?.id]);
  const heightParsed=parseHeightEntry(heightEntry);
  const massParsed=parseMassEntry(massEntry);
  const incomplete=heightParsed.kind==="invalid"||heightParsed.kind==="incomplete"||
    massParsed.kind==="invalid"||massParsed.kind==="incomplete";
  const changeDisplayUnit = (key: keyof DisplayUnits, value: string) => {
    if(key==="height"){
      const changed=switchHeightUnit(heightEntry,value as DisplayUnits["height"]);
      if(!("unit" in changed)){setEntryError("Finish or clear the height before switching units.");return;}
      setHeightEntry(changed);
    }
    if(key==="bodyWeight"){
      const changed=switchMassUnit(massEntry,value as DisplayUnits["bodyWeight"]);
      if(!("unit" in changed)){setEntryError("Finish or clear the weight before switching units.");return;}
      setMassEntry(changed);
    }
    setEntryError("");
    setUnitDraft({...selectedUnits,[key]:value} as DisplayUnits);
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
            <fieldset className="space-y-3">
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
                  <select className="bloom-input w-full" value={selectedUnits[key]} onChange={e=>changeDisplayUnit(key,e.target.value)}>
                    {options.map(option=><option key={option} value={option}>{option}</option>)}
                  </select>
                </label>)}
              </div>
              <Button type="button" variant="outline" disabled={!unitDraft} onClick={()=>{if(unitDraft){patch({displayUnits:unitDraft});setUnitDraft(null);}}}>Save display units</Button>
            </fieldset>
            <label className="block">Height ({selectedUnits.height==="ft-in"?"feet and inches":selectedUnits.height})
              <div className="flex gap-2">
                <input aria-label={selectedUnits.height==="ft-in"?"Height feet":"Height"} className="bloom-input w-full"
                  inputMode="decimal" value={heightEntry.primary}
                  onChange={e=>{setEntryError("");setHeightEntry({...heightEntry,primary:e.target.value});}}/>
                {selectedUnits.height==="ft-in"&&<input aria-label="Height inches" className="bloom-input w-full"
                  inputMode="decimal" value={heightEntry.inches}
                  onChange={e=>{setEntryError("");setHeightEntry({...heightEntry,inches:e.target.value});}}/>}
              </div>
            </label>
            <label className="block">Body weight ({selectedUnits.bodyWeight})
              <input aria-label="Body weight" className="bloom-input w-full" inputMode="decimal"
                value={massEntry.value} onChange={e=>{setEntryError("");setMassEntry({...massEntry,value:e.target.value});}}/>
            </label>
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
            <Button disabled={save.isPending||incomplete}>Save nutrition profile</Button>
          </>
        )}
        {save.isSuccess && <p role="status">Profile saved.</p>}
        {save.isError && <p role="alert">{save.error.message}</p>}
      </form>
      <DietaryPreferenceEditor />
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
