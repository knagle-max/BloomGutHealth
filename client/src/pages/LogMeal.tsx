import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Utensils, CheckCircle2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import MealTypeSelector, { type MealType } from "@/components/MealTypeSelector";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Meal } from "@shared/schema";

export default function LogMeal() {
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [description, setDescription] = useState("");
  const [savedMeal, setSavedMeal] = useState<Meal | null>(null);
  const { toast } = useToast();
  const save = useMutation({
    mutationFn: async () =>
      (await (
        await apiRequest("POST", "/api/meals", {
          mealText: description.trim(),
          mealType,
        })
      ).json()) as Meal,
    onSuccess: (meal) => {
      setSavedMeal(meal);
      setDescription("");
      queryClient.invalidateQueries({
        predicate: (query) =>
          [
            "/api/meals",
            "/api/nutrition/",
            "/api/health/",
            "/api/microbiome/diet-prediction",
          ].some((prefix) => String(query.queryKey[0]).startsWith(prefix)),
      });
      toast({
        title: "Added to your journal",
        description: "Your nutrition overview is up to date.",
      });
    },
  });
  return (
    <main className="meal-page">
      <Link href="/" className="text-link">
        <ArrowLeft size={16} /> Back to overview
      </Link>
      <div className="meal-page-heading">
        <span className="panel-icon">
          <Utensils size={24} />
        </span>
        <p className="eyebrow">NOURISH & NOTICE</p>
        <h1>What's on your plate?</h1>
        <p className="muted">
          A quick entry today. A clearer picture over time.
        </p>
      </div>
      <form
        className="bloom-panel space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (description.trim() && !save.isPending) save.mutate();
        }}
      >
        <fieldset disabled={save.isPending} className="space-y-6">
          <legend className="sr-only">Meal details</legend>
          <MealTypeSelector selected={mealType} onChange={setMealType} />
          <div className="space-y-2">
            <Label htmlFor="food-input">Describe your meal</Label>
            <Textarea
              id="food-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="For example: 150g grilled chicken, 1 cup brown rice, and broccoli"
              className="min-h-32 text-base"
              maxLength={2000}
              required
              data-testid="input-food-description"
            />
            <p className="text-xs text-muted-foreground">
              Include quantities for a more useful nutrition estimate. You can
              review the breakdown after saving.
            </p>
          </div>
          {save.isError && (
            <p role="alert" className="text-sm text-destructive">
              {save.error.message}
            </p>
          )}
          <Button
            className="w-full h-12"
            disabled={!description.trim() || save.isPending}
            data-testid="button-save-meal"
          >
            {save.isPending ? (
              <>
                <Loader2 size={17} className="animate-spin mr-2" /> Saving your
                meal…
              </>
            ) : (
              "Save to my journal"
            )}
          </Button>
        </fieldset>
      </form>
      {savedMeal && (
        <section className="bloom-panel saved-meal" role="status">
          <h2 className="flex items-center gap-2">
            <CheckCircle2 size={20} /> Your meal is saved.
          </h2>
          <p className="my-3">{savedMeal.mealText}</p>
          <div className="saved-nutrients">
            <span>
              <strong>{Math.round(savedMeal.totalCalories || 0)}</strong> kcal
            </span>
            <span>
              <strong>{Math.round(savedMeal.totalProtein || 0)}g</strong>{" "}
              protein
            </span>
            <span>
              <strong>{Math.round(savedMeal.totalCarbs || 0)}g</strong> carbs
            </span>
          </div>
          <Link href="/nutrition" className="text-link mt-5">
            View your food journal{" "}
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </section>
      )}
      <p className="panel-note text-center">
        Nutrition values are estimates from the nutrition provider.
      </p>
    </main>
  );
}
