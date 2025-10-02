import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Utensils, TrendingUp, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function NutritionHistory() {
  const { data: demoUser } = useQuery<{ id: string; username: string }>({
    queryKey: ['/api/demo/user'],
  });

  const userId = demoUser?.id || 'demo-user-123';

  const { data: dailyData, isLoading: dailyLoading } = useQuery<any>({
    queryKey: ['/api/nutrition/daily', userId],
  });

  const { data: targets, isLoading: targetsLoading } = useQuery<any>({
    queryKey: ['/api/nutrition/targets', userId],
  });

  const { data: allMeals, isLoading: mealsLoading } = useQuery<any[]>({
    queryKey: ['/api/meals', userId],
  });

  if (dailyLoading || targetsLoading || mealsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading nutrition history...</p>
      </div>
    );
  }

  const meals = dailyData?.meals || [];
  const totals = dailyData?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    potassium: 0,
  };
  const nutrientTargets = targets || {
    calories: 2000,
    protein: 120,
    carbs: 225,
    fat: 67,
    fiber: 30,
    sugar: 50,
    sodium: 2300,
    potassium: 3500,
  };

  const calculatePercentage = (current: number, target: number) => {
    if (!target) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'text-excellent';
    if (percentage >= 70 && percentage <= 130) return 'text-good';
    return 'text-needs-attention';
  };

  return (
    <div className="max-w-[448px] mx-auto pb-24 px-4 pt-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Utensils className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Nutrition History</h1>
          <p className="text-sm text-muted-foreground">Track your daily intake</p>
        </div>
      </div>

      <Card className="mb-6" data-testid="card-daily-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Calories</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.calories, nutrientTargets.calories))}`}>
                  {Math.round(totals.calories || 0)} / {nutrientTargets.calories || 2000}
                </span>
                <Badge variant="outline" data-testid="badge-calories-percentage">
                  {Math.round(calculatePercentage(totals.calories, nutrientTargets.calories))}%
                </Badge>
              </div>
            </div>
            <Progress value={calculatePercentage(totals.calories, nutrientTargets.calories)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Protein</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.protein, nutrientTargets.protein))}`}>
                  {Math.round(totals.protein || 0)}g / {nutrientTargets.protein || 120}g
                </span>
                <Badge variant="outline">
                  {Math.round(calculatePercentage(totals.protein, nutrientTargets.protein))}%
                </Badge>
              </div>
            </div>
            <Progress value={calculatePercentage(totals.protein, nutrientTargets.protein)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carbs</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.carbs, nutrientTargets.carbs))}`}>
                  {Math.round(totals.carbs || 0)}g / {nutrientTargets.carbs || 225}g
                </span>
                <Badge variant="outline">
                  {Math.round(calculatePercentage(totals.carbs, nutrientTargets.carbs))}%
                </Badge>
              </div>
            </div>
            <Progress value={calculatePercentage(totals.carbs, nutrientTargets.carbs)} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fat</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.fat, nutrientTargets.fat))}`}>
                  {Math.round(totals.fat || 0)}g / {nutrientTargets.fat || 67}g
                </span>
                <Badge variant="outline">
                  {Math.round(calculatePercentage(totals.fat, nutrientTargets.fat))}%
                </Badge>
              </div>
            </div>
            <Progress value={calculatePercentage(totals.fat, nutrientTargets.fat)} className="h-2" />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Micronutrients</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Fiber</p>
                <p className="text-sm font-medium">{Math.round(totals.fiber || 0)}g / {nutrientTargets.fiber}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sugar</p>
                <p className="text-sm font-medium">{Math.round(totals.sugar || 0)}g / {nutrientTargets.sugar}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sodium</p>
                <p className="text-sm font-medium">{Math.round(totals.sodium || 0)}mg / {nutrientTargets.sodium}mg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Potassium</p>
                <p className="text-sm font-medium">{Math.round(totals.potassium || 0)}mg / {nutrientTargets.potassium}mg</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Meals
        </h2>
        
        {meals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No meals logged today</p>
              <p className="text-sm text-muted-foreground mt-1">Start tracking your nutrition!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {meals.map((meal: any, index: number) => (
              <Card key={meal.id} data-testid={`card-meal-${index}`}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium" data-testid={`text-meal-description-${index}`}>{meal.mealText}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(meal.loggedAt), 'h:mm a')}
                        {meal.mealType && ` • ${meal.mealType}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary" data-testid={`badge-meal-calories-${index}`}>
                      {Math.round(meal.totalCalories || 0)} cal
                    </Badge>
                    <Badge variant="secondary">
                      P: {Math.round(meal.totalProtein || 0)}g
                    </Badge>
                    <Badge variant="secondary">
                      C: {Math.round(meal.totalCarbs || 0)}g
                    </Badge>
                    <Badge variant="secondary">
                      F: {Math.round(meal.totalFat || 0)}g
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {allMeals && allMeals.length > meals.length && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-center text-muted-foreground">
              {allMeals.length - meals.length} more meal{allMeals.length - meals.length !== 1 ? 's' : ''} in history
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
