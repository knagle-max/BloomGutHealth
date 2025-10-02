import ActionButtonCard from '../ActionButtonCard';
import { UtensilsCrossed, Upload, Lightbulb } from 'lucide-react';

export default function ActionButtonCardExample() {
  return (
    <div className="flex flex-col gap-3 p-4 max-w-md">
      <ActionButtonCard 
        icon={UtensilsCrossed} 
        title="Log Today's Meals" 
        onClick={() => console.log('Log meals clicked')}
      />
      <ActionButtonCard 
        icon={Upload} 
        title="Upload Microbiome Test" 
        onClick={() => console.log('Upload clicked')}
        variant="info"
      />
      <ActionButtonCard 
        icon={Lightbulb} 
        title="View My Insights" 
        onClick={() => console.log('Insights clicked')}
        variant="accent"
      />
    </div>
  );
}
