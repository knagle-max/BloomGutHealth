import GutHealthScore from '@/components/GutHealthScore';
import InsightCard from '@/components/InsightCard';
import BacterialBar from '@/components/BacterialBar';
import FoodRecommendationCard from '@/components/FoodRecommendationCard';
import EmptyState from '@/components/EmptyState';
import { Beaker } from 'lucide-react';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

//todo: remove mock functionality - replace with real AI insights
const mockInsights = {
  hasData: true,
  gutScore: 72,
  keyFindings: [
    {
      title: 'Bacterial Diversity Improving',
      summary: 'Your Shannon diversity index increased to 2.8, indicating a healthier gut ecosystem.',
      details: 'This improvement suggests better nutrient absorption and immune function. Continue with your current dietary approach focusing on fiber-rich foods.',
      variant: 'success' as const,
    },
    {
      title: 'Low Butyrate Production',
      summary: 'Butyrate-producing bacteria are below optimal levels at 8%.',
      details: 'Butyrate is crucial for colon health and reducing inflammation. Increase resistant starch intake through cooled potatoes and green bananas.',
      variant: 'warning' as const,
    },
  ],
  bacteria: [
    { name: 'Akkermansia', currentLevel: 2.5, optimalRange: '1-4%', isDeficient: false },
    { name: 'Bifidobacterium', currentLevel: 8.7, optimalRange: '2-25%', isDeficient: false },
    { name: 'Faecalibacterium', currentLevel: 1.2, optimalRange: '3-15%', isDeficient: true },
    { name: 'Bacteroides', currentLevel: 25.3, optimalRange: '15-45%', isDeficient: false },
  ],
  recommendations: {
    emphasize: [
      {
        item: 'Fermented Foods (Kimchi, Sauerkraut)',
        reason: 'Boosts Lactobacillus and improves gut diversity',
        details: 'Start with 2-3 tablespoons daily with meals',
      },
      {
        item: 'Resistant Starch (Green Bananas, Cooled Potatoes)',
        reason: 'Feeds butyrate-producing bacteria',
        details: 'Include 1-2 servings daily for optimal SCFA production',
      },
    ],
    limit: [
      {
        item: 'Processed Dairy Products',
        reason: 'Strong correlation with bloating symptoms (78% correlation)',
        details: 'Try lactose-free or plant-based alternatives',
      },
    ],
    supplements: [
      {
        item: 'Probiotic: Lactobacillus rhamnosus GG',
        reason: 'Address detected Lactobacillus deficiency',
        details: '10 billion CFU daily, take with breakfast for 8 weeks',
      },
    ],
  },
};

export default function Insights() {
  const [, setLocation] = useLocation();

  if (!mockInsights.hasData) {
    return (
      <div className="pb-20 pt-4 px-4 max-w-md mx-auto">
        <EmptyState
          icon={Beaker}
          title="No Insights Yet"
          description="Upload your microbiome test results to get personalized AI-powered insights and recommendations."
          actionLabel="Upload Test Results"
          onAction={() => setLocation('/upload')}
          useIllustration
        />
      </div>
    );
  }

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">Your Insights</h1>
        <p className="text-sm text-muted-foreground">AI-powered personalized recommendations</p>
      </div>

      <GutHealthScore score={mockInsights.gutScore} />

      <Tabs defaultValue="findings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="findings">Key Findings</TabsTrigger>
          <TabsTrigger value="bacteria">Bacteria</TabsTrigger>
          <TabsTrigger value="recommendations">Diet</TabsTrigger>
        </TabsList>

        <TabsContent value="findings" className="space-y-4 mt-6">
          {mockInsights.keyFindings.map((finding, idx) => (
            <InsightCard
              key={idx}
              title={finding.title}
              summary={finding.summary}
              details={finding.details}
              variant={finding.variant}
            />
          ))}
        </TabsContent>

        <TabsContent value="bacteria" className="space-y-4 mt-6">
          <div className="rounded-xl bg-card border border-card-border p-4 space-y-4">
            <h3 className="font-display font-semibold">Bacterial Composition</h3>
            {mockInsights.bacteria.map((bacteria, idx) => (
              <BacterialBar
                key={idx}
                name={bacteria.name}
                currentLevel={bacteria.currentLevel}
                optimalRange={bacteria.optimalRange}
                isDeficient={bacteria.isDeficient}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6 mt-6">
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg">Foods to Emphasize</h3>
            {mockInsights.recommendations.emphasize.map((rec, idx) => (
              <FoodRecommendationCard
                key={idx}
                type="emphasize"
                item={rec.item}
                reason={rec.reason}
                details={rec.details}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg">Foods to Limit</h3>
            {mockInsights.recommendations.limit.map((rec, idx) => (
              <FoodRecommendationCard
                key={idx}
                type="limit"
                item={rec.item}
                reason={rec.reason}
                details={rec.details}
              />
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="font-display font-semibold text-lg">Recommended Supplements</h3>
            {mockInsights.recommendations.supplements.map((rec, idx) => (
              <FoodRecommendationCard
                key={idx}
                type="supplement"
                item={rec.item}
                reason={rec.reason}
                details={rec.details}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
