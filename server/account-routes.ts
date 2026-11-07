import { z } from "zod";
import { AccountErasureError } from "./account-erasure";
import type { Express, RequestHandler } from "express";
export function registerAccountRoutes(app: Express, auth: RequestHandler, store: {exportAccount(userId:string):Promise<unknown>}, erasure?:{eraseAccount(userId:string,password:string):Promise<void>}) {
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
  app.delete("/api/account",auth,async(req,res)=>{
    res.setHeader("Cache-Control","no-store");
    const parsed=z.object({password:z.string().min(1).refine(v=>Buffer.byteLength(v,"utf8")<=72),confirmation:z.literal("DELETE ACCOUNT")}).strict().safeParse(req.body);
    if(!parsed.success)return void res.status(400).json({error:"Enter your current password and type DELETE ACCOUNT to confirm."});
    if(!erasure)return void res.status(503).json({error:"Account deletion is unavailable."});
    try {
      await erasure.eraseAccount(req.session.userId!,parsed.data.password);
    }catch(error){
      if(error instanceof AccountErasureError&&error.reason==="credentials")return void res.status(401).json({error:"The current password could not be verified. No records were deleted."});
      return void res.status(503).json({error:"Account deletion could not be completed. No deletion was committed. Please retry."});
    }
    // The database already revoked sessions atomically. A cleanup callback failure cannot undo erasure.
    let completed=false;
    const complete=()=>{if(completed)return;completed=true;
      res.clearCookie("connect.sid",{path:"/",secure:process.env.NODE_ENV==="production",httpOnly:true,sameSite:"strict"});
      res.json({deleted:true,scope:"active-application-records",note:"Backups, operational logs and external-provider records are outside this deletion. Provider permissions must be revoked separately."});
    };
    try{req.session.destroy(complete);}catch{complete();}
  });

}
