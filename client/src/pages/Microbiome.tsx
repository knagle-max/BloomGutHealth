import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, TrendingUp, Beaker, Upload as UploadIcon, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';

export default function Microbiome() {
  const [, navigate] = useLocation();
  
  const { data: demoUser } = useQuery<{ id: string; username: string }>({
    queryKey: ['/api/demo/user'],
  });

  const userId = demoUser?.id || 'demo-user-123';

  const { data: samples, isLoading: samplesLoading } = useQuery<any[]>({
    queryKey: ['/api/microbiome/samples', userId],
  });

  const { data: dietPrediction, isLoading: predictionLoading } = useQuery<any>({
    queryKey: ['/api/microbiome/diet-prediction', userId],
  });

  const hasSamples = samples && samples.length > 0;
  const latestSample = hasSamples ? samples[0] : null;

  if (samplesLoading || predictionLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-6 pb-20">
        <div className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Loading microbiome data...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-6 pb-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Your Microbiome
        </h1>
        <p className="text-sm text-muted-foreground">
          {hasSamples 
            ? 'Analysis of your gut bacteria and their health impacts'
            : 'Predictions based on your dietary patterns'}
        </p>
      </div>

      {!hasSamples && (
        <Card className="mb-6 border-primary/20" data-testid="card-no-test-data">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">AI-Powered Predictions</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  We're analyzing your dietary patterns to predict your likely microbiome composition. 
                  For precise results, upload a microbiome test.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/upload')}
                  data-testid="button-upload-test"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Upload Test Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={hasSamples ? 'latest' : 'predicted'} className="space-y-6">
        {hasSamples && (
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="latest" data-testid="tab-latest">Latest Results</TabsTrigger>
            <TabsTrigger value="bacteria" data-testid="tab-bacteria">Bacteria</TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">Diet Insights</TabsTrigger>
            <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
          </TabsList>
        )}

        {!hasSamples && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predicted" data-testid="tab-predicted">Predicted Profile</TabsTrigger>
            <TabsTrigger value="insights" data-testid="tab-insights">Diet Insights</TabsTrigger>
          </TabsList>
        )}

        {hasSamples ? (
          <>
            <TabsContent value="latest" className="space-y-4">
              {latestSample && (
                <Card data-testid="card-latest-sample">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Test Results</span>
                      <Badge variant="secondary">
                        {format(new Date(latestSample.testDate), 'MMM d, yyyy')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Diversity Index</p>
                        <p className="text-2xl font-bold">{latestSample.diversityIndex?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={latestSample.processingStatus === 'completed' ? 'default' : 'secondary'}>
                          {latestSample.processingStatus}
                        </Badge>
                      </div>
                    </div>
                    {latestSample.testingCompany && (
                      <p className="text-sm text-muted-foreground mt-4">
                        Source: {latestSample.testingCompany}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bacteria" className="space-y-4">
              {dietPrediction?.predictedBacteria && dietPrediction.predictedBacteria.length > 0 ? (
                <>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="py-4">
                      <p className="text-sm">
                        <span className="font-semibold">Diet-Based Composition</span> — Based on {dietPrediction.mealsAnalyzed || 0} meals analyzed. 
                        This shows the likely bacterial species influenced by your current dietary patterns.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Predicted Bacterial Abundance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {dietPrediction.predictedBacteria.map((bacteria: any, idx: number) => {
                        const likelihoodMap: Record<string, number> = {
                          'Very High': 90,
                          'High': 75,
                          'Moderate': 50,
                          'Low': 25,
                        };
                        const abundance = likelihoodMap[bacteria.likelihood] || 50;
                        
                        return (
                          <div key={idx} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{bacteria.name}</p>
                                <p className="text-xs text-muted-foreground">{bacteria.description}</p>
                              </div>
                              <Badge variant="outline" className="ml-2">{bacteria.likelihood}</Badge>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${abundance}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Relative abundance</span>
                                <span>{abundance}%</span>
                              </div>
                            </div>

                            {bacteria.dietaryDriver && (
                              <div className="mt-2 p-2 rounded bg-muted/30 text-xs">
                                <span className="font-medium">Driver: </span>
                                {bacteria.dietaryDriver}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">How to Read This Data</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <strong className="text-foreground">Relative abundance</strong> shows the predicted prevalence of each bacterial species based on your dietary patterns.
                      </p>
                      <p>
                        <strong className="text-foreground">Very High/High</strong> likelihood indicates strong dietary signals promoting these bacteria.
                      </p>
                      <p>
                        Upload a microbiome test for precise abundance measurements and additional insights.
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Bacterial Composition</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Log at least 3 meals to see predicted bacterial composition based on your diet, or upload a microbiome test for precise measurements.
                    </p>
                    <Button onClick={() => navigate('/nutrition')}>
                      Log Meals
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              {dietPrediction?.predictedBacteria && dietPrediction.predictedBacteria.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      Diet-Based Bacterial Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on {dietPrediction.mealsAnalyzed || 0} meals analyzed
                    </p>
                    <div className="space-y-3">
                      {dietPrediction.predictedBacteria.map((bacteria: any, idx: number) => (
                        <div key={idx} className="p-4 rounded-lg border space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold">{bacteria.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">{bacteria.description}</p>
                            </div>
                            <Badge variant="outline" className="ml-2">{bacteria.likelihood}</Badge>
                          </div>
                          {bacteria.dietaryDriver && (
                            <div className="p-2 rounded bg-muted/30">
                              <p className="text-xs font-medium text-muted-foreground mb-1">📊 Dietary Driver</p>
                              <p className="text-sm">{bacteria.dietaryDriver}</p>
                            </div>
                          )}
                          {bacteria.impact && (
                            <div className="p-2 rounded bg-primary/5">
                              <p className="text-xs font-medium text-muted-foreground mb-1">🔬 Health Impact Chain</p>
                              <p className="text-sm font-medium">{bacteria.impact}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Diet-Microbiome Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dietPrediction?.insights ? (
                    <div className="space-y-3">
                      {dietPrediction.insights.map((insight: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border">
                          <h4 className="font-medium mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Log more meals to see personalized insights
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Test History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {samples?.map((sample: any) => (
                      <div key={sample.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium">{format(new Date(sample.testDate), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">{sample.testingCompany || 'Unknown source'}</p>
                        </div>
                        <Badge variant="secondary">{sample.processingStatus}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <>
            <TabsContent value="predicted" className="space-y-4">
              <Card data-testid="card-predicted-profile">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5" />
                    Predicted Microbiome Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dietPrediction ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Based on {dietPrediction.mealsAnalyzed || 0} meals analyzed
                      </p>
                      <div className="space-y-3">
                        {dietPrediction.predictedBacteria?.map((bacteria: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-lg border space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold">{bacteria.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">{bacteria.description}</p>
                              </div>
                              <Badge variant="outline" className="ml-2">{bacteria.likelihood}</Badge>
                            </div>
                            {bacteria.dietaryDriver && (
                              <div className="p-2 rounded bg-muted/30">
                                <p className="text-xs font-medium text-muted-foreground mb-1">📊 Dietary Driver</p>
                                <p className="text-sm">{bacteria.dietaryDriver}</p>
                              </div>
                            )}
                            {bacteria.impact && (
                              <div className="p-2 rounded bg-primary/5">
                                <p className="text-xs font-medium text-muted-foreground mb-1">🔬 Health Impact Chain</p>
                                <p className="text-sm font-medium">{bacteria.impact}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Log more meals to generate predictions
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Diet-Microbiome Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dietPrediction?.insights ? (
                    <div className="space-y-3">
                      {dietPrediction.insights.map((insight: any, idx: number) => (
                        <div key={idx} className="p-3 rounded-lg border">
                          <h4 className="font-medium mb-1">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Log more meals to see personalized insights
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
