import type { Express, RequestHandler } from "express";
import type { IStorage } from "./storage";
import type { registerPrecisionRoutes } from "./precision-routes";
import { assessFood } from "../shared/biological-model";
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
