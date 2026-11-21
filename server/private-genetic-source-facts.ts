import {geneticSourceSnapshotSchema} from '../shared/genetic-source-selection';
import {precisionEntrySchema,type PrecisionRecord} from '../shared/precision-nutrition';
import {isSensitiveGeneticCall} from '../shared/genetic-selection';
import {geneticSourceRevision} from './genetic-source-version';
/** Current selected source facts only. Never reactivates an old dataset, flips
 * alleles, combines loci into haplotypes or infers a phenotype/diet/clinical risk.
 * Matches the existing source detail reader's storage-only marker exclusion. */
export function privateGeneticSourceFacts(actor:string,records:readonly PrecisionRecord[],selection:unknown,asOf:Date){
 if(!actor||!Number.isFinite(+asOf))throw Error('GENETIC_SNAPSHOT_SCOPE');
 const control=geneticSourceSnapshotSchema.parse(selection);
 if(control.state!=='active')return {state:control.state,selectionRevision:control.selectionRevision,source:null,facts:[]};
 const summary=control.sources.find(row=>row.id===control.activeId),matches=records.filter(row=>row.kind==='genetics'&&row.id===control.activeId);
 if(!summary?.readable||matches.length!==1||summary.revision!==geneticSourceRevision(actor,matches[0]))throw Error('GENETIC_SOURCE_CHANGED');
 const record=matches[0],entry=precisionEntrySchema.parse({kind:'genetics',payload:record.payload});
 if(entry.kind!=='genetics'||+new Date(record.createdAt)>+asOf||+new Date(entry.payload.collectedAt)>+asOf)throw Error('GENETIC_SOURCE_UNAVAILABLE');
 const data=entry.payload,calls=data.provider==='manual'?data.entries:data.calls;
 const facts=calls.filter(call=>!isSensitiveGeneticCall(call.rsid)).map(call=>({
  id:`genetics:${record.id}:${call.rsid}`,domain:'genetics' as const,sourceId:record.id,revision:summary.revision,
  rsid:call.rsid,reportedGene:'gene'in call&&call.gene?call.gene:null,genotype:call.genotype,original:call.sourceCall?.original??null,
  valueKind:call.genotype==='--'?'source-no-call' as const:'source-reported-genotype' as const,
  occurredAt:data.collectedAt,dateBasis:'source-entered-genetic-date' as const,
  build:data.provider==='23andMe'?data.build:data.sourceContext?.genomeBuild??null,
  strand:data.provider==='23andMe'?'forward':data.strand,
  reportedAssay:data.provider==='manual'?data.sourceContext?.assay??null:null,phase:'not-established' as const,clinicalEffect:'not-assessed' as const,measuredGeneExpression:false as const,
 }));
 return {state:'active' as const,selectionRevision:control.selectionRevision,
  source:{sourceId:record.id,revision:summary.revision,provider:data.provider,collectedAt:data.collectedAt,storageOnlyMarkers:'not-projected' as const},facts};
}
