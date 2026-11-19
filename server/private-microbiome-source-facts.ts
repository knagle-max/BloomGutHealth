import {createHash} from 'node:crypto';
import {parseStructuredReport,microbiomeSourceFacts} from '../shared/structured-report';
import {reportDateContext} from '../shared/report-dates';
import {viomeSource} from '../shared/viome-report-context';
import type {MicrobiomeSample} from '../shared/schema';
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
/** Canonical owned source projection only. No organism identity/rank upgrade,
 * assay equivalence, inferred function, personal metabolite or diagnosis. */
export function privateMicrobiomeSourceFacts(actor:string,samples:readonly MicrobiomeSample[],asOf:Date){
 if(!actor||!Number.isFinite(+asOf)||samples.length>20||samples.some(sample=>sample.userId!==actor)||new Set(samples.map(sample=>sample.id)).size!==samples.length)throw Error('MICROBIOME_SNAPSHOT_SCOPE');
 const reports:ReturnType<typeof project>[]=[];let unavailable=0,future=0;
 function project(sample:MicrobiomeSample){
  const parsed=parseStructuredReport(sample.structuredData),native=viomeSource(sample.structuredData),dateContext=reportDateContext(sample);
  const collectedOn=native?.biologicalDates.collectedOn??null;
  // Keep source calendars verbatim; never convert upload time into collection
  // time or invent a time zone/midnight for a date-only biological sample.
  const biologicalDate=collectedOn??(dateContext.source==='report-provided'||dateContext.source==='user-provided'?dateContext.input??null:null);
  const dateBasis=collectedOn?'reported-collection-date':biologicalDate?(dateContext.source==='user-provided'?'user-entered-test-date':'report-test-date'):'biological-date-unknown';
  const revision=digest([sample.id,sample.testDate,sample.uploadedAt,sample.processingStatus,sample.structuredData]);
  const provenance=microbiomeSourceFacts(parsed);
  const entries=[
   ...parsed.organisms.map((organism,index)=>({suffix:`organism:${index}`,name:organism.name,valueKind:'report-listed-organism' as const,amount:null as number|null,unit:null as string|null,reportedStatus:organism.reportedStatus,reportedAbundance:organism.reportedAbundance})),
   ...Object.entries(parsed.bacteria_percentages??{}).map(([name,amount],index)=>({suffix:`abundance:${index}`,name,valueKind:'reported-relative-abundance' as const,amount,unit:'%',reportedStatus:null,reportedAbundance:null})),
  ];
  const facts=entries.map(({suffix,...entry})=>({
    id:`microbiome:${sample.id}:${suffix}`,domain:'microbiome' as const,sourceId:sample.id,revision,...entry,
    occurredAt:biologicalDate,dateBasis,timeComparability:'not-established' as const,
    taxonomyResolution:'source-name-only' as const,measuredMetabolite:false as const,measuredGeneFunction:false as const,
  }));
  return {sourceId:sample.id,revision,kind:parsed.kind,dateContext,biologicalDate,dateBasis,
   specimenEvent:native?.specimenEvent??null,sourceDocumentKind:native?.documentKind??null,specimenType:native?.specimenType??null,reportedMethod:native?.method??null,
   sourceReportedScoreCount:parsed.scores.length,providerRecommendationsAreNotIntake:true as const,
   assayAndTaxonomy:provenance,reportedOrganisms:parsed.organisms.length,quantifiedTaxa:Object.keys(parsed.bacteria_percentages??{}).length,facts};
 }
 for(const sample of samples){
  const uploaded=sample.uploadedAt?new Date(sample.uploadedAt):null;
  if(uploaded&&Number.isFinite(+uploaded)&&+uploaded>+asOf){future++;continue;}
  if(sample.processingStatus!=='completed'){unavailable++;continue;}
  try{reports.push(project(sample));}catch{unavailable++;}
 }
 return {reports,facts:reports.flatMap(report=>report.facts),unavailable,future};
}
