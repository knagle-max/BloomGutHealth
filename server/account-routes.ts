import type { Express, RequestHandler } from "express";
export function registerAccountRoutes(app: Express, auth: RequestHandler, store: {exportAccount(userId:string):Promise<unknown>}) {
  app.get("/api/account/export",auth,async(req,res)=>{
    res.setHeader("Cache-Control","no-store");
    res.setHeader("X-Content-Type-Options","nosniff");
    try {
      const body=JSON.stringify(await store.exportAccount(req.session.userId!));
      if(Buffer.byteLength(body,"utf8")>25*1024*1024)throw Error("EXPORT_TOO_LARGE");
      res.setHeader("Content-Disposition",'attachment; filename="bloom-account-records.json"');
      res.type("application/json").send(body);
    } catch {
      res.status(503).json({error:"Account records could not be exported. No partial download was produced. Retry later or contact the app operator for a larger export."});
    }
  });
}
