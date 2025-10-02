import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface InsightCardProps {
  title: string;
  summary: string;
  details?: string;
  variant?: 'primary' | 'info' | 'success' | 'warning';
}

export default function InsightCard({ title, summary, details, variant = 'primary' }: InsightCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case 'info':
        return 'from-[hsl(var(--info))]/10 to-[hsl(var(--info))]/5 border-[hsl(var(--info))]/20';
      case 'success':
        return 'from-[hsl(var(--success))]/10 to-[hsl(var(--success))]/5 border-[hsl(var(--success))]/20';
      case 'warning':
        return 'from-[hsl(var(--warning))]/10 to-[hsl(var(--warning))]/5 border-[hsl(var(--warning))]/20';
      default:
        return 'from-primary/10 to-primary/5 border-primary/20';
    }
  };

  return (
    <div className={`rounded-xl border bg-gradient-to-br p-4 ${getVariantClasses()}`} data-testid="card-insight">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-base mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{summary}</p>
          {details && isExpanded && (
            <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/50">
              {details}
            </p>
          )}
        </div>
      </div>
      {details && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-primary font-medium mt-3 hover-elevate px-2 py-1 rounded"
          data-testid="button-expand-insight"
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span>Learn more</span>
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
