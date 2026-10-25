import {Link} from 'wouter';
import {Utensils,Activity,Moon} from 'lucide-react';
import {useExperience,useExperienceRecords,localDate} from '@/lib/experience';
export default function TodayStatus({mealCount,partial,loading,unavailable}:{mealCount:number;partial:number;loading:boolean;unavailable:boolean}){
 const {mode}=useExperience();
 const sessions=useExperienceRecords('session'),checkins=useExperienceRecords('checkin'),today=localDate();
 const currentSessions=!sessions.isFetching&&!sessions.isError?sessions.data?.flatMap(row=>row.kind==='session'&&Number.isFinite(Date.parse(row.payload.startsAt))&&localDate(new Date(row.payload.startsAt))===today&&row.payload.status!=='cancelled'?[row.payload]:[]):undefined;
 const completed=currentSessions?.filter(row=>row.status==='completed').length||0,planned=currentSessions?.filter(row=>row.status==='planned').length||0;
 const checkin=!checkins.isFetching&&!checkins.isError?checkins.data?.find(row=>row.kind==='checkin'&&row.payload.date===today&&row.payload.mode===mode):undefined;
 const sleep=checkin?.kind==='checkin'&&Number.isFinite(checkin.payload.sleepHours)&&checkin.payload.sleepHours>=0&&checkin.payload.sleepHours<=24?checkin.payload.sleepHours:undefined;
 const items=[
  {label:'Eat',Icon:Utensils,href:'/nutrition',value:unavailable?'Unavailable':loading?'Checking…':mealCount?`${mealCount} meal${mealCount===1?'':'s'}`:'Not recorded',source:partial&&!unavailable&&!loading?`${partial} to review`:'Food journal'},
  {label:'Move',Icon:Activity,href:'/athlete',value:sessions.isError?'Unavailable':sessions.isFetching?'Checking…':completed?`${completed} completed`:planned?`${planned} planned`:'Not recorded',source:'Training calendar'},
  {label:'Recover',Icon:Moon,href:'/weekly-review',value:checkins.isError?'Unavailable':checkins.isFetching?'Checking…':sleep!==undefined?`${sleep} h sleep`:'Not recorded',source:'Daily check-in'},
 ];
 return <section className="today-status" aria-label="Your day at a glance"><nav className="today-status-strip" aria-label="Dated source records">{items.map(({label,Icon,href,value,source})=><Link key={label} href={href} className="today-status-item"><span className="today-status-label"><Icon size={16} aria-hidden="true"/>{label}</span><strong>{value}</strong><span className="today-status-source">{source}</span></Link>)}</nav><details className="today-status-context"><summary>Today’s sources & missing data</summary><p>Food journal, training calendar and check-in for {new Date().toLocaleDateString()}. These are recorded observations, not completion targets or a readiness score. Open a source to review or correct it.</p><p>No recorded session does not establish a planned rest day. Missing sleep or intake is unknown. Sleep is self-reported; it does not measure recovery.</p>{planned>0&&completed>0&&<p>{planned} additional session(s) are planned today. Planned activity is not completed training.</p>}</details></section>;
}
