import {useRef, useState} from 'react';
import {Link} from 'wouter';
import {Utensils,Activity,Moon} from 'lucide-react';
import {useExperience,useExperienceRecords,localDate} from '@/lib/experience';
export default function TodayStatus({mealCount,partial,loading,unavailable}:{mealCount:number;partial:number;loading:boolean;unavailable:boolean}){
 const {mode}=useExperience();
 const movement=useRef<HTMLDetailsElement>(null),[movementOpen,setMovementOpen]=useState(false);
 const activities=useExperienceRecords('activity'),sessions=useExperienceRecords('session'),checkins=useExperienceRecords('checkin'),today=localDate();
 const currentSessions=sessions.fetchStatus==='idle'&&!sessions.isStale&&!sessions.isError?sessions.data?.flatMap(row=>row.kind==='session'&&Number.isFinite(Date.parse(row.payload.startsAt))&&localDate(new Date(row.payload.startsAt))===today?[row.payload]:[]):undefined;
 const currentActivities=activities.fetchStatus==='idle'&&!activities.isStale&&!activities.isError?activities.data?.flatMap(row=>row.kind==='activity'&&localDate(new Date(row.payload.startedAt))===today?[row.payload]:[]):undefined;
 const activityChecking=activities.isPending||activities.fetchStatus!=='idle'||activities.isStale&&!activities.isError;
 const cancelled=currentSessions?.filter(row=>row.status==='cancelled').length||0;
 const completed=currentSessions?.filter(row=>row.status==='completed').length||0,planned=currentSessions?.filter(row=>row.status==='planned').length||0;
 const checkin=checkins.fetchStatus==='idle'&&!checkins.isError?checkins.data?.find(row=>row.kind==='checkin'&&row.payload.date===today&&row.payload.mode===mode):undefined;
 const sleep=checkin?.kind==='checkin'&&Number.isFinite(checkin.payload.sleepHours)&&checkin.payload.sleepHours>=0&&checkin.payload.sleepHours<=24?checkin.payload.sleepHours:undefined;
 const items=[
  {label:'Eat',Icon:Utensils,href:'/nutrition',value:unavailable?'Unavailable':loading?'Checking…':mealCount?`${mealCount} meal${mealCount===1?'':'s'}`:'Not recorded',source:partial&&!unavailable&&!loading?`${partial} to review`:'Food journal'},
  {label:'Move',Icon:Activity,href:'#today-movement-source',value:activities.isError||sessions.isError?'Unavailable':activityChecking||sessions.isPending||sessions.fetchStatus!=='idle'||sessions.isStale&&!sessions.isError?'Checking…':currentActivities?.length?`${currentActivities.length} activity ${currentActivities.length===1?'entry':'entries'}`:completed?`${completed} completed`:planned?`${planned} planned`:cancelled?`${cancelled} cancelled`:'Not recorded',source:'Activity & sessions'},
  {label:'Recover',Icon:Moon,href:'/weekly-review',value:checkins.isError?'Unavailable':checkins.isPending||checkins.fetchStatus!=='idle'?'Checking…':sleep!==undefined?`${sleep} h sleep`:'Not recorded',source:'Daily check-in'},
 ];
 return <section className="today-status" aria-label="Your day at a glance"><nav className="today-status-strip" aria-label="Dated source records">{items.map(({label,Icon,href,value,source})=>{
  const content=<><span className="today-status-label"><Icon size={16} aria-hidden="true"/>{label}</span><strong>{value}</strong><span className="today-status-source">{source}</span></>;
  return label==='Move'?<button key={label} type="button" className="today-status-item text-left" aria-controls="today-movement-source" aria-expanded={movementOpen} onClick={()=>{if(movement.current){movement.current.open=true;movement.current.querySelector('summary')?.focus();}}}>{content}</button>:<Link key={label} href={href} className="today-status-item">{content}</Link>;
 })}</nav>
 <details ref={movement} id="today-movement-source" className="today-status-context" aria-label="Today’s movement records" onToggle={e=>setMovementOpen(e.currentTarget.open)}>
  <summary>Today’s movement records</summary>
  <p>Manual activity and training calendar · {new Date().toLocaleDateString()}. Shared recorded history, independent of experience mode. Planned and cancelled sessions do not count as completed movement.</p>
  <h3>Manual activity</h3>
  {activityChecking?<p role="status">Checking current manual activity…</p>:activities.isError?<p role="alert">Manual activity could not load. <button type="button" className="text-link" onClick={()=>activities.refetch()}>Retry manual activity</button></p>:currentActivities?.length?<ul className="space-y-3">{currentActivities.map((row,index)=><li key={index}><strong>{row.title}</strong><p>{new Date(row.startedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · {row.minutes} minutes{row.effort?` · ${row.effort}`:''} · Manual entry</p></li>)}</ul>:<p>No manual activity recorded for this date.</p>}
  <p><Link className="text-link" href="/activity">Log activity</Link></p><h3>Training sessions</h3>
  {sessions.fetchStatus!=='idle'||sessions.isPending||sessions.isStale&&!sessions.isError?<p role="status">Checking current movement records…</p>:sessions.isError?<p role="alert">Movement records could not load. <button type="button" className="text-link" onClick={()=>sessions.refetch()}>Retry movement records</button></p>:<>
   {currentSessions?.length?<ul className="space-y-3">{currentSessions.map((row,index)=><li key={index}><strong>{row.title}</strong><p>{new Date(row.startsAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})} · {row.minutes} minutes · {row.status}</p></li>)}</ul>:<p>No session recorded for this date.</p>}
  </>}
  <p>No recorded session does not establish a rest day or zero movement. Device activity is not included in this calendar source.</p>
  <p className="panel-note">Manual activity does not estimate calories burned or assign workout fueling targets. <Link className="text-link" href="/athlete">Manage training sessions</Link>.</p>
 </details>
 <details className="today-status-context"><summary>Today’s sources & missing data</summary><p>Food journal, training calendar and check-in for {new Date().toLocaleDateString()}. These are recorded observations, not completion targets or a readiness score. Open a source to review it.</p><p>No recorded session does not establish a planned rest day. Missing sleep or intake is unknown. Sleep is self-reported; it does not measure recovery.</p>{planned>0&&completed>0&&<p>{planned} additional session(s) are planned today. Planned activity is not completed training.</p>}</details></section>;
}
