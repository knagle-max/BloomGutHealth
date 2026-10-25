import { useExperience } from "@/lib/experience";
import { energyAmount } from "@shared/nutrition-display";
import { SaveMealButton } from "@/components/SavedMeals";
import MealAnalysis from "@/components/MealAnalysis";
import { unmatchedFoods, nutritionUpdateFeedback } from "@shared/nutrition-review";
import { explainFoods } from "@shared/meal-intelligence";
import { type MealIntelligence } from "@shared/meal-intelligence";
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

function invalidateNutritionPeriodHistory() {
  void queryClient.invalidateQueries({predicate:query=>["/api/nutrition/monthly/","/api/nutrition/yearly/"].some(prefix=>String(query.queryKey[0]).startsWith(prefix))});
}

function HistoricalTrends({
  userId,
  targets,
}: {
  userId: string;
  targets: any;
}) {
  const { settings } = useExperience();
  const energyUnit = settings.displayUnits.energy;
  const currentTargets = targets || {};
  const currentDate = new Date();
  const currentMonth = currentDate.getUTCMonth();
  const currentYear = currentDate.getUTCFullYear();

  const { data: monthlyData, isError: monthlyError } = useQuery<any>({
    queryKey: [
      `/api/nutrition/monthly/${userId}?year=${currentYear}&month=${currentMonth}`,
    ],
    enabled: !!userId,
  });

  const { data: yearlyData, isError: yearlyError } = useQuery<any>({
    queryKey: [`/api/nutrition/yearly/${userId}?year=${currentYear}`],
    enabled: !!userId,
  });

  if (!monthlyData && !yearlyData && !monthlyError && !yearlyError) return null;

  // Recorded partial days are not an adequacy assessment against today's targets.
  const historyAmount = (period: any, key: string, unit: string) => {
    const value=period.dailyAverages?.[key];
    if(typeof value!=="number"||!Number.isFinite(value))return "Unavailable";
    const text=key==="calories"?`${energyAmount(value,energyUnit)} ${energyUnit}`:`${value} ${unit}`;
    return text+(period.nutritionCoverage?.[key]?.partial?" · partial":"");
  };

  return (
    <div className="mb-6 space-y-4">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        Historical Trends
      </h2>
      <p className="text-sm text-muted-foreground">Known recorded contributions per UTC day with a meal. Unlogged meals and missing nutrients are not measured zeros; these averages do not establish total intake or adequacy.</p>
      {(monthlyError||yearlyError)&&<p role="alert">Some nutrition history could not load. Missing reports are not empty records; your daily journal remains available.</p>}

      {monthlyData?.dailyAverages && (
        <Card data-testid="card-monthly-averages">
          <CardHeader>
            <CardTitle className="text-base">
              {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}{" "}
              - Recorded Daily Averages
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Based on {monthlyData.daysWithMeals} UTC days with logged meals
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg energy/day
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground"
                  >
                    {historyAmount(monthlyData, "calories", energyUnit)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"calories",energyUnit)}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Protein/Day
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground"
                  >
                    {historyAmount(monthlyData, "protein", "g")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"protein","g")}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Carbs/Day
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground"
                  >
                    {historyAmount(monthlyData, "carbs", "g")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"carbs","g")}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Fat/Day
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground"
                  >
                    {historyAmount(monthlyData, "fat", "g")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"fat","g")}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Fiber/Day
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground"
                  >
                    {historyAmount(monthlyData, "fiber", "g")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"fiber","g")}
                </p>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">
                    Avg Sugar/Day
                  </span>
                  <span
                    className="text-sm font-semibold text-foreground"
                  >
                    {historyAmount(monthlyData, "sugar", "g")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"sugar","g")}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b">
              <div>
                <p className="text-xs text-muted-foreground">
                  Yearly average energy
                </p>
                <p
                  className="text-lg font-semibold text-foreground"
                >
                  {historyAmount(yearlyData, "calories", energyUnit)}/logged day
                </p>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"calories",energyUnit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Yearly Avg Protein
                </p>
                <p
                  className="text-lg font-semibold text-foreground"
                >
                  {historyAmount(yearlyData, "protein", "g")}/logged day
                </p>
                <p className="text-xs text-muted-foreground">
                  {targets?.basis?.kind === "example-reference" ? "Example reference" : targets?.basis?.kind === "profile-estimate" ? "Current estimate" : "Current target"}: {historyAmount({dailyAverages:currentTargets},"protein","g")}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Monthly Breakdown</h4>
              <div className="space-y-2">
                {yearlyData.monthlyBreakdown.map((month: any) => (
                  <div
                    key={month.month}
                    className="flex flex-wrap items-center justify-between gap-2 text-sm"
                  >
                    <span className="font-medium">{month.monthName}</span>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{month.mealsLogged} meals</span>
                      <span
                        className="text-foreground"
                      >
                        {historyAmount({dailyAverages:{calories:month.avgCalories},nutritionCoverage:month.nutritionCoverage}, "calories", energyUnit)}/logged day
                      </span>
                      <span
                        className="text-foreground"
                      >
                        {historyAmount({dailyAverages:{protein:month.avgProtein},nutritionCoverage:month.nutritionCoverage}, "protein", "g protein")}/logged day
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
  const { settings } = useExperience();
  const energyUnit = settings.displayUnits.energy;
  const [historyLimit, setHistoryLimit] = useState(20);
  const [reviewingMealId, setReviewingMealId] = useState<string | null>(null);
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

  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const timezoneOffset = today.getTimezoneOffset();
  const { data: dailyData, isLoading: dailyLoading, isError: dailyError, refetch: retryDaily } = useQuery<any>({
    queryKey: ["/api/nutrition/daily", userId, localDate, timezoneOffset],
    queryFn: async () =>
      (
        await apiRequest(
          "GET",
          `/api/nutrition/daily/${userId}?date=${localDate}&timezoneOffset=${timezoneOffset}`,
        )
      ).json(),
    enabled: !!userId,
  });

  const { data: targets, isLoading: targetsLoading, isError: targetsError, refetch: retryTargets } = useQuery<any>({
    queryKey: ["/api/nutrition/targets", userId],
    enabled: !!userId,
  });

  const { data: allMeals, isLoading: mealsLoading, isError: mealsError, refetch: retryMeals } = useQuery<any[]>({
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
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
      invalidateNutritionPeriodHistory();
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
    onSuccess: (meal) => {
      if (unmatchedFoods(meal.intelligence).length || meal.intelligence?.status === "unavailable") setReviewingMealId(meal.id);
      queryClient.invalidateQueries({ queryKey: ["/api/meals", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
      invalidateNutritionPeriodHistory();
      queryClient.invalidateQueries({
        queryKey: ["/api/nutrition/daily", userId],
      });

      toast(nutritionUpdateFeedback(meal.intelligence));

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
      queryClient.invalidateQueries({ queryKey: ["/api/precision"] });
      invalidateNutritionPeriodHistory();
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

  const journalSource = !mealsError && allMeals
    ? allMeals
    : !dailyError ? dailyData?.meals || [] : [];
  const journalMeals = [...journalSource].sort(
    (a, b) => +new Date(b.loggedAt) - +new Date(a.loggedAt),
  );
  const meals = journalMeals.slice(0, historyLimit);
  const totals = dailyData?.totals || {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
    fiber: null,
    sugar: null,
    sodium: null,
    potassium: null,
  };
  const nutrientTargets = targets || {};

  const summaryValueKnown = (key: string) => typeof totals[key] === "number" && Number.isFinite(totals[key]) && totals[key] >= 0;
  const summaryCanCompare = (key: string) => summaryValueKnown(key) && typeof nutrientTargets[key] === "number" && Number.isFinite(nutrientTargets[key]) && nutrientTargets[key] > 0;
  const retrySummary = () => { void Promise.allSettled([retryDaily(), retryTargets()]); };
  const summaryAmount = (key: string, unit: string) => summaryValueKnown(key) ? `${Math.round(totals[key])} ${unit}` : "Unavailable";
  const showAmount = (value: number | null | undefined) =>
    value == null ? "Unavailable" : Math.round(value);
  const calculatePercentage = (current: number | null, target: number) => {
    if (!target || current == null) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getStatusColor = (_percentage: number) => "text-foreground";

  return (
    <main className="science-page journal-page">
      <div className="science-heading">
        <p className="eyebrow">YOUR DAILY RECORD</p>
        <h1>Food journal</h1>
        <p>Your meals and nutrient totals, together in one place.</p>
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

      {!dailyError && dailyData?.isPartial && (
        <p className="bloom-panel text-sm" role="status">
          Partial daily totals: known nutrition is included. Some meals or
          nutrients are missing; unavailable values are not counted as zero.
        </p>
      )}
      <div className="journal-workspace">
      {mealsError && (
        <div role="alert" className="bloom-panel space-y-3">
          <p>The full journal could not load. Available entries for today are shown; this is not your complete history.</p>
          <Button variant="outline" onClick={() => {void retryMeals();}}>Retry journal</Button>
        </div>
      )}


      <Card className="mb-6" data-testid="card-daily-summary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today's Summary
          </CardTitle>
          {targets?.basis?.note && !targetsError && <p className="text-sm text-muted-foreground">{targets.basis.note} <a className="text-primary underline" href="/profile#measurement-units">Review profile inputs</a></p>}
        </CardHeader>
        {dailyError || !dailyData ? (
          <CardContent className="space-y-3">
            <p role="alert">Today's totals could not load. Your saved journal remains available.</p>
            <Button variant="outline" onClick={retrySummary}>Retry summary</Button>
          </CardContent>
        ) : targetsError || !targets ? (
          <CardContent className="space-y-3">
          <p role="alert">Planning targets could not load. Recorded totals are shown without target comparisons.</p>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              ["calories", "Energy", energyUnit], ["protein", "Protein", "g"],
              ["carbs", "Carbs", "g"], ["fat", "Fat", "g"], ["fiber", "Fiber", "g"],
              ["sugar", "Sugar", "g"], ["sodium", "Sodium", "mg"], ["potassium", "Potassium", "mg"],
            ].map(([key, label, unit]) => (
              <div key={key}>
                <dt>{label}</dt>
                <dd>
                  {key === "calories"
                    ? summaryValueKnown(key) ? `${energyAmount(totals[key], energyUnit)} ${unit}` : "Unavailable"
                    : summaryAmount(key, unit)}
                  {dailyData.nutritionCoverage?.[key]?.partial ? " · partial" : ""}
                </dd>
              </div>
            ))}
          </dl>
          <Button variant="outline" onClick={retrySummary}>Retry summary</Button>
        </CardContent>
        ) : (<CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Energy ({energyUnit})</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.calories, nutrientTargets.calories))}`}
                >
                  {energyAmount(totals.calories, energyUnit)}
                  {dailyData?.nutritionCoverage?.calories?.partial
                    ? " (partial)"
                    : ""}{" "}
                  / {energyAmount(nutrientTargets.calories, energyUnit)} {energyUnit}
                </span>
                {summaryCanCompare("calories") && (<Badge
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
                </Badge>)}
              </div>
            </div>
            {summaryCanCompare("calories") && (<Progress
              value={calculatePercentage(
                totals.calories,
                nutrientTargets.calories,
              )}
              className="h-2"
            />)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Protein</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.protein, nutrientTargets.protein))}`}
                >
                  {summaryAmount("protein", "g")} /{" "}
                  {showAmount(nutrientTargets.protein)}g
                </span>
                {summaryCanCompare("protein") && (<Badge
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
                </Badge>)}
              </div>
            </div>
            {summaryCanCompare("protein") && (<Progress
              value={calculatePercentage(
                totals.protein,
                nutrientTargets.protein,
              )}
              className="h-2"
            />)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carbs</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.carbs, nutrientTargets.carbs))}`}
                >
                  {summaryAmount("carbs", "g")} / {showAmount(nutrientTargets.carbs)}g
                </span>
                {summaryCanCompare("carbs") && (<Badge
                  variant="outline"
                  className={getStatusColor(
                    calculatePercentage(totals.carbs, nutrientTargets.carbs),
                  )}
                >
                  {Math.round(
                    calculatePercentage(totals.carbs, nutrientTargets.carbs),
                  )}
                  %
                </Badge>)}
              </div>
            </div>
            {summaryCanCompare("carbs") && (<Progress
              value={calculatePercentage(totals.carbs, nutrientTargets.carbs)}
              className="h-2"
            />)}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fat</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${getStatusColor(calculatePercentage(totals.fat, nutrientTargets.fat))}`}
                >
                  {summaryAmount("fat", "g")} / {showAmount(nutrientTargets.fat)}g
                </span>
                {summaryCanCompare("fat") && (<Badge
                  variant="outline"
                  className={getStatusColor(
                    calculatePercentage(totals.fat, nutrientTargets.fat),
                  )}
                >
                  {Math.round(
                    calculatePercentage(totals.fat, nutrientTargets.fat),
                  )}
                  %
                </Badge>)}
              </div>
            </div>
            {summaryCanCompare("fat") && (<Progress
              value={calculatePercentage(totals.fat, nutrientTargets.fat)}
              className="h-2"
            />)}
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-3">Fiber, sugars & minerals</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Fiber</p>
                <p className="text-sm font-medium">
                  {summaryAmount("fiber", "g")} / {nutrientTargets.fiber}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sugar</p>
                <p className="text-sm font-medium">
                  {summaryAmount("sugar", "g")} / {nutrientTargets.sugar}g
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sodium</p>
                <p className="text-sm font-medium">
                  {summaryAmount("sodium", "mg")} / {nutrientTargets.sodium}
                  mg
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Potassium</p>
                <p className="text-sm font-medium">
                  {summaryAmount("potassium", "mg")} / {nutrientTargets.potassium}
                  mg
                </p>
              </div>
            </div>
          </div>
        </CardContent>)}
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
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge
                          variant="secondary"
                          data-testid={`badge-meal-calories-${index}`}
                        >
                          {meal.totalCalories == null
                            ? "Unavailable"
                            : energyAmount(meal.totalCalories, energyUnit)}{" "}
                          {energyUnit}
                        </Badge>
                        <Badge variant="secondary">
                          P:{" "}
                          {meal.totalProtein == null
                            ? "—"
                            : Math.round(meal.totalProtein)}
                          g
                        </Badge>
                        <Badge variant="secondary">
                          C:{" "}
                          {meal.totalCarbs == null
                            ? "—"
                            : Math.round(meal.totalCarbs)}
                          g
                        </Badge>
                        <Badge variant="secondary">
                          F:{" "}
                          {meal.totalFat == null
                            ? "—"
                            : Math.round(meal.totalFat)}
                          g
                        </Badge>
                      </div>
                    </div>

                    {isExpanded && hasItems && (
                      <div
                        className="mt-4 pt-4 border-t space-y-3"
                        data-testid={`meal-items-${index}`}
                      >
                        <p className="text-xs text-muted-foreground">
                          Gut pathways are hypotheses, not measured bacterial
                          abundance. Explore cited dietary pathways in the Diet
                          coach.
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

                              <details className="text-sm my-2">
                                <summary>Potential gut pathways</summary>
                                {explainFoods(item.name || "").pathways
                                  .length ? (
                                  explainFoods(item.name || "").pathways.map(
                                    (p) => (
                                      <div key={p.id}>
                                        <p>
                                          {p.substrate} →{" "}
                                          {p.molecules.join(", ")}
                                        </p>
                                        <p>{p.organisms.join("; ")}</p>
                                        <p className="text-xs text-muted-foreground">
                                          {p.relationship}
                                        </p>
                                      </div>
                                    ),
                                  )
                                ) : (
                                  <p>
                                    No supported ingredient-specific pathway in
                                    this catalogue.
                                  </p>
                                )}
                                {explainFoods(item.name || "").sources.map(
                                  (source) => (
                                    <a
                                      className="underline block"
                                      key={source.id}
                                      href={source.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {source.authors}, {source.year}
                                    </a>
                                  ),
                                )}
                              </details>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    Energy ({energyUnit})
                                  </span>
                                  <Badge variant="outline" className="h-5">
                                    {energyAmount(item.calories, energyUnit)} {energyUnit}
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
                    {meal.mealContext && (
                      <details className="mt-3 text-sm">
                        <summary>Meal context & symptoms</summary>
                        <p>
                          Portion:{" "}
                          {(meal.mealContext as any).portion || "Not recorded"}
                        </p>
                        {Object.entries(
                          (meal.mealContext as any).symptoms || {},
                        ).map(([key, value]) => (
                          <p key={key}>
                            {key}:{" "}
                            {value == null ? "Not recorded" : `${value}/10`}
                          </p>
                        ))}
                      </details>
                    )}
                    <Button
                      className="mt-3"
                      variant="outline"
                      disabled={updateMealMutation.isPending}
                      onClick={() =>
                        updateMealMutation.mutate({
                          mealId: meal.id,
                          data: {
                            mealText: meal.mealText,
                            ...(meal.intelligence?.portionModelVersion ===
                            "2026-10-18.2"
                              ? { ingredients: meal.intelligence.ingredients }
                              : {}),
                          },
                        })
                      }
                    >
                      Recalculate nutrition
                    </Button>
                    <SaveMealButton meal={meal}/>
                    {meal.intelligence && (
                      <details className="mt-3"
                        open={reviewingMealId === meal.id}
                        onToggle={(event) => {
                          const open = event.currentTarget.open;
                          setReviewingMealId((current) => open ? meal.id : current === meal.id ? null : current);
                        }}>
                        <summary>Nutrition & gut pathway explanation</summary>
                        {reviewingMealId === meal.id && <MealAnalysis
                          key={
                            (meal.intelligence as MealIntelligence).analyzedAt
                          }
                          analysis={meal.intelligence as MealIntelligence}
                          pending={updateMealMutation.isPending}
                          onRecalculate={(ingredients) =>
                            updateMealMutation.mutate({
                              mealId: meal.id,
                              data: { mealText: meal.mealText, ingredients },
                            })
                          }
                        />}
                      </details>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      </div>
      <details className="bloom-panel workspace-disclosure mb-6">
        <summary>Nutrition history & trends</summary>
        <HistoricalTrends userId={userId} targets={targetsError ? null : targets} />
      </details>
      {journalMeals.length > historyLimit && (
        <Button
          variant="outline"
          onClick={() => setHistoryLimit(historyLimit + 20)}
        >
          Show more journal entries ({journalMeals.length - historyLimit}{" "}
          remaining)
        </Button>
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
    </main>
  );
}
