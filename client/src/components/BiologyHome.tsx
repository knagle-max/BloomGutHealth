import { Link } from 'wouter';
import { Activity, FlaskConical, Dna, Leaf, ChevronRight } from 'lucide-react';
import type { PrecisionReport } from '@shared/precision-nutrition';
import type {GutReportInventory} from '@shared/biology-source-inventory';
/** Source navigation, not a health score or a new prioritization model. */
export default function BiologyHome({ report,gutReports, onOpen }: { report: PrecisionReport;gutReports?:GutReportInventory; onOpen: (tab: string) => void }) {
  const pending = report.pendingLabs.length;
  const sourceOnly = report.sourceOnlyLabs.length;
  const results = report.labHistory.length + pending + sourceOnly;
  const gutNote=gutReports?gutReports.saved?`${gutReports.saved} saved ${gutReports.saved===1?'report':'reports'}${gutReports.awaitingReview?` · ${gutReports.awaitingReview} to review`:''}`:gutReports.awaitingReview?`${gutReports.awaitingReview} ${gutReports.awaitingReview===1?'report':'reports'} to review`:'Add your first report':report.microbiome.report?'Report added':'Review gut reports';
  const rows = [
    { label: 'Bloodwork', note: `${results?`${results} recorded results`:'Add your first result'}${pending ? ` · ${pending} source unit${pending===1?' needs':'s need'} review` : ''}${sourceOnly ? ` · ${sourceOnly} source-only` : ''}`, tab: 'labs', Icon: FlaskConical },
    { label: 'Gut reports', note:gutNote, href: '/microbiome', Icon: Leaf },
    { label: 'Genetics', note: report.genetics.import ? 'Recorded calls & research context' : 'Explore genes or add a source', tab: 'genetics', Icon: Dna },
    { label: 'Measurements', note: report.checkins.length?`${report.checkins.length} dated check-ins`:'Add your first measurement', tab: 'progress', Icon: Activity },
  ];
  return <section aria-label="Your health information" className="biology-home">
    <h2 className="mb-3">Your health information</h2>
    <div className="biology-home-sources">{rows.map(({ label, note, tab, href, Icon }) => {
      const content = <><Icon size={22} aria-hidden="true"/><span><strong>{label}</strong><small>{note}</small></span><ChevronRight size={18} aria-hidden="true"/></>;
      return href ? <Link key={label} className="biology-home-source" href={href}>{content}</Link> : <button type="button" key={label} className="biology-home-source" onClick={() => onOpen(tab!)}>{content}</button>;
    })}</div>
  </section>;
}
