import FoodCapture from "@/components/FoodCapture";
import { SaveMealButton } from "@/components/SavedMeals";
import ProductPicker from "@/components/ProductPicker";
import { nutritionUpdateFeedback } from "@shared/nutrition-review";
import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Utensils, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MealTypeSelector, { type MealType } from "@/components/MealTypeSelector";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import MealAnalysis from "@/components/MealAnalysis";
import {
  recipes,
  type Ingredient,
  type MealIntelligence,
} from "@shared/meal-intelligence";
import type { Meal } from "@shared/schema";

export default function LogMeal() {
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get("type");
  const catalogueId=params.get("fdcId"),catalogueGrams=Number(params.get("grams"));
  const [catalogueEnabled,setCatalogueEnabled]=useState(!!catalogueId);
  const catalogueSelection=useQuery<{fdcId:number;description:string;grams:number}>({queryKey:["/api/biology/catalogue",catalogueId,catalogueGrams],enabled:catalogueEnabled&&/^\d+$/.test(catalogueId||"")&&catalogueGrams>0&&catalogueGrams<=3000,queryFn:async()=>(await apiRequest("GET",`/api/biology/catalogue/${catalogueId}?grams=${catalogueGrams}`)).json()});
  const [mealType, setMealType] = useState<MealType>(
    ["breakfast", "lunch", "dinner", "snack"].includes(requestedType || "")
      ? (requestedType as MealType)
      : new Date().getHours() < 11
        ? "breakfast"
        : new Date().getHours() < 16
          ? "lunch"
          : "dinner",
  );
  const recipe = recipes.find(
    (r) => r.id === new URLSearchParams(window.location.search).get("recipe"),
  );
  const [description, setDescription] = useState(
    recipe
      ? recipe.ingredients
          .map((i) => `${i.grams} g ${i.name.replaceAll(",", " ")}`)
          .join(", ")
      : (params.get("description") || "").slice(0, 2000),
  );
  const [eatenAt, setEatenAt] = useState(() => {
    const date = new Date();
    return new Date(+date - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [portion, setPortion] = useState<
    "small" | "medium" | "large" | "specified"
  >("specified");
  const [aiConsent, setAIConsent] = useState(false);
  const [symptoms, setSymptoms] = useState<
    Record<"bloating" | "energy" | "comfort" | "clarity", number | null>
  >({ bloating: null, energy: null, comfort: null, clarity: null });
  const [products, setProducts] = useState<Ingredient[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [scanRequested, setScanRequested] = useState(false);
  const [scannerKey,setScannerKey] = useState(0);
  const [savedMeal, setSavedMeal] = useState<Meal | null>(null);
  const { toast } = useToast();
  const save = useMutation({
    mutationFn: async () =>
      (await (
        await apiRequest("POST", "/api/meals", {
          mealText: catalogueEnabled&&catalogueSelection.data?`${catalogueSelection.data.grams} g ${catalogueSelection.data.description}`:description.trim(),
          products,
          ...(catalogueEnabled&&catalogueSelection.data?{ingredients:[{name:catalogueSelection.data.description.slice(0,120),grams:catalogueSelection.data.grams,preparation:catalogueSelection.data.description.slice(0,120),assumption:"User-selected USDA record and portion",catalogue:{source:"usda-fndds",fdcId:catalogueSelection.data.fdcId}}]}:{}),
          mealType,
          aiConsent,
          mealContext: {
            eatenAt: new Date(eatenAt).toISOString(),
            portion,
            symptoms,
          },
        })
      ).json()) as Meal,
    onSuccess: (meal) => {
      setSavedMeal(meal);
      setDescription("");
      setProducts([]);
      setCatalogueEnabled(false);
      queryClient.invalidateQueries({
        predicate: (query) =>
          [
            "/api/meals",
            "/api/precision",
            "/api/nutrition/",
            "/api/health/",
            "/api/microbiome/diet-prediction",
          ].some((prefix) => String(query.queryKey[0]).startsWith(prefix)),
      });
      toast({
        title: "Added to your journal",
        description:
          meal.totalCalories === null
            ? "Your meal is saved; nutrition needs more information or a provider."
            : "Your nutrition overview is up to date.",
      });
    },
  });
  const recalculate = useMutation({
    mutationFn: async (ingredients: Ingredient[]) =>
      (await (
        await apiRequest("PUT", `/api/meals/${savedMeal!.id}`, {
          mealText: savedMeal!.mealText,
          ingredients,
        })
      ).json()) as Meal,
    onSuccess: (meal) => {
      setSavedMeal(meal);
      queryClient.invalidateQueries();
      toast(nutritionUpdateFeedback(meal.intelligence as MealIntelligence));
    },
    onError: (error) =>
      toast({
        title: "Could not recalculate",
        description: error.message,
        variant: "destructive",
      }),
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
        <h1>Log a meal</h1>
        <p className="muted">
          Describe what you ate, or select a food or supplement label.
        </p>
      </div>
      <Button type="button" className="mr-2 mb-3" onClick={()=>{setScannerKey(v=>v+1);setScanRequested(true);setShowProducts(true);}}>Scan package barcode</Button>
      <Button
        className="whitespace-normal h-auto max-w-full"
        type="button"
        variant="outline"
        onClick={() => {setScanRequested(false);setShowProducts(!showProducts);}}
      >
        {showProducts
          ? "Close product search"
          : "Search a food, brand or supplement"}
      </Button>
      {showProducts && (
        <ProductPicker key={scannerKey} startScanner={scanRequested}
          onPick={(i) => {
            setProducts((v) => [...v, i].slice(0, 10));
            setShowProducts(false);
          }}
          initialQuery={description.slice(0, 120)}
        />
      )}
      {products.length > 0 && (
        <section className="bloom-panel">
          <h2>Selected products</h2>
          <p>
            These products are counted separately. In the meal description,
            include only other foods to avoid counting the same product twice.
          </p>
          {products.map((i, index) => (
            <p key={index}>
              {i.name} · {i.product!.servings} labelled serving(s){" "}
              <button
                type="button"
                className="text-link"
                onClick={() =>
                  setProducts((v) => v.filter((_, n) => n !== index))
                }
              >
                Remove
              </button>
            </p>
          ))}
          <Button
            className="whitespace-normal h-auto max-w-full"
            type="button"
            variant="outline"
            onClick={() => setDescription("")}
          >
            Use selected products as the whole entry
          </Button>
        </section>
      )}
      {catalogueEnabled&&<section className="bloom-panel space-y-3"><h2>Selected catalogue food</h2>{catalogueSelection.isLoading&&<p role="status">Loading your selected food…</p>}{catalogueSelection.error&&<p role="alert">The selected record could not load. Return to Explore or describe the food manually.</p>}{catalogueSelection.data&&<p>{catalogueSelection.data.grams} g {catalogueSelection.data.description}. This exact USDA record will be used when you save.</p>}<Button type="button" variant="outline" onClick={()=>setCatalogueEnabled(false)}>Use a different food or description</Button></section>}
      <FoodCapture onDescription={setDescription} onProduct={i=>setProducts(v=>[...v,i].slice(0,10))}/>
      <Link href="/saved-meals" className="text-link">Choose a saved meal</Link>
      <form
        className="bloom-panel space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if ((description.trim() || products.length || catalogueEnabled&&catalogueSelection.data) && !save.isPending && (!catalogueEnabled||!!catalogueSelection.data))
            save.mutate();
        }}
      >
        <fieldset disabled={save.isPending} className="space-y-6">
          <legend className="sr-only">Meal details</legend>
          <MealTypeSelector selected={mealType} onChange={setMealType} />
          <div className="space-y-2">
            {!catalogueEnabled&&<><Label htmlFor="food-input">Describe your meal</Label>
            <Textarea
              id="food-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="For example: 150g grilled chicken, 1 cup brown rice, and broccoli"
              className="min-h-32 text-base"
              maxLength={2000}
              required={!products.length&&!catalogueEnabled}
              data-testid="input-food-description"
            />
            <p className="text-xs text-muted-foreground">
              Include quantities for a more useful nutrition estimate. You can
              review the breakdown after saving.
            </p></>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              Meal date & time
              <input
                className="bloom-input w-full"
                type="datetime-local"
                value={eatenAt}
                onChange={(e) => setEatenAt(e.target.value)}
                required
              />
            </label>
          </div>
          <details className="workspace-disclosure">
            <summary>Optional details & symptom check-in</summary>
            <div className="space-y-5 pt-4">
            <label className="block">
              Portion context
              <select
                className="bloom-input w-full"
                value={portion}
                onChange={(e) => setPortion(e.target.value as any)}
              >
                <option value="specified">Amounts in description</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>
          <p className="panel-note">
            Portion labels are saved as context; they do not automatically
            multiply nutrients. Common portions can be estimated; review and
            correct the calculated gram amounts after saving.
          </p>
          <fieldset className="space-y-3">
            <legend>Optional symptom check-in</legend>
            {(["bloating", "energy", "comfort", "clarity"] as const).map(
              (key) => (
                <div key={key}>
                  <label>
                    <input
                      type="checkbox"
                      checked={symptoms[key] !== null}
                      onChange={(e) =>
                        setSymptoms({
                          ...symptoms,
                          [key]: e.target.checked ? 5 : null,
                        })
                      }
                    />{" "}
                    Record{" "}
                    {key === "comfort"
                      ? "digestive comfort"
                      : key === "clarity"
                        ? "mental clarity"
                        : key}
                  </label>
                  {symptoms[key] !== null && (
                    <label className="flex gap-3 items-center">
                      <input
                        aria-label={`${key} level`}
                        type="range"
                        min="0"
                        max="10"
                        value={symptoms[key]!}
                        onChange={(e) =>
                          setSymptoms({
                            ...symptoms,
                            [key]: Number(e.target.value),
                          })
                        }
                      />
                      <span>{symptoms[key]}/10</span>
                    </label>
                  )}
                </div>
              ),
            )}
          </fieldset>
          <label className="block text-sm">
            <input
              type="checkbox"
              checked={aiConsent}
              onChange={(e) => setAIConsent(e.target.checked)}
            />{" "}
            Use optional AI ingredient parsing. Sends this meal description to
            the configured AI provider; nutrient numbers come from food
            databases.
          </label>
            </div>
          </details>
          {save.isError && (
            <p role="alert" className="text-sm text-destructive">
              {save.error.message}
            </p>
          )}
          <Button
            className="w-full h-12"
            disabled={
              (!description.trim() && !products.length && !(catalogueEnabled&&catalogueSelection.data)) || (catalogueEnabled&&!catalogueSelection.data) || save.isPending
            }
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
          {savedMeal.totalCalories !== null ? (
            <div className="saved-nutrients">
              <span>
                <strong>{Math.round(savedMeal.totalCalories!)}</strong> kcal
              </span>
              <span>
                <strong>
                  {savedMeal.totalProtein == null
                    ? "—"
                    : Math.round(savedMeal.totalProtein)}
                  g
                </strong>{" "}
                protein
              </span>
              <span>
                <strong>
                  {savedMeal.totalCarbs == null
                    ? "—"
                    : Math.round(savedMeal.totalCarbs)}
                  g
                </strong>{" "}
                carbs
              </span>
            </div>
          ) : (
            <p>
              Complete nutrition totals unavailable; the description and
              check-in are saved.
            </p>
          )}
          <Link href="/nutrition" className="text-link mt-5">
            View your food journal{" "}
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </section>
      )}
      {savedMeal && <SaveMealButton meal={savedMeal}/>}
      {Boolean(savedMeal?.intelligence) && (
        <MealAnalysis
          key={(savedMeal!.intelligence as MealIntelligence).analyzedAt}
          analysis={savedMeal!.intelligence as MealIntelligence}
          onRecalculate={(ingredients) => recalculate.mutate(ingredients)}
          pending={recalculate.isPending}
        />
      )}
      <p className="panel-note text-center">
        Nutrition values are estimates from the nutrition provider.
      </p>
    </main>
  );
}
