import {Link} from 'wouter';
import type {WellnessActionView} from '@shared/wellness-actions';
export default function FoodSourceDetails({sources,date,loading}:{sources:WellnessActionView['foodSources'];date:string;loading:boolean}){
 return <details className="mt-3"><summary className="min-h-11 cursor-pointer">Food journal source details</summary><div className="space-y-2 py-2">
  <p className="panel-note">Saved journal entries for {date}. Entry times describe when a meal was recorded; food collection dates were not captured. Unlogged intake, absorption and nutrient adequacy remain unknown.</p>
  {!sources?<p className="panel-note" role="status">{loading?'Checking current journal sources…':'Journal source details are unavailable. Ordinary food logging remains available.'}</p>:sources.status==='unavailable'?<p className="panel-note">Journal sources are unavailable. Ordinary food logging remains available.</p>:<>
   {sources.limited&&<p className="panel-note">Showing the latest 200 entries for this day; this source view is incomplete.</p>}
   {!sources.observations.length?<p className="panel-note">No saved meal entries for this day. Unrecorded intake stays unknown.</p>:<ul className="space-y-3">{sources.observations.map(row=><li key={row.sourceId} className="break-words"><strong>Saved meal entry</strong><p className="panel-note">{row.recordedAt?<><time dateTime={row.recordedAt}>{row.recordedAt}</time>{row.temporalStatus==='future-entry'?' · future-dated entry':''}</>:'Entry time not recorded'}</p><p className="panel-note">{row.genericSourceStatus==='not-captured'?'Original generic composition sources were not captured for this entry.':row.genericSourceStatus==='unsupported'?'Original generic composition sources could not be confirmed for this entry.':row.capturedGenericSources?`${row.capturedGenericSources} original generic composition source(s) captured. Portion contributions remain estimates.`:'No generic composition snapshots in this entry.'} Other saved source details remain in the journal.</p><Link className="text-link inline-flex min-h-11 items-center max-w-full whitespace-normal" href={'/nutrition?meal='+encodeURIComponent(row.sourceId)}>Review saved meal & sources</Link></li>)}</ul>}
  </>}
  <Link className="text-link inline-flex min-h-11 items-center" href="/nutrition">Open food journal</Link>
 </div></details>;
}
