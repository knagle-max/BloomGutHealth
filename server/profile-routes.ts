import type {Express,RequestHandler} from "express";
import type {IStorage} from "./storage";
import {updateUserProfileSchema} from "../shared/schema";
import {profileRevision,ProfileRevisionConflict} from "./profile-source";
export function registerProfileRoutes(app:Express,requireAuth:RequestHandler,store:Pick<IStorage,"getUser"|"updateUserProfile">){
 app.get("/api/profile",requireAuth,async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  try{const user=await store.getUser(req.session.userId!);if(!user)return res.status(404).json({error:"User not found"});const{password,...profile}=user;res.json({...profile,profileRevision:profileRevision(user)});}
  catch{res.status(503).json({error:"Profile unavailable"});}
 });
 app.patch("/api/user/:userId/profile",requireAuth,async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(req.params.userId!==req.session.userId)return res.status(403).json({error:"Access denied"});
  const parsed=updateUserProfileSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Invalid profile"});
  const match=req.get("If-Match");
  if(match!==undefined&&!/^"[a-f0-9]{64}"$/.test(match))return res.status(400).json({error:"Invalid profile revision"});
  try{await store.updateUserProfile(req.session.userId!,parsed.data,match?.slice(1,-1));res.json({success:true});}
  catch(error){if(error instanceof ProfileRevisionConflict)return res.status(409).json({error:error.message});res.status(503).json({error:"Profile could not save"});}
 });
}
