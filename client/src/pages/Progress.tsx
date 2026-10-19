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
    { mode } = useExperience(),
    report = useQuery<PrecisionReport>({
      queryKey: ["/api/precision"],
      enabled: !!user,
    });
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
      <section className="bloom-panel space-y-4">
        <h2>Bloodwork over time</h2>
        <p className="panel-note">
          Comparisons need compatible units, dates, lab methods and relevant
          fasting conditions. Entered results are not independently verified.
        </p>
        {report.isLoading && (
          <p role="status">Loading your laboratory history…</p>
        )}
        {report.error && <p role="alert">{report.error.message}</p>}
        {report.data?.pendingLabs && <LabUnitReview labs={report.data.pendingLabs} />}
        {report.data?.trends.map(t=><LabTrend key={t.marker} trend={t}/>)}
        {report.data && !report.data.trends.length && (
          <p>
            No dated laboratory results yet. Add a report's values to establish
            a baseline.
          </p>
        )}
        <Link className="text-link" href="/precision">
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
      <WeeklyReviewPanel mode={mode} />
    </main>
  );
}
