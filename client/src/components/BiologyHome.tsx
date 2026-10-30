import { Link } from 'wouter';
import { Activity, FlaskConical, Dna, Leaf, ChevronRight } from 'lucide-react';
import type { PrecisionReport } from '@shared/precision-nutrition';
import CompanionHero from './CompanionHero';
/** Source navigation, not a health score or a new prioritization model. */
export default function BiologyHome({ report, onOpen }: { report: PrecisionReport; onOpen: (tab: string) => void }) {
  const pending = report.pendingLabs.length;
  const sourceOnly = report.sourceOnlyLabs.length;
  const results = report.labHistory.length + pending + sourceOnly;
  const rows = [
    { label: 'Measurements', note: `${report.checkins.length} dated check-ins`, tab: 'progress', Icon: Activity },
    { label: 'Bloodwork', note: `${results} recorded results${pending ? ` · ${pending} source units need review` : ''}${sourceOnly ? ` · ${sourceOnly} source-only, no interpretation` : ''}`, tab: 'labs', Icon: FlaskConical },
    { label: 'Gut reports', note: report.microbiome.report ? 'Review your supplied report and its source' : 'No supported structured report selected', href: '/microbiome', Icon: Leaf },
    { label: 'Genetics', note: report.genetics.import ? 'Recorded calls and educational explanations' : 'No genetic import recorded', tab: 'genetics', Icon: Dna },
  ];
  return <section aria-label="Your health information" className="biology-home">
    <CompanionHero className="biology-home-hero" headingId="biology-home-action" eyebrow="YOUR NEXT ACTION" title="View bloodwork"
      reason={pending ? 'Some source units need confirmation. Review original values before using any interpretation.' : results ? 'Review recorded results, original units and their limitations.' : 'No bloodwork markers recorded yet. You can enter results from your original report.'}
      actions={<button type="button" className="hero-button" onClick={() => onOpen('labs')}>View bloodwork<ChevronRight size={18} aria-hidden="true"/></button>}/>
    <div className="biology-home-sources">{rows.map(({ label, note, tab, href, Icon }) => {
      const content = <><Icon size={22} aria-hidden="true"/><span><strong>{label}</strong><small>{note}</small></span><ChevronRight size={18} aria-hidden="true"/></>;
      return href ? <Link key={label} className="biology-home-source" href={href}>{content}</Link> : <button type="button" key={label} className="biology-home-source" onClick={() => onOpen(tab!)}>{content}</button>;
    })}</div>
    <p className="panel-note">Recorded data is not independently verified. Missing records are not zero measurements or evidence of health.</p>
  </section>;
}
