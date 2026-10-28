import {useAuth} from "@/lib/auth";
import { useState, useEffect, useRef, useId } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  nutrientDefinitions,
  type Ingredient,
} from "@shared/meal-intelligence";
import { productResponseSchema, productListResponseSchema, productSearchResponseSchema, readProductResponse, productIngredient, replacementLabelAmount, type Product } from "@shared/products";
import { productMatchStatus, homePreparedQuery, isHomePreparedSource } from "@shared/product-search";
import BarcodeScanner from "./BarcodeScanner";
import { productSearchText, normalizeBarcode, canonicalBarcode } from "@shared/barcodes";
export default function ProductPicker({
  onPick,
  initialQuery = "",
  initialKind = "all",
  autoSearch = false,
  confirmLabel = "Use selected product & amount",
  pending = false,
  startScanner = false,
  active = true,
  showBarcode = true,
  initialGrams,
  onDescribeIngredients,
}: {
  onPick: (i: Ingredient) => void;
  initialQuery?: string;
  initialKind?: "all"|"food"|"supplement";
  autoSearch?: boolean;
  confirmLabel?: string;
  pending?: boolean;
  startScanner?: boolean;
  active?: boolean;
  showBarcode?: boolean;
  initialGrams?:number|null;
  onDescribeIngredients?:()=>void;
}) {
  const [query, setQuery] = useState(productSearchText(initialQuery)),
    [kind, setKind] = useState<"all" | "food" | "supplement">(initialKind),
    [variants, setVariants] = useState<Product[]>([]),
    [choice, setChoice] = useState<Product | null>(null),
    [servings, setServings] = useState(1),
    [manual, setManual] = useState(false),
    [error, setError] = useState("");
  const [amountReviewRequired,setAmountReviewRequired]=useState(false),[amountReviewed,setAmountReviewed]=useState(false);
  const [amountBasis,setAmountBasis]=useState(initialGrams);
  function initialiseAmount(product:Product|null){
    const amount=replacementLabelAmount(product?.servingGrams??null,initialGrams);
    setServings(amount.servings);setAmountReviewRequired(amount.requiresReview);setAmountReviewed(false);setAmountBasis(initialGrams);
  }
  function chooseProduct(product:Product|null){choiceOwner.current=user?.id;setChoice(product);initialiseAmount(product);}
  useEffect(()=>{if(choice&&!Object.is(amountBasis,initialGrams))initialiseAmount(choice);},[initialGrams,amountBasis,choice]);
  const started = useRef(false);
  const lookupEpoch=useRef(0);
  const {user}=useAuth();const actor=useRef(user?.id),choiceOwner=useRef(user?.id);actor.current=user?.id;
  useEffect(()=>()=>{lookupEpoch.current++;},[]);
  const resultId=useId();
  const [submittedQuery,setSubmittedQuery]=useState(initialQuery);
  const manualForm=useRef<HTMLFormElement>(null);
  useEffect(()=>{if(manual)manualForm.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();},[manual]);
  const search = useMutation({
    mutationFn: async (override?:string)=>{
      const submitted=override||query,epoch=++lookupEpoch.current,owner=user?.id;
      setSubmittedQuery(submitted);setVariants([]);chooseProduct(null);setError("");
      const response=await apiRequest("GET","/api/products/search?"+new URLSearchParams({q:submitted,kind}));
      return {...readProductResponse(productSearchResponseSchema,await response.json()),epoch,submitted,owner};
    },
    onSuccess:result=>{
      if(result.epoch!==lookupEpoch.current||result.owner!==actor.current)return;
      if(normalizeBarcode(result.submitted)&&result.products.length===1)resolve.mutate(result.products[0]);
    },
  });
  const searchResult=search.data?.epoch===lookupEpoch.current&&search.data.owner===user?.id?search.data:undefined;
  const resultQuery=searchResult?.query?.original||submittedQuery;
  const allPossible=!!searchResult?.products.length&&searchResult.products.every(p=>productMatchStatus(p,resultQuery)==="possible");
  const resolve = useMutation({
    mutationFn:async(p:Product)=>{
      const epoch=lookupEpoch.current,owner=user?.id;setVariants([]);chooseProduct(null);setError("");
      const response=await apiRequest("GET",`/api/products/${p.source}/${encodeURIComponent(p.id)}`);
      return {...readProductResponse(productListResponseSchema,await response.json()),epoch,owner};
    },
    onSuccess:result=>{
      if(result.epoch!==lookupEpoch.current||result.owner!==actor.current)return;
      setVariants(result.products);chooseProduct(result.products[0]||null);
      setError(result.products.length?"":"This source has no supported serving on this label. Enter your package label below.");
    },
  });
  const saved=useQuery<Product[]>({queryKey:["/api/products/saved",user?.id],enabled:!!user,queryFn:async()=>readProductResponse(productResponseSchema.array(),await(await apiRequest("GET","/api/products/saved")).json())});
  useEffect(()=>{if(autoSearch&&!started.current&&query.length>=2){started.current=true;search.mutate(undefined);}},[]);
  const create = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const epoch=++lookupEpoch.current,owner=user?.id;setVariants([]);chooseProduct(null);
      const d = new FormData(form),
        perServing: Record<string, number> = {};
      for (const [key] of nutrientDefinitions) {
        const v = String(d.get(key) || "").trim();
        if (v !== "") perServing[key] = Number(v);
      }
      const activeName = String(d.get("activeName") || "").trim(),
        activeAmount = String(d.get("activeAmount") || "").trim();
      const response=await apiRequest("POST", "/api/products", {
          name: String(d.get("name") || ""),
          ...(d.get("barcode") ? {barcode:String(d.get("barcode"))} : {}),
          brand: String(d.get("brand") || ""),
          ...(String(d.get("sourceNote")||"").trim()?{sourceNote:String(d.get("sourceNote")).trim()}:{}),
          servingDescription: String(d.get("servingDescription") || ""),
          servingGrams: d.get("servingGrams")
            ? Number(d.get("servingGrams"))
            : null,
          perServing,
          ...(activeName && activeAmount
            ? {
                otherNutrients: [
                  {
                    name: activeName,
                    amount: Number(activeAmount),
                    unit: String(d.get("activeUnit") || ""),
                  },
                ],
              }
            : {}),
        });
      return {product:readProductResponse(productResponseSchema,await response.json()),epoch,owner};
    },
    onSuccess: ({product:p,epoch,owner}) => {
      queryClient.invalidateQueries({ queryKey: ["/api/products/saved",owner] });
      if(epoch!==lookupEpoch.current||owner!==actor.current)return;
      chooseProduct(p);
      setVariants([p]);
      setManual(false);
    },
  });
  const previousOwner=useRef(user?.id);
  useEffect(()=>{if(previousOwner.current===user?.id)return;previousOwner.current=user?.id;lookupEpoch.current++;setChoice(null);setVariants([]);search.reset();resolve.reset();create.reset();},[user?.id]);
  const remove = useMutation({
    mutationFn: async (id: string) =>
      apiRequest("DELETE", "/api/products/" + encodeURIComponent(id)),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["/api/products/saved"] }),
  });
  return (
    <div className="space-y-3 border rounded-xl p-3 min-w-0 break-words">
      <h3>Find a food or supplement</h3>
      {showBarcode&&<BarcodeScanner active={active} startImmediately={startScanner} onScan={code=>{setQuery(code);setChoice(null);setVariants([]);search.mutate(code);}}/>}
      <p className="panel-note">
        Search by product name or barcode, then confirm the exact variant and
        serving. The search sends only this query to public product databases.
        No database covers every product; saved label entry is available below.
      </p>
      <div className="precision-grid">
        <label>
          Product name / barcode
          <input
            className="bloom-input w-full"
            maxLength={120}
            value={query}
            onChange={(e) => {lookupEpoch.current++;setQuery(e.target.value);setVariants([]);chooseProduct(null);}}
          />
        </label>
        <label>
          Search in
          <select
            aria-label="Search in"
            className="bloom-input w-full"
            value={kind}
            onChange={(e) => {lookupEpoch.current++;setKind(e.target.value as any);setVariants([]);chooseProduct(null);}}
          >
            <option value="all">Foods & supplements</option>
            <option value="food">Foods</option>
            <option value="supplement">Supplement labels</option>
          </select>
        </label>
      </div>
      <Button
        type="button"
        disabled={query.trim().length < 2 || search.isPending || resolve.isPending || create.isPending}
        onClick={() => search.mutate(undefined)}
      >
        {search.isPending ? "Searching…" : "Search products"}
      </Button>
      {[search.error, resolve.error, create.error, remove.error, saved.error]
        .filter(Boolean)
        .map((e, i) => (
          <p role="alert" key={i}>
            {e!.message}
          </p>
        ))}
      {error && <p role="alert">{error}</p>}
      {(search.error || (searchResult && !searchResult.products.some(p=>["usda-branded","off","manual"].includes(p.source))))&&<div className="report-context space-y-2">
        <p>No verified package match is available for “{query}”. A generic estimate is not the same product. You can still log the nutrition printed on your package; unlisted values stay unknown.</p>
        <Button type="button" variant="outline" onClick={()=>setManual(true)}>Enter package nutrition</Button>
      </div>}
      {searchResult && (
        <div>
          {searchResult.warnings.map((s, i) => (
            <p className="panel-note" key={i}>
              {s}
            </p>
          ))}
          {onDescribeIngredients&&kind!=="supplement"&&(homePreparedQuery(resultQuery).requested||!searchResult.products.length)&&<div className="space-y-2">
            <p>For your own recipe, enter the individual foods and amounts. Existing meal details and selected products stay in your draft.</p>
            <Button type="button" variant="outline" disabled={pending} onClick={onDescribeIngredients}>Build from individual ingredients</Button>
          </div>}
          {!searchResult.products.length && (
            <p>
              No matching records found. Try the barcode, a different spelling,
              or enter the label below.
            </p>
          )}
          {allPossible&&<p className="panel-note">Possible matches for your search. Choose the product and variety on your package before confirming the amount.</p>}
          <ul className="space-y-2 max-h-80 overflow-y-auto">
            {searchResult.products.map((p,index) => (
              <li key={p.source + p.id}>
                <Button
                  className="whitespace-normal h-auto text-left"
                  variant="outline"
                  type="button"
                  disabled={resolve.isPending||search.isPending}
                  aria-describedby={`${resultId}-result-${index}`}
                  onClick={() => resolve.mutate(p)}
                >
                  {p.name} · {p.brand} ·{" "}
                  {p.source === "dsld"
                    ? "NIH supplement label"
                    : p.source === "off"
                      ? "Open Food Facts"
                      : p.source === "usda-branded"
                        ? "USDA manufacturer label"
                      : p.source === "manual"
                        ? "Your saved label"
                        : isHomePreparedSource(p)?"USDA home-prepared food":"USDA generic food"}
                </Button>
                <p id={`${resultId}-result-${index}`} className="panel-note">
                  {productMatchStatus(p,resultQuery)==="barcode"&&<span>Matching barcode · </span>}
                  {!allPossible&&productMatchStatus(p,resultQuery)==="possible"&&<span>Possible match · </span>}
                  {p.servingDescription}{p.provenance?.marketCountry?` · ${p.provenance.marketCountry}`:""}
                  {p.perServing.calories!==undefined?` · ${Number(p.perServing.calories.toFixed(1))} kcal per source serving`:""}
                  {p.perServing.protein_g!==undefined?` · ${Number(p.perServing.protein_g.toFixed(1))} g protein per source serving`:""}
                  <span className="sr-only"> Source record {p.id}.</span>
                </p>
              </li>
            ))}
          </ul>
          <p className="panel-note">{searchResult.attribution}</p>
        </div>
      )}
      {resolve.isPending && <p role="status">Loading the product label…</p>}
      {choice && choiceOwner.current===user?.id && (
        <div className="space-y-3">
          <h4>
            {choice.name} · {choice.brand}
          </h4>
          <p className="panel-note">{choice.source==="usda-local"?(isHomePreparedSource(choice)?"USDA describes this source record as homemade. Recipe ingredients and amounts can differ; review the food and grams eaten, or build from individual ingredients.":"USDA generic estimate. Review the food, preparation and grams eaten. Recipes and cooking methods can differ."):"Confirm this exact product, variety, country and label serving against your package. A name match alone does not confirm the formulation."}</p>
          {variants.length > 1 && (
            <label>
              Label serving
              <select
                className="bloom-input w-full"
                value={choice.id}
                onChange={(e) => {
                  chooseProduct(variants.find((p) => p.id === e.target.value)!);
                }}
              >
                {variants.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.servingDescription}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block">
            Servings eaten · 1 serving = {choice.servingDescription}
            <input
              className="bloom-input w-full"
              type="number"
              min="0.01"
              max="100"
              step="any"
              value={servings}
              onChange={(e) => setServings(Number(e.target.value))}
            />
          </label>
          {choice.servingGrams !== null && (
            <label className="block">
              Or enter grams eaten
              <input
                className="bloom-input w-full"
                type="number"
                min="0.01"
                max="3000"
                step="any"
                value={Number((servings * choice.servingGrams).toFixed(2))}
                onChange={(e) =>
                  setServings(Number(e.target.value) / choice.servingGrams!)
                }
              />
            </label>
          )}
          <p className="panel-note">
            For a food shown per 100 g, 0.6 servings means 60 g. For capsules or
            scoops, use the labelled serving count. A heaping spoon can differ
            from a labelled rounded spoon.
          </p>
          {amountReviewRequired&&<div className="space-y-2"><p role="status">This label cannot automatically keep the previous recorded amount. Review the replacement serving count before applying it.</p><label className="block"><input type="checkbox" checked={amountReviewed} onChange={e=>setAmountReviewed(e.target.checked)}/>Use this reviewed serving count instead of the previous amount.</label></div>}
          <dl>
            {nutrientDefinitions
              .filter(([k]) => choice.perServing[k] !== undefined)
              .map(([k, name, unit]) => (
                <div className="flex justify-between gap-2" key={k}>
                  <dt>{name}</dt>
                  <dd>
                    {Number((choice.perServing[k] * servings).toFixed(2))}{" "}
                    {unit}
                  </dd>
                </div>
              ))}
          </dl>
          {choice.otherNutrients?.map((n, i) => (
            <p key={i}>
              {n.name}: {Number((n.amount * servings).toFixed(3))} {n.unit} ·
              label ingredient; not a macro target
            </p>
          ))}
          {choice.source==="manual"&&choice.sourceNote&&<details><summary>Your source context</summary><p className="panel-note break-words">{choice.sourceNote}</p></details>}
          {choice.notes.map((n, i) => (
            <p className="panel-note" key={i}>
              {n}
            </p>
          ))}
          {choice.provenance&&<details><summary>Source record & formulation</summary><p>Market country: {choice.provenance.marketCountry||"Not supplied; Canadian formulation is not confirmed"}</p><p>Source barcode: {choice.provenance.gtin||"Not supplied"}</p><p>Published: {choice.provenance.publishedDate||"Not supplied"} · Updated: {choice.provenance.modifiedDate||"Not supplied"}</p>{choice.provenance.ingredients&&<p>Source ingredients: {choice.provenance.ingredients}</p>}</details>}
          {choice.url && (
            <a
              className="text-link"
              href={choice.url}
              target="_blank"
              rel="noreferrer"
            >
              View source label
            </a>
          )}
          <Button
            className="whitespace-normal h-auto max-w-full"
            type="button"
            disabled={
              pending || search.isPending || resolve.isPending || create.isPending || !Object.is(amountBasis,initialGrams) || amountReviewRequired&&!amountReviewed || !Number.isFinite(servings) || servings <= 0 || servings > 100
            }
            onClick={() => {
              const ingredient=productIngredient(choice,servings);
              onPick({...ingredient,product:{...ingredient.product,query:searchResult?.query?.original||query}});
              setChoice(null);
              setVariants([]);
            }}
          >
            {pending ? "Updating meal…" : confirmLabel}
          </Button>
        </div>
      )}
      <details>
        <summary>Your saved products ({saved.data?.length || 0})</summary>
        {saved.data?.map((p) => (
          <div className="flex flex-wrap gap-2 py-2" key={p.id}>
            <Button
              className="whitespace-normal h-auto max-w-full text-left"
              type="button"
              variant="outline"
              disabled={search.isPending||resolve.isPending}
              onClick={() => {
                lookupEpoch.current++;setVariants([p]);
                chooseProduct(p);
              }}
            >
              {p.name}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="whitespace-normal h-auto max-w-full"
              disabled={remove.isPending}
              onClick={() => remove.mutate(p.id)}
            >
              Remove saved label
            </Button>
          </div>
        ))}
      </details>
      <Button
        className="whitespace-normal h-auto max-w-full"
        type="button"
        variant="outline"
        onClick={() => setManual(!manual)}
      >
        {manual
          ? "Close label entry"
          : "Product missing? Enter and save its label"}
      </Button>
      {manual && (
        <form
          ref={manualForm}
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate(e.currentTarget);
          }}
        >
          <p>
            Use the amounts per serving from your package or nutrition information
            you are recording yourself. Leave unlisted nutrients blank; enter 0
            only when the source says 0. This record stays private to your account
            and can be reused.
          </p>
          <div className="precision-grid">
            <label>
              Product name
              <input
                className="bloom-input w-full"
                name="name"
                maxLength={120}
                defaultValue={normalizeBarcode(query) ? "" : query}
                required
              />
            </label>
            <label>Package barcode (optional)<input className="bloom-input w-full" name="barcode" inputMode="numeric" maxLength={14} defaultValue={normalizeBarcode(query)||""}/></label>
            <label>
              Brand (optional)
              <input
                className="bloom-input w-full"
                name="brand"
                maxLength={100}
              />
            </label>
            <label>
              One serving, as labelled
              <input
                className="bloom-input w-full"
                name="servingDescription"
                maxLength={120}
                placeholder="2 capsules or 1 scoop"
                required
              />
            </label>
            <label>
              Grams per serving (if shown)
              <input
                className="bloom-input w-full"
                name="servingGrams"
                type="number"
                min="0.01"
                max="3000"
                step="any"
              />
            </label>
          </div>
          <div className="precision-grid">
            {nutrientDefinitions.map(([k, name, unit]) => (
              <label key={k}>
                {name} per serving ({unit})
                <input
                  className="bloom-input w-full"
                  name={k}
                  type="number"
                  min="0"
                  max="100000"
                  step="any"
                />
              </label>
            ))}
          </div>
          <details>
            <summary>Country, variant & source context (optional)</summary>
            <label className="block">Source note (optional)<textarea className="bloom-input w-full" name="sourceNote" rows={2} maxLength={500} placeholder="Country, exact variant, source or date you checked"/></label>
            <p className="panel-note">Your note is not independently verified. It is saved with this private record and meals that use it.</p>
          </details>
          <details>
            <summary>Another supplement ingredient (optional)</summary>
            <label>
              Ingredient name
              <input
                className="bloom-input w-full"
                name="activeName"
                placeholder="For example creatine"
              />
            </label>
            <label>
              Amount per serving
              <input
                className="bloom-input w-full"
                name="activeAmount"
                type="number"
                min="0"
                max="100000"
                step="any"
              />
            </label>
            <label>
              Unit
              <input
                className="bloom-input w-full"
                name="activeUnit"
                placeholder="g, mg, CFU..."
              />
            </label>
          </details>
          <Button type="submit" disabled={create.isPending}>
            {create.isPending ? "Saving label…" : "Save my product label"}
          </Button>
        </form>
      )}
      <p className="panel-note">
        <a
          className="text-link"
          href="https://world.openfoodfacts.org"
          target="_blank"
          rel="noreferrer"
        >
          Open Food Facts
        </a>{" "}
        ·{" "}
        <a
          className="text-link"
          href="https://opendatacommons.org/licenses/odbl/1-0/"
          target="_blank"
          rel="noreferrer"
        >
          ODbL attribution
        </a>{" "}
        ·{" "}
        <a
          className="text-link"
          href="https://dsld.od.nih.gov"
          target="_blank"
          rel="noreferrer"
        >
          NIH Dietary Supplement Label Database
        </a>
      </p>
    </div>
  );
}
