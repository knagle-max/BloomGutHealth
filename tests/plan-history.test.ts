import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalPlanRecord} from '../server/plan-history';
test('plan history preserves safe stored snapshots and zero targets without treating version or check flags as current clearance',()=>{
 const original={id:'synthetic',kind:'plan',payload:{type:'weekly-plan',version:'weekly-2026-10-17.1',checksPassed:true,request:{targets:{sodium:0}},days:[],biologicalEvidence:{}}};
 const projected=historicalPlanRecord(original) as any;
 assert.equal(projected.payload,original.payload);assert.equal(projected.interpretationStatus,'historical_plan_not_revalidated');assert.equal(projected.currentUse,'rebuild_required');
 assert.equal((original as any).interpretationStatus,undefined);
 for(const payload of [null,[],{},'weekly-plan',{type:'lab'}]){const record={kind:'plan',payload};assert.equal(historicalPlanRecord(record),record);}
 const lab={kind:'lab',payload:{type:'weekly-plan',value:0,unit:'original'}};assert.equal(historicalPlanRecord(lab),lab);
});

test('known legacy genotype ranking is withdrawn across history without deleting the source or hiding safe plans',()=>{
 const payload={type:'weekly-plan',name:'Synthetic affected history',version:'weekly-2026-10-17.1',status:'feasible',checksPassed:true,request:{targets:{protein:0}},biologicalEvidence:{geneticContext:[{rsid:'rs1801133',genotype:'AG'}]},days:[{meals:[{recipeId:'unsafe-selected',reasons:['Folate-containing ingredients are relevant to recorded MTHFR context; the call does not establish a deficiency or supplement need.']}]}],shoppingList:[{foodId:'unsafe-selected'}],recommendations:[{id:'unsafe-selected'}]};
 const record={id:'synthetic',kind:'plan',payload},before=structuredClone(record),view=historicalPlanRecord(record) as any;
 assert.equal(view.interpretationStatus,'historical_genotype_ranking_withheld');assert.equal(view.payload.checksPassed,false);assert.equal(view.payload.status,'blocked');assert.deepEqual(view.payload.days,[]);assert.deepEqual(view.payload.shoppingList,[]);assert.deepEqual(view.payload.recommendations,[]);assert.equal(view.payload.historicalOutput.recordedMeals,1);assert.deepEqual(view.payload.request,payload.request);assert.deepEqual(view.payload.biologicalEvidence,payload.biologicalEvidence);assert.deepEqual(record,before);
 const safe={...record,payload:{...payload,days:[{meals:[{recipeId:'safe-selected',reasons:['Fits dietary preferences.']}]}]}};assert.equal((historicalPlanRecord(safe) as any).payload,safe.payload);
});


test('legacy precision recommendations cannot replay genotype-only ranking; safe snapshots remain historical and original check-ins stay untouched',()=>{
 const payload={name:'Synthetic precision plan',version:'precision-r6',startedAt:'2026-10-01',goals:['heart'],recommendations:[{id:'unsupported',name:'FORBIDDEN_GENOTYPE_SELECTION',reasons:['MTHFR provides secondary folate-pathway context, not a measured deficiency.'],matchedRecordIds:['original-gene']}],supplements:[{name:'Recorded source context'}],reviewFlags:[]};
 const original={id:'legacy',kind:'plan',payload},before=structuredClone(original),view=historicalPlanRecord(original) as any;
 assert.equal(view.interpretationStatus,'historical_genotype_ranking_withheld');assert.deepEqual(view.payload.recommendations,[]);assert.equal(view.payload.historicalOutput.recordedRecommendations,1);assert.deepEqual(view.payload.goals,payload.goals);assert.deepEqual(view.payload.supplements,payload.supplements);assert.deepEqual(original,before);
 const safe={...original,payload:{...payload,recommendations:[{id:'safe',name:'Whole foods',reasons:['Matches saved goals.']}]}};const safeView=historicalPlanRecord(safe) as any;assert.equal(safeView.interpretationStatus,'historical_plan_not_revalidated');assert.equal(safeView.payload,safe.payload);
 const checkin={kind:'checkin',payload:{planId:'legacy',adherencePercent:0}};assert.equal(historicalPlanRecord(checkin),checkin);
});
