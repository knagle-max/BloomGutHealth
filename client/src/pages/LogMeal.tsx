import {mealNutritionSummary} from "@shared/nutrition-summary";
import {refreshMealSources} from "@/lib/meal-cache";
import FoodEntryChooser from "@/components/FoodEntryChooser";
import {useCapabilities} from "@/lib/capabilities";
import DevelopmentPhotoPreview from "@/components/DevelopmentPhotoPreview";
import {useAuth} from "@/lib/auth";
import RestaurantEntry from "@/components/RestaurantEntry";
import FoodCapture from "@/components/FoodCapture";
import { useExperience } from "@/lib/experience";
import { energyAmount, foodMass, formatNutrientAmount } from "@shared/nutrition-display";
import {foodEntryMethods,availableFoodEntryMethods,resolveFoodEntryRoute,parseFoodEntryMethod,type FoodEntryMethod} from "@shared/food-entry";
import { SaveMealButton } from "@/components/SavedMeals";
import ProductPicker from "@/components/ProductPicker";
import { nutritionUpdateFeedback } from "@shared/nutrition-review";
import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Utensils, CheckCircle2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import MealTypeSelector, { type MealType } from "@/components/MealTypeSelector";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, ApiRequestError } from "@/lib/queryClient";
import MealAnalysis from "@/components/MealAnalysis";
import {
  recipes,
  type Ingredient,
  type MealIntelligence,
} from "@shared/meal-intelligence";
import type { Meal } from "@shared/schema";

export default function LogMeal() {
  const { settings } = useExperience();
  const {user}=useAuth();
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
  const aiStatus=useQuery<{ai:{features?:{ingredientParsing:boolean;recipeRanking:boolean}}}>({queryKey:["/api/analysis/status"]});
  const [symptoms, setSymptoms] = useState<
    Record<"bloating" | "energy" | "comfort" | "clarity", number | null>
  >({ bloating: null, energy: null, comfort: null, clarity: null });
  const [products, setProducts] = useState<Ingredient[]>([]);
  const [method,setMethod]=useState<FoodEntryMethod|null>(resolveFoodEntryRoute(params.get("method"))||(params.has("productQuery")?"search":params.has("description")||recipe||catalogueId?"describe":null));
  const capabilities=useCapabilities(),photoPreview=capabilities.photoPreview,photoAllowed=!!photoPreview;
  const publicMethods=availableFoodEntryMethods(capabilities.data?.foodEntry);
  const availableMethods=foodEntryMethods.filter(option=>publicMethods.some(item=>item.id===option.id)||option.id==='photo'&&photoAllowed);
  const methodSignature=availableMethods.map(option=>option.id).join(',');
  const [photoVisited,setPhotoVisited]=useState(false),[methodNotice,setMethodNotice]=useState('');
  const [pickerVisited,setPickerVisited]=useState(params.has("productQuery")||["barcode","search"].includes(params.get("method")||""));
  const [restaurant,setRestaurant]=useState(""),[market,setMarket]=useState("Canada"),[restaurantVisited,setRestaurantVisited]=useState(params.get("method")==="restaurant");
  const chooserHeading=useRef<HTMLHeadingElement>(null);
  const changeMethod=(requested:FoodEntryMethod|null)=>{
    setMethodNotice("");
    const next=requested&&availableMethods.some(m=>m.id===requested)?requested:null;
    if(next==="photo")setPhotoVisited(true);
    if(next&&["barcode","search"].includes(next))setPickerVisited(true);
    const url=new URL(window.location.href);if(next)url.searchParams.set("method",next);else url.searchParams.delete("method");
    window.history.pushState(null,"",url.pathname+url.search);setMethod(next);
    requestAnimationFrame(()=>chooserHeading.current?.focus());
  };
  useEffect(()=>{const back=()=>{const value=new URLSearchParams(window.location.search).get('method'),candidate=value==='restaurant'?'describe':parseFoodEntryMethod(value);const next=candidate&&availableMethods.some(option=>option.id===candidate)?candidate:null;setMethod(next);if(next==='photo')setPhotoVisited(true);if(next&&['barcode','search'].includes(next))setPickerVisited(true);if(value==='photo'&&!next){const url=new URL(window.location.href);url.searchParams.delete('method');window.history.replaceState(null,'',url.pathname+url.search);requestAnimationFrame(()=>chooserHeading.current?.focus());}};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[methodSignature]);
  useEffect(()=>{if(capabilities.isLoading)return;const url=new URL(window.location.href),incoming=url.searchParams.get('method');if(!photoAllowed)setPhotoVisited(false);if(incoming==='restaurant'){url.searchParams.set('method','describe');window.history.replaceState(null,'',url.pathname+url.search);}else if(incoming==='photo'){if(photoAllowed){setMethod('photo');setPhotoVisited(true);}else{if(method==='photo')setMethodNotice('This entry method is no longer available. Your meal draft is still here.');url.searchParams.delete('method');window.history.replaceState(null,'',url.pathname+url.search);setMethod(null);requestAnimationFrame(()=>chooserHeading.current?.focus());}}},[capabilities.isLoading,photoAllowed]);
  const recentMeals=useQuery<Meal[]>({queryKey:["/api/meals",user?.id],enabled:!!user&&method==="describe"&&restaurantVisited});
  const recentRestaurants=(recentMeals.data||[]).flatMap(meal=>{const context=(meal.mealContext as any)?.restaurantContext;return typeof context?.restaurant==="string"&&typeof context?.market==="string"?[{restaurant:context.restaurant,market:context.market}]:[];});
  const pickerActive=method==="barcode"||method==="search";
  const [savedMeal, setSavedMeal] = useState<Meal | null>(null);
  const { toast } = useToast();
  const actor=useRef(user?.id),mounted=useRef(false);actor.current=user?.id;
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  const reviewHeading=useRef<HTMLHeadingElement>(null);
  function draftPayload(ingredients?:Ingredient[]){
    const selected=catalogueEnabled?catalogueSelection.data:undefined;
    const catalogueItem:Ingredient|undefined=selected?{name:selected.description.slice(0,120),grams:selected.grams,preparation:selected.description.slice(0,120),assumption:"User-selected USDA record and portion",catalogue:{source:"usda-fndds",fdcId:selected.fdcId}}:undefined;
    const complete=ingredients||(catalogueItem?[catalogueItem,...products]:undefined);
    return {mealText:selected?`${selected.grams} g ${selected.description}`:description.trim(),products,...(complete?{ingredients:complete}:{}),mealType,aiConsent,mealContext:{eatenAt:new Date(eatenAt).toISOString(),portion,symptoms,...((restaurant.trim()||restaurantVisited)?{restaurantContext:{restaurant:restaurant.trim(),market:market.trim(),source:"user-entered-context" as const}}:{})}};
  }
  type ReviewPayload=ReturnType<typeof draftPayload>;
  type AnalysisResult={intelligence:MealIntelligence;nutritionalData:unknown[]};
  type ReviewSnapshot={payload:ReviewPayload;analysis:AnalysisResult;revision:string;basis:string;owner:string};
  const basis=JSON.stringify([user?.id,description,products,catalogueEnabled,catalogueSelection.data?.fdcId,catalogueSelection.data?.grams,mealType,eatenAt,portion,symptoms,restaurant,market,restaurantVisited,aiConsent]);
  const basisRef=useRef(basis);basisRef.current=basis;
  const [review,setReview]=useState<ReviewSnapshot|null>(null),[reviewDirty,setReviewDirty]=useState(false),[reviewRejected,setReviewRejected]=useState(false);
  const saveAttempt=useRef<{payload:string;revision:string;key:string;basis:string}|null>(null);
  const reviewMeal=useMutation({mutationFn:async(v:{payload:ReviewPayload;basis:string;owner:string})=>{
    const response=await apiRequest("POST","/api/meals/review",v.payload),revision=response.headers.get("X-Bloom-Meal-Review");
    if(!revision||!/^[a-f0-9]{64}$/.test(revision))throw Error("Meal review is unavailable. Your entry has not been saved; retry the review.");
    const analysis=await response.json() as AnalysisResult;
    if(!Array.isArray(analysis.intelligence?.ingredients)||!Array.isArray(analysis.nutritionalData))throw Error("Meal review could not be read. Your entry has not been saved.");
    return{...v,analysis,revision};
  },onSuccess:snapshot=>{if(!mounted.current||actor.current!==snapshot.owner||basisRef.current!==snapshot.basis)return;setReview(snapshot);setReviewDirty(false);setReviewRejected(false);requestAnimationFrame(()=>{reviewHeading.current?.focus();reviewHeading.current?.scrollIntoView({block:"start"});});}});
  function confirmation(snapshot:ReviewSnapshot){return{...snapshot.payload,ingredients:snapshot.analysis.intelligence.ingredients,aiConsent:false,reviewed:true as const};}
  const save=useMutation({mutationFn:async(v:{snapshot:ReviewSnapshot;payload:ReturnType<typeof confirmation>;key:string})=>{
    if(!mounted.current||actor.current!==v.snapshot.owner)throw Error("The meal save was interrupted. Review the entry in the current account.");
    const response=await apiRequest("POST","/api/meals/confirm",v.payload,{"Idempotency-Key":v.key,"If-Match":`"${v.snapshot.revision}"`});
    const meal=await response.json() as Meal;
    if(typeof meal.id!=="string")throw Error("The save response could not be read. Check your journal or retry this same entry.");
    return meal;
  },onSuccess:(meal,v)=>{
    if(!mounted.current||actor.current!==v.snapshot.owner||saveAttempt.current?.key!==v.key)return;
    saveAttempt.current=null;
    if(basisRef.current!==v.snapshot.basis){toast({title:"Previous entry saved",description:"Your newer draft is still here. Check the journal before logging it."});return;}
    setSavedMeal(meal);setReview(null);setReviewDirty(false);setReviewRejected(false);setDescription("");setProducts([]);
    setPhotoVisited(false);setMethodNotice("");setRestaurant("");setMarket("Canada");setRestaurantVisited(false);setPickerVisited(false);changeMethod(null);window.history.replaceState(null,"","/log-meal");setCatalogueEnabled(false);
    toast({title:"Added to your journal",description:meal.totalCalories===null?"Your meal is saved; some nutrition remains unavailable.":"Your meal is saved. Linked nutrition totals are being refreshed."});
  },onError:error=>{if(error instanceof ApiRequestError&&error.status===409)setReviewRejected(true);},onSettled:refreshMealSources});
  const saveUnknown=save.isError&&(!(save.error instanceof ApiRequestError)||save.error.status>=500);
  const inputFrozen=save.isPending||reviewMeal.isPending||saveUnknown;
  const sameReview=!!review&&review.basis===basis&&review.owner===user?.id;
  const reviewCurrent=sameReview&&!reviewDirty&&!reviewRejected&&!reviewMeal.isPending&&!reviewMeal.isError;
  const previewNutrition=review?mealNutritionSummary([review.analysis]):null;
  function confirmReview(){if(!review||!reviewCurrent||save.isPending)return;const payload=confirmation(review),serialized=JSON.stringify(payload);if(saveAttempt.current?.payload!==serialized||saveAttempt.current.revision!==review.revision)saveAttempt.current={payload:serialized,revision:review.revision,key:crypto.randomUUID(),basis:review.basis};save.mutate({snapshot:review,payload,key:saveAttempt.current.key});}
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
      toast(nutritionUpdateFeedback(meal.intelligence as MealIntelligence));
    },
    onSettled: refreshMealSources,
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

        <h1>Add Food</h1>
        <p className="muted">
          Choose how to add food. Review your items together before saving.
        </p>
      </div>
      <fieldset disabled={inputFrozen} className="space-y-3">
      <legend className="sr-only">Choose foods to log</legend>
      <section className={`bloom-panel space-y-3 ${!method?"food-entry-selection":""}`}>
        <h2 ref={chooserHeading} tabIndex={-1} className={!method?"sr-only":undefined}>{method?foodEntryMethods.find(m=>m.id===method)?.label:"How would you like to add food?"}</h2>
        {method&&<Button type="button" variant="outline" onClick={()=>changeMethod(null)}>Change method / add another item</Button>}
        {!method&&<FoodEntryChooser methods={availableMethods} photoLabel={photoPreview?.label} onSelect={next=>{setSavedMeal(null);changeMethod(next);}}/>}
        <p className="panel-note">Selected items and your description stay in this draft. Save only when ready.</p>
        {methodNotice&&<p role="status">{methodNotice}</p>}
        {photoVisited&&photoPreview&&<div hidden={method!=='photo'}><DevelopmentPhotoPreview feature={photoPreview}/></div>}
        {method==="describe"&&<div className="space-y-3"><p>Type foods and amounts in the shared meal review below. Selected products are counted separately.</p><FoodCapture voiceOnly onDescription={text=>setDescription(current=>[current,text].filter(Boolean).join("; "))} onProduct={()=>{}}/></div>}
        {method==="describe"&&<div className="space-y-3"><Button type="button" variant="outline" aria-expanded={restaurantVisited} aria-controls="restaurant-context" onClick={()=>setRestaurantVisited(value=>!value)}>Log a restaurant meal</Button>{restaurantVisited&&<div id="restaurant-context" className="space-y-3"><p className="panel-note">Describe what you ate below. Restaurant names add context; menu item search is not available.</p><RestaurantEntry recent={recentRestaurants} name={restaurant} region={market} onName={setRestaurant} onRegion={setMarket}/><details><summary>Why?</summary><p>Names do not verify menu nutrition or allergens. Generic food matches are estimates. To use published nutrition, add it as a private label through Search foods; missing values stay unknown.</p></details></div>}</div>}

        {products.length>=10&&<p role="alert">This meal supports up to 10 labelled products. Save the meal or remove one before adding another.</p>}
        {pickerVisited&&<div hidden={!pickerActive}><ProductPicker initialKind="food" onDescribeIngredients={()=>{changeMethod("describe");requestAnimationFrame(()=>document.getElementById("food-input")?.focus());}} active={pickerActive} showBarcode={method==="barcode"} pending={products.length>=10} onPick={i=>{setProducts(v=>v.length>=10?v:[...v,i]);changeMethod(null);}} initialQuery={productQuery||description.slice(0,120)} autoSearch={!!productQuery}/></div>}
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
      {(method==="describe"||method==="photo"&&photoAllowed||products.length>0||description.trim()||catalogueEnabled)&&<form
        className="bloom-panel space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          if ((description.trim() || products.length || catalogueEnabled&&catalogueSelection.data) && !inputFrozen && user && (!catalogueEnabled||!!catalogueSelection.data))
            reviewMeal.mutate({payload:draftPayload(),basis,owner:user.id});
        }}
      >
        <fieldset disabled={inputFrozen} className="space-y-6">
          <legend className="sr-only">Meal details</legend>
          <h2>Meal details</h2>
          {(restaurant||restaurantVisited)&&<p className="panel-note">Restaurant context (entered by you): {restaurant||"restaurant not specified"} · {market||"market not specified"}. This context does not verify the nutrition source.</p>}
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
              Include quantities for a more useful nutrition estimate. Review and
              correct the breakdown before saving.
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
            correct the calculated gram amounts in the review before saving.
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
          {aiStatus.data?.ai?.features?.ingredientParsing && <>
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
          </>}
            </div>
          </details>
          {save.isError && (
            <div role="alert" className="space-y-2">
              <p className="font-semibold">{saveUnknown?"We couldn’t confirm your meal was saved.":"Your meal could not be saved."}</p>
              <p>{save.error.message}</p>
              <p>{saveUnknown?"Your details are locked while this page stays open. Retry this same reviewed entry to recover the save without a duplicate, or check your journal in case it arrived.":"Your details are retained. Review the current source again before confirming."}</p>
              <Link href="/nutrition" className="text-link" target="_blank" rel="noopener">Check journal in a new tab</Link>
            </div>
          )}
          {reviewMeal.isError&&<p role="alert">{reviewMeal.error.message}</p>}
          <Button className="w-full h-12" disabled={(!description.trim()&&!products.length&&!(catalogueEnabled&&catalogueSelection.data))||(catalogueEnabled&&!catalogueSelection.data)||inputFrozen||!user} data-testid="button-review-meal">{reviewMeal.isPending?"Reviewing meal…":"Review meal"}</Button>
        </fieldset>
      </form>}
      {review&&sameReview&&<section className="bloom-panel space-y-4 meal-review" aria-labelledby="meal-review-heading">
        <h2 id="meal-review-heading" ref={reviewHeading} tabIndex={-1}>Review before saving</h2>
        <p role="status">{saveUnknown?"The save is not confirmed. Retry the same entry or check your journal.":"This meal is not in your journal yet. Review the foods, amounts and source estimates below."}</p>
        {reviewCurrent&&previewNutrition&&<div className="saved-nutrients"><span><strong>{previewNutrition.totals.calories===null?"—":energyAmount(previewNutrition.totals.calories,settings.displayUnits.energy)}</strong> {settings.displayUnits.energy}</span>{([['protein','protein'],['carbs','carbs'],['fat','fat']] as const).map(([key,label])=><span key={key}><strong>{previewNutrition.totals[key]===null?"—":formatNutrientAmount(previewNutrition.totals[key])}g</strong> {label}</span>)}</div>}
        <p className="panel-note">Known contributions are estimates. Missing nutrients remain unavailable, including when only part of a meal has source data.</p>
        <MealAnalysis analysis={review.analysis.intelligence} preview onDraftChange={setReviewDirty} onRecalculate={ingredients=>{if(!inputFrozen&&user)reviewMeal.mutate({payload:{...review.payload,ingredients,aiConsent:false},basis,owner:user.id});}} pending={reviewMeal.isPending} disabled={save.isPending||saveUnknown} current={reviewCurrent}/>
        {reviewDirty&&<p role="status">Update the ingredient review before saving this meal.</p>}
        {reviewRejected&&<p role="alert">The source changed. Update the review before saving.</p>}
        <Button type="button" className="w-full h-12" disabled={!reviewCurrent||save.isPending} onClick={confirmReview} data-testid="button-save-meal">{save.isPending?"Saving your meal…":saveUnknown?"Retry saving my meal":"Save to my journal"}</Button>
      </section>}
      {savedMeal && (
        <section className="bloom-panel saved-meal" role="status">
          <h2 className="flex items-center gap-2">
            <CheckCircle2 size={20} /> Your meal is saved.
          </h2>
          <p className="my-3">{savedMeal.mealText}</p>
          {recalculate.isPending||recalculate.isError ? <p role="status">{recalculate.isPending?"Checking corrected nutrition…":"Correction could not be confirmed. Retry with your retained portion draft, or open the journal to check the saved entry."}</p> : savedMeal.totalCalories !== null ? (
            <div className="saved-nutrients">
              <span>
                <strong>{energyAmount(savedMeal.totalCalories, settings.displayUnits.energy)}</strong> {settings.displayUnits.energy}
              </span>
              <span>
                <strong>
                  {savedMeal.totalProtein == null
                    ? "—"
                    : formatNutrientAmount(savedMeal.totalProtein)}
                  g
                </strong>{" "}
                protein
              </span>
              <span>
                <strong>
                  {savedMeal.totalCarbs == null
                    ? "—"
                    : formatNutrientAmount(savedMeal.totalCarbs)}
                  g
                </strong>{" "}
                carbs
              </span>
              <span><strong>{savedMeal.totalFat==null?"—":formatNutrientAmount(savedMeal.totalFat)}g</strong> fat</span>
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
      {savedMeal && !recalculate.isPending && !recalculate.isError && <SaveMealButton meal={savedMeal}/>}
      {Boolean(savedMeal?.intelligence) && (
        <MealAnalysis
          key={savedMeal!.id}
          analysis={savedMeal!.intelligence as MealIntelligence}
          onRecalculate={(ingredients) => recalculate.mutate(ingredients)}
          pending={recalculate.isPending}
          current={!recalculate.isPending&&!recalculate.isError}
        />
      )}
      <p className="panel-note text-center">
        Nutrition values are estimates from the nutrition provider.
      </p>
    </main>
  );
}
