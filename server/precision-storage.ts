import{viomeSource}from"../shared/viome-report-context";
import type{MicrobiomeFoodSource,MicrobiomeFoodControl}from"../shared/microbiome-food-influence";
import type{LabSourceSummary}from"../shared/lab-history";
import{selectedGeneticSource,healthContextOnly,geneticSourceCommandSchema,GeneticSourceError,type GeneticSourceSnapshot,type GeneticSourceCommand,type GeneticsSourceControl}from"../shared/genetic-source-selection";
import {possibleLabReimports} from "../shared/lab-reimport";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {labDateChangeSchema,applyLabDateChange,type LabDateChange} from "../shared/lab-date-correction";
import { createHash,randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { precisionProfiles, precisionRecords, users,microbiomeSamples } from "../shared/schema";
import { labSchema, sourceOnlyLabSchema, contextSchema,precisionEntrySchema, activeLabObservations, activeLabRows, type Lab, type SourceOnlyLab } from "../shared/precision-nutrition";
import {
  preferenceSchema,
  defaultPreferences,
} from "../shared/meal-intelligence";
import { encryptPrecision, decryptPrecision } from "./precision-crypto";
import type {
  PrecisionContext,
  PrecisionRecord,
} from "../shared/precision-nutrition";
import type { db as appDatabase } from "./db";

type PrecisionDatabase = Pick<
  typeof appDatabase,
  "select" | "insert" | "delete" | "transaction"
>;
export class LabImportReviewRequired extends Error {
  constructor(readonly matchedIds:string[]){super("LAB_REIMPORT_REVIEW_REQUIRED");}
}
/** Group only persisted import identity or explicit correction edges, never calendar dates. */
function labSourceGroups(userId:string,records:PrecisionRecord[]){
 const rows=records.filter(row=>row.kind==="lab"),byId=new Map(rows.map(row=>[row.id,row]));
 const links=new Map(rows.map(row=>[row.id,new Set<string>()])),imports=new Map<string,string[]>();
 const facts=new Map<string,Lab|SourceOnlyLab>();
 for(const row of rows){const known=labSchema.safeParse(row.payload),raw=sourceOnlyLabSchema.safeParse(row.payload);const fact=known.success?known.data:raw.success?raw.data:null;if(!fact)continue;facts.set(row.id,fact);
  if(fact.sourceReport){const source=fact.sourceReport,key=JSON.stringify([source.importId,source.reportIdentifier??null,source.specimenIdentifier??null]);imports.set(key,[...(imports.get(key)||[]),row.id]);}
  const parents=[fact.dateCorrection?.supersedes,...('unitReview'in fact?[fact.unitReview?.supersedes]:[])];
  for(const parent of parents)if(parent&&byId.has(parent)){links.get(row.id)!.add(parent);links.get(parent)!.add(row.id);}
 }
 for(const ids of Array.from(imports.values()))for(const id of ids.slice(1)){links.get(ids[0])!.add(id);links.get(id)!.add(ids[0]);}
 const visited=new Set<string>();return rows.flatMap(row=>{if(visited.has(row.id))return[];const ids=[row.id];visited.add(row.id);for(let i=0;i<ids.length;i++)for(const next of Array.from(links.get(ids[i])!))if(!visited.has(next)){visited.add(next);ids.push(next);}ids.sort();
  const members=ids.map(id=>byId.get(id)!),parsed=ids.flatMap(id=>facts.has(id)?[{...facts.get(id)!,id}]:[]);
  const sourceKeys=Array.from(new Set(parsed.flatMap(fact=>fact.sourceReport?[JSON.stringify([fact.sourceReport.importId,fact.sourceReport.reportIdentifier??null,fact.sourceReport.specimenIdentifier??null])]:[]))).sort();
  // Conflicting explicitly recorded source identities are not silently combined into a report.
  const valid=sourceKeys.length<=1;
  const key=sourceKeys.length===1?['import',sourceKeys[0]]:['entry',ids[0]];
  const id=createHash('sha256').update(JSON.stringify(['lab-source-v1',userId,key])).digest('hex');
  const revision=createHash('sha256').update(JSON.stringify(['lab-source-version-v1',userId,members])).digest('hex');
  const detailRecordId=activeLabRows(parsed)[0]?.id;
  const savedTimes=members.map(row=>+new Date(row.createdAt)).filter(Number.isFinite),savedAt=savedTimes.length?new Date(Math.min(...savedTimes)).toISOString():null;
  const summary:LabSourceSummary={id,revision,manageable:valid,savedAt,...(detailRecordId?{detailRecordId}:{}),scope:sourceKeys.length===1?'report':'result',results:parsed.length===members.length?activeLabRows(parsed).length:null,records:members.length,dates:Array.from(new Set(parsed.map(fact=>fact.dateCorrection?.enteredDate||fact.sourceReport?.enteredDate||fact.measuredAt.slice(0,10)))).sort()};
  return[{summary,members,valid}];
 });
}
export class PrecisionStorage {
  constructor(private readonly db: PrecisionDatabase) {}
  async getPrecisionContext(userId: string): Promise<unknown> {
    const [row] = await this.db
      .select()
      .from(precisionProfiles)
      .where(eq(precisionProfiles.userId, userId));
    return row ? decryptPrecision(row.encryptedContext, userId) : undefined;
  }
  async putPrecisionContext(
    userId: string,
    context: PrecisionContext,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      if(context.geneticsSelection!==undefined||context.microbiomeFood!==undefined)throw new GeneticSourceError("read-only");
      const[selectionProfile]=await tx.select({encryptedContext:precisionProfiles.encryptedContext}).from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      const selectionContext=selectionProfile?contextSchema.parse(decryptPrecision(selectionProfile.encryptedContext,userId)):undefined;
      let next:PrecisionContext={...context,...(selectionContext?.microbiomeFood?{microbiomeFood:selectionContext.microbiomeFood}:{}),...(selectionContext?.geneticsSelection?{geneticsSelection:selectionContext.geneticsSelection}:{})};
      if(context.intolerances===undefined){
        const [existing]=await tx.select({encryptedContext:precisionProfiles.encryptedContext}).from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
        const previous=existing?decryptPrecision(existing.encryptedContext,userId):undefined;
        if(previous&&typeof previous==="object"&&"intolerances" in previous&&previous.intolerances!==undefined)next={...next,intolerances:contextSchema.shape.intolerances.parse(previous.intolerances)};
      }
      const encryptedContext=encryptPrecision(next,userId);
      await tx
        .insert(precisionProfiles)
        .values({ userId, encryptedContext })
        .onConflictDoUpdate({
          target: precisionProfiles.userId,
          set: { encryptedContext, updatedAt: new Date() },
        });
    });
  }
  async getPrecisionRecords(userId: string): Promise<PrecisionRecord[]> {
    const rows = await this.db
      .select()
      .from(precisionRecords)
      .where(eq(precisionRecords.userId, userId))
      .orderBy(desc(precisionRecords.createdAt));
    return rows.map((row) => ({
      id: row.id,
      kind: row.kind,
      payload: decryptPrecision(row.encryptedPayload, userId),
      createdAt: row.createdAt,
    }));
  }
  insertReviewedLab(userId:string,payload:unknown,saveKey:string,reviewedMatches:readonly string[]){
    if(!/^[A-Za-z0-9_-]{8,128}$/.test(saveKey))throw Error("LAB_SOURCE_CHANGED");
    return this.insertPrecisionRecord(userId,"lab",payload,saveKey,reviewedMatches);
  }
  async insertPrecisionRecord(
    userId: string,
    kind: string,
    payload: unknown,
    saveKey?: string,
    reviewedLabMatches?:readonly string[],
  ): Promise<PrecisionRecord> {
    const encryptedPayload = encryptPrecision(payload, userId);
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      const id = saveKey ? createHash("sha256").update(JSON.stringify(["precision-save-v1",userId,saveKey])).digest("hex") : undefined;
      if(id){
        const [existing]=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.id,id),eq(precisionRecords.userId,userId)));
        if(existing){
          const decoded=decryptPrecision(existing.encryptedPayload,userId);
          if(existing.kind!==kind||!isDeepStrictEqual(decoded,payload))throw Error("PRECISION_SAVE_CONFLICT");
          return {id:existing.id,kind:existing.kind,payload:decoded,createdAt:existing.createdAt};
        }
      }
      const plan = payload as any;
      if (kind === "lab" && plan?.dateCorrection && plan?.unitReview?.status !== "confirmed") throw Error("LAB_SOURCE_CHANGED");
      if(reviewedLabMatches!==undefined){
        const known=labSchema.safeParse(payload),raw=sourceOnlyLabSchema.safeParse(payload);
        const incoming=known.success?known.data:raw.success?raw.data:null;
        if(kind!=="lab"||!saveKey||!incoming||incoming.dateCorrection||("unitReview" in incoming&&incoming.unitReview&&(incoming.unitReview.status!=="pending"||incoming.unitReview.confirmedAt!==null||incoming.unitReview.supersedes!==null||incoming.value!==incoming.unitReview.originalValue)))throw Error("LAB_SOURCE_CHANGED");
        const owned=await tx.select({id:precisionRecords.id,encryptedPayload:precisionRecords.encryptedPayload}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
        const rows=owned.map(row=>{
          const decoded=decryptPrecision(row.encryptedPayload,userId),supported=labSchema.safeParse(decoded),source=sourceOnlyLabSchema.safeParse(decoded);
          if(!supported.success&&!source.success)throw Error("LAB_SOURCE_CHANGED");
          return {...(supported.success?supported.data:source.data!),id:row.id};
        });
        const expected=possibleLabReimports(incoming,activeLabRows(rows)).map(row=>row.id).sort();
        if(JSON.stringify(expected)!==JSON.stringify([...reviewedLabMatches].sort()))throw new LabImportReviewRequired(expected);
      }
      if (kind === "lab" && plan?.unitReview?.status === "confirmed") {
        const owned = await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
        const decoded = owned.map(r=>({...r,payload:decryptPrecision(r.encryptedPayload,userId) as any}));
        const supported=decoded.flatMap(row=>{const parsed=labSchema.safeParse(row.payload);return parsed.success?[{...parsed.data,id:row.id}]:[];});
        const active=activeLabRows(supported);
        const prior = active.find(row=>row.unitReview?.supersedes===plan.unitReview.supersedes);
        const source = decoded.find(r=>r.id===plan.unitReview.supersedes);
        const parsed = labSchema.safeParse(source?.payload);
        if(!parsed.success||!isDeepStrictEqual(parsed.data.dateCorrection,plan.dateCorrection))throw Error("LAB_SOURCE_CHANGED");
        if(prior){const record=decoded.find(row=>row.id===prior.id)!;return {id:record.id,kind:record.kind,payload:record.payload,createdAt:record.createdAt};}
        if(!active.some(row=>row.id===source?.id))throw Error("LAB_SOURCE_CHANGED");
        if(!parsed.success || parsed.data.unitReview?.status!=="pending" ||
          parsed.data.unitReview.originalValue!==plan.value || parsed.data.marker!==plan.marker)
          throw Error("LAB_SOURCE_CHANGED");
      }

      if (kind === "plan" && plan?.type === "weekly-plan") {
        const [profile] = await tx
          .select()
          .from(precisionProfiles)
          .where(eq(precisionProfiles.userId, userId));
        const [user] = await tx
          .select({ dietaryPreferences: users.dietaryPreferences })
          .from(users)
          .where(eq(users.id, userId))
          .for("share");
        const currentPrefs = preferenceSchema.safeParse(
          user?.dietaryPreferences,
        );
        if (
          !profile ||
          JSON.stringify(
            healthContextOnly(contextSchema.parse(
              decryptPrecision(profile.encryptedContext, userId),
            )),
          ) !== JSON.stringify(plan.inputGuard?.context) ||
          JSON.stringify(
            currentPrefs.success ? currentPrefs.data : defaultPreferences,
          ) !== JSON.stringify(plan.inputGuard?.preferences)
        )
          throw Error("PRECISION_INPUTS_CHANGED");
        const records = await tx
          // Only lab payloads need classification; do not transfer wide genetics/plan blobs.
          .select({ id: precisionRecords.id, kind: precisionRecords.kind,createdAt:precisionRecords.createdAt,
            labPayload: sql<unknown>`CASE WHEN ${precisionRecords.kind} = 'lab' THEN ${precisionRecords.encryptedPayload} ELSE NULL END` })
          .from(precisionRecords)
          .where(eq(precisionRecords.userId, userId))
          .orderBy(desc(precisionRecords.createdAt));
        const supportedLabs:Array<Lab&{id:string}>=[],unresolvedLabs=new Set<string>();
        for(const record of records.filter(row=>row.kind==="lab")){
          const payload=decryptPrecision(record.labPayload,userId),supported=labSchema.safeParse(payload);
          if(supported.success)supportedLabs.push({...supported.data,id:record.id});
          else if(!sourceOnlyLabSchema.safeParse(payload).success)unresolvedLabs.add(record.id);
        }
        if(unresolvedLabs.size)throw Error("PRECISION_INPUTS_CHANGED");
        const clinicalLabIds=new Set(activeLabObservations(supportedLabs).labs.map(row=>row.id));
        const selected=selectedGeneticSource(records,contextSchema.parse(decryptPrecision(profile.encryptedContext,userId)).geneticsSelection);
        const[selectedRow]=selected?await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,selected.id),eq(precisionRecords.kind,"genetics"))):[];
        const validSelected=selectedRow?precisionEntrySchema.safeParse({kind:"genetics",payload:decryptPrecision(selectedRow.encryptedPayload,userId)}):null;
        const latestGenetics=validSelected?.success?selected:undefined;
        const sourceIds = records
          .filter(
            (r) =>
              (r.kind === "lab" && clinicalLabIds.has(r.id)) ||
              r.kind === "metabolite" ||
              r.id === latestGenetics?.id,
          )
          .map((r) => r.id);
        if (
          !Array.isArray(plan.inputGuard?.sourceRecordIds) ||
          plan.inputGuard.sourceRecordIds.length !== sourceIds.length ||
          !plan.inputGuard.sourceRecordIds.every((id: string) =>
            sourceIds.includes(id),
          )
        )
          throw Error("PRECISION_INPUTS_CHANGED");
      }
      const [row] = await tx
        .insert(precisionRecords)
        .values({ ...(id?{id}:{}), userId, kind, encryptedPayload })
        .returning();
      if(kind==="genetics"){
        await this.writeGeneticControl(tx,userId,{sourceId:row.id,revision:randomUUID()});
      }
      return { id: row.id, kind: row.kind, payload, createdAt: row.createdAt };
    });
  }
  async correctLabDate(userId: string, sourceId: string, input: LabDateChange, saveKey: string): Promise<PrecisionRecord> {
    const request = labDateChangeSchema.parse(input);
    if (!/^[A-Za-z0-9_-]{8,128}$/.test(saveKey)) throw Error("LAB_DATE_INVALID");
    const id = createHash("sha256").update(JSON.stringify(["lab-date-v1", userId, saveKey])).digest("hex");
    const fingerprint = createHash("sha256").update(JSON.stringify([sourceId, request])).digest("hex");
    return this.db.transaction(async tx => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
      const [receipt] = await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      if (receipt) {
        const payload = decryptPrecision(receipt.encryptedPayload,userId);
        const known = labSchema.safeParse(payload), raw = sourceOnlyLabSchema.safeParse(payload);
        const parsed = known.success ? known.data : raw.success ? raw.data : null;
        if(receipt.kind!=="lab"||parsed?.dateCorrection?.requestFingerprint!==fingerprint)throw Error("PRECISION_SAVE_CONFLICT");
        return {id:receipt.id,kind:receipt.kind,payload:parsed,createdAt:receipt.createdAt};
      }
      const rows = await tx.select({id:precisionRecords.id,encryptedPayload:precisionRecords.encryptedPayload})
        .from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
      if(!rows.some(row=>row.id===sourceId))throw Error("LAB_NOT_FOUND");
      const parsedRows = rows.map(row=>{
        const payload=decryptPrecision(row.encryptedPayload,userId), known=labSchema.safeParse(payload), raw=sourceOnlyLabSchema.safeParse(payload);
        if(!known.success&&!raw.success)throw Error("LAB_SOURCE_CHANGED");
        return {...(known.success?known.data:raw.data!),id:row.id};
      });
      const source=activeLabRows(parsedRows).find(row=>row.id===sourceId);
      if(!source)throw Error("LAB_SOURCE_CHANGED");
      const {id:_sourceId,...payload}=source;
      const corrected=applyLabDateChange(payload,sourceId,request,fingerprint,new Date().toISOString());
      const [row]=await tx.insert(precisionRecords).values({id,userId,kind:"lab",encryptedPayload:encryptPrecision(corrected,userId)}).returning();
      if("marker" in corrected&&corrected.unitReview?.status!=="pending")
        await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"plan")));
      return {id:row.id,kind:row.kind,payload:corrected,createdAt:row.createdAt};
    });
  }
  private microbiomeFoodSources(rows:any[]):MicrobiomeFoodSource[]{return rows.flatMap(row=>{const data=row.processingStatus==='completed'?viomeSource(row.structuredData):null;if(!data||data.documentKind!=='health-scores-foods'||!data.foods.length)return[];const foods=data.foods.map(food=>({name:food.correctedName||food.name,reportedCategory:food.correctedCategory||food.reportedCategory,sourcePage:food.position.page,sourceColumn:food.position.column,notes:null}));const revision=createHash('sha256').update(JSON.stringify(['microbiome-food-source-v1',row.id,foods,data.biologicalDates])).digest('hex');return[{id:row.id,revision,provider:data.provider,date:data.biologicalDates.collectedOn||data.biologicalDates.reportedOn||null,foods}];});}
  async getMicrobiomeFood(userId:string){
   const context=contextSchema.parse(await this.getPrecisionContext(userId)||{}),control=context.microbiomeFood||{enabled:false,reportId:null,reportRevision:null,ignoredFoodIds:[],nonce:null};
   const rows=await this.db.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,userId));
   const sources=this.microbiomeFoodSources(rows);const source=sources.find(row=>row.id===control.reportId&&row.revision===control.reportRevision)||null;
   return{control,revision:createHash('sha256').update(JSON.stringify(['microbiome-food-setting-v1',userId,control])).digest('hex'),sources,source};
  }
  async putMicrobiomeFood(userId:string,input:MicrobiomeFoodControl,expected:string){
   await this.db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
    const[profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));const prior=profile?contextSchema.parse(decryptPrecision(profile.encryptedContext,userId)):contextSchema.parse({});
    const current=prior.microbiomeFood||{enabled:false,reportId:null,reportRevision:null,ignoredFoodIds:[],nonce:null};
    const actual=createHash('sha256').update(JSON.stringify(['microbiome-food-setting-v1',userId,current])).digest('hex');
    const same=JSON.stringify({...current,nonce:undefined})===JSON.stringify({...input,nonce:undefined});
    if(actual!==expected&&!same)throw Error('MICROBIOME_FOOD_CHANGED');if(same)return;
    if(input.enabled){const rows=await tx.select().from(microbiomeSamples).where(eq(microbiomeSamples.userId,userId));if(!this.microbiomeFoodSources(rows).some(row=>row.id===input.reportId&&row.revision===input.reportRevision))throw Error('MICROBIOME_FOOD_CHANGED');}
    const encryptedContext=encryptPrecision({...prior,microbiomeFood:{...input,nonce:randomUUID()}},userId);
    await tx.insert(precisionProfiles).values({userId,encryptedContext}).onConflictDoUpdate({target:precisionProfiles.userId,set:{encryptedContext,updatedAt:new Date()}});
   });
   return this.getMicrobiomeFood(userId);
  }
  async getLabSources(userId:string):Promise<LabSourceSummary[]>{return labSourceGroups(userId,await this.getPrecisionRecords(userId)).map(group=>group.summary);}
  async deleteLabSource(userId:string,id:string,revision:string):Promise<void>{
   await this.db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
    const stored=await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId));
    const records=stored.map(row=>({id:row.id,kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt}));
    const group=labSourceGroups(userId,records).find(group=>group.summary.id===id);
    if(!group)return; // Same authoritative absence response for missing or foreign sources.
    if(!group.valid||group.summary.revision!==revision)throw Error('LAB_SOURCE_CHANGED');
    const ids=group.members.map(row=>row.id),removed=new Set(ids);
    const plans=records.filter(row=>{const plan=row.payload as any;return row.kind==='plan'&&plan?.type==='weekly-plan'&&Array.isArray(plan.inputGuard?.sourceRecordIds)&&plan.inputGuard.sourceRecordIds.some((id:unknown)=>typeof id==='string'&&removed.has(id));}).map(row=>row.id);
    await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),inArray(precisionRecords.id,[...ids,...plans])));
   });
  }
  // Explicit logical-entry deletion; typed lab rows cannot use the generic row-only endpoint.
  async deleteLabEntry(userId: string, id: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
      const rows = await tx.select({ id: precisionRecords.id, encryptedPayload: precisionRecords.encryptedPayload })
        .from(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "lab")));
      if (!rows.some(row => row.id === id)) return; // Idempotent, same response for absent/foreign IDs.
      const supported: (Lab & { id: string })[] = [];
      const raw: (SourceOnlyLab & {id:string})[] = [];
      const links = new Map<string, Set<string>>(rows.map(row => [row.id, new Set<string>()]));
      for (const row of rows) {
        const payload = decryptPrecision(row.encryptedPayload, userId);
        const parsed = labSchema.safeParse(payload);
        if (parsed.success) {
          supported.push({ ...parsed.data, id: row.id });
          const parent = parsed.data.unitReview?.supersedes;
          if (parent && links.has(parent)) {
            links.get(row.id)!.add(parent);
            links.get(parent)!.add(row.id);
          }
        } else {
          const parsedRaw=sourceOnlyLabSchema.safeParse(payload);
          if(!parsedRaw.success)throw Error("LAB_SOURCE_CHANGED");
          raw.push({...parsedRaw.data,id:row.id});
        }
      }
      for(const row of [...supported,...raw]){
        const parent=row.dateCorrection?.supersedes;
        if(parent&&links.has(parent)){links.get(row.id)!.add(parent);links.get(parent)!.add(row.id);}
      }
      const active = activeLabObservations(supported);
      if (!activeLabRows([...supported,...raw]).some(row => row.id === id))
        throw Error("LAB_SOURCE_CHANGED");
      const ids = [id], seen = new Set(ids);
      for (let index = 0; index < ids.length; index++) {
        for (const linked of Array.from(links.get(ids[index])!)) {
          if (!seen.has(linked)) { seen.add(linked); ids.push(linked); }
        }
      }
      await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "lab"), inArray(precisionRecords.id, ids)));
      if (active.labs.some(row => seen.has(row.id)))
        await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "plan")));
    });
  }
  async deletePrecisionRecord(userId: string, id: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      const[target]=await tx.select({kind:precisionRecords.kind}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      if(target?.kind==="genetics")throw new GeneticSourceError("read-only");
      if(target?.kind==="lab"){
        const[row]=await tx.select({encryptedPayload:precisionRecords.encryptedPayload}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
        const payload=decryptPrecision(row.encryptedPayload,userId);
        if(labSchema.safeParse(payload).success||sourceOnlyLabSchema.safeParse(payload).success)throw Error("LAB_LOGICAL_DELETE_REQUIRED");
      }
      const removed = await tx
        .delete(precisionRecords)
        .where(
          and(eq(precisionRecords.userId, userId), eq(precisionRecords.id, id)),
        )
         .returning({ id: precisionRecords.id, kind: precisionRecords.kind,
          labPayload:sql<unknown>`CASE WHEN ${precisionRecords.kind} = 'lab' THEN ${precisionRecords.encryptedPayload} ELSE NULL END` });
      if (!removed.length) return false;
      let sourceOnly=false;
      if(removed[0].kind==="lab")try{sourceOnly=sourceOnlyLabSchema.safeParse(decryptPrecision(removed[0].labPayload,userId)).success;}catch{/* Unreadable sources retain conservative plan invalidation. */}
      // Validated raw-only facts never entered a clinical plan's input set.
      if (removed[0].kind !== "plan" && !sourceOnly)
        await tx
          .delete(precisionRecords)
          .where(
            and(
              eq(precisionRecords.userId, userId),
              eq(precisionRecords.kind, "plan"),
            ),
          );
      return true;
    });
  }
  private async writeGeneticControl(tx:any,userId:string,control:GeneticsSourceControl){
    const[profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
    const prior=profile?contextSchema.parse(decryptPrecision(profile.encryptedContext,userId)):contextSchema.parse({});
    const encryptedContext=encryptPrecision({...prior,geneticsSelection:control},userId);
    await tx.insert(precisionProfiles).values({userId,encryptedContext}).onConflictDoUpdate({target:precisionProfiles.userId,set:{encryptedContext,updatedAt:new Date()}});
  }
  private async removeGeneticPlans(tx:any,userId:string,sourceId:string){
    const plans=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"plan")));
    const ids=plans.flatMap((row:any)=>{const payload=decryptPrecision(row.encryptedPayload,userId)as any;return payload?.type==="weekly-plan"&&Array.isArray(payload.inputGuard?.sourceRecordIds)&&payload.inputGuard.sourceRecordIds.includes(sourceId)?[row.id]:[];});
    if(ids.length)await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"plan"),inArray(precisionRecords.id,ids)));
  }
  private geneticSourceVersion(userId:string,row:PrecisionRecord){return createHash("sha256").update(JSON.stringify(["genetic-source-v1",userId,row.id,row.kind,row.createdAt,row.payload])).digest("hex");}
  private geneticSnapshot(userId:string,records:PrecisionRecord[],context:PrecisionContext):GeneticSourceSnapshot{
    const selected=selectedGeneticSource(records,context.geneticsSelection);
    const sources=records.filter(r=>r.kind==="genetics").map(row=>{
      const parsed=precisionEntrySchema.safeParse({kind:"genetics",payload:row.payload}),data=parsed.success&&parsed.data.kind==="genetics"?parsed.data.payload:null;
      return{id:row.id,revision:this.geneticSourceVersion(userId,row),provider:data?.provider||"unrecognized" as const,createdAt:new Date(row.createdAt).toISOString(),collectedAt:data?.collectedAt||null,callCount:data?(data.provider==="manual"?data.entries.length:data.calls.length):null,readable:!!data,active:!!data&&row.id===selected?.id};
    });
    const selectionRevision=createHash("sha256").update(JSON.stringify(["genetic-selection-v1",userId,context.geneticsSelection||{legacySourceId:selected?.id||null}])).digest("hex");
    return{selectionRevision,activeId:sources.find(row=>row.active)?.id||null,state:sources.some(row=>row.active)?"active":context.geneticsSelection?.sourceId===null||!selected&&!context.geneticsSelection?.sourceId?"none":"unavailable",sources};
  }
  async getGeneticSources(userId:string):Promise<GeneticSourceSnapshot>{
    if(!userId)throw new GeneticSourceError("invalid");
    const[records,raw]=await Promise.all([this.getPrecisionRecords(userId),this.getPrecisionContext(userId)]);
    return this.geneticSnapshot(userId,records,contextSchema.parse(raw||{}));
  }
  async changeGeneticSource(userId:string,command:GeneticSourceCommand):Promise<GeneticSourceSnapshot>{
    if(!userId||!geneticSourceCommandSchema.safeParse(command).success)throw new GeneticSourceError("invalid");
    return this.db.transaction(async(tx:any)=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
      const stored=await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId)).orderBy(desc(precisionRecords.createdAt));
      const records:PrecisionRecord[]=stored.map((row:any)=>({id:row.id,kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt}));
      const[profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));const context=contextSchema.parse(profile?decryptPrecision(profile.encryptedContext,userId):{}),snapshot=this.geneticSnapshot(userId,records,context);
      const target=command.sourceId?records.find(row=>row.kind==="genetics"&&row.id===command.sourceId):undefined;
      // Authoritative absence in this account is a safe deletion retry; it
      // never clears a newer active source or reveals a foreign dataset.
      if(command.action==="delete"&&!target)return snapshot;
      if(command.sourceId&&(!target||this.geneticSourceVersion(userId,target)!==command.sourceRevision))throw new GeneticSourceError(target?"changed":"unavailable");
      const selected=selectedGeneticSource(records,context.geneticsSelection);
      if(command.action==="activate"){
        const parsed=target?precisionEntrySchema.safeParse({kind:"genetics",payload:target.payload}):null;
        if(target&&!parsed?.success)throw new GeneticSourceError("invalid");
        const already=(context.geneticsSelection?.sourceId===command.sourceId);
        if(command.selectionRevision!==snapshot.selectionRevision){if(already)return snapshot;throw new GeneticSourceError("changed");}
        if(already)return snapshot;
        await this.writeGeneticControl(tx,userId,{sourceId:command.sourceId,revision:randomUUID()});
      }else{
        if(command.selectionRevision!==snapshot.selectionRevision)throw new GeneticSourceError("changed");
        await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"genetics"),eq(precisionRecords.id,target!.id)));
        if(selected?.id===target!.id)await this.writeGeneticControl(tx,userId,{sourceId:null,revision:randomUUID()});
        await this.removeGeneticPlans(tx,userId,target!.id);
      }
      const nextRows=await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId)).orderBy(desc(precisionRecords.createdAt));const[nextProfile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      return this.geneticSnapshot(userId,nextRows.map((row:any)=>({id:row.id,kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt})),contextSchema.parse(nextProfile?decryptPrecision(nextProfile.encryptedContext,userId):{}));
    });
  }
  async clearPrecisionData(userId: string): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      await tx
        .delete(precisionRecords)
        .where(eq(precisionRecords.userId, userId));
      await tx
        .delete(precisionProfiles)
        .where(eq(precisionProfiles.userId, userId));
    });
  }
}
