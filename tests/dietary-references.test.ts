import test from 'node:test';
import assert from 'node:assert/strict';
import {dietaryReferenceSubset,dietaryReferencesFor,dietaryReferenceRowSchema} from '../shared/dietary-references';
test('curated Health Canada source facts preserve separate adult EAR/RDA/UL, sex/age categories and source-specific scope',()=>{
 assert.equal(dietaryReferenceSubset.rows.length,48);assert.deepEqual(Array.from(new Set(dietaryReferenceSubset.rows.map(row=>row.kind))).sort(),['AI','EAR','RDA','UL']);assert.equal(dietaryReferenceSubset.authority,'Health Canada');assert.equal(dietaryReferenceSubset.retrievedOn,'2026-11-18');assert.equal(dietaryReferenceSubset.sourcePublishedOn,null);assert.equal(dietaryReferenceSubset.effectiveFrom,null);
 const rda=(nutrient:string,sex:string,ageMin:number)=>dietaryReferencesFor(nutrient).find(row=>row.kind==='RDA'&&row.sexReferenceCategory===sex&&row.ageMinYears===ageMin)!;
 assert.equal(rda('vitamin_c_mg','M',19).amount,90);assert.equal(rda('vitamin_c_mg','F',19).amount,75);
 for(const [sex,age,value]of [['M',19,400],['M',31,420],['F',19,310],['F',31,320]]as const)assert.equal(rda('magnesium_mg',sex,age).amount,value);
 assert.equal(dietaryReferencesFor('magnesium_mg').find(row=>row.kind==='UL')!.amount,350);assert.equal(dietaryReferencesFor('magnesium_mg').find(row=>row.kind==='UL')!.intakeScope,'pharmacological-only');
 assert.equal(dietaryReferencesFor('vitamin_c_mg').find(row=>row.kind==='UL')!.amount,2000);assert.equal(dietaryReferencesFor('vitamin_c_mg').find(row=>row.kind==='UL')!.smokingApplicability,'not-specific');
 assert.ok(dietaryReferenceSubset.rows.every(row=>row.lifeStage==='nonpregnant-nonlactating-adult'&&row.referencePeriod==='usual-daily-intake'&&row.referenceVersion===dietaryReferenceSubset.version));
 assert.ok(dietaryReferenceSubset.sources.every(source=>source.url.startsWith('https://www.canada.ca/en/health-canada/')&&source.location.includes('Table 2')));
});
test('schema rejects a magnesium food UL, altered source/form basis, invalid units/amounts and child/reversed age rows',()=>{
 const {referenceVersion:ulVersion,...ul}=dietaryReferencesFor('magnesium_mg').find(row=>row.kind==='UL')!;
 const {referenceVersion:cVersion,...c}=dietaryReferencesFor('vitamin_c_mg').find(row=>row.kind==='RDA')!;
 assert.equal(ulVersion,cVersion);assert.equal(dietaryReferenceRowSchema.safeParse(ul).success,true);assert.equal(dietaryReferenceRowSchema.safeParse(c).success,true);
 for(const patch of [{intakeScope:'total-intake'},{amount:0},{amount:null},{amount:NaN},{amount:Infinity},{unit:'µg/day'},{ageMinYears:18},{ageMaxYears:18},{sourceId:'hc-vitamins'},{kind:'normal'},{lifeStage:'pregnancy'},{referencePeriod:'single-meal'}])assert.equal(dietaryReferenceRowSchema.safeParse({...ul,...patch}).success,false,JSON.stringify(patch));
 assert.equal(dietaryReferenceRowSchema.safeParse({...c,smokingApplicability:'not-specific'}).success,false);
 assert.equal(dietaryReferenceRowSchema.safeParse({...c,intakeScope:'pharmacological-only'}).success,false);
});
test('unsupported nutrients stay absent and reference reads never mutate source facts or generate an intake/adequacy assessment',()=>{
 const before=JSON.stringify(dietaryReferenceSubset);
 for(const key of ['vitamin_b6_mg','ferritin','iodine_ug','unknown'])assert.deepEqual(dietaryReferencesFor(key),[]);
 const rows=dietaryReferencesFor('magnesium_mg');assert.equal(Object.isFrozen(rows[0]),true);assert.equal(Object.isFrozen(dietaryReferenceSubset),true);assert.equal(Object.isFrozen(dietaryReferenceSubset.sources[0]),true);
 assert.equal(rows.some(row=>'adequacy' in row||'target' in row||'normalLow' in row),false);assert.equal(JSON.stringify(dietaryReferenceSubset),before);
});

test('calcium retains 2011 source-specific adult sex/age requirements and age-dependent total-intake UL, without changing the C/Mg subset',()=>{
 const calcium=dietaryReferencesFor('calcium_mg');assert.equal(calcium.length,10);
 for(const[sex,age,ear,rda]of [['M',19,800,1000],['M',71,1000,1200],['F',19,800,1000],['F',51,1000,1200]]as const){assert.equal(calcium.find(row=>row.sexReferenceCategory===sex&&row.ageMinYears===age&&row.kind==='EAR')!.amount,ear);assert.equal(calcium.find(row=>row.sexReferenceCategory===sex&&row.ageMinYears===age&&row.kind==='RDA')!.amount,rda);}
 assert.deepEqual(calcium.filter(row=>row.kind==='UL').map(row=>[row.ageMinYears,row.ageMaxYears,row.amount,row.intakeScope]),[[19,50,2500,'total-intake'],[51,null,2000,'total-intake']]);
 assert.equal(dietaryReferencesFor('vitamin_c_mg').length+dietaryReferencesFor('magnesium_mg').length,14);assert.match(dietaryReferenceSubset.sources.find(source=>source.id==='hc-elements')!.note,/2011/);
});

test('potassium preserves 2019 AI and explicitly absent EAR/RDA/UL/CDRR without inventing an upper bound or adequacy result',()=>{
 const rows=dietaryReferencesFor('potassium_mg');assert.deepEqual(rows.map(row=>[row.sexReferenceCategory,row.kind,row.amount,row.unit]),[['M','AI',3400,'mg/day'],['F','AI',2600,'mg/day']]);
 const {referenceVersion,...row}=rows[0];for(const kind of ['EAR','RDA','UL','CDRR'])assert.equal(dietaryReferenceRowSchema.safeParse({...row,kind}).success,false);
 assert.match(dietaryReferenceSubset.nutrientNotes.potassium_mg,/below an AI does not establish inadequacy/);assert.match(dietaryReferenceSubset.nutrientNotes.potassium_mg,/does not mean unlimited intake is safe/);
});

test('dietary vitamin D keeps micrograms/day, 2011 adult age-dependent RDA and total-intake UL separate from IU and blood analytes',()=>{
 const rows=dietaryReferencesFor('vitamin_d_ug');assert.deepEqual(rows.map(row=>[row.kind,row.ageMinYears,row.ageMaxYears,row.amount,row.unit]),[['EAR',19,null,10,'µg/day'],['RDA',19,70,15,'µg/day'],['RDA',71,null,20,'µg/day'],['UL',19,null,100,'µg/day']]);
 const {referenceVersion,...row}=rows[0];for(const unit of ['mg/day','IU/day','nmol/L','pmol/L'])assert.equal(dietaryReferenceRowSchema.safeParse({...row,unit}).success,false);assert.equal(dietaryReferenceRowSchema.safeParse({...row,sourceId:'hc-elements'}).success,false);
 assert.match(dietaryReferenceSubset.nutrientNotes.vitamin_d_ug,/minimal sun exposure/);assert.match(dietaryReferenceSubset.nutrientNotes.vitamin_d_ug,/not blood vitamin D measurements/);assert.equal(rows.some(row=>'bloodLevel' in row||'dose' in row),false);
});

test('vitamin A RAE requirements never turn total carotenoids or unknown form into a preformed-only UL amount',()=>{
 const rows=dietaryReferencesFor('vitamin_a_ug');assert.deepEqual(rows.map(row=>[row.sexReferenceCategory,row.kind,row.amount,row.unit,row.intakeScope]),[['M','EAR',625,'µg RAE/day','total-intake'],['M','RDA',900,'µg RAE/day','total-intake'],['F','EAR',500,'µg RAE/day','total-intake'],['F','RDA',700,'µg RAE/day','total-intake'],['all','UL',3000,'µg RAE/day','preformed-vitamin-a-only']]);
 const {referenceVersion,...ul}=rows[4];for(const intakeScope of ['total-intake','pharmacological-only'])assert.equal(dietaryReferenceRowSchema.safeParse({...ul,intakeScope}).success,false);for(const unit of ['µg/day','mg/day','IU/day'])assert.equal(dietaryReferenceRowSchema.safeParse({...ul,unit}).success,false);
 const {referenceVersion:v,...other}=dietaryReferencesFor('calcium_mg')[0];assert.equal(dietaryReferenceRowSchema.safeParse({...other,intakeScope:'preformed-vitamin-a-only'}).success,false);assert.match(dietaryReferenceSubset.nutrientNotes.vitamin_a_ug,/does not establish the preformed amount/);
});

test('folate and vitamin E source form-specific requirements and synthetic-only ULs cannot be relabelled as total food limits',()=>{
 for(const[key,amounts,units,scope]of [['folate_ug',[320,400,1000],['µg DFE/day','µg DFE/day','µg folic acid/day'],'synthetic-folic-acid-only'],['vitamin_e_mg',[12,15,1000],['mg/day','mg/day','mg/day'],'synthetic-vitamin-e-only']]as const){const rows=dietaryReferencesFor(key);assert.deepEqual(rows.map(row=>row.kind),['EAR','RDA','UL']);assert.deepEqual(rows.map(row=>row.amount),amounts);assert.deepEqual(rows.map(row=>row.unit),units);assert.equal(rows[2].intakeScope,scope);const{referenceVersion,...ul}=rows[2];assert.equal(dietaryReferenceRowSchema.safeParse({...ul,intakeScope:'total-intake'}).success,false);const{referenceVersion:v,...ear}=rows[0];assert.equal(dietaryReferenceRowSchema.safeParse({...ear,intakeScope:scope}).success,false);}
 const{referenceVersion,...ul}=dietaryReferencesFor('folate_ug')[2];for(const unit of ['µg DFE/day','µg/day','mg/day'])assert.equal(dietaryReferenceRowSchema.safeParse({...ul,unit}).success,false);assert.match(dietaryReferenceSubset.nutrientNotes.folate_ug,/do not establish DFE/);assert.match(dietaryReferenceSubset.nutrientNotes.vitamin_e_mg,/2R-stereoisomeric/);
});

test('iron retains explicit female source menstrual assumptions and never invents a general female or menopause requirement',()=>{
 const rows=dietaryReferencesFor('iron_mg');assert.equal(rows.length,7);assert.deepEqual(rows.map(row=>[row.sexReferenceCategory,row.ageMinYears,row.kind,row.amount,row.menstrualBasis??null]),[['M',19,'EAR',6,null],['M',19,'RDA',8,null],['F',19,'EAR',8.1,'source-assumed-menstruating'],['F',19,'RDA',18,'source-assumed-menstruating'],['F',51,'EAR',5,'source-assumed-postmenopausal'],['F',51,'RDA',8,'source-assumed-postmenopausal'],['all',19,'UL',45,null]]);
 const{referenceVersion,...female}=rows[2];for(const patch of [{menstrualBasis:undefined},{menstrualBasis:'source-assumed-postmenopausal'},{ageMaxYears:null}])assert.equal(dietaryReferenceRowSchema.safeParse({...female,...patch}).success,false);
 const{referenceVersion:v,...male}=rows[0];assert.equal(dietaryReferenceRowSchema.safeParse({...male,menstrualBasis:'source-assumed-menstruating'}).success,false);assert.match(dietaryReferenceSubset.nutrientNotes.iron_mg,/do not establish either status/);
});
