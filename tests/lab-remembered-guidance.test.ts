import test from 'node:test';
import assert from 'node:assert/strict';
import {labSchema} from '../shared/precision-nutrition';
import {rememberedLabGuidance} from '../shared/lab-family-guidance';
import {labEditorialFor,labEditorialSources} from '../shared/biology-labs';
import {labResponseQuestionForMarkers,type LabResponseContextView, type RecalledLabResponseContext} from '../shared/lab-response-context';
const sourceDefaults={laboratory:'Synthetic',method:'Synthetic assay',fasting:'unknown',referenceLow:null,referenceHigh:null};
const sources=[{...labSchema.parse({...sourceDefaults,marker:'ldl',value:3.5,unit:'mmol/L',measuredAt:'2026-10-01T12:00:00Z'}),id:'owned-source'}];
function view(patch:Partial<RecalledLabResponseContext>={}):LabResponseContextView{
 const payload:RecalledLabResponseContext={version:1,valueKind:'recalled-context',intentId:'ed942fe8-8d76-4c22-bdd6-b2a40545b443',family:'lipids',question:'medication-change',answer:'yes',reviewWindow:{from:'2026-09-01',to:'2026-10-01',basis:'source-date'},eventWindow:{from:'2026-09-15',to:'2026-09-20',precision:'range'},datePrecision:'range',recordedAt:'2026-11-16T12:00:00Z',sourceReferences:[{id:'owned-source',revision:'a'.repeat(64)}],supersedes:null,notes:'Free text must not be interpreted as a new exposure',...patch};
 return{questionId:payload.question,scopeHash:'b'.repeat(64),generationId:null,historyRevision:'c'.repeat(64),historyCount:1,latest:{sourceCurrent:true,record:{id:'answer-v1',payload,createdAt:payload.recordedAt,updatedAt:payload.recordedAt}},asOf:'2026-11-17T12:00:00Z'};
}
test('saved context generates versioned source-bound guidance using exact canonical text without personal causal claims',()=>{
 const input=view(),before=structuredClone({sources,input}),result=rememberedLabGuidance('lipids',sources,input)!;
 assert.ok(result);assert.equal(result.timing,'recalled-window');assert.equal(result.attribution,'not-established');
 assert.match(result.summary,/You recalled a change in medicines/);assert.match(result.nextStep,/Do not change doses/);
 assert.deepEqual(result.profiles[0].citations,labEditorialSources(labEditorialFor('ldl')!));assert.equal(result.profiles[0].discussion,labEditorialFor('ldl')!.whatToDiscuss);
 assert.equal(result.revision.answerId,'answer-v1');assert.deepEqual(result.revision.sourceIds,['owned-source']);
 assert.equal(result.action.href,'/precision?tab=labs&labResult=owned-source');assert.equal(JSON.stringify(result).includes(input.latest!.record.payload.notes),false);
 assert.deepEqual({sources,input},before);
});
test('saved no/unknown/not-tracked/declined answers are distinct and never become absence or an exposure',()=>{
 for(const answer of ['no','unknown','not-tracked','prefer-not-answer'] as const){
  const result=rememberedLabGuidance('lipids',sources,view({answer,eventWindow:null,datePrecision:'not-applicable',notes:answer==='prefer-not-answer'?'':'note'}))!;
  assert.ok(result);assert.equal(result.timing,'not-applicable');assert.equal(result.timingText,null);assert.equal(result.attribution,'not-established');
  assert.match(result.summary,answer==='no'?/does not rule out/:answer==='prefer-not-answer'?/No exposure or explanation is inferred/:/not treated as no change/);
 }
});
test('upload/mixed dates, unknown recall, same-day and outside-window events never become aligned exposure windows',()=>{
 for(const basis of ['stored-timestamp','mixed-or-unknown'] as const)assert.equal(rememberedLabGuidance('lipids',sources,view({reviewWindow:{from:'2026-09-01',to:'2026-10-01',basis}}))!.timing,'unknown');
 assert.equal(rememberedLabGuidance('lipids',sources,view({eventWindow:null,datePrecision:'unknown'}))!.timing,'unknown');
 for(const day of ['2026-08-10','2026-09-01','2026-10-01'])assert.equal(rememberedLabGuidance('lipids',sources,view({eventWindow:{from:day,to:day,precision:'day'},datePrecision:'day'}))!.timing,'not-aligned');
});
test('source correction/deletion, question change, unknown assay and malformed answers retract the derived explanation',()=>{
 const changed=view();changed.latest!.sourceCurrent=false;assert.equal(rememberedLabGuidance('lipids',sources,changed),null);
 assert.equal(rememberedLabGuidance('lipids',[],view()),null);assert.equal(rememberedLabGuidance('lipids',[{...sources[0],id:'other-owner-source'}],view()),null);
 assert.equal(rememberedLabGuidance('liver',sources,view()),null);const question=view();question.questionId='acute-illness';assert.equal(rememberedLabGuidance('lipids',sources,question),null);
 assert.equal(rememberedLabGuidance('lipids',[{...sources[0],marker:'psa'}],view()),null);
 const invalid=view();invalid.latest!.record.payload.answer='fabricated' as any;assert.equal(rememberedLabGuidance('lipids',sources,invalid),null);
 assert.equal(rememberedLabGuidance('lipids',sources,null),null);
});
test('B12/iron/CBC/liver/glucose questions remain analyte-specific without a TG or medicine fallback',()=>{
 for(const [family,marker,unit]of [['iron-cbc','b12','pmol/L'],['iron-cbc','ferritin','ug/L'],['iron-cbc','hemoglobin','g/L'],['liver','alt','U/L'],['glycemic','glucose','mmol/L']]as const){
  const rows=[{...labSchema.parse({...sourceDefaults,marker,unit,value:10,measuredAt:'2026-10-01T12:00:00Z'}),id:'owned-source'}];
  const question=labResponseQuestionForMarkers(family,[marker]);const result=rememberedLabGuidance(family,rows,view({family,question}))!;
  assert.ok(result);assert.equal(result.revision.question,question);assert.deepEqual(result.profiles.map(profile=>profile.markerId),[marker]);
 }
 const rows=[{...labSchema.parse({...sourceDefaults,marker:'hba1c',unit:'%',value:5,measuredAt:'2026-10-01T12:00:00Z'}),id:'owned-source'}];
 assert.equal(rememberedLabGuidance('glycemic',rows,view({family:'glycemic',question:'fasting-context'})),null,'No nonexistent glucose report action for HbA1c alone');
});
