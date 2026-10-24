import type { RequestHandler } from "express";
/** A stale/in-flight session cannot authorize access after account deletion. */
export function requireActiveAccount(exists:(userId:string)=>Promise<boolean>):RequestHandler {
  return async(req,res,next)=>{
    if(!req.session.userId)return void res.status(401).json({error:"Authentication required"});
    try{if(!await exists(req.session.userId))return void res.status(401).json({error:"Sign in again to continue."});next();}
    catch{res.status(503).json({error:"Account access could not be verified. Please retry."});}
  };
}

import { eq } from "drizzle-orm";
import { users } from "../shared/schema";
import type { db as appDatabase } from "./db";
/** Serialize persistent session creation with the account erasure parent-row lock. */
export class AccountSessionGuard {
  constructor(private readonly db:Pick<typeof appDatabase,"transaction">) {}
  async withActiveAccount(userId:string,save:()=>Promise<void>) {
    await this.db.transaction(async tx=>{
      const [user]=await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for("key share");
      if(!user)throw Error("Account is unavailable");
      await save();
    });
  }
}
