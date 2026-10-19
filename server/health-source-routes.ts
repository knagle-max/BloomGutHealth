import type { Express, RequestHandler } from "express";
import { HealthSourceStorage } from "./health-source-storage";

/** Account-only inspection, revocation and erasure. No connector authentication
 * or native permissions are implied by these endpoints. */
export function registerHealthSourceRoutes(app:Express, auth:RequestHandler, storage:HealthSourceStorage) {
  app.use("/api/health-sources", auth, (_req,res,next)=>{
    res.setHeader("Cache-Control","no-store"); next();
  });
  app.get("/api/health-sources", async(req,res)=>{
    try {
      const consents=await storage.getConsents(req.session.userId!);
      res.json({
        connections:["apple_health","health_connect"].map(provider=>({
          provider,
          state:"not_connected",
          consentRecorded:consents.some(c=>c.provider===provider&&!c.revokedAt),
          note:"No native device connector is configured. Stored consent does not imply OS authorization.",
        })),
      });
    } catch {res.status(503).json({error:"Health source status is temporarily unavailable."});}
  });
  app.delete("/api/health-sources/:provider",async(req,res)=>{
    if(req.params.provider!=="apple_health"&&req.params.provider!=="health_connect")
      return res.status(404).json({error:"Unsupported health source."});
    if(req.headers["x-bloom-confirm"]!=="delete-health-source")
      return res.status(400).json({error:"Explicit deletion confirmation required."});
    try {
      await storage.clearProvider(req.session.userId!,req.params.provider);
      res.status(204).end();
    } catch {res.status(503).json({error:"Health source data could not be deleted. Retry."});}
  });
  app.delete("/api/health-sources",async(req,res)=>{
    if(req.headers["x-bloom-confirm"]!=="delete-all-health-sources")
      return res.status(400).json({error:"Explicit deletion confirmation required."});
    try {
      await storage.clearAccount(req.session.userId!);
      res.status(204).end();
    } catch {res.status(503).json({error:"Health source data could not be deleted. Retry."});}
  });
}
