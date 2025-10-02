import InsightCard from '../InsightCard';

export default function InsightCardExample() {
  return (
    <div className="flex flex-col gap-3 p-4 max-w-md">
      <InsightCard 
        title="Bacterial Diversity Improving" 
        summary="Your Shannon diversity index increased to 2.8, indicating a healthier gut ecosystem."
        details="This improvement suggests better nutrient absorption and immune function. Continue with your current dietary approach focusing on fiber-rich foods."
        variant="success"
      />
      <InsightCard 
        title="Potential Food Trigger Identified" 
        summary="Strong correlation detected between dairy consumption and bloating symptoms."
        details="Data shows 78% correlation between dairy intake and increased bloating within 3-4 hours. Consider reducing dairy or trying lactose-free alternatives."
        variant="warning"
      />
    </div>
  );
}
