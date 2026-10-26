import { canonicalBarcode, isBarcodeSearch } from "../shared/barcodes";
import { normalizeProductQuery, brandedSearchQuery, rankProducts } from "../shared/product-search";
import { normalizeUSDABranded } from "./usda-branded";
import {
  nutrientDefinitions,
  type Ingredient,
  type MealIntelligence,
} from "../shared/meal-intelligence";
import {
  labelInputSchema,
  productIngredient,
  type Product,
  type ProductRef,
} from "../shared/products";
import { catalogueFoods, findFoodCandidates } from "./food-catalog";
import type { IStorage } from "./storage";
import type { Express, RequestHandler } from "express";
import { z } from "zod";
export type ProductStore = Pick<
  IStorage,
  "getNutritionProducts" | "insertNutritionProduct" | "deleteNutritionProduct"
>;
export type ProductFetch = (url: string, init?: RequestInit) => Promise<any>;
export class ProductSourceError extends Error {
  constructor(readonly category: "http"|"timeout"|"network"|"size"|"invalid-response"|"budget", readonly status?:number, readonly providerCode?:string) {super("Product source unavailable");}
}
const sourceFailure=(error:unknown)=>error instanceof ProductSourceError?error:new ProductSourceError((error as any)?.name==="TimeoutError"||(error as any)?.name==="AbortError"?"timeout":"network");
const gatewayCodes=new Set(["API_KEY_INVALID","API_KEY_MISSING","API_KEY_DISABLED","API_KEY_UNVERIFIED","OVER_RATE_LIMIT","HTTPS_REQUIRED"]);
async function gatewayFailure(response:Response) {
  const reader=response.body?.getReader();let bytes=0,text="";
  try {
    if(reader)while(true){const part=await reader.read();if(part.done)break;bytes+=part.value.byteLength;if(bytes>8192){await reader.cancel();break;}text+=new TextDecoder().decode(part.value);}
    try{const code=JSON.parse(text)?.error?.code;if(gatewayCodes.has(code))return code as string;}catch{}
    return response.headers.get("content-type")?.includes("text/html")?"NON_JSON_DENIAL":"UNCLASSIFIED";
  }catch{return "UNCLASSIFIED";}finally{reader?.releaseLock();}
}
const downloadResponse: ProductFetch = async (url, init) => {
  const r = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(10000),
    headers: {
      "User-Agent":
        "BloomGutHealth/1.0 (https://github.com/knagle-max/BloomGutHealth)",
      ...init?.headers,
    },
  });
  if (!r.ok) {throw new ProductSourceError("http",r.status,await gatewayFailure(r)); }
  if(Number(r.headers.get("content-length"))>3000000||!r.body){await r.body?.cancel();throw new ProductSourceError("size");}
  const reader=r.body.getReader(),decoder=new TextDecoder();let text="",bytes=0,parts=0;
  try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;
    if(bytes>3000000||++parts>4096){await reader.cancel();throw new ProductSourceError("size");}
    text+=decoder.decode(value,{stream:true});
  }text+=decoder.decode();}finally{reader.releaseLock();}
  try{return JSON.parse(text);}catch{throw new ProductSourceError("invalid-response");}
};
const download:ProductFetch=async(url,init)=>{try{return await downloadResponse(url,init);}catch(error){throw sourceFailure(error);}};
const num = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
const now = () => new Date().toISOString();
export function supplementSearchQuery(query: string) {
  return query.replace(/[^a-zA-Z0-9 .-]/g, " ")
    .replace(/\b(real sugar|sugar[ -]free|gluten[ -]free|dairy[ -]free)\b/gi, (phrase) => `"${phrase.replace(/-/g, " ")}"`);
}
const unit = (s: string) =>
  s
    .toLowerCase()
    .replace(/[{}().\s]/g, "")
    .replace(/μ|µ/g, "u");
function quantity(
  amount: number,
  from: string,
  to: string,
  name: string,
): number | null {
  const aliases: Record<string, string> = {
    gram: "g",
    grams: "g",
    milligram: "mg",
    milligrams: "mg",
    microgram: "ug",
    micrograms: "ug",
  };
  const f = aliases[unit(from)] || unit(from),
    t = aliases[unit(to)] || unit(to);
  if (f === t || (t === "kcal" && ["calories", "calorie", "kcal"].includes(f)))
    return amount;
  const weights: Record<string, number> = {
    g: 1,
    mg: 0.001,
    ug: 0.000001,
    mcg: 0.000001,
  };
  if (weights[f] && weights[t]) return (amount * weights[f]) / weights[t];
  if (name === "vitamin_d_ug" && f === "iu") return amount * 0.025;
  return null;
}
const dsldNames: Record<string, string> = {
  calories: "calories",
  totalcarbohydrates: "carbohydrates_total_g",
  totalcarbohydrate: "carbohydrates_total_g",
  dietaryfiber: "fiber_g",
  sugar: "sugar_g",
  sugars: "sugar_g",
  totalsugars: "sugar_g",
  totalfat: "fat_total_g",
  saturatedfat: "fat_saturated_g",
  protein: "protein_g",
  sodium: "sodium_mg",
  potassium: "potassium_mg",
  calcium: "calcium_mg",
  iron: "iron_mg",
  magnesium: "magnesium_mg",
  zinc: "zinc_mg",
  vitaminc: "vitamin_c_mg",
  vitamind: "vitamin_d_ug",
  vitamind3: "vitamin_d_ug",
  vitaminb12: "vitamin_b12_ug",
  folate: "folate_ug",
  vitamina: "vitamin_a_ug",
  vitamine: "vitamin_e_mg",
  vitamink: "vitamin_k_ug",
  cholesterol: "cholesterol_mg",
};
export function normalizeDSLD(raw: any): Product[] {
  if (!raw || !/^\d+$/.test(String(raw.id)) || typeof raw.fullName !== "string")
    throw Error("Invalid supplement label.");
  const declared = (order: number) => {
    const values = new Set<number>();
    function walk(rows: any[]) {
      for (const row of rows || []) {
        for (const q of row.quantity || [])
          if (
            q.servingSizeOrder === order &&
            num(q.servingSizeQuantity) &&
            q.servingSizeQuantity > 0
          )
            values.add(q.servingSizeQuantity);
        walk(row.nestedRows);
      }
    }
    walk(raw.ingredientRows);
    return Array.from(values);
  };
  const sizes = (
    Array.isArray(raw.servingSizes) ? raw.servingSizes.slice(0, 12) : []
  ).flatMap((size: any) =>
    declared(size.order)
      .filter(
        (q) =>
          q >= size.minQuantity &&
          (size.maxQuantity == null
            ? q === size.minQuantity
            : q <= size.maxQuantity),
      )
      .map((q) => ({ ...size, minQuantity: q, maxQuantity: q })),
  );
  return sizes.flatMap((size: any, index: number) => {
    if (
      !num(size.minQuantity) ||
      size.minQuantity !== size.maxQuantity ||
      !size.minQuantity
    )
      return [];
    const perServing: Record<string, number> = {},
      otherNutrients: NonNullable<Product["otherNutrients"]> = [],
      notes = [
        "NIH DSLD reproduces a submitted label, not a certification of accuracy or clinical benefit. Check the product, country and label date.",
        "Missing nutrients are unknown; blend weights are not counted again as macro nutrients.",
      ];
    function walk(rows: any[]) {
      for (const row of rows || []) {
        const name = String(row.name || ""),
          key = dsldNames[name.toLowerCase().replace(/[^a-z0-9]/g, "")],
          q = (row.quantity || []).find(
            (v: any) =>
              v.servingSizeOrder === size.order &&
              v.servingSizeQuantity === size.minQuantity,
          );
        if (q && q.operator === "=" && num(q.quantity)) {
          const target = ["folate_ug", "vitamin_a_ug"].includes(key)
              ? undefined
              : nutrientDefinitions.find((n) => n[0] === key),
            converted = target
              ? quantity(q.quantity, String(q.unit), target[2], key)
              : null;
          // DFE and retinol-equivalent units are not interchangeable with total folate / RAE.
          if (key && converted !== null && !Object.hasOwn(perServing, key))
            perServing[key] = converted;
          else if (otherNutrients.length < 40)
            otherNutrients.push({
              name: name.slice(0, 120),
              amount: q.quantity,
              unit: String(q.unit).slice(0, 30),
            });
        }
        walk(row.nestedRows);
      }
    }
    walk(raw.ingredientRows);
    if (raw.offMarket)
      notes.push("This label may be historical or off market.");
    const grams = quantity(size.minQuantity, String(size.unit), "g", "");
    return [
      {
        source: "dsld" as const,
        id: `${raw.id}:${index}`,
        name: raw.fullName.slice(0, 120),
        brand: String(raw.brandName || "").slice(0, 100),
        servingDescription:
          `${size.minQuantity} ${size.unit}${size.notes ? " · " + size.notes : ""}`.slice(
            0,
            120,
          ),
        servingGrams: grams,
        perServing,
        url: `https://dsld.od.nih.gov/label/${raw.id}`,
        retrievedAt: now(),
        notes: [
          ...notes,
          `Label entered: ${raw.entryDate || "date not supplied"}`,
        ],
        otherNutrients,
      },
    ];
  });
}
export function normalizeOFF(raw: any): Product {
  if (!raw || !/^\d{8,14}$/.test(String(raw.code)) || !raw.product_name)
    throw Error("Invalid food product.");
  const n = raw.nutriments || {},
    g =
      num(raw.serving_quantity) &&
      raw.serving_quantity > 0 &&
      (!raw.serving_quantity_unit || raw.serving_quantity_unit === "g")
        ? raw.serving_quantity
        : null;
  const servingGrams = g ?? 100,
    scale = servingGrams / 100,
    perServing: Record<string, number> = {};
  const map: Record<string, string> = {
    proteins: "protein_g",
    carbohydrates: "carbohydrates_total_g",
    fat: "fat_total_g",
    fiber: "fiber_g",
    sugars: "sugar_g",
    "saturated-fat": "fat_saturated_g",
  };
  for (const [external, key] of Object.entries(map))
    if (num(n[external + "_100g"]))
      perServing[key] = n[external + "_100g"] * scale;
  if (num(n["energy-kcal_100g"]))
    perServing.calories = n["energy-kcal_100g"] * scale;
  else if (num(n.energy_100g))
    perServing.calories = (n.energy_100g / 4.184) * scale;
  if (num(n.sodium_100g)) perServing.sodium_mg = n.sodium_100g * 1000 * scale;
  return {
    source: "off",
    id: String(raw.code),
    name: String(raw.product_name).slice(0, 120),
    brand: String(raw.brands || "").slice(0, 100),
    servingGrams,
    servingDescription: g
      ? String(raw.serving_size || `${g} g`).slice(0, 120)
      : "100 g (choose grams eaten)",
    perServing,
    url: `https://world.openfoodfacts.org/product/${raw.code}`,
    retrievedAt: now(),
    notes: [
      "Open Food Facts contributor data (ODbL). Verify the label and market; missing nutrients are not zero.",
      ...(g
        ? []
        : [
            "No reliable gram serving was supplied. Values are shown per 100 g; scale servings to the grams eaten.",
          ]),
    ],
  };
}
export function localProduct(id: string): Product {
  const f = catalogueFoods.find((f) => String(f.fdcId) === id);
  if (!f) throw Error("Food not found.");
  return {
    source: "usda-local",
    id,
    name: f.description.slice(0, 120),
    brand: "Generic USDA FNDDS 2021–2023",
    servingDescription: "100 g edible prepared food",
    servingGrams: 100,
    perServing: Object.fromEntries(
      nutrientDefinitions.flatMap(([key, , , id]) =>
        num(f.per100g[String(id)]) ? [[key, f.per100g[String(id)]]] : [],
      ),
    ),
    url: `https://fdc.nal.usda.gov/food-details/${id}/nutrients`,
    retrievedAt: "2026-10-18T00:00:00Z",
    notes: [
      "Generic food, not a verified brand match. Choose the matching preparation and scale to the amount eaten.",
    ],
  };
}
export class ProductService {
  private cache = new Map<string, { until: number; value: any }>();
  private inFlight = new Map<string, Promise<any>>();
  private sharedSourceBudget:((source:"usda-branded")=>Promise<boolean>)|undefined;
  setSharedSourceBudget(check:(source:"usda-branded")=>Promise<boolean>){this.sharedSourceBudget=check;}
  private async usdaRead(url:string,init?:RequestInit){
    this.usdaLimit();
    if(this.sharedSourceBudget&&!await this.sharedSourceBudget("usda-branded"))throw new ProductSourceError("budget");
    return this.fetchJson(url,init);
  }
  private usdaWindow={at:0,count:0};
  private usdaLimit(){
    if(Date.now()-this.usdaWindow.at>60000)this.usdaWindow={at:Date.now(),count:0};
    if(this.usdaWindow.count>=12)throw new ProductSourceError("budget");
    this.usdaWindow.count++;
  }
  private offWindow: { at: number; search: number; read: number } = {
    at: 0,
    search: 0,
    read: 0,
  };
  constructor(private fetchJson: ProductFetch = download, private offEnabled: () => boolean = () => process.env.BLOOM_OPEN_FOOD_FACTS_APPROVED === "true", private usdaKey:()=>string|undefined=()=>process.env.USDA_FDC_API_KEY?.trim()) {}
  private usdaSearch(query:string) {
    return this.cached("usda-branded-search:"+brandedSearchQuery(query),()=>{
      const key=this.usdaKey()?.trim();
      return this.usdaRead(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(key||"")}`,
        {method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({query:brandedSearchQuery(query),dataType:["Branded"],pageSize:20})}).then(data=>{if(!Array.isArray(data?.foods))throw new ProductSourceError("invalid-response");return data;});
    });
  }
  /** Fixed public startup check, no account/query data. Warms the same bounded cache as search. */
  async verifyUSDABrandedSource() {
    if(!this.usdaKey()?.trim())return;
    const start=Date.now();
    try {
      const data=await this.usdaSearch("Kit Kat");
      const foods=Array.isArray(data.foods)?data.foods:[];
      console.info(`USDA Branded startup check: status=ok; returned=${foods.length}; elapsedMs=${Date.now()-start}`);
    } catch(error) {
      const failure=sourceFailure(error);
      console.warn(`USDA Branded startup check: category=${failure.category}; status=${failure.status||0}; gateway=${failure.providerCode||"none"}; elapsedMs=${Date.now()-start}`);
    }
  }
  private async cached(key: string, read: () => Promise<any>) {
    const old = this.cache.get(key);
    if (old && old.until > Date.now()) return old.value;
    if (this.inFlight.has(key)) return this.inFlight.get(key);
    const p = read()
      .then((value) => {
        if (this.cache.size >= 512)
          this.cache.delete(this.cache.keys().next().value!);
        this.cache.set(key, { until: Date.now() + 86400000, value });
        return value;
      })
      .finally(() => this.inFlight.delete(key));
    this.inFlight.set(key, p);
    return p;
  }
  private offLimit(search: boolean) {
    if (Date.now() - this.offWindow.at > 60000)
      this.offWindow = { at: Date.now(), search: 0, read: 0 };
    const key = search ? "search" : "read";
    if (this.offWindow[key] >= (search ? 8 : 12))
      throw Error("Food source busy. Try again in a minute.");
    this.offWindow[key]++;
  }
  async search(
    query: string,
    kind: "all" | "food" | "supplement",
    store: ProductStore,
    userId: string,
  ) {
    const q = query.trim(),
      results: Product[] = [],
      warnings: string[] = [];
    const code=canonicalBarcode(q);
    if(isBarcodeSearch(q)&&!code)return {
      products:[],query:{original:q,normalized:q},
      warnings:["This barcode has an unsupported length or check digit. Check the package digits, or search by product name."],
      attribution:"No product identified. You can still enter the package label manually.",
    };
    const own = await store.getNutritionProducts(userId);
    if(code){
      const matches=own.filter(p=>p.barcode&&canonicalBarcode(p.barcode)===code);
      if(matches.length)return {products:matches,warnings:[],attribution:"Your privately saved package label. Confirm the current formula and serving."};
    }
    results.push(
      ...own.filter((p) =>
        normalizeProductQuery(`${p.name} ${p.brand}`).includes(normalizeProductQuery(q)),
      ),
    );
    if (kind !== "supplement" && !code)
      results.push(
        ...findFoodCandidates(q, 5).map((f) => localProduct(String(f.fdcId))),
      );
    const jobs = [] as Promise<void>[];
    const key=this.usdaKey();
    if(kind!=="supplement"&&key)jobs.push(this.usdaSearch(q).then(data=>{
      for(const raw of (Array.isArray(data.foods)?data.foods:[]).slice(0,20))try{results.push(normalizeUSDABranded(raw,false));}catch{}
    }).catch(error=>{
      const failure=sourceFailure(error);
      console.warn(`USDA Branded request failed: category=${failure.category}; status=${failure.status||0}; gateway=${failure.providerCode||"none"}`);
      const reason=failure.category==="http"&&[401,403].includes(failure.status||0)?"access was denied by the source. The app operator needs to check the configured API key"
        :failure.category==="budget"||failure.status===429?"request limit reached. Wait a minute before retrying"
        :failure.category==="timeout"?"request timed out. Retry shortly"
        :"is temporarily unavailable";
      warnings.push(`USDA Branded Foods ${reason}. Your saved labels and manual label entry still work.`);
    }));
    if(kind!=="supplement"&&!key)warnings.push("USDA Branded Foods is not configured. Enter your package label or use a private saved product; generic USDA foods are estimates.");
    if (kind !== "food" && !code)
      jobs.push(
        this.cached("dsld-search:" + q.toLowerCase(), () =>
          this.fetchJson(
            `https://api.ods.od.nih.gov/dsld/v9/search-filter?${new URLSearchParams({ q: supplementSearchQuery(q), size: "40", status: "1", sort_by: "_score" })}`,
          ),
        )
          .then((data) => {
            for (const h of (data.hits || []).slice(0, 40)) {
              const d = h._source;
              if (d && /^\d+$/.test(String(h._id)) &&
                !(/\b(real sugar|with sugar|sugared)\b/i.test(q) && /\bsugar[ -]free\b/i.test(d.fullName || "")))
                results.push({
                  source: "dsld",
                  id: String(h._id),
                  name: String(d.fullName || "Supplement").slice(0, 120),
                  brand: String(d.brandName || "").slice(0, 100),
                  servingGrams: null,
                  servingDescription: "Select to review label and serving",
                  perServing: {},
                  url: `https://dsld.od.nih.gov/label/${h._id}`,
                  retrievedAt: now(),
                  notes: [
                    `Label entered: ${d.entryDate || "unknown"}. Check the exact version.`,
                  ],
                });
            }
          })
          .catch(() => {
            warnings.push(
              "NIH supplement search is temporarily unavailable. You can use a saved product or enter your label.",
            );
          }),
      );
    if (kind !== "supplement" && this.offEnabled())
      jobs.push(
        this.cached("off-search:" + q.toLowerCase(), async () => {
          this.offLimit(true);
          if (code) {
            const r = await this.fetchJson(
              `https://world.openfoodfacts.org/api/v3.6/product/${q.replace(/[\s-]/g,"")}.json`,
            );
            return { products: r.product ? [r.product] : [] };
          }
          return this.fetchJson(
            `https://world.openfoodfacts.org/cgi/search.pl?${new URLSearchParams({ search_terms: q, search_simple: "1", action: "process", json: "1", page_size: "12", fields: "code,product_name,brands,serving_size,serving_quantity,serving_quantity_unit,nutriments" })}`,
          );
        })
          .then((data) => {
            for (const p of data.products || []) {
              try {
                results.push(normalizeOFF(p));
              } catch {}
            }
          })
          .catch(() => {
            warnings.push(
              "Open Food Facts search is temporarily unavailable. Generic USDA foods, saved labels and supplement search may still be available.",
            );
          }),
      );
    if(kind !== "supplement" && !this.offEnabled()) warnings.push("Open Food Facts is disabled pending source licensing review. USDA Branded Foods, if configured, and your private saved labels are separate sources.");
    await Promise.all(jobs);
    return {
      products: rankProducts(results,q),
      query: {original:q,normalized:brandedSearchQuery(q)},
      warnings,
      attribution:
        `Generic estimates: USDA FNDDS. ${key?"Manufacturer labels: USDA Branded Foods (US public-domain data); verify country and formulation. ":""}${this.offEnabled() ? "Packaged foods: Open Food Facts (ODbL). " : ""}Supplement labels: NIH DSLD. Saved labels are private to your account.`,
    };
  }
  async resolve(
    ref: Pick<ProductRef, "source" | "id">,
    store: ProductStore,
    userId: string,
  ): Promise<Product[]> {
    if (ref.source === "manual") {
      const p = (await store.getNutritionProducts(userId)).find(
        (p) => p.id === ref.id,
      );
      if (!p) throw Error("Saved product not found in your account.");
      return [p];
    }
    if (ref.source === "usda-local") return [localProduct(ref.id)];
    if(ref.source==="usda-branded"){
      const key=this.usdaKey();
      if(!key)throw Error("USDA Branded Foods is not configured. Enter the package label instead.");
      if(!/^\d{1,10}$/.test(ref.id))throw Error("Invalid USDA record");
      return this.cached("usda-branded:"+ref.id,async()=>{
        const raw=await this.usdaRead(`https://api.nal.usda.gov/fdc/v1/food/${ref.id}?api_key=${encodeURIComponent(key)}`);
        const product=normalizeUSDABranded(raw);
        if(product.id!==ref.id)throw Error("USDA record identity changed");
        return [product];
      });
    }
    if (ref.source === "dsld") {
      const id = ref.id.split(":")[0];
      if (!/^\d{1,9}$/.test(id)) throw Error("Invalid label ID.");
      const all = await this.cached("dsld:" + id, async () =>
        normalizeDSLD(
          await this.fetchJson(
            `https://api.ods.od.nih.gov/dsld/v9/label/${id}`,
          ),
        ),
      );
      return ref.id.includes(":")
        ? all.filter((p: Product) => p.id === ref.id)
        : all;
    }
    if (!/^\d{8,14}$/.test(ref.id)) throw Error("Invalid barcode.");
    if(!this.offEnabled()) throw Error("Public packaged-food lookup is unavailable pending source licensing review. Enter or select a saved label instead.");
    return this.cached("off:" + ref.id, async () => {
      this.offLimit(false);
      const raw = await this.fetchJson(
        `https://world.openfoodfacts.org/api/v3.6/product/${ref.id}.json`,
      );
      return [normalizeOFF(raw.product)];
    });
  }
}
export const productService = new ProductService();
export async function lookupProductNutrition(
  ingredients: Ingredient[],
  store: ProductStore,
  userId: string,
  service = productService,
) {
  const nutrients = nutrientDefinitions.map(([key, name, unit]) => ({
      key,
      name,
      unit,
      amount: null as number | null,
      coverage: 0,
    })),
    foodMatches: MealIntelligence["foodMatches"] = [],
    warnings: string[] = [],
    counts: Record<string, number> = {},
    productDetails: NonNullable<MealIntelligence["productDetails"]> = [];
  for (const i of ingredients.filter((i) => i.product)) {
    try {
      const p = (await service.resolve(i.product!, store, userId)).find(
        (p) => p.id === i.product!.id,
      );
      if (!p) throw Error("Select a serving from the product label.");
      const servings = i.product!.servings;
      const grams = p.servingGrams === null ? null : p.servingGrams * servings;
      if (grams !== null && grams > 3000)
        throw Error("Product amount exceeds the supported mass.");
      i.name = p.name;
      i.grams = grams;
      i.preparation = "Selected product label";
      i.assumption = `${servings} × ${p.servingDescription}; ${p.source === "manual" ? "your saved label" : "database label; verify the formula and market"}. Missing nutrients are unknown.`;
      for (const n of nutrients)
        if (num(p.perServing[n.key])) {
          n.amount = (n.amount ?? 0) + p.perServing[n.key] * servings;
          counts[n.key] = (counts[n.key] || 0) + 1;
        }
      // Do not retain references into a mutable provider/cache or private-label object.
      const labelSnapshot=structuredClone(p);
      productDetails.push({
        labelSnapshot,
        name: p.name,
        serving: `${servings} × ${p.servingDescription}`,
        source: p.source,
        ...(labelSnapshot.provenance?{provenance:labelSnapshot.provenance}:{}),
        otherNutrients: (p.otherNutrients || []).map((n) => ({
          ...n,
          amount: n.amount * servings,
        })),
      });
      foodMatches.push({
        ingredient: i.name,
        grams: p.servingGrams === null ? null : p.servingGrams * servings,
        serving: `${servings} × ${p.servingDescription}`,
        fdcId: p.source === "usda-local"||p.source==="usda-branded" ? Number(p.id) : null,
        description: `${p.brand} ${p.name} · ${p.source}`,
        url: p.url || "",
        needsConfirmation: true,
      });
      warnings.push(...p.notes);
    } catch {
      warnings.push(
        `Could not load the selected product “${i.name}”. Retry product lookup or use your package label; no generic substitute was counted.`,
      );
    }
  }
  for (const n of nutrients)
    n.coverage = ingredients.length
      ? (counts[n.key] || 0) / ingredients.length
      : 0;
  return {
    nutrients,
    foodMatches,
    productDetails,
    warnings: Array.from(new Set(warnings)),
  };
}
export function registerProductRoutes(
  app: Express,
  auth: RequestHandler,
  store: ProductStore,
  service = productService,
) {
  const limits = new Map<string, { at: number; count: number }>();
  const limit: RequestHandler = (req, res, next) => {
    const t = Date.now();
    for (const [id, v] of Array.from(limits))
      if (t - v.at > 60000) limits.delete(id);
    const id = req.session.userId!,
      e = limits.get(id) || { at: t, count: 0 };
    if (e.count >= 12)
      return void res
        .status(429)
        .json({ error: "Please wait a minute before another product lookup." });
    e.count++;
    limits.set(id, e);
    next();
  };
  app.use("/api/products", auth, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/products/search", limit, async (req, res) => {
    const p = z
      .object({
        q: z.string().trim().min(2).max(120),
        kind: z.enum(["all", "food", "supplement"]).default("all"),
      })
      .strict()
      .safeParse(req.query);
    if (!p.success)
      return res
        .status(400)
        .json({ error: "Enter a product name or barcode (2–120 characters)." });
    try {
      res.json(
        await service.search(p.data.q, p.data.kind, store, req.session.userId!),
      );
    } catch {
      res
        .status(503)
        .json({ error: "Product search could not load. Please retry." });
    }
  });
  app.get("/api/products/saved", async (req, res) => {
    try {
      res.json(await store.getNutritionProducts(req.session.userId!));
    } catch {
      res.status(503).json({ error: "Saved products could not load." });
    }
  });
  app.get("/api/products/:source/:id", limit, async (req, res) => {
    const p = productRefSchemaForRoute.safeParse(req.params);
    if (!p.success)
      return res.status(400).json({ error: "Choose a supported product." });
    try {
      res.json({
        products: await service.resolve(p.data, store, req.session.userId!),
      });
    } catch {
      res.status(404).json({
        error:
          "Product label could not load. Retry or enter your package label.",
      });
    }
  });
  app.post("/api/products", limit, async (req, res) => {
    const p = labelInputSchema.safeParse(req.body);
    if (
      !p.success ||
      (p.success &&
        Object.keys(p.data.perServing).some(
          (k) => !nutrientDefinitions.some((n) => n[0] === k),
        ))
    )
      return res.status(400).json({
        error: "Check the label name, serving size, nutrient values and units.",
      });
    try {
      if ((await store.getNutritionProducts(req.session.userId!)).length >= 200)
        return res.status(400).json({
          error:
            "Your saved-product list is full. Remove an unused label first.",
        });
      res
        .status(201)
        .json(await store.insertNutritionProduct(req.session.userId!, p.data));
    } catch {
      res.status(503).json({ error: "Product label could not save." });
    }
  });
  app.delete("/api/products/:id", async (req, res) => {
    try {
      res.sendStatus(
        (await store.deleteNutritionProduct(req.session.userId!, req.params.id))
          ? 204
          : 404,
      );
    } catch {
      res.status(503).json({ error: "Saved product could not be removed." });
    }
  });
}
const productRefSchemaForRoute = z
  .object({
    source: z.enum(["usda-local", "usda-branded", "off", "dsld", "manual"]),
    id: z.string().regex(/^[a-zA-Z0-9:-]{1,100}$/),
  })
  .strict();
