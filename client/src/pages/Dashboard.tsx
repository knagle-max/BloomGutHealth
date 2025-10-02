import GutHealthScore from '@/components/GutHealthScore';
import QuickStatCard from '@/components/QuickStatCard';
import ActionButtonCard from '@/components/ActionButtonCard';
import InsightCard from '@/components/InsightCard';
import { Flame, AlertTriangle, TrendingUp, Calendar, UtensilsCrossed, Upload, Lightbulb } from 'lucide-react';
import { useLocation } from 'wouter';

//todo: remove mock functionality - replace with real data
const mockData = {
  gutScore: 72,
  previousScore: 65,
  lastUpdated: '2 days ago',
  stats: {
    streak: 12,
    triggerFoods: 3,
    improvement: 24,
    daysThisMonth: 18,
  },
  latestInsight: {
    title: 'Bacterial Diversity Improving',
    summary: 'Your Shannon diversity index increased to 2.8, indicating a healthier gut ecosystem.',
    details: 'This improvement suggests better nutrient absorption and immune function. Continue with your current dietary approach focusing on fiber-rich foods.',
  },
};

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <GutHealthScore 
        score={mockData.gutScore} 
        previousScore={mockData.previousScore}
        lastUpdated={mockData.lastUpdated}
      />

      <div className="grid grid-cols-2 gap-3">
        <QuickStatCard icon={Flame} value={mockData.stats.streak} label="Day Streak" />
        <QuickStatCard 
          icon={AlertTriangle} 
          value={mockData.stats.triggerFoods} 
          label="Trigger Foods" 
          gradientFrom="hsl(var(--warning))" 
        />
        <QuickStatCard 
          icon={TrendingUp} 
          value={`${mockData.stats.improvement}%`} 
          label="Improvement" 
          gradientFrom="hsl(var(--success))" 
        />
        <QuickStatCard 
          icon={Calendar} 
          value={mockData.stats.daysThisMonth} 
          label="Days This Month" 
          gradientFrom="hsl(var(--info))" 
        />
      </div>

      <div className="space-y-3">
        <ActionButtonCard
          icon={UtensilsCrossed}
          title="Log Today's Meals"
          description="Track your food and symptoms"
          onClick={() => setLocation('/log-meal')}
        />
        <ActionButtonCard
          icon={Upload}
          title="Upload Microbiome Test"
          description="Get personalized insights"
          onClick={() => setLocation('/upload')}
          variant="info"
        />
        <ActionButtonCard
          icon={Lightbulb}
          title="View My Insights"
          description="AI-powered recommendations"
          onClick={() => setLocation('/insights')}
          variant="accent"
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold">Recent Activity</h2>
        <InsightCard
          title={mockData.latestInsight.title}
          summary={mockData.latestInsight.summary}
          details={mockData.latestInsight.details}
          variant="success"
        />
      </div>
    </div>
  );
}
