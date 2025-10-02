import { useState } from 'react';
import MealTypeSelector, { MealType } from '@/components/MealTypeSelector';
import SymptomSlider from '@/components/SymptomSlider';
import { Activity, Zap, Heart, Brain, Clock, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LogMeal() {
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [foodDescription, setFoodDescription] = useState('');
  const [portionSize, setPortionSize] = useState('medium');
  const [bloating, setBloating] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [comfort, setComfort] = useState(5);
  const [mood, setMood] = useState(5);
  const [nutritionData, setNutritionData] = useState<any>(null);
  const { toast } = useToast();

  const { data: demoUser } = useQuery({
    queryKey: ['/api/demo/user'],
  });

  const logMealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/meals', data);
      return await response.json();
    },
    onSuccess: (data) => {
      setNutritionData(data.nutritionalData);
      toast({
        title: 'Meal logged successfully!',
        description: 'Your food has been analyzed with nutritional breakdown.',
      });
      
      setFoodDescription('');
      setBloating(5);
      setEnergy(5);
      setComfort(5);
      setMood(5);
    },
    onError: (error: any) => {
      toast({
        title: 'Error logging meal',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = () => {
    logMealMutation.mutate({
      userId: demoUser?.id || 'demo-user-123',
      mealText: foodDescription,
      mealType,
    });
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
        disabled={!foodDescription.trim() || logMealMutation.isPending}
        data-testid="button-save-meal"
      >
        {logMealMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing Nutrition...
          </>
        ) : (
          'Save Meal Entry'
        )}
      </Button>

      {nutritionData && nutritionData.length > 0 && (
        <Card className="p-4" data-testid="card-nutrition-breakdown">
          <h3 className="font-display font-semibold mb-4">Nutritional Breakdown</h3>
          
          <div className="space-y-4">
            {nutritionData.map((item: any, idx: number) => (
              <div key={idx} className="space-y-3">
                <h4 className="font-medium text-sm capitalize">{item.name}</h4>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calories</span>
                    <Badge variant="outline" data-testid={`badge-calories-${idx}`}>{item.calories}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Protein</span>
                    <Badge variant="outline" data-testid={`badge-protein-${idx}`}>{item.protein_g}g</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carbs</span>
                    <Badge variant="outline" data-testid={`badge-carbs-${idx}`}>{item.carbohydrates_total_g}g</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fat</span>
                    <Badge variant="outline" data-testid={`badge-fat-${idx}`}>{item.fat_total_g}g</Badge>
                  </div>
                </div>

                {item.fiber_g > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Micronutrients & Fiber</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {item.fiber_g > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Fiber</span>
                          <span>{item.fiber_g}g</span>
                        </div>
                      )}
                      {item.sugar_g > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sugar</span>
                          <span>{item.sugar_g}g</span>
                        </div>
                      )}
                      {item.sodium_mg > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sodium</span>
                          <span>{item.sodium_mg}mg</span>
                        </div>
                      )}
                      {item.potassium_mg > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Potassium</span>
                          <span>{item.potassium_mg}mg</span>
                        </div>
                      )}
                      {item.cholesterol_mg > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cholesterol</span>
                          <span>{item.cholesterol_mg}mg</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
