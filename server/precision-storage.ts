import {conditionContextCommandSchema,type ConditionContextCommand,type ConditionContextView} from '../shared/condition-context';
import {investigationSharingSchema,investigationSharingCommandSchema,giSourceContextSchema,GiSourceError,type InvestigationSharing,type InvestigationSharingCommand} from '../shared/gi-source-context';
import {geneticSourceRevision} from './genetic-source-version';
import {referenceHash,referenceStreamId,referenceSourceRevision,referenceCorrectionView} from './lab-reference-corrections';
import {labReferenceCorrectionCommandSchema,labReferenceCorrectionSchema,type LabReferenceCorrectionCommand} from '../shared/lab-reference-correction';
import {copiedReferenceIntervalForPlot} from '../shared/lab-reference-interval';
import {LAB_REPORT_METADATA_KIND,labReportMetadataSchema,labReportMetadataCommandSchema,LabReportMetadataError,type LabReportMetadataCommand,type LabReportMetadata,type LabReportMetadataView} from '../shared/lab-report-metadata';
import {labSourceReviewSchema,labReviewRevisionText,applyLabSourceReview,type LabSourceReview} from '../shared/lab-source-review';
import{knownPlanUsesSources}from'./plan-history';
import{viomeSource}from"../shared/viome-report-context";
import type{MicrobiomeFoodSource,MicrobiomeFoodControl}from"../shared/microbiome-food-influence";
import type{LabSourceSummary}from"../shared/lab-history";
import{selectedGeneticSource,healthContextOnly,geneticSourceCommandSchema,GeneticSourceError,type GeneticSourceSnapshot,type GeneticSourceCommand,type GeneticsSourceControl}from"../shared/genetic-source-selection";
import {possibleLabReimports} from "../shared/lab-reimport";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import {labDateChangeSchema,applyLabDateChange,type LabDateChange} from "../shared/lab-date-correction";
import { createHash,randomUUID } from "node:crypto";
import { isDeepStrictEqual } from "node:util";
import { precisionProfiles, precisionRecords,labReportMetadataVersions, users,microbiomeSamples } from "../shared/schema";
import { labSchema, sourceOnlyLabSchema, contextSchema,checkinSchema,precisionEntrySchema, activeLabObservations, activeLabRows, canonicalLab, type Lab, type SourceOnlyLab } from "../shared/precision-nutrition";
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

const zUuid=(value:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

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
  const parents=[fact.sourceCorrection?.supersedes,fact.dateCorrection?.supersedes,...('unitReview'in fact?[fact.unitReview?.supersedes]:[])];
  for(const parent of parents)if(parent&&byId.has(parent)){links.get(row.id)!.add(parent);links.get(parent)!.add(row.id);}
 }
 for(const ids of Array.from(imports.values()))for(const id of ids.slice(1)){links.get(ids[0])!.add(id);links.get(id)!.add(ids[0]);}
 const visited=new Set<string>();return rows.flatMap(row=>{if(visited.has(row.id))return[];const ids=[row.id];visited.add(row.id);for(let i=0;i<ids.length;i++)for(const next of Array.from(links.get(ids[i])!))if(!visited.has(next)){visited.add(next);ids.push(next);}ids.sort();
  const members=ids.map(id=>byId.get(id)!),parsed=ids.flatMap(id=>facts.has(id)?[{...facts.get(id)!,id}]:[]);
  const sourceKeys=Array.from(new Set(parsed.flatMap(fact=>fact.sourceReport?[JSON.stringify([fact.sourceReport.importId,fact.sourceReport.reportIdentifier??null,fact.sourceReport.specimenIdentifier??null])]:[]))).sort();
  // Conflicting explicitly recorded source identities are not silently combined into a report.
  const roots=ids.filter(id=>{const fact=facts.get(id);return !fact||!(fact.sourceCorrection?.supersedes||fact.dateCorrection?.supersedes||('unitReview'in fact&&fact.unitReview?.supersedes));});
  const valid=sourceKeys.length<=1&&(sourceKeys.length===1||roots.length===1);
  const key=sourceKeys.length===1?['import',sourceKeys[0]]:['entry',roots[0]??ids[0]];
  const legacyKey=sourceKeys.length===1?['import',sourceKeys[0]]:['entry',ids[0]];
  const legacyId=createHash('sha256').update(JSON.stringify(['lab-source-v1',userId,legacyKey])).digest('hex');
  const id=createHash('sha256').update(JSON.stringify(['lab-source-v1',userId,key])).digest('hex');
  const revision=createHash('sha256').update(JSON.stringify(['lab-source-version-v1',userId,members])).digest('hex');
  const detailRecordId=activeLabRows(parsed)[0]?.id;
  const savedTimes=members.map(row=>+new Date(row.createdAt)).filter(Number.isFinite),savedAt=savedTimes.length?new Date(Math.min(...savedTimes)).toISOString():null;
  const summary:LabSourceSummary={id,revision,manageable:valid,savedAt,groupKey:sourceKeys.length===1?sourceKeys[0]:null,originalLaboratories:Array.from(new Set(parsed.map(fact=>fact.laboratory))),reportIdentifiers:Array.from(new Set(parsed.flatMap(fact=>fact.sourceReport?.reportIdentifier?[fact.sourceReport.reportIdentifier]:[]))),specimenIdentifiers:Array.from(new Set(parsed.flatMap(fact=>fact.sourceReport?.specimenIdentifier?[fact.sourceReport.specimenIdentifier]:[]))),dateContexts:activeLabRows(parsed).map(fact=>({date:fact.dateCorrection?.enteredDate||fact.sourceReport?.enteredDate||fact.measuredAt.slice(0,10),precision:fact.dateCorrection?.enteredDate?(fact.dateCorrection.enteredTime?'source-time':'source-date'):fact.sourceReport?.enteredDate?(fact.sourceReport.enteredTime?'source-time':'source-date'):'stored-timestamp-only'})),...(detailRecordId?{detailRecordId}:{}),scope:sourceKeys.length===1?'report':'result',results:parsed.length===members.length?activeLabRows(parsed).length:null,records:members.length,dates:Array.from(new Set(parsed.map(fact=>fact.dateCorrection?.enteredDate||fact.sourceReport?.enteredDate||fact.measuredAt.slice(0,10)))).sort()};
  return[{summary,members,valid,legacyId}];
 });
}
const isDeletedGi=(value:unknown)=>!!value&&typeof value==='object'&&'deletedGiSource'in value&&value.deletedGiSource===true;
export class PrecisionStorage {
  constructor(private readonly db: PrecisionDatabase) {}
  async getPrecisionContext(userId: string): Promise<unknown> {
    const [row] = await this.db
      .select()
      .from(precisionProfiles)
      .where(eq(precisionProfiles.userId, userId));
    return row ? decryptPrecision(row.encryptedContext, userId) : undefined;
  }
  private contextSourceRevision(userId:string,raw:unknown){
    if(raw===undefined||!contextSchema.parse(raw).investigationSharing)throw new GiSourceError(409,'Health context or account data changed. Reload before saving.');
    return createHash('sha256').update(JSON.stringify(['precision-context-source-v1',userId,raw])).digest('hex');
  }
  async getPrecisionContextSource(userId:string){
    await this.getInvestigationSharing(userId);
    const context=await this.getPrecisionContext(userId);
    return {context,revision:this.contextSourceRevision(userId,context)};
  }
  async putPrecisionContext(
    userId: string,
    context: PrecisionContext,
    expectedRevision?:string,
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      if(context.geneticsSelection!==undefined||context.microbiomeFood!==undefined||context.investigationSharing!==undefined||context.conditionSource!==undefined)throw new GeneticSourceError("read-only");
      const[selectionProfile]=await tx.select({encryptedContext:precisionProfiles.encryptedContext}).from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      const raw=selectionProfile?decryptPrecision(selectionProfile.encryptedContext,userId):undefined;
      if(expectedRevision!==undefined&&(!/^[a-f0-9]{64}$/.test(expectedRevision)||!selectionProfile||this.contextSourceRevision(userId,raw)!==expectedRevision))throw new GiSourceError(409,'Saved health context changed. Your draft was not applied. Reload the saved source before retrying.');
      const selectionContext=raw===undefined?undefined:contextSchema.parse(raw);
      if(selectionContext?.conditionSource&&!isDeepStrictEqual(context.conditions,selectionContext.conditions))throw new GiSourceError(409,'Condition selections changed. Refresh before saving other health context.');
      let next:PrecisionContext={...context,...(selectionContext?.conditionSource?{conditions:selectionContext.conditions,conditionSource:selectionContext.conditionSource}:{}),...(selectionContext?.microbiomeFood?{microbiomeFood:selectionContext.microbiomeFood}:{}),...(selectionContext?.geneticsSelection?{geneticsSelection:selectionContext.geneticsSelection}:{}),...(selectionContext?.investigationSharing?{investigationSharing:selectionContext.investigationSharing}:{})};
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
  private conditionView(userId:string,raw:unknown):ConditionContextView{
    const context=contextSchema.parse(raw);
    if(context.conditionSource&&((context.conditionSource.assertion==='reported')!==(context.conditions.length>0)))throw new GiSourceError(503,'Condition source assertions are inconsistent.');
    if(!context.investigationSharing)throw new GiSourceError(409,'Account sources changed. Reload condition selections.');
    return {revision:createHash('sha256').update(JSON.stringify(['condition-context-v1',userId,context.investigationSharing.revision,context.conditionSource??null,context.conditions])).digest('hex'),conditions:context.conditions,assertion:context.conditionSource?.assertion??(context.conditions.length?'reported':'unknown'),source:context.conditionSource?'user-selected-unverified':'legacy-unverified'};
  }
  async getConditionContext(userId:string):Promise<ConditionContextView>{
    await this.getInvestigationSharing(userId);
    return this.conditionView(userId,await this.getPrecisionContext(userId));
  }
  async putConditionContext(userId:string,command:ConditionContextCommand):Promise<ConditionContextView>{
    const input=conditionContextCommandSchema.parse(command);
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
      const[row]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      if(!row)throw new GiSourceError(409,'Account sources changed. Reload condition selections.');
      const raw=decryptPrecision(row.encryptedContext,userId),view=this.conditionView(userId,raw);
      const context=contextSchema.parse(raw);
      if(view.revision!==input.revision){
        if(context.conditionSource?.previousRevision===input.revision&&context.conditionSource.sharingRevision===context.investigationSharing?.revision&&view.assertion===input.assertion&&isDeepStrictEqual(view.conditions,input.conditions))return view;
        throw new GiSourceError(409,'Condition selections or privacy choices changed. Reload before saving.');
      }
      if(context.conditionSource&&view.assertion===input.assertion&&isDeepStrictEqual(view.conditions,input.conditions))return view;
      const next={...raw as object,conditions:input.conditions,conditionSource:{version:1 as const,revision:randomUUID(),previousRevision:input.revision,sharingRevision:context.investigationSharing!.revision,assertion:input.assertion,confirmedAt:new Date().toISOString()}};
      contextSchema.parse(next);
      await tx.update(precisionProfiles).set({encryptedContext:encryptPrecision(next,userId),updatedAt:new Date()}).where(eq(precisionProfiles.userId,userId));
      return this.conditionView(userId,next);
    });
  }
  /** Same encrypted canonical context, same account lock. Initializing an opaque
   * source-write revision grants no inference permission: both scopes start OFF. */
  async getInvestigationSharing(userId:string):Promise<InvestigationSharing>{
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
      const[user]=await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for('key share');
      if(!user)throw new GiSourceError(404,'Account source is unavailable.');
      const[row]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      const raw=row?decryptPrecision(row.encryptedContext,userId):{};contextSchema.parse(raw);
      const current=(raw as any).investigationSharing;if(current!==undefined)return investigationSharingSchema.parse(current);
      const state:InvestigationSharing={version:1,revision:randomUUID(),changedAt:new Date().toISOString(),medicationChronology:false,menstrualPelvic:false};
      const encryptedContext=encryptPrecision({...raw as object,investigationSharing:state},userId);
      await tx.insert(precisionProfiles).values({userId,encryptedContext}).onConflictDoUpdate({target:precisionProfiles.userId,set:{encryptedContext,updatedAt:new Date()}});return state;
    });
  }
  async putInvestigationSharing(userId:string,command:InvestigationSharingCommand):Promise<InvestigationSharing>{
    const input=investigationSharingCommandSchema.parse(command);
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
      const[row]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      const raw=row?decryptPrecision(row.encryptedContext,userId):{},current=investigationSharingSchema.safeParse((raw as any).investigationSharing);
      if(!current.success||current.data.revision!==input.revision)throw new GiSourceError(409,'Privacy choices changed. Refresh before saving.');
      if(current.data.medicationChronology===input.medicationChronology&&current.data.menstrualPelvic===input.menstrualPelvic)return current.data;
      const state:InvestigationSharing={version:1,revision:randomUUID(),changedAt:new Date().toISOString(),medicationChronology:input.medicationChronology,menstrualPelvic:input.menstrualPelvic};
      await tx.update(precisionProfiles).set({encryptedContext:encryptPrecision({...raw as object,investigationSharing:state},userId),updatedAt:new Date()}).where(eq(precisionProfiles.userId,userId));return state;
    });
  }
  private checkinSourceView(userId:string,row:{id:string;kind:string;encryptedPayload:unknown;createdAt:Date}){
    const payload=checkinSchema.parse(decryptPrecision(row.encryptedPayload,userId));
    const record={id:row.id,kind:row.kind,payload,createdAt:row.createdAt};
    return {record,revision:createHash('sha256').update(JSON.stringify(['checkin-source-v1',userId,record])).digest('hex')};
  }
  async getCheckinSource(userId:string,id:string){
    const[row]=await this.db.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id),eq(precisionRecords.kind,'checkin')));
    return row&&!isDeletedGi(decryptPrecision(row.encryptedPayload,userId))?this.checkinSourceView(userId,row):null;
  }
  async insertGiCheckin(userId:string,payload:unknown,key:string,sharingRevision:string):Promise<PrecisionRecord>{
    const input=checkinSchema.parse(payload);
    if(!input.gi||input.giSource||!zUuid(key)||!zUuid(sharingRevision))throw new GiSourceError(400,'Review the check-in details and current source reference.');
    const id=createHash('sha256').update(JSON.stringify(['gi-checkin-save-v1',userId,key])).digest('hex');
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
      const[profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      const raw=profile?decryptPrecision(profile.encryptedContext,userId):{},sharing=investigationSharingSchema.safeParse((raw as any).investigationSharing);
      if(!sharing.success||sharing.data.revision!==sharingRevision)throw new GiSourceError(409,'Source privacy or account data changed. Review the current journal before starting a new entry.');
      const[existing]=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      if(existing){
        if(existing.kind!=='checkin'||isDeletedGi(decryptPrecision(existing.encryptedPayload,userId)))throw new GiSourceError(409,'This entry was removed. Start a new entry if intended.');
        const view=this.checkinSourceView(userId,existing),{giSource,...prior}=view.record.payload;
        if(!isDeepStrictEqual(prior,input))throw new GiSourceError(409,'This save reference belongs to different source details.');
        return view.record;
      }
      const data=checkinSchema.parse({...input,giSource:{version:1,revision:randomUUID(),learnedAt:new Date().toISOString(),previousSourceRevision:null}});
      const[row]=await tx.insert(precisionRecords).values({id,userId,kind:'checkin',encryptedPayload:encryptPrecision(data,userId)}).returning();
      return this.checkinSourceView(userId,row).record;
    });
  }
  async updateGiCheckin(userId:string,id:string,sourceRevision:string,sharingRevision:string,gi:unknown){
    const context=giSourceContextSchema.parse(gi);
    if(!/^[a-f0-9]{64}$/.test(sourceRevision)||!zUuid(sharingRevision))throw new GiSourceError(400,'Review the current check-in source.');
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
      const[profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
      const raw=profile?decryptPrecision(profile.encryptedContext,userId):{},sharing=investigationSharingSchema.safeParse((raw as any).investigationSharing);
      if(!sharing.success||sharing.data.revision!==sharingRevision)throw new GiSourceError(409,'Source privacy or account data changed. Refresh before saving.');
      const[row]=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id),eq(precisionRecords.kind,'checkin'))).for('update');
      if(!row||isDeletedGi(decryptPrecision(row.encryptedPayload,userId)))throw new GiSourceError(404,'Check-in source is no longer available.');
      const current=this.checkinSourceView(userId,row);if(current.revision!==sourceRevision)throw new GiSourceError(409,'This check-in changed. Review the latest source before saving.');
      const payload=checkinSchema.parse({...current.record.payload,gi:context,giSource:{version:1,revision:randomUUID(),learnedAt:new Date().toISOString(),previousSourceRevision:sourceRevision}});
      const encryptedPayload=encryptPrecision(payload,userId);
      await tx.update(precisionRecords).set({encryptedPayload}).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      return this.checkinSourceView(userId,{...row,encryptedPayload});
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
    })).filter(row=>!isDeletedGi(row.payload));
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
    if(kind==='checkin'&&payload&&typeof payload==='object'&&('gi'in payload||'giSource'in payload))throw new GiSourceError(400,'Use the source-reviewed GI check-in action.');
    if(kind===LAB_REPORT_METADATA_KIND)throw new LabReportMetadataError(400,'Use the source-reviewed report metadata action.');
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
      if (kind === "lab" && (plan?.sourceCorrection && plan?.unitReview?.status !== "confirmed" || plan?.dateCorrection && plan?.unitReview?.status !== "confirmed")) throw Error("LAB_SOURCE_CHANGED");
      if(reviewedLabMatches!==undefined){
        const known=labSchema.safeParse(payload),raw=sourceOnlyLabSchema.safeParse(payload);
        const incoming=known.success?known.data:raw.success?raw.data:null;
        if(kind!=="lab"||!saveKey||!incoming||incoming.sourceCorrection||incoming.dateCorrection||("unitReview" in incoming&&incoming.unitReview&&(incoming.unitReview.status!=="pending"||incoming.unitReview.confirmedAt!==null||incoming.unitReview.supersedes!==null||incoming.value!==incoming.unitReview.originalValue)))throw Error("LAB_SOURCE_CHANGED");
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
        if(!parsed.success||(!isDeepStrictEqual(parsed.data.dateCorrection,plan.dateCorrection)||!isDeepStrictEqual(parsed.data.sourceCorrection,plan.sourceCorrection)))throw Error("LAB_SOURCE_CHANGED");
        if(prior){const record=decoded.find(row=>row.id===prior.id)!;return {id:record.id,kind:record.kind,payload:record.payload,createdAt:record.createdAt};}
        if(!active.some(row=>row.id===source?.id))throw Error("LAB_SOURCE_CHANGED");
        if(!parsed.success || parsed.data.unitReview?.status!=="pending" ||
          parsed.data.unitReview.originalValue!==plan.value || parsed.data.marker!==plan.marker)
          throw Error("LAB_SOURCE_CHANGED");
      }

      if (kind === "plan" && plan?.type === "weekly-plan") {
        if(plan.inputGuard?.microbiomeFood){
          const expected=plan.inputGuard.microbiomeFood;
          if(expected.reportId)await tx.select({id:microbiomeSamples.id}).from(microbiomeSamples).where(and(eq(microbiomeSamples.userId,userId),eq(microbiomeSamples.id,expected.reportId))).for('share');
          const current=await new PrecisionStorage(tx).getMicrobiomeFood(userId);
          if(current.revision!==expected.settingRevision||expected.reportId!==(current.control.enabled?current.source?.id||null:null)||expected.reportRevision!==(current.control.enabled?current.source?.revision||null:null))throw Error("PRECISION_INPUTS_CHANGED");
        }
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
      await this.removeSourcePlans(tx,userId,new Set([sourceId]));
      return {id:row.id,kind:row.kind,payload:corrected,createdAt:row.createdAt};
    });
  }
  async reviewLabSource(userId:string,sourceId:string,input:LabSourceReview,saveKey:string):Promise<PrecisionRecord>{
    const request=labSourceReviewSchema.parse(input);
    if(!/^[A-Za-z0-9_-]{8,128}$/.test(saveKey))throw Error("LAB_REVIEW_INVALID");
    const id="lab_review_"+createHash("sha256").update(JSON.stringify(["lab-source-review-v1",userId,saveKey])).digest("hex");
    const fingerprint=createHash("sha256").update(JSON.stringify([sourceId,request])).digest("hex");
    return this.db.transaction(async tx=>{
      await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
      const [receipt]=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      if(receipt){
        const parsed=labSchema.safeParse(decryptPrecision(receipt.encryptedPayload,userId));
        if(receipt.kind!=="lab"||!parsed.success||parsed.data.sourceCorrection?.requestFingerprint!==fingerprint)throw Error("PRECISION_SAVE_CONFLICT");
        return{id:receipt.id,kind:receipt.kind,payload:parsed.data,createdAt:receipt.createdAt};
      }
      const rows=await tx.select({id:precisionRecords.id,encryptedPayload:precisionRecords.encryptedPayload}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"lab")));
      if(!rows.some(row=>row.id===sourceId))throw Error("LAB_NOT_FOUND");
      const owned=rows.map(row=>{const payload=decryptPrecision(row.encryptedPayload,userId),known=labSchema.safeParse(payload),raw=sourceOnlyLabSchema.safeParse(payload);if(!known.success&&!raw.success)throw Error("LAB_SOURCE_CHANGED");return{...(known.success?known.data:raw.data!),id:row.id};});
      const source=activeLabRows(owned).find(row=>row.id===sourceId);
      if(!source||createHash("sha256").update(labReviewRevisionText(source)).digest("hex")!==request.expectedRevision)throw Error("LAB_SOURCE_CHANGED");
      const payload=applyLabSourceReview(source,sourceId,request,fingerprint,new Date().toISOString());
      const [row]=await tx.insert(precisionRecords).values({id,userId,kind:"lab",encryptedPayload:encryptPrecision(payload,userId)}).returning();
      await this.removeSourcePlans(tx,userId,new Set([sourceId]));
      return{id:row.id,kind:row.kind,payload,createdAt:row.createdAt};
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
  private async labMetadataReady(tx:any,write=false):Promise<boolean>{
   const result=await tx.execute(sql`SELECT to_regclass('public.lab_report_metadata_versions') IS NOT NULL
    AND EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='lab_report_metadata_immutable' AND tgrelid=to_regclass('public.lab_report_metadata_versions') AND tgenabled='O' AND NOT tgisinternal)
    AND EXISTS(SELECT 1 FROM pg_trigger WHERE tgname='lab_report_metadata_source_cleanup' AND tgrelid=to_regclass('public.precision_records') AND tgenabled='O' AND NOT tgisinternal) AS ready`);
   if(!result.rows[0]?.ready)return false;
   const rights=await tx.execute(sql`SELECT has_table_privilege(current_user,'public.lab_report_metadata_versions','SELECT') AND (${write}=false OR (has_table_privilege(current_user,'public.lab_report_metadata_versions','INSERT') AND has_table_privilege(current_user,'public.lab_report_metadata_versions','DELETE'))) AS allowed`);return !!rights.rows[0]?.allowed;
  }
  private async metadataRows(tx:any,userId:string):Promise<PrecisionRecord[]>{return(await tx.select().from(labReportMetadataVersions).where(eq(labReportMetadataVersions.userId,userId))).map((row:any)=>({id:row.id,kind:LAB_REPORT_METADATA_KIND,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt}));}
  async getLabReportMetadataHistory(userId:string):Promise<{available:boolean;records:PrecisionRecord[]}>{
   try{return await this.db.transaction(async tx=>await this.labMetadataReady(tx)?{available:true,records:await this.metadataRows(tx,userId)}:{available:false,records:[]});}catch{return{available:false,records:[]};}
  }
  private async deleteLabMetadata(tx:any,userId:string,sourceIds:string[]){
   if(!sourceIds.length)return;const exists=await tx.execute(sql`SELECT to_regclass('public.lab_report_metadata_versions') IS NOT NULL AS present`);
   if(exists.rows[0]?.present)await tx.delete(labReportMetadataVersions).where(and(eq(labReportMetadataVersions.userId,userId),inArray(labReportMetadataVersions.sourceId,sourceIds)));
  }
  private labMetadataView(sourceId:string,sourceRevision:string,records:PrecisionRecord[]):LabReportMetadataView{
   const invalid=records.some(row=>{if(row.kind!==LAB_REPORT_METADATA_KIND||labReportMetadataSchema.safeParse(row.payload).success)return false;const claimed=(row.payload as {sourceId?:unknown}|null)?.sourceId;return typeof claimed!=='string'||claimed===sourceId;});
   const candidates=records.filter(row=>row.kind===LAB_REPORT_METADATA_KIND).flatMap(row=>{const parsed=labReportMetadataSchema.safeParse(row.payload);return parsed.success&&parsed.data.sourceId===sourceId?[{id:row.id,payload:parsed.data}]:[];});
   const superseded=new Set(candidates.flatMap(row=>row.payload.supersedes?[row.payload.supersedes]:[])),heads=candidates.filter(row=>!superseded.has(row.id));
   const byId=new Map(candidates.map(row=>[row.id,row])),head=heads.length===1?heads[0]:null,chain:typeof candidates=[];let cursor=head;const visited=new Set<string>();
   while(cursor){if(visited.has(cursor.id))return{current:null,sourceCurrent:false,history:[],historyCount:candidates.length,available:false};visited.add(cursor.id);chain.push(cursor);cursor=cursor.payload.supersedes?byId.get(cursor.payload.supersedes)??null:null;}
   const available=!invalid&&new Set(candidates.map(row=>row.payload.revision)).size===candidates.length&&(candidates.length===0||!!head&&chain.length===candidates.length&&chain.at(-1)?.payload.supersedes===null),current=available?head?.payload??null:null;
   return{current,sourceCurrent:!!current&&current.sourceRevision===sourceRevision,history:chain.slice(1,21).map(row=>({revision:row.payload.revision,recordedAt:row.payload.recordedAt,sourceRevision:row.payload.sourceRevision,identity:row.payload.identity,identityAssertedAt:row.payload.identityAssertedAt,overlay:row.payload.overlay})),historyCount:Math.max(0,candidates.length-1),available};
  }
  async getLabSources(userId:string):Promise<LabSourceSummary[]>{
   const records=await this.getPrecisionRecords(userId),metadata=await this.getLabReportMetadataHistory(userId),indexed=new Map<string,PrecisionRecord[]>(),unattributed:PrecisionRecord[]=[];
   for(const row of metadata.records)if(row.kind===LAB_REPORT_METADATA_KIND){const id=(row.payload as {sourceId?:unknown}|null)?.sourceId;if(typeof id==='string')indexed.set(id,[...(indexed.get(id)||[]),row]);else unattributed.push(row);}
   return labSourceGroups(userId,records).map(group=>{
    const view=metadata.available?this.labMetadataView(group.summary.id,group.summary.revision,[...(indexed.get(group.summary.id)||[]),...unattributed]):{current:null,sourceCurrent:false,history:[],historyCount:0,available:false};
    const facts=group.members.flatMap(row=>{const parsed=labSchema.safeParse(row.payload);return parsed.success?[{...parsed.data,id:row.id}]:[];});
    return{...group.summary,metadata:view,referenceCorrections:{available:metadata.available,observations:activeLabRows(facts).map(fact=>referenceCorrectionView(userId,fact.id,referenceSourceRevision(fact,view.current?.identity??null),metadata.records,metadata.available&&view.available))}};
   });
  }
  async saveLabReferenceCorrection(userId:string,sourceId:string,input:LabReferenceCorrectionCommand,key:string):Promise<LabSourceSummary>{
   input=labReferenceCorrectionCommandSchema.parse(input);if(!/^[a-f0-9-]{36}$/i.test(key))throw new LabReportMetadataError(400,'Choose a valid range save reference.');
   await this.db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
    if(!await this.labMetadataReady(tx,true))throw new LabReportMetadataError(503,'Laboratory range annotations are unavailable. Original observations remain available.');
    const stored=await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId)),records=stored.map(row=>({id:row.id,kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt}));
    const group=labSourceGroups(userId,records).find(group=>group.summary.id===sourceId);
    if(!group)throw new LabReportMetadataError(404,'Laboratory source not found in your account.');
    const facts=group.members.flatMap(row=>{const parsed=labSchema.safeParse(row.payload);return parsed.success?[{...parsed.data,id:row.id}]:[];}),fact=activeLabRows(facts).find(row=>row.id===input.observationId);
    if(!fact)throw new LabReportMetadataError(404,'Current laboratory observation not found in this source.');
    const annotations=await this.metadataRows(tx,userId),provider=this.labMetadataView(sourceId,group.summary.revision,annotations),revision=referenceSourceRevision(fact,provider.current?.identity??null),view=referenceCorrectionView(userId,fact.id,revision,annotations);
    if(!group.valid||!provider.available||!view.available)throw new LabReportMetadataError(409,'The source or range history needs review before changing a range.');
    const stream=referenceStreamId(userId,fact.id),id=referenceHash(['lab-reference-save-v1',userId,stream,key]),fingerprint=referenceHash(input),receipt=annotations.find(row=>row.id===id);
    if(receipt){const parsed=labReferenceCorrectionSchema.safeParse(receipt.payload);if(!parsed.success||parsed.data.requestFingerprint!==fingerprint)throw new LabReportMetadataError(409,'This save reference already contains different range details.');return;}
    if(revision!==input.sourceRevision||(view.current?.revision??null)!==input.expectedCorrectionRevision)throw new LabReportMetadataError(409,'The result, laboratory identity or range changed. Reload and review the latest source.');
    if(input.limits){
     if(fact.unitReview?.status==='pending')throw new LabReportMetadataError(400,'Confirm the original source unit before adding a laboratory range.');
     const comparable=(value:string)=>value.trim().replace(/\s+/g,' ').toLowerCase(),known=(value:string)=>!!value.trim()&&!/^(?:unknown|not supplied|not recorded|unspecified)$/i.test(value.trim());
     const identity=provider.current?.identity,confirmedLaboratory=identity&&identity.provider!=='unknown'?(identity.provider==='other'?identity.otherProvider:identity.provider):fact.laboratory;
     for(const [copied,original,label]of[[input.limits.laboratory,confirmedLaboratory,'laboratory'],[input.limits.reportIdentifier,fact.sourceReport?.reportIdentifier??'','report identifier'],[input.limits.method,fact.method,'method']]){
      if(copied&&known(original)&&comparable(copied)!==comparable(original))throw new LabReportMetadataError(400,`The copied ${label} differs from this saved source. Review its source details before applying a range; absent report details may stay blank.`);
     }
     const canonical=canonicalLab(fact),interval=copiedReferenceIntervalForPlot(fact.marker,{sourceValue:fact.value,sourceUnit:fact.unit,unit:canonical.unit,method:fact.method,sourceInput:fact.sourceInput,unitReview:fact.unitReview},input.limits);
     if(!interval)throw new LabReportMetadataError(400,'The copied unit or assay cannot be validated for this result. Review the original source identity first.');
    }
    const previous=view.current?annotations.find(row=>{const parsed=labReferenceCorrectionSchema.safeParse(row.payload);return parsed.success&&parsed.data.sourceId===stream&&parsed.data.revision===view.current!.revision;}):null;
    const payload=labReferenceCorrectionSchema.parse({version:1,valueKind:'lab-reference-range-correction',sourceId:stream,observationId:fact.id,reportSourceId:sourceId,revision:key,supersedes:previous?.id??null,sourceRevision:revision,limits:input.limits,recordedAt:new Date().toISOString(),requestFingerprint:fingerprint});
    await tx.insert(labReportMetadataVersions).values({id,userId,sourceId:stream,sourceRecordIds:[fact.id],encryptedPayload:encryptPrecision(payload,userId)});
   });
   const source=(await this.getLabSources(userId)).find(row=>row.id===sourceId);if(!source)throw new LabReportMetadataError(404,'The source was removed.');return source;
  }

  async saveLabReportMetadata(userId:string,sourceId:string,input:LabReportMetadataCommand,key:string):Promise<LabSourceSummary>{
   input=labReportMetadataCommandSchema.parse(input);if(!/^[a-f0-9-]{36}$/i.test(key))throw new LabReportMetadataError(400,'Choose a valid report save reference.');
   await this.db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`);
    if(!await this.labMetadataReady(tx,true))throw new LabReportMetadataError(503,'Report annotations are not ready in this deployment. Original observations remain available.');
    const stored=await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId)),records=stored.map(row=>({id:row.id,kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt}));
    const group=labSourceGroups(userId,records).find(group=>group.summary.id===sourceId);if(!group)throw new LabReportMetadataError(404,'Laboratory source not found in your account.');
    const annotations=await this.metadataRows(tx,userId),view=this.labMetadataView(sourceId,group.summary.revision,annotations);
    if(!group.valid||group.summary.results===null||!view.available)throw new LabReportMetadataError(409,'This source or annotation history needs review before metadata can be changed.');
    const id=createHash('sha256').update(JSON.stringify(['lab-report-metadata-v1',userId,sourceId,key])).digest('hex'),receiptHash=createHash('sha256').update(JSON.stringify(input)).digest('hex'),receipt=annotations.find(row=>row.id===id);
    if(receipt){const parsed=labReportMetadataSchema.safeParse(receipt.payload);if(receipt.kind!==LAB_REPORT_METADATA_KIND||!parsed.success||parsed.data.receiptHash!==receiptHash)throw new LabReportMetadataError(409,'This save reference already has different report details.');return{...group.summary,metadata:view};}
    if(group.summary.revision!==input.sourceRevision||(view.current?.revision??null)!==input.metadataRevision)throw new LabReportMetadataError(409,'The source or its laboratory metadata changed. Reload and review the latest report.');
    const changedIdentity=!isDeepStrictEqual(input.identity,view.current?.identity??null),needsReview=!!input.identity&&(changedIdentity||!view.sourceCurrent);
    if((changedIdentity||needsReview)&&!input.identityReviewed)throw new LabReportMetadataError(400,'Confirm the performing laboratory and testing jurisdiction against the source report.');
    const now=new Date().toISOString(),currentRecord=view.current?annotations.find(row=>row.kind===LAB_REPORT_METADATA_KIND&&labReportMetadataSchema.safeParse(row.payload).success&&(row.payload as LabReportMetadata).sourceId===sourceId&&(row.payload as LabReportMetadata).revision===view.current!.revision):undefined;
    const metadata=labReportMetadataSchema.parse({version:1,sourceId,groupKey:group.summary.groupKey??null,revision:key,supersedes:currentRecord?.id??null,sourceRevision:input.sourceRevision,identity:input.identity,identityAssertedAt:input.identity?(input.identityReviewed?now:view.current?.identityAssertedAt??now):null,overlay:input.overlay,recordedAt:now,receiptHash});
    const [saved]=await tx.insert(labReportMetadataVersions).values({id,userId,sourceId,sourceRecordIds:group.members.map(row=>row.id),encryptedPayload:encryptPrecision(metadata,userId)}).returning();
    return{...group.summary,metadata:this.labMetadataView(sourceId,group.summary.revision,[...annotations,{id:saved.id,kind:LAB_REPORT_METADATA_KIND,payload:metadata,createdAt:saved.createdAt}])};
   });
   const source=(await this.getLabSources(userId)).find(row=>row.id===sourceId);if(!source)throw new LabReportMetadataError(404,'The source was removed.');return source;
  }
  async deleteLabSource(userId:string,id:string,revision:string):Promise<void>{
   await this.db.transaction(async tx=>{
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
    const stored=await tx.select().from(precisionRecords).where(eq(precisionRecords.userId,userId));
    const records=stored.map(row=>({id:row.id,kind:row.kind,payload:decryptPrecision(row.encryptedPayload,userId),createdAt:row.createdAt}));
    const group=labSourceGroups(userId,records).find(group=>group.summary.id===id||group.legacyId===id);
    if(!group)return; // Same authoritative absence response for missing or foreign sources.
    if(!group.valid||group.summary.revision!==revision)throw Error('LAB_SOURCE_CHANGED');
    const ids=group.members.map(row=>row.id),removed=new Set(ids);

    const plans=records.filter(row=>row.kind==='plan'&&knownPlanUsesSources(row.payload,removed)).map(row=>row.id);
    await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),inArray(precisionRecords.id,[...ids,...plans])));
    await this.deleteLabMetadata(tx,userId,[group.summary.id]);
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
        for(const parent of [row.dateCorrection?.supersedes,row.sourceCorrection?.supersedes]){
         if(parent&&links.has(parent)){links.get(row.id)!.add(parent);links.get(parent)!.add(row.id);}
        }
      }
      if (!activeLabRows([...supported,...raw]).some(row => row.id === id))
        throw Error("LAB_SOURCE_CHANGED");
      const ids = [id], seen = new Set(ids);
      for (let index = 0; index < ids.length; index++) {
        for (const linked of Array.from(links.get(ids[index])!)) {
          if (!seen.has(linked)) { seen.add(linked); ids.push(linked); }
        }
      }
      await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId, userId), eq(precisionRecords.kind, "lab"), inArray(precisionRecords.id, ids)));
      await this.removeSourcePlans(tx,userId,seen);

    });
  }
  async deletePrecisionRecord(userId: string, id: string): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`,
      );
      const[target]=await tx.select({kind:precisionRecords.kind,encryptedPayload:precisionRecords.encryptedPayload}).from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
      const checkinPayload=target?.kind==='checkin'?decryptPrecision(target.encryptedPayload,userId):undefined;
      if(isDeletedGi(checkinPayload))return true;
      // Deletion must also work for owned legacy observations that predate the
      // current capture schema. Only explicit GI fields need replay protection;
      // their presence also protects correction of a malformed old GI source.
      if(checkinPayload&&typeof checkinPayload==='object'&&(Object.hasOwn(checkinPayload,'gi')||Object.hasOwn(checkinPayload,'giSource'))){
        await tx.update(precisionRecords).set({encryptedPayload:encryptPrecision({deletedGiSource:true},userId)}).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.id,id)));
        await this.removeSourcePlans(tx,userId,new Set([id]));return true;
      }
      if(target?.kind==="genetics")throw new GeneticSourceError("read-only");
      if(target?.kind===LAB_REPORT_METADATA_KIND)throw new LabReportMetadataError(400,'Report annotation history is removed with its laboratory source, not as an observation.');
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
      if(removed[0].kind!=="plan")await this.removeSourcePlans(tx,userId,new Set([id]));
      return true;
    });
  }
  private async writeGeneticControl(tx:any,userId:string,control:GeneticsSourceControl){
    const[profile]=await tx.select().from(precisionProfiles).where(eq(precisionProfiles.userId,userId));
    const prior=profile?contextSchema.parse(decryptPrecision(profile.encryptedContext,userId)):contextSchema.parse({});
    const encryptedContext=encryptPrecision({...prior,geneticsSelection:control},userId);
    await tx.insert(precisionProfiles).values({userId,encryptedContext}).onConflictDoUpdate({target:precisionProfiles.userId,set:{encryptedContext,updatedAt:new Date()}});
  }
  private async removeSourcePlans(tx:any,userId:string,sourceIds:ReadonlySet<string>){
    const plans=await tx.select().from(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"plan")));
    const ids=plans.flatMap((row:any)=>{const payload=decryptPrecision(row.encryptedPayload,userId);return knownPlanUsesSources(payload,sourceIds)?[row.id]:[];});
    if(ids.length)await tx.delete(precisionRecords).where(and(eq(precisionRecords.userId,userId),eq(precisionRecords.kind,"plan"),inArray(precisionRecords.id,ids)));
  }
  private geneticSourceVersion(userId:string,row:PrecisionRecord){return geneticSourceRevision(userId,row);}
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
        await this.removeSourcePlans(tx,userId,new Set([target!.id]));
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
      const metadataTable=await tx.execute(sql`SELECT to_regclass('public.lab_report_metadata_versions') IS NOT NULL AS present`);
      if(metadataTable.rows[0]?.present)await tx.delete(labReportMetadataVersions).where(eq(labReportMetadataVersions.userId,userId));
      await tx
        .delete(precisionProfiles)
        .where(eq(precisionProfiles.userId, userId));
    });
  }
}
