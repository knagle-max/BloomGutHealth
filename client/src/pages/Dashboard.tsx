import GutHealthScore from '@/components/GutHealthScore';
import QuickStatCard from '@/components/QuickStatCard';
import ActionButtonCard from '@/components/ActionButtonCard';
import InsightCard from '@/components/InsightCard';
import { Flame, AlertTriangle, TrendingUp, Calendar, UtensilsCrossed, Upload, Lightbulb, Microscope } from 'lucide-react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: demoUser } = useQuery({
    queryKey: ['/api/demo/user'],
  });

  const { data: demoSamples } = useQuery({
    queryKey: ['/api/demo/samples'],
  });

  const { data: analysisResults } = useQuery({
    queryKey: ['/api/microbiome/results', demoSamples?.[0]?.id],
    enabled: !!demoSamples?.[0]?.id,
  });

  const latestSample = demoSamples?.[0];
  const latestAnalysis = analysisResults?.analyses?.[0];
  const overallScore = latestAnalysis?.results?.overall_score || 72;
  const diversityIndex = latestSample?.diversityIndex || 0;

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      {demoUser && (
        <Card className="p-4 bg-info/10 border-info/20" data-testid="card-demo-banner">
          <div className="flex items-start gap-3">
            <Microscope className="h-5 w-5 text-info mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Demo Mode - Explore Full Features</h3>
              <p className="text-xs text-muted-foreground mt-1">
                You're viewing sample microbiome analysis. All features are functional!
              </p>
            </div>
          </div>
        </Card>
      )}

      <GutHealthScore 
        score={overallScore} 
        previousScore={overallScore - 7}
        lastUpdated={latestSample ? new Date(latestSample.testDate).toLocaleDateString() : '2 days ago'}
      />

      <div className="grid grid-cols-2 gap-3">
        <QuickStatCard 
          icon={Microscope} 
          value={diversityIndex.toFixed(1)} 
          label="Diversity Index" 
        />
        <QuickStatCard 
          icon={TrendingUp} 
          value={analysisResults?.bacterial_composition?.length || 0} 
          label="Species Found" 
          gradientFrom="hsl(var(--success))" 
        />
        <QuickStatCard 
          icon={Lightbulb} 
          value={analysisResults?.metabolites?.length || 0} 
          label="Metabolites" 
          gradientFrom="hsl(var(--info))" 
        />
        <QuickStatCard 
          icon={Calendar} 
          value={analysisResults?.recommendations?.length || 0} 
          label="Recommendations" 
          gradientFrom="hsl(var(--accent))" 
        />
      </div>

      <div className="space-y-3">
        <ActionButtonCard
          icon={UtensilsCrossed}
          title="Log Today's Meals"
          description="AI nutrition analysis with macro/micronutrients"
          onClick={() => setLocation('/log-meal')}
        />
        <ActionButtonCard
          icon={Microscope}
          title="View Microbiome Analysis"
          description="ML-powered insights from demo data"
          onClick={() => setLocation('/insights')}
          variant="accent"
        />
        <ActionButtonCard
          icon={Upload}
          title="Upload Your Own Test"
          description="Analyze your microbiome data"
          onClick={() => setLocation('/upload')}
          variant="info"
        />
      </div>

      {analysisResults?.recommendations?.[0] && (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-semibold">Top Recommendation</h2>
          <InsightCard
            title={analysisResults.recommendations[0].itemName}
            summary={analysisResults.recommendations[0].reasoning}
            details={analysisResults.recommendations[0].details || ''}
            variant="success"
          />
        </div>
      )}
    </div>
  );
}
