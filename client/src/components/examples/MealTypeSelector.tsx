import { useState } from 'react';
import MealTypeSelector, { MealType } from '../MealTypeSelector';

export default function MealTypeSelectorExample() {
  const [selected, setSelected] = useState<MealType>('breakfast');
  
  return (
    <div className="p-4 max-w-md">
      <MealTypeSelector selected={selected} onChange={setSelected} />
      <p className="mt-4 text-sm text-muted-foreground">Selected: {selected}</p>
    </div>
  );
}
