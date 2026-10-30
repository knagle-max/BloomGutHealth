import {recordedActivityWeek} from '@shared/activity-capture';
import type {ExperienceRecord} from '@shared/experience';
import {useLocalClock} from '@/lib/use-local-clock';
export default function ActivityWeekSummary({records}:{records:readonly Extract<ExperienceRecord,{kind:'activity'}>[]}){
 const now=useLocalClock(),week=recordedActivityWeek(records,now);
 if(!records.length)return null;
 return <section className="activity-summary space-y-2" aria-label="Activity over seven days"><h3>Past seven calendar days</h3>
  <p className="panel-note"><time dateTime={week.from}>{week.from}</time> to <time dateTime={week.to}>{week.to}</time>, through now · current browser timezone.</p>
  {week.entries?<><p><strong>{week.recordedDays} {week.recordedDays===1?'day':'days'} with entries</strong> · {week.entries} saved {week.entries===1?'entry':'entries'}</p>
   <p>{week.knownMinutes===null?'Duration not recorded':`${week.knownMinutes} reported minutes`}{week.missingDurations?` · ${week.missingDurations} activity duration(s) unrecorded`:''}</p>
   <p>Recorded choices: {week.labels.join(', ')}.</p></>:<p>No entries in this seven-day window. Older saved entries remain in the history below.</p>}
  <p className="panel-note">Journal observations, not a complete measure of movement. Days without entries are not zero activity; sets do not supply missing duration or calories.</p>
 </section>;
}
