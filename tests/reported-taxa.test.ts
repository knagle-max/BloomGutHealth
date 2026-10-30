import test from 'node:test';import assert from 'node:assert/strict';
import{parseStructuredReport}from'../shared/structured-report';import{reportedTaxa,reportedTaxonAmount}from'../shared/reported-taxa';
test('functional source organisms remain clickable observations without invented percent or taxonomy',()=>{
 const structuredData=parseStructuredReport({organisms:[{name:'Methanobrevibacter smithii',abundance:{value:8,unit:'reads'},status:'Detected'},'Escherichia coli',{name:'Unknown organism',reportedAbundance:null}]});
 const sample={id:'source-1',structuredData},before=JSON.stringify(sample),taxa=reportedTaxa(sample,[]);
 assert.equal(taxa.length,3);assert.equal(reportedTaxonAmount(taxa[0]),'8 reads');assert.equal(reportedTaxonAmount(taxa[1]),'Not reported');assert.equal(taxa[0].taxonomyLevel,null);assert.equal(taxa[0].abundance,null);
 assert.equal(reportedTaxonAmount({...taxa[0],abundance:0}),'0%');assert.deepEqual(reportedTaxa({...sample,testDate:'2026-10-30'}as any,[]),taxa);assert.equal(JSON.stringify(sample),before);
 assert.notEqual(reportedTaxa({...sample,id:'other-source'},[])[0].id,taxa[0].id);
});
test('only exact original identities join numeric rows; strain spelling/read counts and precision stay separate',()=>{
 const sample={id:'a',structuredData:parseStructuredReport({organisms:['Escherichia coli','Escherichia coli strain A','escherichia coli','Escherichia coli']})};
 const row={id:'canonical',bacterialName:'Escherichia coli',taxonomyLevel:'species',abundance:1.23456789};const taxa=reportedTaxa(sample,[row]);assert.equal(taxa.length,5);assert.equal(taxa[0],row);assert.equal(reportedTaxonAmount(taxa[0]),'1.23456789%');assert.equal(reportedTaxonAmount(taxa[1]),'Not reported');assert.equal(taxa[2].bacterialName,'Escherichia coli strain A');
 const unique=reportedTaxa({id:'b',structuredData:parseStructuredReport({organisms:[{name:row.bacterialName,abundance:'8 reads',status:'Reported only'}]})},[row]);assert.equal(unique.length,1);assert.equal(unique[0].reportedAbundance,'8 reads');assert.equal(unique[0].reportedStatus,'Reported only');assert.equal(row.abundance,1.23456789);assert.equal('reportedStatus'in row,false);assert.deepEqual(reportedTaxa({id:'legacy',structuredData:{organisms:['Legacy unknown shape']}},[row]),[row]);
});
