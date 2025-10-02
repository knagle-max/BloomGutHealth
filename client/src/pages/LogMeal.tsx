import { useState } from 'react';
import MealTypeSelector, { MealType } from '@/components/MealTypeSelector';
import SymptomSlider from '@/components/SymptomSlider';
import { Activity, Zap, Heart, Brain, Clock } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function LogMeal() {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foodDescription, setFoodDescription] = useState('');
  const [portionSize, setPortionSize] = useState('medium');
  const [bloating, setBloating] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [mood, setMood] = useState(5);
  const { toast } = useToast();

  const handleSubmit = () => {
    //todo: remove mock functionality - integrate with backend
    console.log('Meal logged:', {
      mealType,
      foodDescription,
      portionSize,
      symptoms: { bloating, energy, comfort, mood },
    });
    
    toast({
      title: 'Meal logged successfully!',
      description: 'Your food and symptoms have been recorded.',
    });

    setFoodDescription('');
    setBloating(5);
    setEnergy(5);
    setComfort(5);
    setMood(5);
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold mb-2">Log Your Meal</h1>
        <p className="text-sm text-muted-foreground">Track what you eat and how you feel</p>
      </div>

      <MealTypeSelector selected={mealType} onChange={setMealType} />

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="food-input">What did you eat?</Label>
          <Textarea
            id="food-input"
            placeholder="E.g., Grilled salmon with quinoa and steamed broccoli..."
            value={foodDescription}
            onChange={(e) => setFoodDescription(e.target.value)}
            className="min-h-24 resize-none"
            data-testid="input-food-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Time</Label>
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-input bg-background">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portion">Portion Size</Label>
            <Select value={portionSize} onValueChange={setPortionSize}>
              <SelectTrigger id="portion" data-testid="select-portion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-semibold mb-1">How are you feeling?</h2>
          <p className="text-xs text-muted-foreground">Rate 2-4 hours after eating</p>
        </div>

        <SymptomSlider icon={Activity} label="Bloating Level" value={bloating} onChange={setBloating} />
        <SymptomSlider icon={Zap} label="Energy Level" value={energy} onChange={setEnergy} />
        <SymptomSlider icon={Heart} label="Digestive Comfort" value={comfort} onChange={setComfort} />
        <SymptomSlider icon={Brain} label="Mental Clarity" value={mood} onChange={setMood} />
      </div>

      <Button 
        onClick={handleSubmit} 
        className="w-full h-12" 
        disabled={!foodDescription.trim()}
        data-testid="button-save-meal"
      >
        Save Meal Entry
      </Button>
    </div>
  );
}
