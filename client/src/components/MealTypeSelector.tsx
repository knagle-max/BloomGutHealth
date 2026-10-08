import { Coffee, Sun, Moon, Cookie } from 'lucide-react';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee },
  { id: 'lunch', label: 'Lunch', icon: Sun },
  { id: 'dinner', label: 'Dinner', icon: Moon },
  { id: 'snack', label: 'Snack', icon: Cookie },
] as const;

export type MealType = typeof mealTypes[number]['id'];

interface MealTypeSelectorProps {
  selected: MealType;
  onChange: (type: MealType) => void;
}

export default function MealTypeSelector({ selected, onChange }: MealTypeSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2" data-testid="meal-type-selector">
      {mealTypes.map((meal) => {
        const Icon = meal.icon;
        const isSelected = selected === meal.id;
        return (
          <button
            type="button"
            aria-pressed={isSelected}
            key={meal.id}
            onClick={() => onChange(meal.id)}
            className={`flex items-center gap-2 px-4 h-10 rounded-full whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover-elevate'
            }`}
            data-testid={`tab-${meal.id}`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{meal.label}</span>
          </button>
        );
      })}
    </div>
  );
}
