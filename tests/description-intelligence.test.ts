import test from "node:test";
import assert from "node:assert/strict";
import {validateDescriptionDraft,DESCRIPTION_CONTRACT_VERSION} from "../shared/description-intelligence";
const source=(input:string,quote=input,from=0)=>{const start=input.indexOf(quote,from);assert.ok(start>=0);return{start,end:start+quote.length,quote};};
const label=(input:string,value:string)=>({value,source:source(input,value)});
function food(input="2 slices of pepperoni pizza"){return{version:DESCRIPTION_CONTRACT_VERSION,domain:"food" as const,items:[{source:source(input),name:label(input,"pepperoni pizza"),portion:{value:2,unit:"slice",source:source(input,"2"),unitSource:source(input,"slices")},preparation:null,intent:"uncertain",intentSource:null}]};}
test("food source contract preserves household portions, identity, unicode spans and uncertainty without nutrition inference",()=>{
 for(const input of ["2 slices of pepperoni pizza","🌿 2 slices of pepperoni pizza"]){const result=validateDescriptionDraft(input,"food",food(input));assert.equal(result.status,"source-grounded-draft");assert.equal(result.reviewRequired,true);if(result.status==="source-grounded-draft"&&result.draft.domain==="food")assert.equal(result.draft.items[0].portion!.value,2);}
 const input="two slices of pepperoni pizza",draft=food(input.replace("two","2"));draft.items[0].source=source(input);draft.items[0].name=label(input,"pepperoni pizza");draft.items[0].portion.source=source(input,"two");draft.items[0].portion.unitSource=source(input,"slices");assert.equal(validateDescriptionDraft(input,"food",draft).status,"source-grounded-draft");
});
test("invented mass/identity/nutrients, wrong units, domain changes and fragments of negative/decimal/word tokens require review",()=>{
 const input="2 slices of pepperoni pizza";
 for(const mutate of [(d:any)=>d.items[0].portion.value=120,(d:any)=>d.items[0].name.value="salmon",(d:any)=>d.items[0].portion.unit="g",(d:any)=>d.items[0].nutrients={calories:300}]){const draft=food(input);mutate(draft);assert.equal(validateDescriptionDraft(input,"food",draft).status,"needs-review");}
 assert.equal(validateDescriptionDraft(input,"exercise",food(input)).status,"needs-review");
 for(const changed of ["-2 slices of pepperoni pizza","2.5 slices of pepperoni pizza"]){const draft=food(changed);assert.equal(validateDescriptionDraft(changed,"food",draft).status,"needs-review");}
 const input2="someone slices of pepperoni pizza",draft=food("2 slices of pepperoni pizza");draft.items[0].source=source(input2);draft.items[0].name=label(input2,"pepperoni pizza");draft.items[0].portion={value:1,unit:"slice",source:source(input2,"one"),unitSource:source(input2,"slices")};assert.equal(validateDescriptionDraft(input2,"food",draft).status,"needs-review");
});
test("mixed workout retains duration unknown and exact per-set load source spans; no described completion can become confirmed",()=>{
 const input="Ran then did 5 sets of 10 reps of bench press for 50,50,50,55,55 lbs";
 const quantity=(value:number,word:string,unit:string,unitWord:string,from=0)=>({value,unit,source:source(input,word,from),unitSource:source(input,unitWord)});
 let at=input.indexOf("50,");const loads=[50,50,50,55,55].map(value=>{const q=quantity(value,String(value),"lb","lbs",at);at=q.source.end;return q;});
 const draft:any={version:DESCRIPTION_CONTRACT_VERSION,domain:"exercise",items:[{source:source(input,"Ran"),name:label(input,"Ran"),intent:"reported",intentSource:source(input,"Ran"),sets:null,reps:null,load:null,duration:null,distance:null,perSetLoads:null,completion:"not-confirmed"},{source:source(input,input.slice(input.indexOf("5 sets"))),name:label(input,"bench press"),intent:"uncertain",intentSource:null,sets:quantity(5,"5","set","sets"),reps:quantity(10,"10","rep","reps"),load:null,duration:null,distance:null,perSetLoads:loads,completion:"not-confirmed"}]};
 assert.equal(validateDescriptionDraft(input,"exercise",draft).status,"source-grounded-draft");
 const completed=structuredClone(draft);completed.items[1].completion="completed";assert.equal(validateDescriptionDraft(input,"exercise",completed).status,"needs-review");
 const mismatch=structuredClone(draft);mismatch.items[1].perSetLoads.pop();assert.equal(validateDescriptionDraft(input,"exercise",mismatch).status,"needs-review");
 const duplicate=structuredClone(draft);duplicate.items[1].perSetLoads[1]=duplicate.items[1].perSetLoads[0];assert.equal(validateDescriptionDraft(input,"exercise",duplicate).status,"needs-review");
 const foreign=structuredClone(draft);foreign.items[0].load=foreign.items[1].perSetLoads[0];assert.equal(validateDescriptionDraft(input,"exercise",foreign).status,"needs-review");
});
test("negated/future and lifestyle source clauses remain draft intent, not observed or clinical facts",()=>{
 for(const input of ["did not eat 2 slices of pepperoni pizza","will eat 2 slices of pepperoni pizza tomorrow"]){const draft:any=food(input);draft.items[0].intent="reported";draft.items[0].intentSource=source(input,"eat");assert.equal(validateDescriptionDraft(input,"food",draft).status,"needs-review");draft.items[0].intent="uncertain";assert.equal(validateDescriptionDraft(input,"food",draft).status,"source-grounded-draft");}
 const input="I slept 7 hours",draft:any={version:DESCRIPTION_CONTRACT_VERSION,domain:"lifestyle",items:[{source:source(input),description:label(input,"slept"),duration:{value:7,unit:"h",source:source(input,"7"),unitSource:source(input,"hours")},intent:"reported",intentSource:source(input,"slept")}]};
 assert.equal(validateDescriptionDraft(input,"lifestyle",draft).status,"source-grounded-draft");draft.items[0].diagnosis="sleep disorder";assert.equal(validateDescriptionDraft(input,"lifestyle",draft).status,"needs-review");
 assert.equal(validateDescriptionDraft("x".repeat(4001),"lifestyle",draft).status,"needs-review");
});
