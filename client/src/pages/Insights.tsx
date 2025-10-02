import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyState from '@/components/EmptyState';
import { Beaker, Activity, Heart, Shield, Zap, TrendingUp, Apple, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Insights() {
  const [, setLocation] = useLocation();

  const { data: demoUser } = useQuery<{ id: string; username: string }>({
    queryKey: ['/api/demo/user'],
  });

  const userId = demoUser?.id || 'demo-user-123';

  const { data: healthAnalysis, isLoading: analysisLoading } = useQuery<any>({
    queryKey: [`/api/health/analysis/${userId}`],
    enabled: !!userId,
  });

  const { data: recommendations, isLoading: recLoading } = useQuery<any>({
    queryKey: [`/api/health/recommendations/${userId}`],
    enabled: !!userId,
  });

  const { data: progress } = useQuery<any>({
    queryKey: [`/api/health/progress/${userId}?weeks=4`],
    enabled: !!userId,
  });

  if (analysisLoading || recLoading) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-md mx-auto flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading health analysis...</p>
      </div>
    );
  }

  const hasData = healthAnalysis && healthAnalysis.mealsAnalyzed >= 3;

  if (!hasData) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-md mx-auto">
        <EmptyState
          icon={Beaker}
          title="No Health Data Yet"
          description="Log at least 3 meals to unlock personalized health insights, molecule production tracking, and smart recommendations."
          actionLabel="Log a Meal"
          onAction={() => setLocation('/nutrition')}
          useIllustration
        />
      </div>
    );
  }

  const { molecules, healthScores, bacterialGaps } = healthAnalysis;
  const recs = recommendations?.recommendations || [];

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">Health Insights</h1>
        <p className="text-sm text-muted-foreground">
          Based on {healthAnalysis.mealsAnalyzed} meals analyzed
        </p>
      </div>

      <Tabs defaultValue="health" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" data-testid="tab-health">Health</TabsTrigger>
          <TabsTrigger value="molecules" data-testid="tab-molecules">Molecules</TabsTrigger>
          <TabsTrigger value="recommendations" data-testid="tab-recommendations">Tips</TabsTrigger>
          <TabsTrigger value="progress" data-testid="tab-progress">Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4 mt-6">
          <Card data-testid="card-health-overview">
            <CardHeader>
              <CardTitle className="text-base">Health Score Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthScores && healthScores.length > 0 ? (
                healthScores.map((score: any, idx: number) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {score.category === 'Inflammation' && <Activity className="h-4 w-4 text-primary" />}
                        {score.category === 'Gut Barrier' && <Shield className="h-4 w-4 text-primary" />}
                        {score.category === 'Metabolic Health' && <Zap className="h-4 w-4 text-primary" />}
                        {score.category === 'Immune Function' && <Heart className="h-4 w-4 text-primary" />}
                        <span className="text-sm font-medium">{score.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          score.status === 'excellent' ? 'text-green-600 dark:text-green-400' :
                          score.status === 'good' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-red-600 dark:text-red-400'
                        }`}>
                          {score.score}/100
                        </span>
                        <Badge variant={
                          score.status === 'excellent' ? 'default' :
                          score.status === 'good' ? 'secondary' :
                          'outline'
                        } className={
                          score.status === 'excellent' ? 'bg-green-600 dark:bg-green-700' :
                          score.status === 'good' ? 'bg-yellow-600 dark:bg-yellow-700' :
                          'bg-red-600 dark:bg-red-700 text-white'
                        }>
                          {score.status === 'excellent' ? 'Excellent' :
                           score.status === 'good' ? 'Good' :
                           'Needs Attention'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={score.score} className="h-2" />
                    <div className="bg-muted/50 rounded p-2 space-y-1">
                      {score.impacts.map((impact: string, impIdx: number) => (
                        <p key={impIdx} className="text-xs text-muted-foreground">{impact}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No health score data available</p>
              )}
            </CardContent>
          </Card>

          {bacterialGaps && bacterialGaps.length > 0 && (
            <Card data-testid="card-bacterial-gaps">
              <CardHeader>
                <CardTitle className="text-base">Bacterial Optimization Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bacterialGaps.map((gap: any, idx: number) => (
                  <div key={idx} className="bg-muted/30 rounded p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">{gap.bacteria}</p>
                        <p className="text-xs text-muted-foreground">
                          Current: {gap.currentLevel} | Target: {gap.optimalLevel}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        gap.importance === 'critical' ? 'border-red-600 text-red-600' :
                        gap.importance === 'high' ? 'border-yellow-600 text-yellow-600' :
                        'border-blue-600 text-blue-600'
                      }>
                        {gap.importance}
                      </Badge>
                    </div>
                    <p className="text-xs">
                      <span className="font-medium">Primary Molecule:</span> {gap.primaryMolecule}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="molecules" className="space-y-4 mt-6">
          <Card data-testid="card-molecule-production">
            <CardHeader>
              <CardTitle className="text-base">Metabolite Production</CardTitle>
              <p className="text-xs text-muted-foreground">
                Short-chain fatty acids and beneficial molecules from your diet
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {molecules ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Butyrate</p>
                      <p className="text-2xl font-bold text-primary">{molecules.butyrate}</p>
                      <p className="text-xs text-muted-foreground">mmol/day (est.)</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Acetate</p>
                      <p className="text-2xl font-bold text-primary">{molecules.acetate}</p>
                      <p className="text-xs text-muted-foreground">mmol/day (est.)</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Propionate</p>
                      <p className="text-2xl font-bold text-primary">{molecules.propionate}</p>
                      <p className="text-xs text-muted-foreground">mmol/day (est.)</p>
                    </div>
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Lactate</p>
                      <p className="text-2xl font-bold text-primary">{molecules.lactate}</p>
                      <p className="text-xs text-muted-foreground">mmol/day (est.)</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total SCFAs</p>
                    <p className="text-3xl font-bold text-primary">{molecules.totalSCFAs}</p>
                    <p className="text-xs text-muted-foreground">mmol/day (estimated)</p>
                    <p className="text-xs text-foreground mt-2">
                      {molecules.totalSCFAs > 50 ? 'Excellent SCFA production supporting overall health' :
                       molecules.totalSCFAs > 30 ? 'Good SCFA levels, room for improvement' :
                       'Low SCFA production - increase fiber intake'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t">
                    <h4 className="text-sm font-semibold">What These Molecules Do</h4>
                    <div className="space-y-2">
                      <div className="bg-muted/30 rounded p-2">
                        <p className="text-xs font-medium">Butyrate</p>
                        <p className="text-xs text-muted-foreground">
                          Fuels gut lining cells, reduces inflammation, strengthens gut barrier
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded p-2">
                        <p className="text-xs font-medium">Acetate</p>
                        <p className="text-xs text-muted-foreground">
                          Supports immune function, helps regulate appetite and metabolism
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded p-2">
                        <p className="text-xs font-medium">Propionate</p>
                        <p className="text-xs text-muted-foreground">
                          Regulates glucose and cholesterol metabolism, enhances satiety
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded p-2">
                        <p className="text-xs font-medium">Lactate</p>
                        <p className="text-xs text-muted-foreground">
                          Lowers gut pH, protects against harmful bacteria
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No molecule data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4 mt-6">
          <Card data-testid="card-recommendations">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Apple className="h-5 w-5" />
                Smart Food Recommendations
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Personalized suggestions based on your bacterial gaps and health scores
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {recs.length > 0 ? (
                recs.map((rec: any, idx: number) => (
                  <div 
                    key={idx} 
                    className={`rounded-lg p-4 ${
                      rec.priority === 'high' ? 'bg-primary/10 border border-primary/30' :
                      rec.priority === 'medium' ? 'bg-muted/50 border border-muted' :
                      'bg-muted/30'
                    }`}
                    data-testid={`recommendation-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold flex-1">{rec.food}</p>
                      {rec.priority === 'high' && (
                        <Badge variant="default" className="bg-primary">High Priority</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{rec.reason}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rec.targetBacteria.map((bacteria: string, bIdx: number) => (
                        <Badge key={bIdx} variant="outline" className="text-xs">
                          {bacteria}
                        </Badge>
                      ))}
                    </div>
                    <div className="bg-background/50 rounded p-2 mt-2">
                      <p className="text-xs font-medium mb-1">Serving Guidance:</p>
                      <p className="text-xs text-muted-foreground">{rec.servingGuidance}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Boosts:</span> {rec.targetMolecules.join(', ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recommendations available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4 mt-6">
          <Card data-testid="card-progress">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                4-Week Progress
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Track your health improvements over time
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {progress && progress.weeklyData && progress.weeklyData.length > 0 ? (
                <>
                  {progress.weeklyData.map((week: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{week.week}</p>
                        <Badge variant="outline">{week.mealsLogged} meals</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-xs text-muted-foreground">Inflammation</p>
                          <p className={`text-lg font-bold ${
                            week.averageScores.inflammation >= 70 ? 'text-green-600' :
                            week.averageScores.inflammation >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {week.averageScores.inflammation}
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-xs text-muted-foreground">Gut Barrier</p>
                          <p className={`text-lg font-bold ${
                            week.averageScores.gutBarrier >= 75 ? 'text-green-600' :
                            week.averageScores.gutBarrier >= 55 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {week.averageScores.gutBarrier}
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-xs text-muted-foreground">Metabolic</p>
                          <p className={`text-lg font-bold ${
                            week.averageScores.metabolic >= 70 ? 'text-green-600' :
                            week.averageScores.metabolic >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {week.averageScores.metabolic}
                          </p>
                        </div>
                        <div className="bg-muted/30 rounded p-2">
                          <p className="text-xs text-muted-foreground">Immune</p>
                          <p className={`text-lg font-bold ${
                            week.averageScores.immune >= 70 ? 'text-green-600' :
                            week.averageScores.immune >= 50 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {week.averageScores.immune}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Butyrate</p>
                          <p className="text-sm font-semibold text-primary">{week.molecules.butyrate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Total SCFAs</p>
                          <p className="text-sm font-semibold text-primary">{week.molecules.totalSCFAs}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {progress.weeklyData.length >= 2 && (
                    <div className="bg-gradient-to-r from-green-600/10 to-green-600/5 border border-green-600/30 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Great Progress!
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {(() => {
                              const latest = progress.weeklyData[progress.weeklyData.length - 1];
                              const previous = progress.weeklyData[progress.weeklyData.length - 2];
                              const improvements = [];
                              
                              if (latest.averageScores.inflammation > previous.averageScores.inflammation) {
                                improvements.push('inflammation control');
                              }
                              if (latest.averageScores.gutBarrier > previous.averageScores.gutBarrier) {
                                improvements.push('gut barrier strength');
                              }
                              if (latest.molecules.totalSCFAs > previous.molecules.totalSCFAs) {
                                improvements.push('SCFA production');
                              }
                              
                              if (improvements.length > 0) {
                                return `You're improving in: ${improvements.join(', ')}. Keep up the excellent work!`;
                              }
                              return 'Keep logging meals consistently to track your progress.';
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Log meals consistently to track your progress over time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
