import { Plus, Minus, Pill } from 'lucide-react';

interface FoodRecommendationCardProps {
  type: 'emphasize' | 'limit' | 'supplement';
  item: string;
  reason: string;
  details?: string;
}

export default function FoodRecommendationCard({ type, item, reason, details }: FoodRecommendationCardProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'emphasize':
        return {
          icon: Plus,
          bgColor: 'bg-[hsl(var(--success))]/10',
          borderColor: 'border-[hsl(var(--success))]/20',
          iconColor: 'text-[hsl(var(--success))]',
          iconBg: 'bg-[hsl(var(--success))]/20',
        };
      case 'limit':
        return {
          icon: Minus,
          bgColor: 'bg-[hsl(var(--warning))]/10',
          borderColor: 'border-[hsl(var(--warning))]/20',
          iconColor: 'text-[hsl(var(--warning))]',
          iconBg: 'bg-[hsl(var(--warning))]/20',
        };
      case 'supplement':
        return {
          icon: Pill,
          bgColor: 'bg-[hsl(var(--info))]/10',
          borderColor: 'border-[hsl(var(--info))]/20',
          iconColor: 'text-[hsl(var(--info))]',
          iconBg: 'bg-[hsl(var(--info))]/20',
        };
    }
  };

  const config = getTypeConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-lg border p-3 ${config.bgColor} ${config.borderColor}`} data-testid={`card-recommendation-${type}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg ${config.iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">{item}</h4>
          <p className="text-xs text-muted-foreground">{reason}</p>
          {details && (
            <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/30">
              {details}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
