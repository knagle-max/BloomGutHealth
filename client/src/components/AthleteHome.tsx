import {localDate} from "@/lib/experience";
import {athleteBlockerMessage,type AthleteBlockerReason} from "@shared/athlete-eligibility";
import { Button } from "@/components/ui/button";
import { Link } from 'wouter';
import { CalendarDays, Utensils, Moon, Activity, ChevronRight } from 'lucide-react';
import type { ExperienceRecord } from '@shared/experience';
import type { buildAthleteDay } from '@shared/athlete';
import { athleteCalendarSummary } from '@shared/athlete-calendar';
import CompanionHero from './CompanionHero';
function openSource(id: string, selector?: string) {
    const element = document.getElementById(id);
    if (!element)
        return;
    if (element instanceof HTMLDetailsElement)
        element.open = true;
    const focus = selector ? element.querySelector<HTMLElement>(selector) : element;
    focus?.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'start' });
}
export default function AthleteHome({ date, records, checking, unavailable, day, dayUnavailable, onRetryDay, retrying }: {
    date: string;
    records: ExperienceRecord[];
    checking: boolean;
    unavailable: boolean;
    day?: ReturnType<typeof buildAthleteDay>;
    dayUnavailable: boolean;
    onRetryDay: () => void;
    retrying: boolean;
}) {
    const ready = !checking && !unavailable, calendar = athleteCalendarSummary(ready ? records : [], date), session = calendar.session;
    const activities=ready&&calendar.validDate?records.filter(row=>row.kind==="activity"&&localDate(new Date(row.payload.startedAt))===date):undefined;
    const readableDate = calendar.validDate ? new Date(date + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'the selected date';
    const upcoming = session?.payload.status === 'planned' && Date.parse(session.payload.startsAt) >= Date.now();
    const title = !calendar.validDate ? 'Choose a plan date' : checking ? 'Your training calendar' : unavailable || calendar.unconfirmed && !session ? 'Review your saved calendar' : session ? upcoming ? 'Your next saved session' : 'Review your saved session' : 'Build your training day';
    const label = !calendar.validDate ? 'Choose date' : !ready || calendar.unconfirmed && !session ? 'Open calendar' : session ? 'View session' : 'Plan a session';
    const reason = !calendar.validDate ? 'Choose a valid date to review your saved plan.' : checking ? 'Your current calendar is being checked. Saved source entries remain available below.' : unavailable ? 'Your schedule could not be checked. Review the saved entries or retry the calendar.' : session ? `“${session.payload.title}” · ${session.payload.minutes} min · ${session.payload.intensity} · ${new Date(session.payload.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Recorded status: ${session.payload.status}.` : calendar.unconfirmed ? 'Some saved session dates or durations need review; no training or rest state is inferred.' : `No sessions are recorded for ${readableDate}. An empty calendar does not establish a planned rest day.`;
    const act = () => !calendar.validDate ? openSource('athlete-plan-date') : !ready || calendar.unconfirmed && !session ? openSource('athlete-training-calendar') : session ? openSource('athlete-session-' + session.id) : openSource('athlete-add-session', 'input[name="title"]');
    const blockers:readonly AthleteBlockerReason[]=day?.blockers??(day?.blocked?["data_stale"]:[]);
    const cards = [
        {title:'Activity journal',detail:!calendar.validDate?'Choose a valid date':checking?'Checking source…':unavailable?'Current source unavailable':activities?.length?`${activities.length} reported ${activities.length===1?'entry':'entries'}`:'Not recorded',Icon:Activity,href:'/activity'},
        { title: 'Training calendar', detail: checking ? 'Checking source…' : unavailable ? 'Current source unavailable' : `${calendar.planned} planned · ${calendar.completed} completed`, Icon: CalendarDays, onClick: () => openSource('athlete-training-calendar') },
        { title: 'Fueling & meals', detail: !day ? 'Current context not checked' : day.blocked ? blockers.includes('target_conflict')?'Energy and macro targets conflict':'Review the listed eligibility items' : day.partial ? 'Food estimates are incomplete' : 'Review your reference targets', Icon: Utensils, href: '/athlete/fueling?date=' + encodeURIComponent(date) },
        { title: 'Recovery check-in', detail: 'Your dated weekly observations', Icon: Moon, href: '/athlete/recovery' },
        { title: 'Recorded training', detail: !day ? 'Current context not checked' : day.loadEntries ? `${day.loadEntries} completed session(s) with RPE` : 'No completed RPE entry', Icon: Activity, onClick: () => openSource('athlete-load-context', 'summary') },
    ];
    return <>
  <CompanionHero className="athlete-home-hero" headingId="athlete-home-action" icon="/brand/bloom-icon-athlete.svg" eyebrow="YOUR PLAN · YOUR NEXT STEP" title={title} reason={reason} actions={<><button type="button" className="hero-button" onClick={act}>{label}</button><button type="button" className="text-link" onClick={() => openSource('athlete-profile', 'input[name="sport"]')}>Adjust setup</button></>}>
   {dayUnavailable && <div role="alert" className="athlete-home-context-error" data-blocker-reason="source_unavailable"><p>Current fueling targets could not be checked. Numerical guidance is unavailable.</p><Button variant="outline" disabled={retrying} onClick={onRetryDay}>Retry athlete day</Button></div>}
   {day?.blocked && <p className="panel-note" data-blocker-reasons={blockers.join(" ")}>{blockers.map(reason=>athleteBlockerMessage[reason]).join(" ")} Recording sessions remains available.</p>}
   {day?.partial && <p className="panel-note">Some logged nutrients are missing. Review matches before using remaining-fuel suggestions.</p>}
   <details className="today-focus-evidence"><summary>Why this?</summary><p>A saved planned session is selected by its date, reported status and start time. This is a calendar action, not a readiness score, medical clearance or an inferred energy requirement.</p></details>
  </CompanionHero>
  <p><Link className="text-link" href="/activity">Add activity · describe, select or repeat</Link></p>
  <nav className="athlete-home-links" aria-label="Your training sources">{cards.map(({ title, detail, Icon, href, onClick }) => {
            const content = <><Icon size={20} aria-hidden="true"/><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight size={18} aria-hidden="true"/></>;
            return href ? <Link className="workspace-shortcut" key={title} href={href}>{content}</Link> : <button type="button" className="workspace-shortcut" key={title} onClick={onClick}>{content}</button>;
        })}</nav>
 </>;
}
