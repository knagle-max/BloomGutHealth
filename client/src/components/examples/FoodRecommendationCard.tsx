import FoodRecommendationCard from '../FoodRecommendationCard';

export default function FoodRecommendationCardExample() {
  return (
    <div className="flex flex-col gap-3 p-4 max-w-md">
      <h3 className="font-display font-semibold text-lg">Personalized Recommendations</h3>
      <FoodRecommendationCard 
        type="emphasize"
        item="Fermented Foods (Kimchi, Sauerkraut)"
        reason="Boosts Lactobacillus and improves gut diversity"
        details="Start with 2-3 tablespoons daily with meals"
      />
      <FoodRecommendationCard 
        type="limit"
        item="Processed Dairy Products"
        reason="Strong correlation with bloating symptoms"
        details="Try lactose-free or plant-based alternatives"
      />
      <FoodRecommendationCard 
        type="supplement"
        item="Probiotic: Lactobacillus rhamnosus GG"
        reason="Address detected deficiency"
        details="10 billion CFU daily, take with breakfast for 8 weeks"
      />
    </div>
  );
}
