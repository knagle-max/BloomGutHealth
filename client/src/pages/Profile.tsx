import CompanionHero from '@/components/CompanionHero';
import {UserRound, Ruler, Utensils, Shield, Cable, ChevronRight} from 'lucide-react';
import FoodRegionSettings from "@/components/FoodRegionSettings";
import {measurementUnitSuggestion} from "@shared/measurement-suggestions";
import {invalidatePlanningInputs} from "@/lib/planning-cache";
import ExperimentalSettings from "@/components/ExperimentalSettings";
import AccountErasure from "@/components/AccountErasure";
import AccountDataExport from "@/components/AccountDataExport";
import { useExperience } from "@/lib/experience";
import { formatHeightEntry, formatMassEntry, parseHeightEntry, parseMassEntry, switchHeightUnit, switchMassUnit, type HeightEntry, type MassEntry } from "@shared/measurement-entry";
import type { DisplayUnits } from "@shared/experience";
import ConnectionsOverview from "@/components/ConnectionsOverview";
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
  const signOut = useMutation({mutationFn:logout});
  const { patch, settings, saving: savingUnits, loading: loadingUnits, error: unitsError, ready: settingsReady } = useExperience();
  const units = settings.displayUnits;
  const unitSuggestion=measurementUnitSuggestion(typeof navigator!=="undefined"?navigator.language:undefined,settingsReady?settings.practical.region:undefined);
  const [heightEntry,setHeightEntry] = useState<HeightEntry>({unit:"cm",primary:"",inches:""});
  const [massEntry,setMassEntry] = useState<MassEntry>({unit:"kg",value:""});
  const [entryError,setEntryError] = useState("");
  const lastHydratedProfile = useRef<string | null>(null);
  const profile = useQuery<any>({ queryKey: ["/api/profile"] });
  const revisionValid=profile.data?.profileRevision===undefined||(typeof profile.data.profileRevision==="string"&&/^[a-f0-9]{64}$/.test(profile.data.profileRevision));
  const currentProfile=revisionValid&&!!profile.data&&profile.fetchStatus==="idle"&&!profile.isStale&&!profile.isError;
  const [dirty,setDirty]=useState(false);
  const sourceBasis=useRef<string|null>(null);
  const sourceRevision=useRef<string|null>(null);
  const profileBasis=(value:any)=>JSON.stringify([user?.id,value?.sex??null,value?.age??null,value?.heightCm??null,value?.weightKg??null,value?.activityLevel??null]);
  const sourceChanged=dirty&&sourceBasis.current!==null&&!!profile.data&&profileBasis(profile.data)!==sourceBasis.current;
  useEffect(()=>{sourceBasis.current=null;sourceRevision.current=null;setDirty(false);},[user?.id]);
  const [form, setForm] = useState({
    sex: "",
    age: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate",
  });
  useEffect(() => {
    if (profile.data&&!dirty) {
      sourceBasis.current=profileBasis(profile.data);
      sourceRevision.current=typeof profile.data.profileRevision==="string"&&/^[a-f0-9]{64}$/.test(profile.data.profileRevision)?profile.data.profileRevision:null;
      setForm({
        sex: profile.data.sex || "",
        age: profile.data.age?.toString() || "",
        heightCm: profile.data.heightCm?.toString() || "",
        weightKg: profile.data.weightKg?.toString() || "",
        activityLevel: profile.data.activityLevel || "moderate",
      });
    }
  }, [profile.data,dirty]);
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
      await apiRequest("PATCH", `/api/user/${user!.id}/profile`, data,sourceRevision.current?{"If-Match":`"${sourceRevision.current}"`}:undefined);
    },
    onSettled: async (_data,error) => {
      // A failed response can follow a committed write. Recheck authoritative
      // Profile/health-derived sources after either outcome, including age gates.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/profile"] }),
        invalidatePlanningInputs(),
      ]);
      // Only an acknowledged save may adopt refreshed values automatically.
      if(!error)setDirty(false);
    },
  });
  // Convert drafts only after the shared preference has actually saved.
  // Do not reconstruct them from saved Profile values after a preference PATCH:
  // doing so silently discards unsaved measurements.
  useEffect(()=>{
    if (dirty || loadingUnits || profile.isLoading || !profile.data || !user) return;
    // Hydrate only when the account or *saved measurement* changes, not when
    // unrelated settings requests finish. This protects unsaved edits.
    const stamp = JSON.stringify([user.id, profile.data.heightCm ?? null, profile.data.weightKg ?? null]);
    if (lastHydratedProfile.current === stamp) return;
    lastHydratedProfile.current = stamp;
    setHeightEntry(formatHeightEntry(profile.data.heightCm ?? null,units.height));
    setMassEntry(formatMassEntry(profile.data.weightKg ?? null,units.bodyWeight));
  },[profile.data?.heightCm,profile.data?.weightKg,user?.id,loadingUnits,profile.isLoading,dirty]);
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
  const openSection=(id:string)=>{
    const target=document.getElementById(id);if(!target)return;
    let parent:HTMLElement|null=target;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}
    const focus=target instanceof HTMLDetailsElement?target.querySelector<HTMLElement>('summary'):target.querySelector<HTMLElement>('h2')||target;
    if(focus){if(!focus.matches('summary,button,a,input,select,textarea'))focus.tabIndex=-1;focus.focus({preventScroll:true});}target.scrollIntoView({block:'start'});
  };
  useEffect(()=>{const openHash=()=>{const id=window.location.hash.slice(1);if(['measurement-units','nutrition-profile','food-preferences','privacy','connections'].includes(id))requestAnimationFrame(()=>openSection(id));};openHash();window.addEventListener('hashchange',openHash);return()=>window.removeEventListener('hashchange',openHash);},[]);
  return (
    <main className="science-page profile-workspace space-y-5">
      <div className="science-heading">
        <p className="eyebrow">MAKE BLOOM YOURS</p><h1>Profile & settings</h1>
        <p>Signed in as {user?.username}</p>
      </div>
      <CompanionHero className="profile-home-hero" eyebrow="YOUR DETAILS, YOUR CHOICES" title="Make Bloom work for you" reason="Keep your profile, food preferences and display units in one place." actions={<button type="button" className="hero-button" onClick={()=>openSection('nutrition-profile')}>Edit profile<ChevronRight size={18} aria-hidden="true"/></button>}/>
      <nav className="profile-shortcuts" aria-label="Profile sections">{[
        {id:'nutrition-profile',title:'Your profile',note:'Measurements and everyday activity',Icon:UserRound},
        {id:'measurement-units',title:'Display units',note:'Choose kg, lb and other units independently',Icon:Ruler},
        {id:'food-preferences',title:'Food preferences',note:'Review your saved preferences and restrictions',Icon:Utensils},
        {id:'connections',title:'Connections',note:'Device availability and stored source records',Icon:Cable},
        {id:'privacy',title:'Privacy & data',note:'Export records or manage account data',Icon:Shield},
      ].map(({id,title,note,Icon})=><button type="button" key={id} onClick={()=>openSection(id)}><Icon size={22} aria-hidden="true"/><span><strong>{title}</strong><small>{note}</small></span><ChevronRight size={18} aria-hidden="true"/></button>)}</nav>
      <form
        id="nutrition-profile" className="bloom-panel profile-editor space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if(!currentProfile||sourceChanged||save.isPending||incomplete||savingUnits||loadingUnits||profile.isLoading||profile.isError)return;
          save.mutate();
        }}
      >
        <fieldset disabled={save.isPending||loadingUnits||profile.isLoading} onChangeCapture={()=>setDirty(true)} className="space-y-4">
        <legend className="sr-only">Nutrition profile fields</legend>
        <h2>Nutrition profile</h2>
        {!revisionValid&&<p role="alert">Saved profile revision could not be verified. <Button type="button" variant="outline" onClick={()=>profile.refetch()}>Reload profile</Button></p>}
        {dirty&&!currentProfile&&!profile.isError&&revisionValid&&<p role="status">Checking current saved profile before saving…</p>}
        {sourceChanged&&<div role="alert" className="space-y-2"><p>Saved profile changed while you were editing. Your draft is still here. Load the latest saved profile to review before saving; this replaces your unsaved fields.</p><Button type="button" variant="outline" disabled={!currentProfile} onClick={()=>{lastHydratedProfile.current=null;setDirty(false);}}>Load latest saved profile</Button></div>}
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
            <div className="profile-basics-grid"><label className="block">
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
            </div><p className="panel-note">
              Complete adult Profile fields support formula estimates. Otherwise,
              the journal shows labelled example references.
            </p>
            <Button disabled={!currentProfile||sourceChanged||save.isPending||incomplete||savingUnits||loadingUnits}>Save nutrition profile</Button>
          </>
        )}
        {save.isSuccess && <p role="status">Profile saved.</p>}
        {save.isError && <p role="alert">{save.error.message}</p>}
        </fieldset>
      </form>
      <details className="bloom-panel profile-section workspace-disclosure" id="profile-display-units"><summary><strong role="heading" aria-level={2}>Display units</strong><span>Personalize how measurements are shown</span></summary><div className="pt-4">            <fieldset className="space-y-3" id="measurement-units">
              <legend className="font-medium">Measurement units</legend>
              <p className="panel-note">Choose units independently. Saved profile measurements remain in canonical centimetres and kilograms; laboratory source units are not changed.</p>
              <p className="panel-note" data-testid="unit-suggestion">{unitSuggestion.region?`Starting suggestions use your saved food browsing region (${unitSuggestion.region}), which does not establish residence.`:unitSuggestion.locale?`Starting suggestions use browser language ${unitSuggestion.locale}, which does not establish where you live.`:"Browser region is unavailable; metric starting suggestions are provided."} Your saved choices are kept. Change any unit independently.</p>
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
                  <select className="bloom-input w-full" aria-label={`${label} unit`} disabled={savingUnits||loadingUnits||!settingsReady} value={selectedUnits[key]} onChange={e=>changeDisplayUnit(key,e.target.value)}>
                    {options.map(option=><option key={option} value={option}>{option}</option>)}
                  </select>
                  <span className="text-xs text-muted-foreground">Suggested: {unitSuggestion.units[key]}</span>
                </label>)}
              </div>
              <p className="panel-note">Unit preferences save automatically here. Completed measurement drafts convert after a successful save; unfinished drafts keep their labelled entry units.</p>
              {savingUnits&&<p role="status">Saving preferences…</p>}
              {unitsError&&<p role="alert">Saved preferences could not be checked or updated: {unitsError}</p>}
            </fieldset></div></details>
      <section id="food-preferences" className="profile-preference-section"><DietaryPreferenceSummary /></section>
      <details id="connections" className="bloom-panel profile-section workspace-disclosure"><summary><strong role="heading" aria-level={2}>Connections</strong><span>Device availability and stored source records</span></summary><div className="pt-4"><ConnectionsOverview/></div></details>
      <details className="bloom-panel profile-section workspace-disclosure" id="privacy" onToggle={e=>{if(e.target===e.currentTarget&&!e.currentTarget.open)e.currentTarget.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(details=>details.open=false);}}><summary><strong role="heading" aria-level={2}>Privacy & data controls</strong><span>Review exports and account deletion</span></summary><div className="space-y-3 pt-4">
        <h2>Manage your account records</h2>
        <p>Download account records here. Separate deletion controls for training and biology remain available below.</p>
        <a href="/precision" className="text-link">Manage biology records & exports</a>
        <AccountDataExport/><AccountErasure/><p className="panel-note">Backup, operational-log and vendor retention/removal remain separate from active account deletion and require operator/provider handling.</p>
      </div></details>
      <details className="bloom-panel profile-section workspace-disclosure"><summary><strong role="heading" aria-level={2}>Food browsing & setup</strong><span>Region and optional Everyday setup</span></summary><div className="space-y-4 pt-4"><FoodRegionSettings/><section className="space-y-3"><h2>Your data & choices</h2><p>Review the privacy and export controls below, or revisit optional Everyday setup.</p><Button variant="outline" onClick={()=>patch({onboarding:{status:"not-started"},mode:"everyday"})}>Revisit Everyday setup</Button><img src="/brand/bloom-icon-monochrome.svg" width={32} height={32} alt="" /></section>
      </div></details>
      <details className="bloom-panel profile-section workspace-disclosure"><summary><strong role="heading" aria-level={2}>Training data controls</strong><span>Export or remove experience records</span></summary><div className="pt-4"><ExperienceDataControls/></div></details>
      <details className="bloom-panel profile-section workspace-disclosure"><summary><strong role="heading" aria-level={2}>Appearance & account</strong><span>Theme, sign-out and available tools</span></summary><div className="pt-4">      <div className="flex flex-wrap gap-3">
        <Link className="text-link" href="/meal-planner">
          Meal planner
        </Link>
        <Link className="text-link" href="/progress">
          Recorded progress
        </Link>
        {onToggleDarkMode && (
          <Button variant="outline" onClick={onToggleDarkMode}>
            {isDarkMode ? "Light mode" : "Dark mode"}
          </Button>
        )}
        <ExperimentalSettings/>
        <Button variant="outline" disabled={signOut.isPending} onClick={() => signOut.mutate()}>
          {signOut.isPending ? "Logging out…" : "Log out"}
        </Button>
        {signOut.error && <p role="alert" className="panel-note">Sign-out could not be confirmed. Try again.</p>}
      </div>
</div></details>
    </main>
  );
}
