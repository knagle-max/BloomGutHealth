import {investigationSharingSchema} from '../shared/gi-source-context';
import {privateObservationSourceFacts} from './private-observation-source-facts';
import {privateGeneticSourceFacts} from './private-genetic-source-facts';
import {privateMicrobiomeSourceFacts} from './private-microbiome-source-facts';
import { createHash } from 'node:crypto';
import { z } from 'zod';
import { activeLabRows, labSchema, sourceOnlyLabSchema, type Lab, type SourceOnlyLab } from '../shared/precision-nutrition';
import { recordedIntakeSources, intakeCalendarDate } from '../shared/recorded-intake-sources';
import { hasConfirmedLabIdentity } from '../shared/lab-assay-identity';
import { dateKey } from '../shared/experience';
import { recognizedMealTimeZone } from '../shared/meal-time';
import { mealRecordRevision } from './meal-edit';
import { buildWellnessContext } from './wellness-context';
import type { IStorage } from './storage';

const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const windowSchema=z.object({date:dateKey,timeZone:z.string().refine(recognizedMealTimeZone)}).strict();
type SnapshotStore=Pick<IStorage,'getUser'|'getPrecisionContext'|'getPrecisionRecords'|'getMeals'|'getExperienceRecords'>&Partial<Pick<IStorage,'getUserSamples'|'getGeneticSources'>>;
export class InvestigationSnapshotUnavailable extends Error {
  constructor(){super('Authorized investigation sources are unavailable.');}
}
/** Read-only composition of canonical owned readers. Not an HTTP endpoint,
 * consent store or external prompt. Recollect after model work before admitting
 * any output: an epoch match against an old snapshot alone is insufficient. */
export async function collectPrivateInvestigationSnapshot(input:{
  actor:string; purpose:'personal-wellness'; window:unknown;includeMicrobiome?:boolean;includeGenetics?:boolean;
  store:SnapshotStore;
  authorize:(actor:string,purpose:'personal-wellness')=>Promise<boolean>;
  now?:()=>Date;
}) {
  const {actor,store,authorize}=input;
  const window=windowSchema.safeParse(input.window),now=(input.now??(()=>new Date()))();
  if(!actor||input.purpose!=='personal-wellness'||!window.success||!Number.isFinite(+now)||!await authorize(actor,'personal-wellness')) throw new InvestigationSnapshotUnavailable();
  if(input.includeMicrobiome&&!store.getUserSamples)throw new InvestigationSnapshotUnavailable();
  if(input.includeGenetics&&!store.getGeneticSources)throw new InvestigationSnapshotUnavailable();
  const load=()=>Promise.all([
    store.getUser(actor),store.getPrecisionContext(actor),store.getPrecisionRecords(actor),store.getMeals(actor),store.getExperienceRecords(actor,'supplement-intake'),input.includeMicrobiome?store.getUserSamples!(actor):undefined,input.includeGenetics?store.getGeneticSources!(actor):undefined,
    store.getExperienceRecords(actor,'checkin'),store.getExperienceRecords(actor,'hydration'),store.getExperienceRecords(actor,'activity'),store.getExperienceRecords(actor,'session'),
  ]);
  const sources=await load();
  const [user,context,records,meals,supplements,samples,geneticSelection,experienceCheckins,hydration,activities,sessions]=sources;
  const originalSourceDigest=digest(sources);
  if(!user||user.id!==actor||records.length>1000||meals.length>2000||supplements.length>=2000||!await authorize(actor,'personal-wellness')) throw new InvestigationSnapshotUnavailable();
  const microbiome=samples?privateMicrobiomeSourceFacts(actor,samples,now):null;
  const genetics=geneticSelection?privateGeneticSourceFacts(actor,records,geneticSelection,now):null;
  const sharingResult=investigationSharingSchema.safeParse(context&&typeof context==='object'&&'investigationSharing'in context?context.investigationSharing:undefined);
  if(context&&typeof context==='object'&&'investigationSharing'in context&&!sharingResult.success)throw new InvestigationSnapshotUnavailable();
  const sharing=sharingResult.success?sharingResult.data:{medicationChronology:false,menstrualPelvic:false};
  let purposeContext=context;
  if(context&&typeof context==='object'){
    const {medications,currentSupplements,investigationSharing,...ordinary}=context as Record<string,unknown>;
    purposeContext={...ordinary,...(sharing.medicationChronology?{...(medications!==undefined?{medications}:{}),...(currentSupplements!==undefined?{currentSupplements}:{})}:{})};
    if(Array.isArray(ordinary.conditions)&&ordinary.conditions.length===0)delete (purposeContext as Record<string,unknown>).conditions;
  }
  const observations=privateObservationSourceFacts({actor,precision:records,experience:{checkin:experienceCheckins,hydration,activity:activities,session:sessions},asOf:now,viewTimeZone:window.data.timeZone,sharing});
  const wellness=buildWellnessContext(actor,purposeContext,user,now);
  const intake=recordedIntakeSources({actor,...window.data,asOf:now.toISOString(),foods:meals.map(meal=>({id:meal.id,userId:meal.userId,name:meal.mealText.slice(0,160),loggedAt:meal.loggedAt,revision:mealRecordRevision(meal),analysis:meal.intelligence&&typeof meal.intelligence==='object'?meal.intelligence as any:null})),supplements:supplements.map(record=>({...record,userId:'userId'in record?record.userId:actor}))});
  const labRecords=records.filter(record=>record.kind==='lab');
  if(new Set(labRecords.map(record=>record.id)).size!==labRecords.length) throw new InvestigationSnapshotUnavailable();
  let unsupportedLabs=0;
  const parsed:Array<(Lab|SourceOnlyLab)&{id:string}>=labRecords.flatMap<(Lab|SourceOnlyLab)&{id:string}>(record=>{
    const lab=labSchema.safeParse(record.payload);
    if(lab.success)return[{...lab.data,id:record.id}];
    const source=sourceOnlyLabSchema.safeParse(record.payload);
    if(!source.success){unsupportedLabs++;return [];}
    return [{...source.data,id:record.id}];
  });
  const allActive=activeLabRows(parsed);
  const active=allActive.filter((row):row is Lab&{id:string}=>labSchema.safeParse((({id,...payload})=>payload)(row)).success);
  const facts=active.filter(row=>Date.parse(row.measuredAt)<=+now).map(row=>({
    id:`lab:${row.id}`,domain:'lab' as const,sourceId:row.id,revision:digest(row),
    marker:row.marker,amount:row.value,unit:row.unit,occurredAt:row.measuredAt,
    dateBasis:'recorded-measurement-time' as const,laboratory:row.laboratory,method:row.method,fasting:row.fasting,
    referenceLow:row.referenceLow,referenceHigh:row.referenceHigh,
    sourceReport:row.sourceReport??null,sourceInput:row.sourceInput??null,dateCorrection:row.dateCorrection??null,sourceCorrection:row.sourceCorrection??null,
    computationEligible:row.unitReview?.status!=='pending'&&hasConfirmedLabIdentity(row.marker,row),
    sourceOriginal:row.unitReview?{amount:row.unitReview.originalValue,unit:row.unitReview.originalUnit}:null,
  }));
  const sourceFacts=intake.events.flatMap(event=>event.rows.map((row,index)=>({
    id:`intake:${event.key}:${index}`,domain:event.kind,sourceId:event.recordId,revision:event.revision,
    nutrientKey:row.nutrientKey,amount:row.amount,unit:row.unit,state:row.state,occurredAt:event.occurredAt,
    dateBasis:event.kind==='food'?'food-record-time' as const:'confirmed-taken-time' as const,
    chemicalForm:row.chemicalForm,mineralBasis:row.mineralBasis,source:row.source,
  })));
  // Canonical source projection only; no private notes, genotype dumps, recipes,
  // causal windows, guessed doses or inferred unlogged intake are constructed.
  const basis={version:'private-investigation-snapshot-v3',accountScope:actor,purpose:'personal-wellness' as const,window:window.data,investigationSharing:sharingResult.success?sharingResult.data:{medicationChronology:false,menstrualPelvic:false,revision:null},
    facts:[...facts,...sourceFacts,...observations.facts,...(microbiome?.facts??[]),...(genetics?.facts??[])],geneticSource:genetics?{state:genetics.state,selectionRevision:genetics.selectionRevision,source:genetics.source}:null,microbiomeReports:microbiome?.reports.map(({facts,...report})=>report)??[],intakeEvents:intake.events.map(event=>({sourceId:event.recordId,revision:event.revision,kind:event.kind,occurredAt:event.occurredAt,dateBasis:event.kind==='food'?'food-record-time':'confirmed-taken-time',sourceStatus:event.sourceStatus,rowCount:event.rows.length})),observationSources:{feedRevisions:observations.feedRevisions,calendarFilteringBasis:observations.calendarFilteringBasis},wellness,
    missing:{unsupportedLabs,sourceOnlyLabs:allActive.length-active.length,futureLabs:active.length-facts.length,
      intakeCoverage:'partial-or-unknown' as const,intakeExcluded:{undated:intake.undatedEvents,future:intake.futureEvents,unsupported:intake.unsupportedEvents,conflicting:intake.conflictingEvents},
      microbiome:microbiome?(microbiome.reports.length?'source-reports-included' as const:'no-readable-source-reports' as const):'not-collected' as const,microbiomeUnavailable:microbiome?.unavailable??null,microbiomeFuture:microbiome?.future??null,genetics:genetics?genetics.state:'not-collected' as const,activity:observations.stats.activity.projected||observations.stats.session.projected?'source-records-included' as const:'no-readable-source-records' as const,observations:{coverage:observations.coverage,feeds:observations.stats} as const},
  };
  if(!intakeCalendarDate(now.toISOString(),window.data.timeZone)||Buffer.byteLength(JSON.stringify(basis),'utf8')>500_000)throw new InvestigationSnapshotUnavailable();
  // View timestamp is separate from source epoch so an unchanged recollection
  // does not invalidate all work just because wall-clock time advanced.
  const sourceEpoch=digest({...basis,wellness:{...wellness,asOf:undefined}});
  // Optimistic stable-read check across existing stores, not a new ledger or
  // claim of database serializability. Recollect again before later display.
  if(originalSourceDigest!==digest(sources)||originalSourceDigest!==digest(await load())||!await authorize(actor,'personal-wellness'))throw new InvestigationSnapshotUnavailable();
  return {...basis,asOf:now.toISOString(),sourceEpoch,snapshotId:digest([actor,sourceEpoch]),externalTransferPermitted:false as const};
}
