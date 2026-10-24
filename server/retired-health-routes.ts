import type { Express, RequestHandler } from "express";
import type { IStorage } from "./storage";
/** Prototype diet formulas cannot establish personal SCFAs, bacterial gaps or health scores. */
export function registerRetiredHealthRoutes(app:Express,auth:RequestHandler,store:Pick<IStorage,"getMeal">){
 const retired={code:"UNVALIDATED_MODEL_RETIRED",error:"Personal metabolite levels, bacterial gaps and health scores cannot be calculated reliably from a food log. Use sourced food guidance and track actual nutrition or laboratory results.",alternatives:["/insights","/explore","/progress"]};
 for(const kind of ["analysis","recommendations","progress","adherence"]){
  app.get(`/api/health/${kind}/:userId`,auth,(req,res)=>{
   res.setHeader("Cache-Control","no-store");
   if(req.params.userId!==req.session.userId)return res.status(403).json({error:"Access denied"});
   res.status(410).json(retired);
  });
 }
 app.post("/api/meals/:mealId/check-adherence",auth,async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  try{const meal=await store.getMeal(req.params.mealId);if(!meal||meal.userId!==req.session.userId)return res.status(404).json({error:"Meal not found in your account."});res.status(410).json(retired);}catch{res.status(503).json({error:"Meal could not load. Please retry."});}
 });
}
