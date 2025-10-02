import GutHealthScore from '@/components/GutHealthScore';
import InsightCard from '@/components/InsightCard';
import BacterialBar from '@/components/BacterialBar';
import FoodRecommendationCard from '@/components/FoodRecommendationCard';
import EmptyState from '@/components/EmptyState';
import { Beaker } from 'lucide-react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Insights() {
  const [, setLocation] = useLocation();

  const { data: demoUser } = useQuery<{ id: string; username: string }>({
    queryKey: ['/api/demo/user'],
  });

  const userId = demoUser?.id || 'demo-user-123';

  const { data: demoSamples } = useQuery({
    queryKey: ['/api/demo/samples'],
  });

  const { data: analysisResults, isLoading } = useQuery({
    queryKey: ['/api/microbiome/results', demoSamples?.[0]?.id],
    enabled: !!demoSamples?.[0]?.id,
  });

  const { data: dietPrediction } = useQuery<any>({
    queryKey: ['/api/microbiome/diet-prediction', userId],
    enabled: !demoSamples || demoSamples.length === 0,
  });

  const latestAnalysis = analysisResults?.analyses?.[0];
  const bacteria = analysisResults?.bacterial_composition || [];
  const metabolites = analysisResults?.metabolites || [];
  const recommendations = analysisResults?.recommendations || [];

  const gutScore = latestAnalysis?.results?.overall_score || 0;
  const cohortComparisons = latestAnalysis?.results?.cohort_comparisons || {};

  const hasSamples = demoSamples && demoSamples.length > 0;
  const hasDietData = dietPrediction && dietPrediction.mealsAnalyzed >= 3;

  if (isLoading) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-md mx-auto flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading analysis...</p>
      </div>
    );
  }

  if (!hasSamples && !hasDietData) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-md mx-auto">
        <EmptyState
          icon={Beaker}
          title="No Insights Yet"
          description="Log meals to get diet-based insights or upload microbiome test results for comprehensive ML analysis."
          actionLabel="Log a Meal"
          onAction={() => setLocation('/nutrition')}
          useIllustration
        />
      </div>
    );
  }

  if (!hasSamples && hasDietData) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-2">Your Insights</h1>
          <p className="text-sm text-muted-foreground">Diet-based microbiome optimization</p>
        </div>

        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2">🌟 Diet-Based Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Based on {dietPrediction.mealsAnalyzed} meals analyzed. For comprehensive insights, upload a microbiome test.
          </p>
        </Card>

        <div className="space-y-4">
          <h3 className="font-semibold">Key Insights</h3>
          {dietPrediction.insights?.map((insight: any, idx: number) => (
            <InsightCard
              key={idx}
              title={insight.title}
              summary={insight.description}
              details=""
              variant={insight.impact === 'positive' ? 'success' : insight.impact === 'warning' ? 'warning' : 'neutral'}
            />
          ))}
        </div>

        {dietPrediction.predictedBacteria && dietPrediction.predictedBacteria.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold">Predicted Bacterial Influences</h3>
            {dietPrediction.predictedBacteria.map((bacteria: any, idx: number) => (
              <Card key={idx} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{bacteria.name}</p>
                  <Badge variant="outline">{bacteria.likelihood}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{bacteria.dietaryDriver}</p>
                <div className="p-2 rounded bg-primary/5 mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Impact Chain</p>
                  <p className="text-sm">{bacteria.impact}</p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="p-4 border-primary/20">
          <p className="text-sm text-muted-foreground text-center">
            For comprehensive analysis with cohort comparisons and precise metabolite predictions, upload a microbiome test.
          </p>
          <button
            onClick={() => setLocation('/upload')}
            className="mt-3 w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Upload Test Results
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">Your Insights</h1>
        <p className="text-sm text-muted-foreground">ML-powered microbiome analysis</p>
      </div>

      <GutHealthScore score={gutScore} />

      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="findings" data-testid="tab-findings">Cohorts</TabsTrigger>
          <TabsTrigger value="bacteria" data-testid="tab-bacteria">Bacteria</TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-4 mt-6">
          <Card className="p-4" data-testid="card-cohort-comparison">
            <h3 className="font-display font-semibold mb-4">Cohort Comparison</h3>
            <div className="space-y-3">
              {Object.entries(cohortComparisons).map(([cohort, data]: [string, any]) => (
                <div key={cohort} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium capitalize text-sm">{cohort.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-muted-foreground">Similarity: {(data.similarity * 100).toFixed(0)}%</p>
                  </div>
                  <Badge variant="outline" data-testid={`badge-percentile-${cohort}`}>
                    {data.percentile}th percentile
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <InsightCard
            title="Diversity Status"
            summary={`Shannon diversity index: ${analysisResults.sample?.diversityIndex?.toFixed(2) || 'N/A'}`}
            details="Higher diversity (>3.5) is associated with better metabolic health and immune function."
            variant={analysisResults.sample?.diversityIndex > 3.5 ? 'success' : 'warning'}
          />

          {metabolites.length > 0 && (
            <Card className="p-4" data-testid="card-metabolites">
              <h3 className="font-display font-semibold mb-3">Key Metabolites</h3>
              <div className="space-y-2">
                {metabolites.slice(0, 3).map((met: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <span>{met.metaboliteName}</span>
                    <Badge variant="outline" data-testid={`badge-metabolite-${idx}`}>
                      {met.predictedConcentration?.toFixed(1)} µM
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="bacteria" className="space-y-4 mt-6">
          <div className="rounded-xl bg-card border border-card-border p-4 space-y-4" data-testid="card-bacteria-composition">
            <h3 className="font-display font-semibold">Bacterial Composition</h3>
            {bacteria.map((bac: any, idx: number) => (
              <BacterialBar
                key={idx}
                name={bac.bacterialName}
                currentLevel={bac.abundance}
                optimalRange="Varies"
                isDeficient={bac.abundance < 5}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg">Personalized Recommendations</h3>
            {recommendations.map((rec: any, idx: number) => (
              <FoodRecommendationCard
                key={idx}
                type={rec.category === 'prebiotics' || rec.category === 'probiotics' ? 'emphasize' : rec.recommendationType === 'lifestyle' ? 'supplement' : 'emphasize'}
                item={rec.itemName}
                reason={rec.reasoning}
                details={rec.details || `Priority: ${rec.priority || 'Medium'}`}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
