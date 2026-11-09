import test from "node:test";
import assert from "node:assert/strict";
import {VIOME_FINDINGS_VERSION,parseViomeFindings,assertViomeImportMetadata} from "../shared/viome-findings";
import {parseStructuredReport,resolveReportDate} from "../shared/structured-report";

const root=()=>({schemaVersion:VIOME_FINDINGS_VERSION,provider:"Viome",documentKind:"active-gut-microbes",specimenType:"fecal",method:"qualitative RNA",biologicalDates:{collectedOn:"2026-09-01",receivedOn:"2026-09-02",reportedOn:"2026-09-05"},reviewConfirmed:true,organisms:[{name:"Bacteroides fragilis 638R",reportedGroup:"Bacteria",reportedStatus:"reported_present",position:{page:2,column:1,row:1}}],assessments:[],foods:[]});
test("field-allowlisted qualitative findings use the existing canonical report without creating quantities or treating strain labels as toxin evidence",()=>{
 const input=root(),report=parseStructuredReport(input);
 assert.equal(report.organisms[0].name,input.organisms[0].name);assert.equal(report.organisms[0].reportedStatus,"reported_present");assert.equal(report.organisms[0].reportedAbundance,null);
 assert.match(report.organisms[0].notes!,/Provider group: Bacteria/);
 assert.deepEqual(report.sourceReport,input);assert.deepEqual(parseStructuredReport(report),report);
 assert.equal(report.bacteria_percentages,undefined);assert.equal(report.capabilities.measuredGenes,false);assert.equal(report.capabilities.measuredMetabolites,false);
 assert.equal(resolveReportDate(undefined,report).date.toISOString().slice(0,10),"2026-09-01");
 const withoutCollection=parseStructuredReport({...input,biologicalDates:{receivedOn:"2026-09-02",reportedOn:"2026-09-05"}});
 assert.equal(resolveReportDate(undefined,withoutCollection,new Date("2026-11-05T00:00:00Z")).dateSource,"import-date");
 assert.equal("bft" in report,false);assert.equal("toxin" in report,false);
});
test("native findings reject unknown identity/raw fields and return fixed errors without echoing key names or values",()=>{
 for(const key of["PatientCanaryName","DOB","clientId","testId","sampleId","kitId","orderId","email","rawPdf","rawText","xmp","originalFilename","sha256"]){
  assert.throws(()=>parseStructuredReport({...root(),[key]:"PrivateCanaryValue"}),error=>error instanceof Error&&!error.message.includes(key)&&!error.message.includes("PrivateCanaryValue"));
 }
 for(const input of[
  {...root(),schemaVersion:"bloom-viome-findings-v99"},
  {...root(),biologicalDates:{DOB:"2000-01-01"}},
  {...root(),biologicalDates:{collectedOn:"2026-02-30"}},
  {...root(),organisms:[{...root().organisms[0],abundance:0}]},
  {...root(),organisms:[{...root().organisms[0],position:{page:2,column:1,row:1,filename:"PrivateCanaryValue"}}]},
  {...root(),organisms:[root().organisms[0],root().organisms[0]]},
  {...root(),reviewConfirmed:false},
 ])assert.throws(()=>parseStructuredReport(input));
});
test("canonical wrappers cannot preserve extra identifying metadata in the deidentified source projection",()=>{
 const clean=parseStructuredReport(root());
 const projected=parseStructuredReport({...clean,sourceLabel:"PrivateCanaryValue",dataOrigin:"PrivateCanaryValue",sourceMissingData:["PrivateCanaryValue"],rawText:"PrivateCanaryValue"});
 assert.deepEqual(projected,clean);assert.equal(JSON.stringify(projected).includes("PrivateCanaryValue"),false);
 assert.doesNotThrow(()=>assertViomeImportMetadata(clean.sourceReport,{},null));
 for(const fields of[{testId:"PrivateCanaryValue"},{notes:""},{testingCompany:"Viome"},{testDate:"2026-09-01"}])assert.throws(()=>assertViomeImportMetadata(clean.sourceReport,fields,null));
 assert.throws(()=>assertViomeImportMetadata(clean.sourceReport,{},"PrivateCanaryValue.pdf"));
 assert.equal(parseViomeFindings(root()).reviewConfirmed,true,"User source-review assertion is not independent science or privacy approval");
});
test("companion provider categories remain ordinal and food advice cannot become quantitative abundance or an allergy",()=>{
 const input={...root(),documentKind:"health-scores-foods",organisms:[],assessments:[{name:"Synthetic butyrate assessment",reportedCategory:"Attention",position:{page:3,column:1,row:1}}],foods:[{name:"Synthetic fish",reportedCategory:"Avoid",position:{page:8,column:1,row:1}}]};
 const report=parseStructuredReport(input);
 assert.equal(report.scores[0].score,null);assert.equal(report.scores[0].scale,null);assert.equal(report.scores[0].reportedCategory,"Attention");assert.equal(report.foods![0].reportedCategory,"Avoid");
 assert.equal(report.bacteria_percentages,undefined);assert.equal("allergies" in report,false);assert.equal("foodExclusions" in report,false);
 assert.throws(()=>parseStructuredReport({...input,assessments:[{...input.assessments[0],score:42}]}));
 assert.throws(()=>parseStructuredReport({...input,foods:[{...input.foods[0],portion:100}]}));
});
