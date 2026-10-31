import {currentMealTimeZone,recordedMealTime} from "@shared/meal-time";
import SavedMealSource from "@/components/SavedMealSource";
import RecentMealSource from "@/components/RecentMealSource";
import {useReconnectRetry} from "@/lib/useReconnectRetry";
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
  const { settings, ready: settingsReady } = useExperience();
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
  const [mealTimeZone]=useState(currentMealTimeZone);
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
  const [savedIngredients,setSavedIngredients]=useState<{owner:string;description:string;ingredients:Ingredient[]}|null>(null);
  const [method,setMethod]=useState<FoodEntryMethod|null>(resolveFoodEntryRoute(params.get("method"))||(params.has("productQuery")?"search":params.has("description")||recipe||catalogueId?"describe":null));
  const capabilities=useCapabilities(),photoPreview=capabilities.photoPreview,photoAllowed=!!photoPreview;
  const publicMethods=availableFoodEntryMethods(capabilities.data?.foodEntry);
  const availableMethods=foodEntryMethods.filter(option=>publicMethods.some(item=>item.id===option.id)||option.id==='photo'&&photoAllowed);
  const methodSignature=availableMethods.map(option=>option.id).join(',');
  const [photoVisited,setPhotoVisited]=useState(false),[methodNotice,setMethodNotice]=useState('');
  const [pickerVisited,setPickerVisited]=useState(params.has("productQuery")||["barcode","search"].includes(params.get("method")||""));
  const [restaurant,setRestaurant]=useState(""),[market,setMarket]=useState("Canada"),[restaurantVisited,setRestaurantVisited]=useState(params.get("method")==="restaurant");
  const [marketTouched,setMarketTouched]=useState(false),marketInitialized=useRef(false);
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
  const reviewHeading=useRef<HTMLHeadingElement>(null),savedHeading=useRef<HTMLHeadingElement>(null);
  useEffect(()=>{if(savedMeal?.id){savedHeading.current?.focus();savedHeading.current?.scrollIntoView({block:"start"});}},[savedMeal?.id]);
  function draftPayload(ingredients?:Ingredient[]){
    const selected=catalogueEnabled?catalogueSelection.data:undefined;
    const catalogueItem:Ingredient|undefined=selected?{name:selected.description.slice(0,120),grams:selected.grams,preparation:selected.description.slice(0,120),assumption:"User-selected USDA record and portion",catalogue:{source:"usda-fndds",fdcId:selected.fdcId}}:undefined;
    const loaded=savedIngredients&&savedIngredients.owner===user?.id&&savedIngredients.description===description&&!catalogueEnabled?savedIngredients.ingredients:undefined;
    const complete=ingredients||(loaded?[...loaded,...products]:catalogueItem?[catalogueItem,...products]:undefined);
    return {mealText:selected?`${selected.grams} g ${selected.description}`:description.trim(),products,...(complete?{ingredients:complete}:{}),mealType,aiConsent,mealContext:{eatenAt:new Date(eatenAt).toISOString(),timeZone:mealTimeZone,portion,symptoms,...((restaurant.trim()||restaurantVisited)?{restaurantContext:{restaurant:restaurant.trim(),market:market.trim(),source:"user-entered-context" as const}}:{})}};
  }
  type ReviewPayload=ReturnType<typeof draftPayload>;
  type AnalysisResult={intelligence:MealIntelligence;nutritionalData:unknown[]};
  type ReviewSnapshot={payload:ReviewPayload;analysis:AnalysisResult;revision:string;basis:string;owner:string};
  const basis=JSON.stringify([user?.id,description,savedIngredients,products,catalogueEnabled,catalogueSelection.data?.fdcId,catalogueSelection.data?.grams,mealType,eatenAt,portion,symptoms,restaurant,market,restaurantVisited,aiConsent]);
  const basisRef=useRef(basis);basisRef.current=basis;
  const [review,setReview]=useState<ReviewSnapshot|null>(null),[reviewDirty,setReviewDirty]=useState(false),[reviewRejected,setReviewRejected]=useState(false);
  const saveAttempt=useRef<{payload:string;revision:string;key:string;basis:string}|null>(null);
  const reviewMeal=useMutation({mutationFn:async(v:{payload:ReviewPayload;basis:string;owner:string;keepItemFocus?:boolean})=>{
    if(!mounted.current||actor.current!==v.owner)throw Error("The meal review was interrupted. Review the draft in the current account.");
    const response=await apiRequest("POST","/api/meals/review",v.payload),revision=response.headers.get("X-Bloom-Meal-Review");
    if(!revision||!/^[a-f0-9]{64}$/.test(revision))throw Error("Meal review is unavailable. Your entry has not been saved; retry the review.");
    const analysis=await response.json() as AnalysisResult;
    if(!Array.isArray(analysis.intelligence?.ingredients)||!Array.isArray(analysis.nutritionalData))throw Error("Meal review could not be read. Your entry has not been saved.");
    return{...v,analysis,revision};
  },onSuccess:snapshot=>{if(!mounted.current||actor.current!==snapshot.owner||basisRef.current!==snapshot.basis)return;setReview(snapshot);setReviewDirty(false);setReviewRejected(false);if(!snapshot.keepItemFocus)requestAnimationFrame(()=>{reviewHeading.current?.focus();reviewHeading.current?.scrollIntoView({block:"start"});});}});
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
    setSavedMeal(meal);setReview(null);setReviewDirty(false);setReviewRejected(false);setDescription("");setProducts([]);setSavedIngredients(null);
    setPhotoVisited(false);setMethodNotice("");setRestaurant("");setMarket("Canada");setRestaurantVisited(false);setPickerVisited(false);changeMethod(null);window.history.replaceState(null,"","/log-meal");setCatalogueEnabled(false);
  },onError:error=>{if(error instanceof ApiRequestError&&error.status===409)setReviewRejected(true);},onSettled:refreshMealSources});
  const saveUnknown=save.isError&&(!(save.error instanceof ApiRequestError)||save.error.status>=500);
  const inputFrozen=save.isPending||reviewMeal.isPending||saveUnknown;
  useEffect(()=>{marketInitialized.current=false;setMarketTouched(false);setMarket("Canada");},[user?.id]);
  useEffect(()=>{if(settingsReady&&!marketInitialized.current&&!marketTouched&&!inputFrozen&&!review){setMarket(settings.practical.region||"Canada");marketInitialized.current=true;}},[settingsReady,settings.practical.region,marketTouched,inputFrozen,review]);
  const sameReview=!!review&&review.basis===basis&&review.owner===user?.id;
  const reviewCurrent=sameReview&&!reviewDirty&&!reviewRejected&&!reviewMeal.isPending&&!reviewMeal.isError;
  const reconnect=useReconnectRetry({actorId:user?.id,attemptKey:save.variables?.key,eligible:saveUnknown&&sameReview&&saveAttempt.current?.key===save.variables?.key&&save.variables?.snapshot.owner===user?.id,retry:()=>{const attempt=save.variables;if(attempt&&mounted.current&&actor.current===attempt.snapshot.owner&&saveAttempt.current?.key===attempt.key)save.mutate(attempt);}});
  const previewNutrition=review?mealNutritionSummary([review.analysis]):null;
  const savedNutrition=savedMeal?mealNutritionSummary([savedMeal]):null;
  const recordedFoods=Array.isArray((savedMeal?.intelligence as MealIntelligence|undefined)?.ingredients)?(savedMeal!.intelligence as MealIntelligence).ingredients:[];
  const nutritionOverview=(summary:ReturnType<typeof mealNutritionSummary>)=><div className="saved-nutrients">{(['calories','protein','carbs','fat'] as const).map(key=><span key={key}><strong>{summary.totals[key]===null?'—':key==='calories'?energyAmount(summary.totals[key],settings.displayUnits.energy):formatNutrientAmount(summary.totals[key])}{key!=='calories'&&'g'}</strong> {key==='calories'?settings.displayUnits.energy:key}{summary.totals[key]===null?<small>Unavailable</small>:summary.coverage[key].partial&&<small>Partial</small>}</span>)}</div>;
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
      {savedMeal && (
        <section className="bloom-panel saved-meal" role="status">
          <h2 ref={savedHeading} tabIndex={-1} className="flex items-center gap-2">
            <CheckCircle2 size={20} /> Your meal is saved.
          </h2>
          {!recalculate.isPending&&!recalculate.isError&&<><p className="my-3">{recordedFoods.length?`${recordedFoods.length} reviewed food entries recorded.`:'Your meal description is recorded.'}</p>
          <details className="confirmation-source"><summary>Saved foods & original description</summary><ul>{recordedFoods.map((food,index)=><li key={index}>{food.name} · {food.product?`${food.product.servings} labelled servings${food.grams===null?'':` · ${foodMass(food.grams,settings.displayUnits.foodWeight)}`}`:food.grams===null?'Amount unknown':foodMass(food.grams,settings.displayUnits.foodWeight)}</li>)}</ul><p className="panel-note">Original description: {savedMeal.mealText}</p></details></>}
          {recordedMealTime(savedMeal.loggedAt,savedMeal.mealContext)&&<p className="panel-note">Recorded meal time: {recordedMealTime(savedMeal.loggedAt,savedMeal.mealContext)}</p>}
          {recalculate.isPending||recalculate.isError ? <p role="status">{recalculate.isPending?"Checking corrected nutrition…":"Correction could not be confirmed. Retry with your retained portion draft, or open the journal to check the saved entry."}</p> : savedNutrition&&nutritionOverview(savedNutrition)}
          {!recalculate.isPending&&!recalculate.isError&&savedNutrition?.isPartial&&<p className="panel-note">Some nutrient values are unavailable. Any shown amounts are known contributions only.</p>}
          <div className="flex flex-wrap items-center gap-3 mt-4"><Link href="/" className="hero-button">View Today</Link><Button type="button" variant="outline" disabled={recalculate.isPending||recalculate.isError} onClick={()=>{setSavedMeal(null);changeMethod(null);}}>Add another meal</Button></div>
          <Link href="/nutrition" className="text-link mt-5">
            View your food journal{" "}
            <ArrowLeft size={16} className="rotate-180" />
          </Link>
        </section>
      )}
      <fieldset hidden={!!savedMeal} disabled={inputFrozen} className="space-y-3">
      <legend className="sr-only">Choose foods to log</legend>
      {params.get("template")&&<SavedMealSource id={params.get("template")!} servings={Number(params.get("servings")??1)} onLoad={(text,ingredients)=>{if(!user||inputFrozen)return;setDescription(text);setProducts([]);setCatalogueEnabled(false);setSavedIngredients({owner:user.id,description:text,ingredients});setReview(null);setReviewDirty(false);setReviewRejected(false);setSavedMeal(null);changeMethod("describe");requestAnimationFrame(()=>document.getElementById("food-input")?.focus());}}/>}
      <section className={`bloom-panel space-y-3 ${!method?"food-entry-selection":""}`}>
        <h2 ref={chooserHeading} tabIndex={-1} className={!method?"sr-only":undefined}>{method?foodEntryMethods.find(m=>m.id===method)?.label:"How would you like to add food?"}</h2>
        {method&&<Button type="button" variant="outline" onClick={()=>changeMethod(null)}>Change method / add another item</Button>}
        {!method&&<FoodEntryChooser methods={availableMethods} photoLabel={photoPreview?.label} onSelect={next=>{setSavedMeal(null);changeMethod(next);}}/>}
        {!method&&<RecentMealSource disabled={inputFrozen||!!description.trim()||products.length>0||catalogueEnabled||!!savedIngredients} onLoad={(text,ingredients,context)=>{if(!user||inputFrozen||description.trim()||products.length||catalogueEnabled||savedIngredients)return;setDescription(text);setSavedIngredients({owner:user.id,description:text,ingredients});setReview(null);setReviewDirty(false);setReviewRejected(false);setSavedMeal(null);setRestaurant(context?.restaurant||"");setMarket(context?.market||"Canada");setRestaurantVisited(!!context);changeMethod("describe");requestAnimationFrame(()=>document.getElementById("food-input")?.focus());}}/>}
        <p className="panel-note">Selected items and your description stay in this draft. Save only when ready.</p>
        {methodNotice&&<p role="status">{methodNotice}</p>}
        {photoVisited&&photoPreview&&<div hidden={method!=='photo'}><DevelopmentPhotoPreview feature={photoPreview}/></div>}
        {method==="describe"&&<div className="space-y-3"><p>Type foods and amounts in the shared meal review below. Selected products are counted separately.</p><FoodCapture voiceOnly onDescription={text=>setDescription(current=>[current,text].filter(Boolean).join("; "))} onProduct={()=>{}}/></div>}
        {method==="describe"&&<div className="space-y-3"><Button type="button" variant="outline" aria-expanded={restaurantVisited} aria-controls="restaurant-context" onClick={()=>setRestaurantVisited(value=>!value)}>Log a restaurant meal</Button>{restaurantVisited&&<div id="restaurant-context" className="space-y-3"><p className="panel-note">Describe what you ate below. Restaurant names add context; menu item search is not available.</p><RestaurantEntry recent={recentRestaurants} name={restaurant} region={market} onName={setRestaurant} onRegion={value=>{setMarketTouched(true);setMarket(value);}}/><details><summary>Why?</summary><p>Names do not verify menu nutrition or allergens. Generic food matches are estimates. To use published nutrition, add it as a private label through Search foods; missing values stay unknown.</p></details></div>}</div>}

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
          {savedIngredients&&<p className="panel-note">{savedIngredients.description===description?"Saved ingredient identities and portions are loaded. Use Review meal to adjust individual amounts before saving.":"The description changed. Review it again to identify the new foods; the saved ingredients will not be reused."}</p>}
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
              <span className="block text-xs text-muted-foreground">{mealTimeZone?`Device time zone: ${mealTimeZone}`:"Device local time; source time zone unavailable."}</span>
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
          {reviewMeal.isPaused&&<p role="status">Waiting for a connection to review this draft. Keep this page open.</p>}
          <Button className="w-full h-12" disabled={(!description.trim()&&!products.length&&!(catalogueEnabled&&catalogueSelection.data))||(catalogueEnabled&&!catalogueSelection.data)||inputFrozen||!user} data-testid="button-review-meal">{reviewMeal.isPaused?"Waiting to review…":reviewMeal.isPending?"Reviewing meal…":"Review meal"}</Button>
        </fieldset>
      </form>}
      {review&&sameReview&&<section className="bloom-panel space-y-4 meal-review" aria-labelledby="meal-review-heading">
        <h2 id="meal-review-heading" ref={reviewHeading} tabIndex={-1}>Review your meal</h2>
        <Button type="button" variant="outline" disabled={inputFrozen} onClick={()=>{const input=document.getElementById('food-input');input?.scrollIntoView({block:'center'});input?.focus();}}>Back to meal details</Button>
        <p role="status">{save.isPaused?"Waiting for a connection. Keep this page open to finish saving this reviewed meal.":saveUnknown?"The save is not confirmed. Retry the same entry or check your journal.":"This meal is not in your journal yet. Review the foods, amounts and source estimates below."}</p>
        {reviewCurrent&&previewNutrition&&nutritionOverview(previewNutrition)}
        <p className="panel-note">Known contributions are estimates. Missing nutrients remain unavailable, including when only part of a meal has source data.</p>
        <MealAnalysis analysis={review.analysis.intelligence} preview onDraftChange={setReviewDirty} onRecalculate={(ingredients,options)=>{if(!inputFrozen&&user)reviewMeal.mutate({payload:{...review.payload,ingredients,aiConsent:false},basis,owner:user.id,keepItemFocus:options?.keepItemFocus});}} pending={reviewMeal.isPending} disabled={save.isPending||saveUnknown} current={reviewCurrent}/>
        {reviewDirty&&<p role="status">Update the ingredient review before saving this meal.</p>}
        {reviewRejected&&<p role="alert">The source changed. Update the review before saving.</p>}
        <Button type="button" className="w-full h-12" disabled={!reviewCurrent||save.isPending} onClick={confirmReview} data-testid="button-save-meal">{save.isPaused?"Waiting for connection…":save.isPending?"Saving your meal…":saveUnknown?"Retry saving my meal":"Save meal"}</Button>
        {saveUnknown&&!reconnect.online&&<div className="space-y-2"><label className="flex items-start gap-2"><input type="checkbox" checked={reconnect.enabled} onChange={e=>reconnect.arm(e.target.checked)}/>Retry this reviewed save when the connection returns</label><p className="panel-note">Keep this page open. This option retains the same save for this account during this visit.</p></div>}
      </section>}
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
