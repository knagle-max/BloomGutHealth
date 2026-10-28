import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import type { Meal } from '@shared/schema';
import { recordedFoodDays } from '@shared/food-progress';
import { energyAmount, formatNutrientAmount } from '@shared/nutrition-display';
import { useAuth } from '@/lib/auth';
import { useExperience } from '@/lib/experience';

export default function FoodProgress() {
  const { user } = useAuth();
  const { settings } = useExperience();
  const history = useQuery<Meal[]>({ queryKey: ['/api/meals', user?.id], enabled: !!user });
  const checking = history.isPending || history.fetchStatus !== 'idle';
  const days = !checking && !history.isError && history.data ? recordedFoodDays(history.data) : undefined;
  return <section className="bloom-panel space-y-3" aria-labelledby="food-progress-heading">
    <h2 id="food-progress-heading">Recorded food over time</h2>
    <p className="panel-note">Latest seven logged days, grouped in your current timezone. These are totals from saved meals, not a complete measure of daily intake. Days without entries are not shown as zero.</p>
    {checking && <p role="status">Checking recorded food…</p>}
    {history.isError && <p role="alert">Recorded food could not load. <button type="button" className="text-link" onClick={() => history.refetch()}>Retry recorded food</button></p>}
    {days && (days.length ? <ol className="space-y-3">{days.map(day => <li key={day.day} className="precision-observation block space-y-1">
      <h3><time dateTime={day.day}>{new Date(`${day.day}T12:00:00`).toLocaleDateString()}</time></h3>
      <p>{day.meals} saved {day.meals === 1 ? 'meal' : 'meals'}</p>
      <dl className="grid grid-cols-2 gap-2">{([
        ['calories', 'Energy', settings.displayUnits.energy], ['protein', 'Protein', 'g'],
        ['carbs', 'Carbohydrate', 'g'], ['fat', 'Fat', 'g'],
      ] as const).map(([key, label, unit]) => <div key={key}><dt>{label}</dt><dd>
        {day.totals[key] == null ? 'Unavailable' : `${key === 'calories' ? energyAmount(day.totals[key], settings.displayUnits.energy) : formatNutrientAmount(day.totals[key])} ${unit}`}
        {day.coverage[key].partial && day.totals[key] != null ? ' · partial' : ''}
      </dd></div>)}</dl>
    </li>)}</ol> : <p>No saved meals yet. Log a meal to start your food history.</p>)}
    <div className="flex flex-wrap gap-3"><Link className="text-link" href="/log-meal">Log food</Link><Link className="text-link" href="/nutrition">Review or correct food journal</Link></div>
  </section>;
}
