import{useState}from'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import type { Meal } from '@shared/schema';
import { recordedFoodPeriod } from '@shared/food-progress';
import { energyAmount, formatNutrientAmount,nutrientDisplay } from '@shared/nutrition-display';
import { useAuth } from '@/lib/auth';
import { useExperience } from '@/lib/experience';

export default function FoodProgress() {
  const { user } = useAuth();
  const[period,setPeriod]=useState<7|28|'all'>(7),[metric,setMetric]=useState<'calories'|'protein'|'carbs'|'fat'>('calories');
  const { settings } = useExperience();
  const history = useQuery<Meal[]>({ queryKey: ['/api/meals', user?.id], enabled: !!user });
  const checking = history.isPending || history.fetchStatus !== 'idle';
  const days = !checking && !history.isError && history.data ? recordedFoodPeriod(history.data,period) : undefined;
  const labels={calories:'Logged energy',protein:'Logged protein',carbs:'Logged carbohydrate',fat:'Logged fat'},unit=metric==='calories'?settings.displayUnits.energy:'g';
  const points=days?.slice().reverse().flatMap(day=>{const raw=day.totals[metric];return raw===null?[]:[{day:day.day,value:metric==='calories'?nutrientDisplay('calories',raw,'kcal',{energy:settings.displayUnits.energy}).amount!:raw,partial:day.coverage[metric].partial}];})||[];
  const values=points.map(point=>Number(point.value)),maximum=Math.max(1,...values)*1.1,first=points.length?Date.parse(points[0].day+'T12:00:00Z'):0,span=points.length?Date.parse(points[points.length-1].day+'T12:00:00Z')-first:0;
  return <section className="bloom-panel space-y-3" aria-labelledby="food-progress-heading">
    <h2 id="food-progress-heading">Recorded food over time</h2>
    <div className="flex flex-wrap gap-3"><label className="min-w-0 flex-1">Period<select className="bloom-input w-full min-h-11" aria-label="Food progress period" value={period} onChange={e=>setPeriod(e.target.value==='all'?'all':Number(e.target.value)as 7|28)}><option value="7">Last 7 days</option><option value="28">Last 28 days</option><option value="all">All recorded dates</option></select></label><label className="min-w-0 flex-1">Show<select className="bloom-input w-full min-h-11" aria-label="Food progress metric" value={metric} onChange={e=>setMetric(e.target.value as typeof metric)}>{Object.entries(labels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>
    <p className="panel-note">Saved amounts in your current timezone, not a complete measure of intake. Missing days and unknown amounts are not plotted as zero.</p>
    {days&&days.length>0&&<section aria-label="Logged nutrition trend" className="space-y-2"><h3>{labels[metric]}</h3>{points.length?<><svg className="w-full" viewBox="0 0 340 210" role="img" aria-label={`${labels[metric]}, ${points.length} recorded day(s), ${unit}. ${points.filter(point=>point.partial).length} day(s) have partial nutrition. Points are not joined across missing days; daily source totals are available below.`}><line x1="42" x2="322" y1="170" y2="170" stroke="currentColor"/><line x1="42" x2="42" y1="20" y2="170" stroke="currentColor"/><text x="3" y="24" fontSize="11" fill="currentColor">{formatNutrientAmount(maximum)}</text><text x="20" y="173" fontSize="11" fill="currentColor">0</text>{points.map(point=>{const x=42+(span?(Date.parse(point.day+'T12:00:00Z')-first)/span:0.5)*280,y=170-Number(point.value)/maximum*150;return <g key={point.day}><circle data-recorded-day={point.day} data-recorded-value={point.value} cx={x} cy={y} r="5" fill={point.partial?'none':'currentColor'} stroke="currentColor" strokeWidth="2"/><title>{point.day}: {formatNutrientAmount(point.value)} {unit}{point.partial?' · partial nutrition':''}</title>{point.partial&&<text x={x-3} y={Math.max(12,y-10)} fontSize="10" fill="currentColor">P</text>}</g>})}<text x="42" y="195" fontSize="11" fill="currentColor">{points[0].day}</text><text x="322" y="195" textAnchor="end" fontSize="11" fill="currentColor">{points.at(-1)!.day}</text></svg><p className="panel-note">{unit} from saved meals · P marks partial nutrition.{points.length===1?' One recorded day establishes a point, not a trend.':''}</p></>:<p>No known {labels[metric].toLowerCase()} amounts for these recorded days. Unknown values remain unavailable.</p>}</section>}

    {checking && <p role="status">Checking recorded food…</p>}
    {history.isError && <p role="alert">Recorded food could not load. <button type="button" className="text-link" onClick={() => history.refetch()}>Retry recorded food</button></p>}
    {days && (days.length ? <details><summary className="min-h-11 py-2 cursor-pointer focus-visible:outline focus-visible:outline-2">Daily totals &amp; saved meal counts ({days.length} recorded days)</summary><ol className="food-progress-days">{days.map(day => <li key={day.day} className="precision-observation block food-progress-day">
      <div className="food-progress-day-heading"><h3><time dateTime={day.day}>{new Date(`${day.day}T12:00:00`).toLocaleDateString()}</time></h3>
      <p>{day.meals} saved {day.meals === 1 ? 'meal' : 'meals'}</p></div>
      <dl className="food-progress-values">{([
        ['calories', 'Energy', settings.displayUnits.energy], ['protein', 'Protein', 'g'],
        ['carbs', 'Carbohydrate', 'g'], ['fat', 'Fat', 'g'],
      ] as const).map(([key, label, unit]) => <div key={key}><dt>{label}</dt><dd>
        {day.totals[key] == null ? 'Unavailable' : `${key === 'calories' ? energyAmount(day.totals[key], settings.displayUnits.energy) : formatNutrientAmount(day.totals[key])} ${unit}`}
        {day.coverage[key].partial && day.totals[key] != null ? ' · partial' : ''}
      </dd></div>)}</dl>
    </li>)}</ol></details> : history.data?.length?<p>No saved meals in this period. <button type="button" className="text-link min-h-11" onClick={()=>setPeriod('all')}>Show all recorded dates</button></p>:<p>No saved meals yet. Log a meal to start your food history.</p>)}
    <div className="flex flex-wrap gap-3"><Link className="text-link" href="/log-meal">Log food</Link><Link className="text-link" href="/nutrition">Review or correct food journal</Link></div>
  </section>;
}
