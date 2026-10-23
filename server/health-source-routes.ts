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
  // Account-scoped, bounded observation view for Progress and source inspection.
  // This is not a native connector or permission-grant endpoint.
  app.get("/api/health-sources/observations",async(req,res)=>{
    const kind=req.query.kind;
    const provider=req.query.provider;
    const limitRaw=req.query.limit;
    const offsetRaw=req.query.offset;
    const allowedKinds=new Set(["steps","heart_rate","body_mass","sleep","distance","hydration"]);
    const allowedProviders=new Set(["apple_health","health_connect"]);
    if ((kind!==undefined&&(typeof kind!=="string"||!allowedKinds.has(kind))) ||
        (provider!==undefined&&(typeof provider!=="string"||!allowedProviders.has(provider))) ||
        (limitRaw!==undefined&&(typeof limitRaw!=="string"||!/^[1-9]\d{0,2}$/.test(limitRaw)||Number(limitRaw)>200)) ||
        (offsetRaw!==undefined&&(typeof offsetRaw!=="string"||!/^(0|[1-9]\d{0,4})$/.test(offsetRaw)||Number(offsetRaw)>50000)))
      return res.status(400).json({error:"Invalid observation filter."});
    const limit=limitRaw===undefined?50:Number(limitRaw),offset=offsetRaw===undefined?0:Number(offsetRaw);
    try {
      const observations=await storage.getObservations(req.session.userId!);
      const filtered=observations.filter(item=>
        (kind===undefined||item.kind===kind)&&
        (provider===undefined||item.source.provider===provider));
      filtered.sort((a,b)=>Date.parse(b.endAt)-Date.parse(a.endAt)||
        a.source.provider.localeCompare(b.source.provider)||
        a.source.deviceId.localeCompare(b.source.deviceId)||
        a.source.recordId.localeCompare(b.source.recordId)||a.kind.localeCompare(b.kind));
      res.json({observations:filtered.slice(offset,offset+limit),returned:Math.max(0,Math.min(filtered.length-offset,limit)),
        total:filtered.length,offset,limit,hasMore:filtered.length>offset+limit,
        interpretation:"Source observations only. Overlapping sources must not be summed without reconciliation."});
    } catch {res.status(503).json({error:"Health observations could not be loaded."});}
  });
  // Explicit, authenticated portability endpoint. No provider credentials or keys are exported.
  app.get("/api/health-sources/export",async(req,res)=>{
    try {
      const [observations,consents]=await Promise.all([
        storage.getObservations(req.session.userId!),
        storage.getConsents(req.session.userId!),
      ]);
      res.setHeader("Content-Disposition",'attachment; filename="bloom-health-observations.json"');
      res.json({
        format:"bloom-health-observations-v1",
        exportedAt:new Date().toISOString(),
        observations,
        consents,
        warning:"Sensitive health data. Store privately. This export does not represent an active Apple Health or Health Connect connection.",
      });
    } catch {res.status(503).json({error:"Health observations could not be exported."});}
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
