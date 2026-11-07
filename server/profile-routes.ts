import {ProfileMeasurementMismatch} from "./profile-errors";
import {profileMeasurementWriteSchema} from "../shared/profile-measurement-source";
import {ProfileMeasurementUnavailable} from "./profile-measurement-source";
import type {Express,RequestHandler} from "express";
import type {IStorage} from "./storage";
import {updateUserProfileSchema} from "../shared/schema";
import {profileRevision,ProfileRevisionConflict} from "./profile-source";
export function registerProfileRoutes(app:Express,requireAuth:RequestHandler,store:Pick<IStorage,"getUser"|"updateUserProfile">&Partial<Pick<IStorage,"getProfileMeasurementSource">>){
 app.get("/api/profile",requireAuth,async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  try{const user=await store.getUser(req.session.userId!);if(!user)return res.status(404).json({error:"User not found"});const{password,...profile}=user;res.json({...profile,profileRevision:profileRevision(user),measurementSource:store.getProfileMeasurementSource?await store.getProfileMeasurementSource(user.id,user):{available:false}});}
  catch{res.status(503).json({error:"Profile unavailable"});}
 });
 app.patch("/api/user/:userId/profile",requireAuth,async(req,res)=>{
  res.setHeader("Cache-Control","no-store");
  if(req.params.userId!==req.session.userId)return res.status(403).json({error:"Access denied"});
  const parsed=updateUserProfileSchema.extend({measurementSource:profileMeasurementWriteSchema.optional()}).safeParse(req.body);if(!parsed.success)return res.status(400).json({error:"Invalid profile"});
  const match=req.get("If-Match");
  if(match!==undefined&&!/^"[a-f0-9]{64}"$/.test(match))return res.status(400).json({error:"Invalid profile revision"});
  const {measurementSource,...profile}=parsed.data;
  if(measurementSource&&!match)return res.status(400).json({error:"Profile revision required for original entries"});
  try{await store.updateUserProfile(req.session.userId!,profile,match?.slice(1,-1),measurementSource);res.json({success:true});}
  catch(error){if(error instanceof ProfileMeasurementMismatch)return res.status(400).json({error:"Original entries do not match Profile measurements"});if(error instanceof ProfileMeasurementUnavailable)return res.status(503).json({error:error.message});if(error instanceof ProfileRevisionConflict)return res.status(409).json({error:error.message});res.status(503).json({error:"Profile could not save"});}
 });
}
