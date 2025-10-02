import { LucideIcon, ChevronRight } from 'lucide-react';

interface ActionButtonCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick: () => void;
  variant?: 'primary' | 'info' | 'accent';
}

export default function ActionButtonCard({ 
  icon: Icon, 
  title, 
  description,
  onClick,
  variant = 'primary' 
}: ActionButtonCardProps) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'info':
        return 'bg-[hsl(var(--info))] text-[hsl(var(--info-foreground))]';
      case 'accent':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all active-elevate-2 ${getVariantClasses()}`}
      data-testid={`button-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <Icon className="w-6 h-6 flex-shrink-0" />
      <div className="flex-1 text-left">
        <div className="font-medium">{title}</div>
        {description && <div className="text-sm opacity-90 mt-0.5">{description}</div>}
      </div>
      <ChevronRight className="w-5 h-5 flex-shrink-0" />
    </button>
  );
}
