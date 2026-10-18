import { evidenceAudit, simulationReadiness } from "../shared/scientific-contracts";
import type { Express, RequestHandler } from "express";
import type { IStorage } from "./storage";
import type { registerPrecisionRoutes } from "./precision-routes";
import { assessFood } from "../shared/biological-model";
import { z } from "zod";
import { catalogueFoods, findFoodCandidates } from "./food-catalog";
import { explainNutrientContribution, FOOD_INTELLIGENCE_VERSION } from "../shared/food-intelligence";
import { nutrientDefinitions } from "../shared/meal-intelligence";
import { preferenceSchema } from "../shared/meal-intelligence";
export function registerBiologyRoutes(
  app: Express,
  auth: RequestHandler,
  store: IStorage,
  precision: ReturnType<typeof registerPrecisionRoutes>,
) {
  app.use("/api/biology", auth, (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/biology/catalogue", (req, res) => {
    const input = z.object({q:z.string().trim().min(2).max(100)}).strict().safeParse(req.query);
    if(!input.success) return res.status(400).json({error:"Enter at least two characters to search foods."});
    res.json({foods:findFoodCandidates(input.data.q,12).map(f=>({fdcId:f.fdcId,description:f.description})),totalFoods:catalogueFoods.length});
  });
  app.get("/api/biology/catalogue/:id", (req,res)=>{
    const input=z.object({grams:z.coerce.number().finite().positive().max(3000).default(100)}).strict().safeParse(req.query);
    if(!input.success || !/^\d+$/.test(req.params.id)) return res.status(400).json({error:"Choose a food and a portion between 0 and 3,000 grams."});
    const food=catalogueFoods.find(f=>String(f.fdcId)===req.params.id);
    if(!food)return res.status(404).json({error:"Food not found in the composition catalogue."});
    const nutrients=Object.fromEntries(nutrientDefinitions.map(([key,_name,_unit,id])=>[key,typeof food.per100g[String(id)]==="number"?food.per100g[String(id)]*input.data.grams/100:null]));
    res.json({version:FOOD_INTELLIGENCE_VERSION,fdcId:food.fdcId,description:food.description,grams:input.data.grams,portions:food.portions,contributions:explainNutrientContribution(nutrients),source:{title:"USDA FNDDS 2021–2023",url:"https://fdc.nal.usda.gov/food-details/"+food.fdcId+"/nutrients"},limits:["Generic food estimates vary with preparation and brand. Review your actual portion and package label.","This composition record does not verify ingredients, allergens or suitability for your health context.","Nutrition composition does not predict your microbial activity, metabolite output or genetic response. Reviewed biological relationships remain available separately below."]});
  });
  app.get("/api/biology/evidence-audit", async (_req, res) => {
    try { res.json(evidenceAudit(await store.getBiologicalRegistry())); }
    catch { res.status(503).json({error:"The evidence audit could not load. Retry later."}); }
  });
  app.get("/api/biology/model-readiness", (_req,res)=>res.json(simulationReadiness(null)));
  app.get("/api/biology/registry", async (_req, res) => {
    try {
      res.json(await store.getBiologicalRegistry());
    } catch {
      res
        .status(503)
        .json({
          error:
            "The reviewed biological registry could not load. Your journal and planning tools remain available.",
        });
    }
  });
  app.get("/api/biology/foods/:id", async (req, res) => {
    if (Object.keys(req.query).length)
      return res
        .status(400)
        .json({ error: "Food explanations use only your signed-in account." });
    try {
      const registry = await store.getBiologicalRegistry();
      if (
        !registry.entities.some(
          (e) => e.id === req.params.id && e.kind === "food",
        )
      )
        return res
          .status(404)
          .json({
            error:
              "This food has no reviewed biological explanation yet. Nutrition logging remains available.",
          });
      const id = req.session.userId!,
        [report, user] = await Promise.all([
          precision.reportFor(id),
          store.getUser(id),
        ]),
        assessment = assessFood(
          registry,
          req.params.id,
          report,
          preferenceSchema.parse(user?.dietaryPreferences || {}),
        );
      if (!assessment)
        return res
          .status(404)
          .json({ error: "No reviewed food explanation is available." });
      res.json(assessment);
    } catch {
      res
        .status(503)
        .json({
          error:
            "Your food explanation could not load. Retry or review My biology.",
        });
    }
  });
}
