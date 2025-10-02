import { LucideIcon } from 'lucide-react';

interface QuickStatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  gradientFrom?: string;
  gradientTo?: string;
}

export default function QuickStatCard({ 
  icon: Icon, 
  value, 
  label,
  gradientFrom = 'hsl(var(--primary))',
  gradientTo = 'hsl(var(--primary))'
}: QuickStatCardProps) {
  return (
    <div className="relative rounded-xl p-4 bg-card border border-card-border hover-elevate overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
        }}
      />
      <div className="relative flex flex-col gap-2">
        <Icon className="w-5 h-5" style={{ color: gradientFrom }} />
        <div className="font-display text-2xl font-semibold">{value}</div>
        <div className="text-xs text-muted-foreground font-medium">{label}</div>
      </div>
    </div>
  );
}
