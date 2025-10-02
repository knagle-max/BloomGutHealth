import QuickStatCard from '../QuickStatCard';
import { Flame, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';

export default function QuickStatCardExample() {
  return (
    <div className="grid grid-cols-2 gap-3 p-4 max-w-md">
      <QuickStatCard icon={Flame} value={12} label="Day Streak" />
      <QuickStatCard icon={AlertTriangle} value={3} label="Trigger Foods" gradientFrom="hsl(var(--warning))" />
      <QuickStatCard icon={TrendingUp} value="24%" label="Improvement" gradientFrom="hsl(var(--success))" />
      <QuickStatCard icon={Calendar} value={18} label="Days This Month" gradientFrom="hsl(var(--info))" />
    </div>
  );
}
