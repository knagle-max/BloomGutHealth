import {localDate} from '@/lib/experience';
import {useEffect,useRef} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useAuth} from '@/lib/auth';
import {apiRequest,ApiRequestError} from '@/lib/queryClient';
import {checkinRecordSourceSchema} from '@shared/wellness-checkin-sources';
import {Button} from './ui/button';
/** Explicit, owned original-source read; does not change mode or write feedback. */
export default function CheckinRecordSource({id}:{id:string}){
 const{user}=useAuth(),heading=useRef<HTMLHeadingElement>(null);
 const query=useQuery({queryKey:['/api/experience/checkins/source',user?.id,id],enabled:!!user&&!!id,queryFn:async()=>{
  const source=checkinRecordSourceSchema.parse(await(await apiRequest('GET',`/api/experience/checkins/${encodeURIComponent(id)}/source`)).json());if(source.id!==id)throw Error('The selected source could not be confirmed.');return source;
 }});
 const source=query.fetchStatus==='idle'&&!query.isError&&!query.isStale?query.data:undefined;
 useEffect(()=>{if(source){heading.current?.focus();heading.current?.scrollIntoView({block:'start'});}},[user?.id,id,source?.updatedAt]);
 const missing=query.error instanceof ApiRequestError&&query.error.status===404;
 return <section className="bloom-panel space-y-3 [overflow-wrap:anywhere]" aria-label="Saved check-in source"><h2 ref={heading} tabIndex={-1}>Selected check-in source</h2>
 {!source?<><p role="status">{missing?'The selected check-in is not available in your current account.':query.isError?'This saved check-in source could not be checked.':'Checking the selected check-in source…'}</p>{query.isError&&!missing&&<Button variant="outline" disabled={query.isFetching} onClick={()=>query.refetch()}>Retry check-in source</Button>}</>:<>
 <h3>{source.payload.mode==='athlete'?'Athlete':'Everyday'} check-in · <time dateTime={source.payload.date}>{source.payload.date}</time></h3><p className="panel-note">Entered review date only; no observation time was recorded. These are self-reported entries, not measured treatment effects. Energy and digestive comfort:0 poor,10 good; hunger and soreness:0 low,10 high.</p>
 {source.payload.date>localDate()&&<p className="panel-note">This is a future-dated entry and does not establish an observed outcome.</p>}
 <dl className="grid gap-3 sm:grid-cols-2">{[['Energy',`${source.payload.energy} / 10`],['Hunger',`${source.payload.hunger} / 10`],['Digestive comfort',`${source.payload.digestion} / 10`],['Sleep',`${source.payload.sleepHours} hours`],['Soreness',source.payload.soreness===null?'Not recorded':`${source.payload.soreness} / 10`],['Adherence',`${source.payload.adherence} days out of 7`]].map(([name,value])=><div key={name} className="min-w-0"><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
 <p className="whitespace-pre-wrap">Recorded focus: {source.payload.focus||'Not recorded'}</p><p className="whitespace-pre-wrap">Recorded reflection: {source.payload.notes||'Not recorded'}</p><p>Professional review request: {source.payload.professionalReview?'Marked':'Not marked'}</p><p className="panel-note">Entry saved: {source.createdAt}. Source updated: {source.updatedAt}.</p>
 </>}
 </section>;
}
