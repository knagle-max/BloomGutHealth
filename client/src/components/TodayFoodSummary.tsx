import {Link} from 'wouter';
import {energyAmount,formatNutrientAmount} from '@shared/nutrition-display';
import type {dailyMealSummary} from '@/lib/dashboard-data';

/** The existing journal summary is authoritative; no target or progress ring inferred. */
export default function TodayFoodSummary({summary,loading,error,energyUnit}:{summary:ReturnType<typeof dailyMealSummary>;loading:boolean;error:boolean;energyUnit:'kcal'|'kJ'}){
  const available=!loading&&!error&&summary.meals.length>0;
  return <section className="flagship-nourishment" aria-labelledby="today-food-title">
    <div className="flagship-section-heading"><h2 id="today-food-title">Today so far</h2><Link className="text-link" href="/nutrition">Food journal</Link></div>
    {loading?<p role="status">Checking recorded food…</p>:error?<p role="status">Recorded totals are unavailable. You can still add food manually.</p>:!available?<p>Your recent foods and recorded totals will appear after you log a meal.</p>:<>
      <p className="flagship-recorded-energy"><strong>{summary.calories===null?'—':energyAmount(summary.calories,energyUnit)}</strong> {energyUnit} <span>recorded{summary.coverage.calories.partial?' · Partial data':''}</span></p>
      <dl className="flagship-macros">{([['protein','Protein'],['carbs','Carbs'],['fat','Fat']] as const).map(([key,label])=><div key={key}><dt>{label}</dt><dd>{summary[key]===null?'—':`${formatNutrientAmount(summary[key])} g`}{summary.coverage[key].partial&&<small>Partial data</small>}</dd></div>)}</dl>
      <p className="panel-note">{summary.meals.length} recorded {summary.meals.length===1?'meal':'meals'}. Estimated from saved sources, not a complete measure of daily intake.</p>
    </>}
  </section>;
}
