import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import emptyStateImg from '@assets/generated_images/Empty_state_illustration_1aee0b0b.png';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  useIllustration?: boolean;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  useIllustration = false 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center" data-testid="empty-state">
      {useIllustration ? (
        <img 
          src={emptyStateImg} 
          alt="Empty state" 
          className="w-40 h-40 object-contain mb-6 opacity-80"
        />
      ) : Icon && (
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} data-testid="button-empty-state-action">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
