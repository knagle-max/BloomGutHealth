import { kgToDisplay, cmToHeight, quantityFromCanonical } from "@shared/display-units";
import { useExperienceRecords } from "@/lib/experience";
import DeviceObservations from "@/components/DeviceObservations";
import LabUnitReview from "@/components/LabUnitReview";
import LabTrend from "@/components/LabTrend";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useExperience } from "@/lib/experience";
import { WeeklyReviewPanel } from "@/components/WeeklyReview";
import type { PrecisionReport } from "@shared/precision-nutrition";
export default function Progress() {
  const { user } = useAuth(),
    { mode, settings, patch, saving, loading, error: settingsError } = useExperience(),
    profile = useQuery<{heightCm:number|null;weightKg:number|null}>({queryKey:["/api/profile"],enabled:!!user}),
    sessions = useExperienceRecords("hydration"),
    report = useQuery<PrecisionReport>({
      queryKey: ["/api/precision"],
      enabled: !!user,
    });
  const currentReport=report.fetchStatus==="idle"&&!report.isError?report.data:undefined;
  const currentProfile=profile.fetchStatus==="idle"&&!profile.isError?profile.data:undefined;
  const currentHydration=sessions.fetchStatus==="idle"&&!sessions.isError?sessions.data:undefined;
  const checkingReport=report.isPending||report.fetchStatus!=="idle";
  return (
    <main className="science-page progress-workspace space-y-5">
      <div className="science-heading">
        <p className="eyebrow">NOTICE, COMPARE, ADJUST</p>
        <h1>Progress</h1>
        <p>
          Bring your routine, tolerance and laboratory observations together. A
          change over time is not proof of its cause.
        </p>
      </div>
      <section className="bloom-panel space-y-3">
        <h2>Your dated observations</h2>
        <p>Use repeat measurements and check-ins to review what changed. A current Profile value is not a dated observation.</p>
        {checkingReport && <p role="status">Checking current dated observations…</p>}
        {report.isError && <p role="alert">Dated observations could not be checked. Your records are not treated as empty.</p>}
        {currentReport && (currentReport.checkins.length ? <ol className="space-y-3">
          {[...currentReport.checkins].sort((a,b)=>+new Date(b.measuredAt)-+new Date(a.measuredAt)).slice(0,5).map(c=><li className="precision-observation block" key={c.id}>
            <h3>{new Date(c.measuredAt).toLocaleDateString()}</h3>
            <p>{[
              c.weightKg == null ? null : `Weight: ${Number(kgToDisplay(c.weightKg,settings.displayUnits.bodyWeight).toFixed(2))} ${settings.displayUnits.bodyWeight}`,
              c.waistCm == null ? null : `Waist: ${Number(quantityFromCanonical("circumference",c.waistCm,settings.displayUnits.circumference).toFixed(2))} ${settings.displayUnits.circumference}`,
              c.bodyFatPercent == null ? null : `Body fat: ${c.bodyFatPercent}%`,
              c.energy == null ? null : `Energy: ${c.energy}/10`,
              c.adherencePercent == null ? null : `Adherence: ${c.adherencePercent}%`,
            ].filter(Boolean).join(" · ") || "No body measurements or goal ratings recorded in this check-in."}</p>
            {c.notes && <p className="panel-note">{c.notes}</p>}
          </li>)}
        </ol> : <p>No dated body observations yet. Record a measurement to establish a baseline; an empty history is not a measurement of zero.</p>)}
        <p className="panel-note">Latest five self-reported check-ins. Missing values remain unrecorded. Different methods, illness, training or medication changes can affect comparisons.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="hero-button" href="/precision?tab=progress">Record a dated body measurement</Link>
          <Link className="text-link" href="/weekly-review">Review goals & weekly responses</Link>
        </div>
      </section>
      <section className="bloom-panel space-y-4">
        <h2>Bloodwork over time</h2>
        <p className="panel-note">
          Comparisons need compatible units, dates, lab methods and relevant
          fasting conditions. Entered results are not independently verified.
        </p>
        {checkingReport && (
          <p role="status">Checking current laboratory history…</p>
        )}
        {report.isError && <p role="alert">Laboratory history could not be checked. Previously loaded results are not shown as current.</p>}
        {(report.isError||report.fetchStatus==="paused")&&<button type="button" className="text-link" disabled={report.isFetching} onClick={()=>report.refetch()}>Retry Progress observations</button>}
        <div hidden={!currentReport}><fieldset disabled={!currentReport}><LabUnitReview labs={report.data?.pendingLabs||[]} /></fieldset></div>
        {currentReport?.trends.map(t=><LabTrend key={t.marker} trend={t}/>)}
        {currentReport && !currentReport.trends.length && (
          <p>
            No dated laboratory results yet. Add a report's values to establish
            a baseline.
          </p>
        )}
        <Link className="text-link" href="/precision?tab=labs">
          Add or review laboratory results
        </Link>
      </section>
      <section className="bloom-panel space-y-3">
        <h2>Microbiome history</h2>
        <p>
          Use your gut reports to review reported organisms, scores, methods and
          missing measurements. Reports from different methods are not
          automatically comparable.
        </p>
        <Link className="text-link" href="/microbiome">
          Review my gut reports
        </Link>
        <Link className="text-link" href="/nutrition">
          Review food & symptom history
        </Link>
      </section>
      <DeviceObservations />
      <details className="bloom-panel workspace-disclosure">
        <summary>Weekly responses, goals & experiments</summary>
        <WeeklyReviewPanel mode={mode} />
      </details>
      <details className="bloom-panel workspace-disclosure">
        <summary>Current Profile snapshot & shared display units</summary>
      <section className="bloom-panel space-y-3" aria-labelledby="progress-measurements">
        <h2 id="progress-measurements">Body measurements & units</h2>
        <p className="panel-note">Your unit choices are shared across Profile, Progress and Athlete. Changing a unit changes the display, not the original record. No measurement is invented from a missing record.</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">Height unit
            <select aria-label="Progress height unit" className="bloom-input w-full" value={settings.displayUnits.height} disabled={saving||loading} onChange={e=>patch({displayUnits:{...settings.displayUnits,height:e.target.value as "cm"|"m"|"ft-in"}})}>
              <option value="cm">cm</option><option value="m">metres</option><option value="ft-in">feet + inches</option>
            </select>
          </label>
          <label className="block">Body weight unit
            <select aria-label="Progress body weight unit" className="bloom-input w-full" value={settings.displayUnits.bodyWeight} disabled={saving||loading} onChange={e=>patch({displayUnits:{...settings.displayUnits,bodyWeight:e.target.value as "kg"|"lb"}})}>
              <option value="kg">kg</option><option value="lb">lb</option>
            </select>
          </label>
          <label className="block">Hydration unit
            <select aria-label="Progress hydration unit" className="bloom-input w-full" value={settings.displayUnits.hydration} disabled={saving||loading} onChange={e=>patch({displayUnits:{...settings.displayUnits,hydration:e.target.value as "mL"|"L"|"US-fl-oz"}})}>
              <option value="mL">mL</option><option value="L">L</option><option value="US-fl-oz">US fl oz</option>
            </select>
          </label>
        </div>
        {saving&&<p role="status">Saving units…</p>}
        {settingsError&&<p role="alert">Could not save units: {settingsError}</p>}
        {(profile.isPending||profile.fetchStatus!=="idle")&&<p role="status">Loading saved profile measurements…</p>}
        {profile.isError&&<p role="alert">Saved profile measurements could not load. <button type="button" className="text-link" onClick={()=>profile.refetch()}>Retry Profile measurements</button></p>}
        {currentProfile&&<dl className="grid grid-cols-2 gap-3">
          <div><dt className="panel-note">Current profile height</dt><dd className="font-medium">{currentProfile.heightCm == null?"Not recorded":(()=>{
            const value=cmToHeight(currentProfile.heightCm,settings.displayUnits.height);
            return settings.displayUnits.height==="ft-in"?value.primary+" ft "+Number(value.inches.toFixed(1))+" in":Number(value.primary.toFixed(2))+" "+settings.displayUnits.height;
          })()}</dd></div>
          <div><dt className="panel-note">Current profile weight</dt><dd className="font-medium">{currentProfile.weightKg==null?"Not recorded":Number(kgToDisplay(currentProfile.weightKg,settings.displayUnits.bodyWeight).toFixed(1))+" "+settings.displayUnits.bodyWeight}</dd></div>
        </dl>}
        <p className="panel-note">Source: your latest saved nutrition Profile values; these are not dated weight-history entries. Athlete session weigh-ins and device measurements remain separately identified, so overlapping values are not silently merged.</p>
        {sessions.fetchStatus!=="idle"&&<p role="status">Checking current hydration observations…</p>}
        {sessions.isError&&<p role="alert">Hydration observations could not load. <button type="button" className="text-link" onClick={()=>sessions.refetch()}>Retry hydration observations</button></p>}
        {currentHydration&&<p className="panel-note">Athlete hydration observations recorded: {currentHydration.length}. These retain their original session dates and are not substituted for your current profile weight.</p>}
        <Link className="text-link" href="/profile#measurement-units">Edit your saved body measurements in Profile</Link>
      </section>
      </details>
    </main>
  );
}
