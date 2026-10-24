import FoodCapture from "@/components/FoodCapture";
import { useExperience } from "@/lib/experience";
import { energyAmount, foodMass } from "@shared/nutrition-display";
import {foodEntryMethods,parseFoodEntryMethod,type FoodEntryMethod} from "@shared/food-entry";
import { SaveMealButton } from "@/components/SavedMeals";
import ProductPicker from "@/components/ProductPicker";
import { nutritionUpdateFeedback } from "@shared/nutrition-review";
import { useEffect, useRef, useState } from "react";
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
  const { settings } = useExperience();
  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get("type");
  const productQuery = (params.get("productQuery") || "").slice(0,120);
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
  const [method,setMethod]=useState<FoodEntryMethod|null>(parseFoodEntryMethod(params.get("method"))||(params.has("productQuery")?"search":params.has("description")||recipe||catalogueId?"describe":null));
  const [pickerVisited,setPickerVisited]=useState(params.has("productQuery")||["barcode","search","restaurant"].includes(params.get("method")||""));
  const [restaurant,setRestaurant]=useState(""),[market,setMarket]=useState("");
  const chooserHeading=useRef<HTMLHeadingElement>(null);
  const changeMethod=(next:FoodEntryMethod|null)=>{
    if(next&&["barcode","search","restaurant"].includes(next))setPickerVisited(true);
    const url=new URL(window.location.href);if(next)url.searchParams.set("method",next);else url.searchParams.delete("method");
    window.history.pushState(null,"",url.pathname+url.search);setMethod(next);
    requestAnimationFrame(()=>chooserHeading.current?.focus());
  };
  useEffect(()=>{const back=()=>{const next=parseFoodEntryMethod(new URLSearchParams(window.location.search).get("method"));setMethod(next);if(next&&["barcode","search","restaurant"].includes(next))setPickerVisited(true);};window.addEventListener("popstate",back);return()=>window.removeEventListener("popstate",back);},[]);
  const pickerActive=method==="barcode"||method==="search"||method==="restaurant";
  const [savedMeal, setSavedMeal] = useState<Meal | null>(null);
  const { toast } = useToast();
  const saveAttempt = useRef<{ payload: string; key: string } | null>(null);
  const save = useMutation({
    mutationFn: async () => {
      const payload = {
          mealText: catalogueEnabled&&catalogueSelection.data?`${catalogueSelection.data.grams} g ${catalogueSelection.data.description}`:description.trim(),
          products,
          ...(catalogueEnabled&&catalogueSelection.data?{ingredients:[{name:catalogueSelection.data.description.slice(0,120),grams:catalogueSelection.data.grams,preparation:catalogueSelection.data.description.slice(0,120),assumption:"User-selected USDA record and portion",catalogue:{source:"usda-fndds",fdcId:catalogueSelection.data.fdcId}}]}:{}),
          mealType,
          aiConsent,
          mealContext: {
            eatenAt: new Date(eatenAt).toISOString(),
            portion,
            symptoms,
            ...((restaurant.trim()||market.trim())?{restaurantContext:{restaurant:restaurant.trim(),market:market.trim(),source:"user-entered-context" as const}}:{}),
          },
        };
      const serialized = JSON.stringify(payload);
      if (saveAttempt.current?.payload !== serialized)
        saveAttempt.current = { payload: serialized, key: crypto.randomUUID() };
      return (await apiRequest("POST", "/api/meals", payload, { "Idempotency-Key": saveAttempt.current.key })).json() as Promise<Meal>;
    },
    onSuccess: (meal) => {
      saveAttempt.current = null;
      setSavedMeal(meal);
      setDescription("");
      setProducts([]);
      setRestaurant("");setMarket("");setPickerVisited(false);changeMethod(null);window.history.replaceState(null,"","/log-meal");
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
        <h1>Add Food</h1>
        <p className="muted">
          Choose how to add each item. Review all items together before saving.
        </p>
      </div>
      <fieldset disabled={save.isPending} className="space-y-3">
      <legend className="sr-only">Choose foods to log</legend>
      <section className="bloom-panel space-y-3">
        <h2 ref={chooserHeading} tabIndex={-1}>{method?foodEntryMethods.find(m=>m.id===method)?.label:"How would you like to add food?"}</h2>
        {method&&<Button type="button" variant="outline" onClick={()=>changeMethod(null)}>Change method / add another item</Button>}
        {!method&&<div className="grid gap-3 sm:grid-cols-2">{foodEntryMethods.map(m=><Button className="h-auto whitespace-normal text-left block" type="button" variant="outline" key={m.id} onClick={()=>{setSavedMeal(null);changeMethod(m.id);}}><strong className="block">{m.label}</strong><span className="block text-sm font-normal">{m.description}</span></Button>)}</div>}
        <p className="panel-note">Changing methods keeps this meal's description, selected products and unfinished product search. Camera access stops when you leave scanning. Nothing is saved until you confirm below.</p>
        {method==="describe"&&<div className="space-y-3"><p>Type foods and amounts in the shared meal review below. Selected products are counted separately.</p><FoodCapture voiceOnly onDescription={text=>setDescription(current=>[current,text].filter(Boolean).join("; "))} onProduct={()=>{}}/></div>}
        <div hidden={method!=="restaurant"} className="space-y-3"><p>No official restaurant-menu catalogue is connected. Product search may find a published record; confirm country, item and serving. Generic foods are estimates. You can enter official menu nutrition as a private label or describe the meal without invented values.</p><label className="block">Restaurant name<input className="bloom-input w-full" maxLength={150} value={restaurant} onChange={e=>setRestaurant(e.target.value)}/></label><label className="block">Market / country (optional)<input className="bloom-input w-full" maxLength={100} value={market} onChange={e=>setMarket(e.target.value)}/></label><Button type="button" variant="outline" onClick={()=>changeMethod("describe")}>Describe restaurant meal instead</Button></div>
        {method==="photo"&&<div role="status" className="space-y-3"><p>Automatic photo interpretation is unavailable pending provider, privacy and accuracy approval. No image is requested or sent. You can enter the printed label or describe what you ate.</p><Button type="button" variant="outline" onClick={()=>changeMethod("search")}>Enter package nutrition instead</Button><Button type="button" variant="outline" onClick={()=>changeMethod("describe")}>Describe food instead</Button></div>}
        {products.length>=10&&<p role="alert">This meal supports up to 10 labelled products. Save the meal or remove one before adding another.</p>}
        {pickerVisited&&<div hidden={!pickerActive}><ProductPicker active={pickerActive} showBarcode={method==="barcode"} pending={products.length>=10} onPick={i=>{setProducts(v=>v.length>=10?v:[...v,i]);changeMethod(null);}} initialQuery={productQuery||description.slice(0,120)} autoSearch={!!productQuery}/></div>}
      </section>
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
      {catalogueEnabled&&<section className="bloom-panel space-y-3"><h2>Selected catalogue food</h2>{catalogueSelection.isLoading&&<p role="status">Loading your selected food…</p>}{catalogueSelection.error&&<p role="alert">The selected record could not load. Return to Explore or describe the food manually.</p>}{catalogueSelection.data&&<p>{foodMass(catalogueSelection.data.grams, settings.displayUnits.foodWeight)} {catalogueSelection.data.description}. This exact USDA record will be used when you save.</p>}<Button type="button" variant="outline" onClick={()=>setCatalogueEnabled(false)}>Use a different food or description</Button></section>}
      <Link href="/saved-meals" className="text-link">Choose a saved meal</Link>
      </fieldset>
      {(method==="describe"||products.length>0||description.trim()||catalogueEnabled)&&<form
        className="bloom-panel space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if ((description.trim() || products.length || catalogueEnabled&&catalogueSelection.data) && !save.isPending && (!catalogueEnabled||!!catalogueSelection.data))
            save.mutate();
        }}
      >
        <fieldset disabled={save.isPending} className="space-y-6">
          <legend className="sr-only">Meal details</legend>
          <h2>Review this meal</h2>
          {(restaurant||market)&&<p className="panel-note">Restaurant context (entered by you): {restaurant} · {market||"market not specified"}. This context does not verify the nutrition source.</p>}
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
            <div role="alert" className="space-y-2">
              <p className="font-semibold">We couldn’t confirm your meal was saved.</p>
              <p>{save.error.message}</p>
              <p>Your details are still here while this page stays open. Retry the same details to recover this save without adding a duplicate. Before changing the entry, check your journal in case the first save arrived.</p>
              <Link href="/nutrition" className="text-link" target="_blank" rel="noopener">Check journal in a new tab</Link>
            </div>
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
              save.isError ? "Retry saving my meal" : "Save to my journal"
            )}
          </Button>
        </fieldset>
      </form>}
      {savedMeal && (
        <section className="bloom-panel saved-meal" role="status">
          <h2 className="flex items-center gap-2">
            <CheckCircle2 size={20} /> Your meal is saved.
          </h2>
          <p className="my-3">{savedMeal.mealText}</p>
          {savedMeal.totalCalories !== null ? (
            <div className="saved-nutrients">
              <span>
                <strong>{energyAmount(savedMeal.totalCalories, settings.displayUnits.energy)}</strong> {settings.displayUnits.energy}
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
