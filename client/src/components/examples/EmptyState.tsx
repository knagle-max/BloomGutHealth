import EmptyState from '../EmptyState';
import { Beaker } from 'lucide-react';

export default function EmptyStateExample() {
  return (
    <div className="max-w-md mx-auto p-4 bg-card rounded-lg">
      <EmptyState 
        icon={Beaker}
        title="No Microbiome Data Yet"
        description="Upload your microbiome test results to get personalized insights and recommendations for optimal gut health."
        actionLabel="Upload Test Results"
        onAction={() => console.log('Upload clicked')}
        useIllustration
      />
    </div>
  );
}
