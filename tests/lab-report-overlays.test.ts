import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import curation from '../shared/data/lab-provider-source-review.json';
import {labReportGroupKey,groupLabHistory} from '../shared/lab-history';
import {labSchema} from '../shared/precision-nutrition';
import {sourceReferenceIntervalForPlot,canShareSourceReference} from '../shared/lab-reference-interval';
import {emptyLabOverlayChoice,labOverlaySourceVersion,labSourceDisplayContext} from '../shared/lab-overlay-preference';
import {publishedLabRanges} from '../shared/lab-provider-ranges';
const source={importId:'00000000-0000-4000-8000-000000000001',enteredDate:'2026-08-09',reportIdentifier:'Synthetic same-day report',specimenIdentifier:'one'};
const row=(id:string,extra={})=>({...labSchema.parse({marker:'alt',value:38,unit:'U/L',measuredAt:'2026-08-09T12:00:00Z',laboratory:'Synthetic source',method:'Synthetic method',fasting:'unknown',referenceLow:null,referenceHigh:50,sourceReport:source,...extra}),id});
const point=(r:ReturnType<typeof row>)=>({...r,date:r.measuredAt,sourceValue:r.value,sourceUnit:r.unit});
test('report keys follow immutable import and report/specimen identity, never a shared date; different report ranges cannot share one global band',()=>{
 const a=row('a'),b=row('b',{sourceReport:{...source,importId:'00000000-0000-4000-8000-000000000002'}}),c=row('c',{sourceReport:{...source,specimenIdentifier:'two'}});
 assert.equal(groupLabHistory([a,b,c]).imports.length,3);assert.equal(labReportGroupKey(undefined),null);assert.notEqual(labReportGroupKey(a.sourceReport),labReportGroupKey(b.sourceReport));assert.notEqual(labReportGroupKey(a.sourceReport),labReportGroupKey(c.sourceReport));
 const points=[point(a),point(b)],ranges=points.map(p=>sourceReferenceIntervalForPlot('alt',p));assert.equal(canShareSourceReference(points,ranges),false);assert.equal(canShareSourceReference([point(a)],[ranges[0]]),true);
 const d=row('d',{sourceReport:{...source,enteredDate:'2026-08-10'},measuredAt:'2026-08-10T12:00:00Z'}),mixed=[point(a),point(d)];assert.equal(canShareSourceReference(mixed,mixed.map(p=>sourceReferenceIntervalForPlot('alt',p))),false,'Different source collection calendars do not establish one effective interval period');
});
test('collection confirmations bind to the exact current source and never fill absent collection date, method, age or reference sex from a profile',()=>{
 const a=point(row('a')),original=labOverlaySourceVersion(a);for(const changed of [{...a,referenceHigh:55},{...a,method:'Changed method'},{...a,sourceReport:{...source,enteredDate:'2026-08-08'}},{...a,id:'successor'}])assert.notEqual(labOverlaySourceVersion(changed),original);
 assert.deepEqual(labSourceDisplayContext(a),{method:'Synthetic method',fasting:'unknown',collectedOn:'2026-08-09'});assert.equal(labSourceDisplayContext({...a,sourceReport:undefined}).collectedOn,'');assert.equal(emptyLabOverlayChoice().context.ageAtCollection,null);assert.equal(emptyLabOverlayChoice().context.sexReferenceCategory,null);
});
test('original24-row BC source remains byte-anchored; six adult table checks are not method/specimen or runtime approval, and no SK/ON normal band is invented',()=>{
 const bytes=readFileSync(new URL('../'+curation.originalCsv,import.meta.url));assert.equal(createHash('sha256').update(bytes).digest('hex'),curation.originalSha256);assert.equal(curation.entries.length,24);assert.equal(curation.counts.adultTableEntriesSpotChecked,6);assert.equal(curation.counts.pendingPageReview,18);assert.equal(curation.counts.runtimeApproved,0);assert.equal(curation.entries.filter(e=>e.tableEntryReview==='adult-value-unit-sex-page-spot-checked-by-architect').length,6);assert.ok(curation.entries.every(e=>e.scientificReviewStatus==='pending'&&e.runtimeEligible===false&&e.method===null&&e.assay===null&&e.specimen===null));assert.deepEqual(publishedLabRanges,[]);assert.equal(curation.entries[0].intervalText,'<50');assert.equal(curation.entries[11].intervalText,'24–444');assert.ok(curation.entries.filter(e=>e.analyte==='Free testosterone (calculated)').every(e=>e.candidateMarkerId===null));
});
