interface BacterialBarProps {
  name: string;
  currentLevel: number;
  optimalRange: string;
  isDeficient?: boolean;
}

export default function BacterialBar({ name, currentLevel, optimalRange, isDeficient }: BacterialBarProps) {
  const percentage = Math.min(currentLevel * 10, 100);
  
  return (
    <div className="space-y-2" data-testid={`bacterial-bar-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{name}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{currentLevel}%</span>
          <span className="text-xs text-muted-foreground">({optimalRange})</span>
        </div>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            isDeficient ? 'bg-[hsl(var(--warning))]' : 'bg-primary'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
