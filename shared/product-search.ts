import { canonicalBarcode, isBarcodeSearch } from "./barcodes";
import type { Product } from "./products";

/** Search suggestions only: these aliases never select a SKU or change meal text. */
export function normalizeProductQuery(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[’']/g, "").replace(/\bkit\s+(?:kat|kit)\b/g, "kitkat")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}
export function brandedSearchQuery(value: string) {
  return canonicalBarcode(value) || normalizeProductQuery(value).replace(/\bkitkat\b/g,"kit kat").replace(/\bmichelinas\b/g,"michelina");
}
/** Retrieval hint only. It never changes a record's source or preparation label. */
export function homePreparedQuery(query: string) {
  const normalized=normalizeProductQuery(query);
  const requested=/\b(?:homemade|home made|home prepared)\b/.test(normalized);
  return {requested, food:requested?normalized.replace(/\b(?:homemade|home made|home prepared)\b/g," ").trim().replace(/\s+/g," "):normalized};
}
export function rankProducts(products: Product[], query: string) {
  const intent=homePreparedQuery(query);
  const code=canonicalBarcode(query),tokens=intent.food.split(" ").filter(Boolean);
  if(isBarcodeSearch(query)&&!code)return [];
  const score=(p:Product)=>{
    if(code)return p.barcode&&canonicalBarcode(p.barcode)===code?1000:-1;
    const name=normalizeProductQuery(`${p.name} ${p.brand}`);
    const hits=tokens.filter(t=>name.split(" ").some(w=>w===t||w.startsWith(t))).length;
    if(!hits)return 0;
    return hits*20+(hits===tokens.length?100:0)+(p.source==="manual"?10:0)+(p.source==="usda-local"?(intent.requested&&hits===tokens.length?150:-10):0);
  };
  const seen=new Set<string>();
  return products.map(p=>({p,score:score(p)})).filter(({p,score})=>{
    const key=`${p.source}:${p.id}`;if(score<=0||seen.has(key))return false;seen.add(key);return true;
  }).sort((a,b)=>b.score-a.score).slice(0,40).map(({p})=>p);
}

/** Presentation confidence only. A literal name match never establishes exact SKU identity. */
export function productMatchStatus(product:Product,query:string):"barcode"|"name"|"possible"|"generic" {
  if(product.source==="usda-local")return "generic";
  const barcode=canonicalBarcode(query);
  if(barcode)return product.barcode&&canonicalBarcode(product.barcode)===barcode?"barcode":"possible";
  const literal=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[’']/g,"").replace(/\bkit\s+kat\b/g,"kitkat").replace(/[^a-z0-9]+/g," ").trim();
  const tokens=literal(query).split(/\s+/).filter(Boolean),words=literal(`${product.name} ${product.brand}`).split(/\s+/);
  return tokens.length&&tokens.every(t=>words.includes(t))?"name":"possible";
}
