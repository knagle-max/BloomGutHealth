import test from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { getTableConfig } from "drizzle-orm/pg-core";
import * as schema from "../shared/schema";
import { encryptPrecision } from "../server/precision-crypto";
import { AccountExportStorage } from "../server/account-export";
import { registerAccountRoutes } from "../server/account-routes";
import express from "express";

test("account snapshot includes every owned class, decrypts original payloads and isolates another account",async()=>{
 const pg=new PGlite(),previous=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString("base64");
 try {
 const tables=[schema.users,schema.meals,schema.microbiomeSamples,schema.bacterialComposition,schema.metabolites,schema.healthImpacts,schema.mlAnalyses,schema.recommendations,schema.precisionProfiles,schema.precisionRecords,schema.nutritionProducts,schema.experienceSettings,schema.experienceRecords,schema.healthSourceConsents,schema.healthObservations,schema.capabilityPreferences];
 for(const table of tables){const c=getTableConfig(table);await pg.exec(`CREATE TABLE "${c.name}" (${c.columns.map(col=>`"${col.name}" ${col.getSQLType()}`).join(',')})`);}
 const queries:string[]=[];const db=drizzle(pg,{logger:{logQuery(query){queries.push(query);}}}),store=new AccountExportStorage(db as any);
 for(const user of ['a','b']) {
  await db.insert(schema.users).values({id:user,username:user,password:'HASH-MUST-NOT-EXPORT'});
  await db.insert(schema.capabilityPreferences).values({userId:user,enabled:true,grantFingerprint:'AUTH-GRANT-MUST-NOT-EXPORT'});
  await db.insert(schema.meals).values({id:'meal-'+user,userId:user,mealText:user+' lunch',totalCalories:0,nutritionalData:{calories:0,protein:null}});
  await db.insert(schema.microbiomeSamples).values({id:'sample-'+user,userId:user,testDate:new Date('2026-10-01Z'),rawDataPath:'/private/internal.fastq',structuredData:{originalUnit:'percent'}});
  await db.insert(schema.bacterialComposition).values({id:'bac-'+user,sampleId:'sample-'+user,bacterialName:user,taxonomyLevel:'species',abundance:0,genomeData:{gene_count:88,metabolic_pathways:['FORBIDDEN_FUNCTION_SENTINEL']}});
  await db.insert(schema.metabolites).values({id:'met-'+user,sampleId:'sample-'+user,metaboliteName:user,predictedConcentration:9.87654,confidence:.98,productionGenes:['FORBIDDEN_GENE_SENTINEL']});
  await db.insert(schema.healthImpacts).values({id:'impact-'+user,metaboliteId:'met-'+user,impactCategory:'historical',impactDescription:'FORBIDDEN_CLINICAL_SENTINEL',impactScore:9.87654,mechanismOfAction:'FORBIDDEN_MECHANISM_SENTINEL'});
  await db.insert(schema.mlAnalyses).values({id:'analysis-'+user,sampleId:'sample-'+user,analysisType:'historical',modelVersion:'old',results:{owner:user,score:9.87654,advice:'FORBIDDEN_ANALYSIS_SENTINEL'},confidence:.98,explainability:{note:'FORBIDDEN_EXPLANATION_SENTINEL'},analyzedAt:new Date('2026-10-02T12:00:00Z')});
  await db.insert(schema.recommendations).values({id:'rec-'+user,sampleId:'sample-'+user,recommendationType:'historical',category:'old',itemName:'FORBIDDEN_DOSE_SENTINEL',reasoning:'FORBIDDEN_REASONING_SENTINEL',details:'FORBIDDEN_ADVICE_SENTINEL',expectedImpact:.987654});
  const payload={owner:user,value:12,unit:'source-unit',confirmation:'provisional'};
  for(const table of [schema.precisionRecords,schema.nutritionProducts,schema.experienceRecords,schema.healthObservations])await db.insert(table as any).values({id:'private-'+user,userId:user,kind:'lab',sourceKey:'key-'+user,encryptedPayload:encryptPrecision(payload,user)});
  await db.insert(schema.precisionProfiles).values({userId:user,encryptedContext:encryptPrecision(payload,user)});
  await db.insert(schema.experienceSettings).values({userId:user,encryptedPayload:encryptPrecision(payload,user)});
  await db.insert(schema.healthSourceConsents).values({userId:user,provider:'apple_health',encryptedPayload:encryptPrecision(payload,user)});
 }
 await db.insert(schema.precisionRecords).values({id:'saved-plan-a',userId:'a',kind:'plan',encryptedPayload:encryptPrecision({type:'weekly-plan',version:'old',checksPassed:true,request:{targets:{protein:0}},days:[]},'a')});
 await db.insert(schema.precisionRecords).values({id:'legacy-genotype-a',userId:'a',kind:'plan',encryptedPayload:encryptPrecision({type:'weekly-plan',name:'Synthetic old genotype plan',version:'weekly-2026-10-17.1',request:{targets:{protein:0}},checksPassed:true,days:[{meals:[{recipeId:'FORBIDDEN_GENOTYPE_SELECTION',reasons:['Folate-containing ingredients are relevant to recorded MTHFR context; the call does not establish a deficiency or supplement need.']}]}],shoppingList:[{name:'FORBIDDEN_GENOTYPE_SELECTION'}],recommendations:[{name:'FORBIDDEN_GENOTYPE_SELECTION'}]},'a')});
 await db.insert(schema.precisionRecords).values({id:'legacy-precision-a',userId:'a',kind:'plan',encryptedPayload:encryptPrecision({name:'Synthetic precision history',version:'precision-r6',goals:['heart'],recommendations:[{name:'FORBIDDEN_GENOTYPE_SELECTION',reasons:['MTHFR provides secondary folate-pathway context, not a measured deficiency.']}]},'a')});
 const {parseLabPaste}=await import("../shared/lab-paste");const {labSchema}=await import("../shared/precision-nutrition");
 const sourceLab=parseLabPaste("  [ ORIGINAL REPORTED GROUP ]  \nLDL, 0.00, mmol/L","2026-10-15T12:00:00Z","Synthetic source").valid[0].payload;
 sourceLab.sourceReport={importId:"fb001025-1025-4025-8025-000000000001",reportIdentifier:"  SOURCE REPORT / A  ",specimenIdentifier:" specimen-2 "};
 await db.insert(schema.precisionRecords).values({id:"source-lab-a",userId:"a",kind:"lab",encryptedPayload:encryptPrecision(sourceLab,"a")});
 queries.length=0;const a=await store.exportAccount('a'),b=await store.exportAccount('b');
 const exportedSource=a.biology.records.find(record=>record.id==="source-lab-a") as any;
 assert.deepEqual(labSchema.parse(exportedSource.payload),sourceLab);assert.equal(exportedSource.payload.sourceInput.reportedSection,"  [ ORIGINAL REPORTED GROUP ]  ");assert.equal(exportedSource.payload.sourceInput.rowOrder,1);assert.equal(exportedSource.payload.sourceInput.number,"0.00");assert.ok(!b.biology.records.some(record=>record.id==="source-lab-a"));
 const historical=a.biology.records.find(record=>record.id==='saved-plan-a') as any;
 assert.equal(historical.interpretationStatus,'historical_plan_not_revalidated');assert.equal(historical.currentUse,'rebuild_required');assert.equal(historical.payload.checksPassed,true);assert.equal(historical.payload.request.targets.protein,0);
 assert.ok(!b.biology.records.some(record=>record.id==='saved-plan-a'));
 const legacyPrecision=a.biology.records.find(record=>record.id==='legacy-precision-a') as any;assert.equal(legacyPrecision.interpretationStatus,'historical_genotype_ranking_withheld');assert.equal(legacyPrecision.payload.historicalOutput.recordedRecommendations,1);assert.deepEqual(legacyPrecision.payload.goals,['heart']);assert.ok(!b.biology.records.some(record=>record.id==='legacy-precision-a'));
 const withheld=a.biology.records.find(record=>record.id==='legacy-genotype-a') as any;assert.equal(withheld.interpretationStatus,'historical_genotype_ranking_withheld');assert.equal(withheld.payload.historicalOutput.recordedMeals,1);assert.deepEqual(withheld.payload.request,{targets:{protein:0}});assert.ok(!JSON.stringify(a).includes('FORBIDDEN_GENOTYPE_SELECTION'));assert.ok(!b.biology.records.some(record=>record.id==='legacy-genotype-a'));
 assert.equal(a.format,'bloom-account-records-v2');assert.equal(a.derivedOutputPolicy.historicalGeneratedRecords,'metadata-only');
 assert.ok(queries.every(query=>!['predicted_concentration','impact_description','expected_impact','genome_data','results','explainability'].some(column=>query.includes(String.fromCharCode(34)+column+String.fromCharCode(34)))));
 assert.equal(a.gutReports.bacteria[0].abundance,0);assert.equal(a.gutReports.bacteria[0].genomeData,null);assert.deepEqual(a.gutReports.samples[0].structuredData,{originalUnit:'percent'});
 for(const rows of [a.gutReports.metabolites,a.gutReports.healthImpacts,a.gutReports.analyses,a.gutReports.recommendations])assert.equal(rows[0].interpretationStatus,'historical_model_outputs_withheld');
 assert.equal(a.gutReports.analyses[0].results,null);assert.equal(a.gutReports.analyses[0].confidence,null);assert.equal(a.gutReports.analyses[0].createdAt.toISOString(),'2026-10-02T12:00:00.000Z');
 assert.ok((await db.select().from(schema.metabolites)).every(row=>row.predictedConcentration!>9));
 assert.ok((await db.select().from(schema.mlAnalyses)).every(row=>(row.results as any).advice==='FORBIDDEN_ANALYSIS_SENTINEL'));
 assert.equal(a.experimentalPreference?.enabled,true);assert.equal(a.profile.id,'a');assert.equal(a.journal.length,1);assert.equal(a.journal[0].totalCalories,0);
 assert.deepEqual(a.journal[0].nutritionalData,{calories:0,protein:null});
 for(const rows of Object.values(a.gutReports))assert.equal(rows.length,1);
 assert.equal(a.gutReports.samples[0].id,'sample-a');assert.equal(b.gutReports.samples[0].id,'sample-b');
 assert.deepEqual((a.biology.records[0].payload as any),{owner:'a',value:12,unit:'source-unit',confirmation:'provisional'});
 assert.equal((a.savedLabels[0].payload as any).owner,'a');assert.equal((a.experience.records[0].payload as any).owner,'a');assert.equal((a.healthSources.observations![0].payload as any).owner,'a');
 const text=JSON.stringify(a);for(const forbidden of ['HASH-MUST-NOT-EXPORT','AUTH-GRANT-MUST-NOT-EXPORT','/private/internal.fastq','encryptedPayload','ciphertext','sample-b','meal-b','FORBIDDEN_','predictedConcentration','impactScore','productionGenes'])assert.equal(text.includes(forbidden),false);
 await assert.rejects(()=>store.exportAccount('missing'));
 await pg.exec('DROP TABLE health_source_consents');const older=await store.exportAccount('a');assert.equal(older.healthSources.storage.consents,'not-provisioned');assert.equal(older.healthSources.consents,null);assert.equal(older.healthSources.observations!.length,1);assert.equal(older.journal.length,1);
 await pg.exec('DROP TABLE health_observations');assert.equal((await store.exportAccount('a')).healthSources.observations,null);
 await db.update(schema.precisionRecords).set({encryptedPayload:encryptPrecision({owner:'b'},'b')});
 await assert.rejects(()=>store.exportAccount('a')); // No partial export on authentication/decryption failure.
 } finally {await pg.close();if(previous===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=previous;}
});

test("account export requires auth, uses session identity only and returns safe no-store failures",async()=>{
 const app=express(),calls:string[]=[];let fail=false,oversized=false;
 app.use((req,_res,next)=>{req.session={userId:req.headers['x-test-user']} as any;next();});
 registerAccountRoutes(app,(req,res,next)=>req.session.userId?next():void res.status(401).end(),{exportAccount:async id=>{calls.push(id);if(fail)throw Error('private database detail');return oversized?{data:'x'.repeat(26*1024*1024)}:{profile:{id}};}});
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.on('listening',r));const url='http://127.0.0.1:'+(server.address() as any).port+'/api/account/export';
 try{assert.equal((await fetch(url)).status,401);const response=await fetch(url+'?userId=b&includeRaw=true&experimental=true',{headers:{'x-test-user':'a','x-internal-tester':'true'}});assert.equal(response.headers.get('cache-control'),'no-store');assert.match(response.headers.get('content-disposition')||'',/attachment/);assert.equal((await response.json()).profile.id,'a');assert.deepEqual(calls,['a']);fail=true;const error=await fetch(url,{headers:{'x-test-user':'a'}});assert.equal(error.status,503);assert.equal((await error.text()).includes('private database detail'),false);assert.equal(error.headers.get('content-disposition'),null);fail=false;oversized=true;const large=await fetch(url,{headers:{'x-test-user':'a'}});assert.equal(large.status,503);assert.equal(large.headers.get('content-disposition'),null);}finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));}
});
