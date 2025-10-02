import { LucideIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface SymptomSliderProps {
  icon: LucideIcon;
  label: string;
  value: number;
  onChange: (value: number) => void;
}

export default function SymptomSlider({ icon: Icon, label, value, onChange }: SymptomSliderProps) {
  const getColor = (v: number) => {
    if (v <= 3) return 'hsl(var(--symptom-low))';
    if (v <= 7) return 'hsl(var(--symptom-moderate))';
    return 'hsl(var(--symptom-severe))';
  };

  const getSeverityLabel = (v: number) => {
    if (v <= 3) return 'Low';
    if (v <= 7) return 'Moderate';
    return 'Severe';
  };

  return (
    <div className="rounded-lg border border-card-border p-4 bg-card" data-testid={`slider-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5" style={{ color: getColor(value) }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-semibold" style={{ color: getColor(value) }}>
            {value}
          </span>
          <span className="text-xs text-muted-foreground">{getSeverityLabel(value)}</span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(vals) => onChange(vals[0])}
        min={1}
        max={10}
        step={1}
        className="w-full"
        data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  );
}
