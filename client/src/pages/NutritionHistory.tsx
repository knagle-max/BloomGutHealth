import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Utensils,
  TrendingUp,
  Calendar,
  Loader2,
  Plus,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MealTypeSelector, { MealType } from "@/components/MealTypeSelector";
import { useAuth } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function HistoricalTrends({
  userId,
  targets,
}: {
  userId: string;
  targets: any;
}) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const { data: monthlyData } = useQuery<any>({
    queryKey: [
      `/api/nutrition/monthly/${userId}?year=${currentYear}&month=${currentMonth}`,
    ],
    enabled: !!userId,
  });

  const { data: yearlyData } = useQuery<any>({
    queryKey: [`/api/nutrition/yearly/${userId}?year=${currentYear}`],
    enabled: !!userId,
  });

  if (!monthlyData && !yearlyData) {
    return null;
  }

  const getStatusColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90 && percentage <= 110)
      return "text-green-600 dark:text-green-400";
    if (percentage >= 70 && percentage <= 130)
      return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Historical Trends
      </h2>

      {monthlyData?.dailyAverages && (
        <Card data-testid="card-monthly-averages">
          <CardHeader>
            <CardTitle className="text-base">
              {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              - Daily Averages
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Based on {monthlyData.daysWithMeals} days of logged meals
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Calories/Day
                  </span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(monthlyData.dailyAverages.calories, targets.calories)}`}
                  >
                    {monthlyData.dailyAverages.calories}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.calories}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Protein/Day
                  </span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(monthlyData.dailyAverages.protein, targets.protein)}`}
                  >
                    {monthlyData.dailyAverages.protein}g
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.protein}g
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Carbs/Day
                  </span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(monthlyData.dailyAverages.carbs, targets.carbs)}`}
                  >
                    {monthlyData.dailyAverages.carbs}g
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.carbs}g
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Fat/Day
                  </span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(monthlyData.dailyAverages.fat, targets.fat)}`}
                  >
                    {monthlyData.dailyAverages.fat}g
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.fat}g
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Fiber/Day
                  </span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(monthlyData.dailyAverages.fiber, targets.fiber)}`}
                  >
                    {monthlyData.dailyAverages.fiber}g
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.fiber}g
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Sugar/Day
                  </span>
                  <span
                    className={`text-sm font-semibold ${getStatusColor(monthlyData.dailyAverages.sugar, targets.sugar)}`}
                  >
                    {monthlyData.dailyAverages.sugar}g
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.sugar}g
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {yearlyData?.dailyAverages && yearlyData.monthlyBreakdown?.length > 0 && (
        <Card data-testid="card-yearly-overview">
          <CardHeader>
            <CardTitle className="text-base">
              {currentYear} - Annual Overview
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {yearlyData.daysWithMeals} days tracked • {yearlyData.totalMeals}{" "}
              meals logged
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b">
              <div>
                <p className="text-xs text-muted-foreground">
                  Yearly Avg Calories
                </p>
                <p
                  className={`text-lg font-semibold ${getStatusColor(yearlyData.dailyAverages.calories, targets.calories)}`}
                >
                  {yearlyData.dailyAverages.calories}/day
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.calories}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Yearly Avg Protein
                </p>
                <p
                  className={`text-lg font-semibold ${getStatusColor(yearlyData.dailyAverages.protein, targets.protein)}`}
                >
                  {yearlyData.dailyAverages.protein}g/day
                </p>
                <p className="text-xs text-muted-foreground">
                  Target: {targets.protein}g
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Monthly Breakdown</h4>
              <div className="space-y-2">
                {yearlyData.monthlyBreakdown.map((month: any) => (
                  <div
                    key={month.month}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{month.monthName}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{month.mealsLogged} meals</span>
                      <span
                        className={getStatusColor(
                          month.avgCalories,
                          targets.calories,
                        )}
                      >
                        {month.avgCalories} cal/day
                      </span>
                      <span
                        className={getStatusColor(
                          month.avgProtein,
                          targets.protein,
                        )}
                      >
                        {month.avgProtein}g protein/day
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NutritionHistory() {
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [foodDescription, setFoodDescription] = useState("");
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mealToDelete, setMealToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const userId = user?.id || "";

  const { data: dailyData, isLoading: dailyLoading } = useQuery<any>({
    queryKey: ["/api/nutrition/daily", userId],
    enabled: !!userId,
  });

  const { data: targets, isLoading: targetsLoading } = useQuery<any>({
    queryKey: ["/api/nutrition/targets", userId],
    enabled: !!userId,
  });

  const { data: allMeals, isLoading: mealsLoading } = useQuery<any[]>({
    queryKey: ["/api/meals", userId],
    enabled: !!userId,
  });

  const logMealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/meals", data);
      return await response.json();
    },
    onSuccess: async (newMeal: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/nutrition/daily", userId],
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/health/adherence/${userId}?days=7`],
      });

      toast({
        title: "Meal added to your journal",
        description: "Your estimated nutrition breakdown is ready.",
      });

      setFoodDescription("");
      setShowLogForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error logging meal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateMealMutation = useMutation({
    mutationFn: async ({ mealId, data }: { mealId: string; data: any }) => {
      const response = await apiRequest("PUT", `/api/meals/${mealId}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/nutrition/daily", userId],
      });

      toast({
        title: "Meal updated successfully!",
      });

      setFoodDescription("");
      setShowLogForm(false);
      setEditingMealId(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating meal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const response = await apiRequest("DELETE", `/api/meals/${mealId}`, {});
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meals", userId] });
      queryClient.invalidateQueries({
        queryKey: ["/api/nutrition/daily", userId],
      });

      toast({
        title: "Meal deleted successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error deleting meal",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (editingMealId) {
      updateMealMutation.mutate({
        mealId: editingMealId,
        data: {
          mealText: foodDescription,
          mealType,
        },
      });
    } else {
      logMealMutation.mutate({
        userId,
        mealText: foodDescription,
        mealType,
      });
    }
  };

  const handleEditMeal = (meal: any) => {
    setEditingMealId(meal.id);
    setFoodDescription(meal.mealText);
    setMealType(meal.mealType || "breakfast");
    setShowLogForm(true);
  };

  const handleDeleteMeal = (mealId: string) => {
    setMealToDelete(mealId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (mealToDelete) {
      deleteMealMutation.mutate(mealToDelete);
      setDeleteDialogOpen(false);
      setMealToDelete(null);
    }
  };

  const toggleMealExpansion = (mealId: string) => {
    setExpandedMeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
  };

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
    if (percentage >= 90 && percentage <= 110)
      return "text-green-600 dark:text-green-400";
    if (percentage >= 70 && percentage <= 130)
      return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="max-w-[448px] mx-auto pb-24 px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Nutrition History</h1>
            <p className="text-sm text-muted-foreground">
              Track your daily intake
            </p>
          </div>
        </div>
      </div>

      {showLogForm && (
        <Card className="mb-6" data-testid="card-log-meal-form">
          <CardHeader>
            <CardTitle>
              {editingMealId ? "Edit Meal" : "Log Your Meal"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <MealTypeSelector selected={mealType} onChange={setMealType} />

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

            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={
                  !foodDescription.trim() ||
                  logMealMutation.isPending ||
                  updateMealMutation.isPending
                }
                data-testid="button-save-meal"
              >
                {logMealMutation.isPending || updateMealMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : editingMealId ? (
                  "Update Meal"
                ) : (
                  "Save Meal"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLogForm(false);
                  setFoodDescription("");
                  setEditingMealId(null);
                }}
                data-testid="button-cancel-log-meal"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <HistoricalTrends userId={userId} targets={nutrientTargets} />

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
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.calories, nutrientTargets.calories))}`}
                >
                  {Math.round(totals.calories || 0)} /{" "}
                  {nutrientTargets.calories || 2000}
                </span>
                <Badge
                  variant="outline"
                  className={getStatusColor(
                    calculatePercentage(
                      totals.calories,
                      nutrientTargets.calories,
                    ),
                  )}
                  data-testid="badge-calories-percentage"
                >
                  {Math.round(
                    calculatePercentage(
                      totals.calories,
                      nutrientTargets.calories,
                    ),
                  )}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={calculatePercentage(
                totals.calories,
                nutrientTargets.calories,
              )}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Protein</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.protein, nutrientTargets.protein))}`}
                >
                  {Math.round(totals.protein || 0)}g /{" "}
                  {nutrientTargets.protein || 120}g
                </span>
                <Badge
                  variant="outline"
                  className={getStatusColor(
                    calculatePercentage(
                      totals.protein,
                      nutrientTargets.protein,
                    ),
                  )}
                >
                  {Math.round(
                    calculatePercentage(
                      totals.protein,
                      nutrientTargets.protein,
                    ),
                  )}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={calculatePercentage(
                totals.protein,
                nutrientTargets.protein,
              )}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carbs</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.carbs, nutrientTargets.carbs))}`}
                >
                  {Math.round(totals.carbs || 0)}g /{" "}
                  {nutrientTargets.carbs || 225}g
                </span>
                <Badge
                  variant="outline"
                  className={getStatusColor(
                    calculatePercentage(totals.carbs, nutrientTargets.carbs),
                  )}
                >
                  {Math.round(
                    calculatePercentage(totals.carbs, nutrientTargets.carbs),
                  )}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={calculatePercentage(totals.carbs, nutrientTargets.carbs)}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fat</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.fat, nutrientTargets.fat))}`}
                >
                  {Math.round(totals.fat || 0)}g / {nutrientTargets.fat || 67}g
                </span>
                <Badge
                  variant="outline"
                  className={getStatusColor(
                    calculatePercentage(totals.fat, nutrientTargets.fat),
                  )}
                >
                  {Math.round(
                    calculatePercentage(totals.fat, nutrientTargets.fat),
                  )}
                  %
                </Badge>
              </div>
            </div>
            <Progress
              value={calculatePercentage(totals.fat, nutrientTargets.fat)}
              className="h-2"
            />
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Micronutrients</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Fiber</p>
                <p className="text-sm font-medium">
                  {Math.round(totals.fiber || 0)}g / {nutrientTargets.fiber}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sugar</p>
                <p className="text-sm font-medium">
                  {Math.round(totals.sugar || 0)}g / {nutrientTargets.sugar}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sodium</p>
                <p className="text-sm font-medium">
                  {Math.round(totals.sodium || 0)}mg / {nutrientTargets.sodium}
                  mg
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Potassium</p>
                <p className="text-sm font-medium">
                  {Math.round(totals.potassium || 0)}mg /{" "}
                  {nutrientTargets.potassium}mg
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Meals
          </h2>
          {!showLogForm && (
            <Button
              onClick={() => setShowLogForm(true)}
              size="sm"
              data-testid="button-show-log-meal"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Meal
            </Button>
          )}
        </div>

        {meals.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No meals logged today</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start tracking your nutrition!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {meals.map((meal: any, index: number) => {
              const isExpanded = expandedMeals.has(meal.id);
              const nutritionalItems = meal.nutritionalData || [];
              const hasItems = nutritionalItems.length > 0;

              return (
                <Card key={meal.id} data-testid={`card-meal-${index}`}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className={`flex-1 cursor-pointer ${hasItems ? "hover-elevate" : ""}`}
                        onClick={() => hasItems && toggleMealExpansion(meal.id)}
                        data-testid={`button-expand-meal-${index}`}
                      >
                        <p
                          className="font-medium"
                          data-testid={`text-meal-description-${index}`}
                        >
                          {meal.mealText}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(meal.loggedAt), "h:mm a")}
                          {meal.mealType && ` • ${meal.mealType}`}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditMeal(meal);
                          }}
                          data-testid={`button-edit-meal-${index}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMeal(meal.id);
                          }}
                          data-testid={`button-delete-meal-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        {hasItems && (
                          <div className="ml-1 flex items-center">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className="cursor-pointer"
                      onClick={() => hasItems && toggleMealExpansion(meal.id)}
                    >
                      <div className="flex gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          data-testid={`badge-meal-calories-${index}`}
                        >
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
                    </div>

                    {isExpanded && hasItems && (
                      <div
                        className="mt-4 pt-4 border-t space-y-3"
                        data-testid={`meal-items-${index}`}
                      >
                        <p className="text-xs text-muted-foreground">
                          Food nutrition does not measure bacterial abundance.
                          Explore cited dietary pathways in the Diet coach.
                        </p>

                        <h4 className="text-sm font-semibold text-muted-foreground">
                          Individual Items
                        </h4>
                        {nutritionalItems.map((item: any, itemIdx: number) => {
                          return (
                            <div
                              key={itemIdx}
                              className="bg-muted/50 rounded-lg p-3 space-y-2"
                            >
                              <p className="font-medium text-sm capitalize">
                                {item.name}
                              </p>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Calories
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {item.calories}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Protein
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {item.protein_g}g
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Carbs
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {item.carbohydrates_total_g}g
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Fat
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {item.fat_total_g}g
                                  </Badge>
                                </div>
                              </div>

                              {(item.fiber_g > 0 ||
                                item.sugar_g > 0 ||
                                item.sodium_mg > 0 ||
                                item.potassium_mg > 0) && (
                                <div className="pt-2 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Micronutrients
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {item.fiber_g > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Fiber
                                        </span>
                                        <span>{item.fiber_g}g</span>
                                      </div>
                                    )}
                                    {item.sugar_g > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Sugar
                                        </span>
                                        <span>{item.sugar_g}g</span>
                                      </div>
                                    )}
                                    {item.sodium_mg > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Sodium
                                        </span>
                                        <span>{item.sodium_mg}mg</span>
                                      </div>
                                    )}
                                    {item.potassium_mg > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Potassium
                                        </span>
                                        <span>{item.potassium_mg}mg</span>
                                      </div>
                                    )}
                                    {item.cholesterol_mg > 0 && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">
                                          Cholesterol
                                        </span>
                                        <span>{item.cholesterol_mg}mg</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {allMeals && allMeals.length > meals.length && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-center text-muted-foreground">
              {allMeals.length - meals.length} more meal
              {allMeals.length - meals.length !== 1 ? "s" : ""} in history
            </p>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meal? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
