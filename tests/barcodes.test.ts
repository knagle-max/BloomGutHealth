import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeBarcode,
  canonicalBarcode,
  expandUPCE,
  productSearchText,
} from "../shared/barcodes";
import { labelInputSchema } from "../shared/products";
import { ProductService } from "../server/products";
test("barcode strings preserve leading zeros, validate GS1 check digits and expand UPC-E without stripping queries", () => {
  assert.equal(normalizeBarcode("0 12345 67890 5"), "012345678905");
  assert.equal(normalizeBarcode("012345678906"), null);
  assert.equal(normalizeBarcode("https://example.com"), null);
  assert.equal(normalizeBarcode("1234567"), null);
  assert.equal(
    canonicalBarcode("012345678905"),
    canonicalBarcode("0012345678905"),
  );
  assert.equal(expandUPCE("04252614"), "042100005264");
  assert.equal(productSearchText("0012345678905"), "0012345678905");
  assert.equal(
    productSearchText("1 heaping tablespoon of fiber powder"),
    "fiber powder",
  );
});
test("a privately saved barcode label resolves locally across UPC/EAN forms and stays account-scoped during source outages", async () => {
  const label = labelInputSchema.parse({
    name: "Private supplement",
    barcode: "012345678905",
    brand: "Synthetic",
    servingDescription: "1 scoop",
    servingGrams: 10,
    perServing: { calories: 30, fiber_g: 4 },
  });
  assert.equal(
    labelInputSchema.safeParse({ ...label, barcode: "012345678906" }).success,
    false,
  );
  const product = {
    ...label,
    id: "mine",
    source: "manual",
    url: null,
    retrievedAt: new Date().toISOString(),
    notes: [],
  };
  let requests = 0;
  const service = new ProductService(async () => {
    requests++;
    throw Error("Source offline");
  });
  const store: any = {
    getNutritionProducts: async (id: string) => (id === "a" ? [product] : []),
  };
  const result = await service.search("0012345678905", "all", store, "a");
  assert.equal(result.products[0].id, "mine");
  assert.equal(requests, 0);
  const other = await service.search("0012345678905", "all", store, "b");
  assert.equal(
    other.products.some((p) => p.id === "mine"),
    false,
  );
  assert.ok(other.warnings.length);
});
