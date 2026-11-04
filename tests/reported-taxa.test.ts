import test from 'node:test';import assert from 'node:assert/strict';
import{parseStructuredReport}from'../shared/structured-report';import{reportedTaxa,reportedTaxonAmount,matchReportedTaxon}from'../shared/reported-taxa';
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

test('assay context uses verbatim supported source keys and retains conflicts/unknown rather than guessing',async()=>{
 const{microbiomeSourceFacts}=await import('../shared/structured-report');
 const source={metadata:{assay_type:'16S',qc_status:'Source says failed'},data:{organisms:['Reported name'],assay_type:'Shotgun metagenomics',vendor_method:'Original method v2',taxonomy_version:'Source taxonomy 2026',method:'Unrelated calculation',qc_notes:'Original QC note'}};
 const report=parseStructuredReport(source),facts=microbiomeSourceFacts(report);
 assert.deepEqual(facts.filter(f=>f.kind==='assay').map(f=>f.value),['Shotgun metagenomics','16S']);assert.ok(facts.some(f=>f.sourcePath==='sourceReport.data.vendor_method'&&f.value==='Original method v2'));assert.ok(facts.some(f=>f.value==='Source says failed'));assert.ok(!facts.some(f=>f.value==='Unrelated calculation'));
 assert.deepEqual(microbiomeSourceFacts(parseStructuredReport(JSON.parse(JSON.stringify(report)))),facts);assert.deepEqual(microbiomeSourceFacts(parseStructuredReport({organisms:['Unknown organism'],assay_type:0,assay_method:{name:'Not supported text'}})),[]);
});

test('side-by-side source matching requires unique exact names and known rank without rounding nonzero amounts',()=>{
 const row={id:'a',bacterialName:'Source organism',taxonomyLevel:'species',abundance:0.00000123};
 const previous={...row,id:'b',abundance:0};const source=JSON.stringify([row,previous]);
 assert.equal(reportedTaxonAmount(row),'0.00000123%');assert.equal(reportedTaxonAmount(previous),'0%');assert.equal(reportedTaxonAmount({...row,abundance:null}),'Not reported');
 assert.deepEqual(matchReportedTaxon(row,[row],[previous]),{status:'matched',taxon:previous});
 assert.deepEqual(matchReportedTaxon(row,[row],[previous,{...previous,id:'c'}]),{status:'ambiguous'});
 assert.deepEqual(matchReportedTaxon(row,[row,{...row,id:'d'}],[previous]),{status:'ambiguous'});
 for(const taxonomyLevel of[null,'','unknown','Not supplied'])assert.deepEqual(matchReportedTaxon({...row,taxonomyLevel},[{...row,taxonomyLevel}],[{...previous,taxonomyLevel}]),{status:'unknown-resolution'});
 for(const other of[{...previous,bacterialName:'source organism'},{...previous,bacterialName:'Source organism strain A'},{...previous,taxonomyLevel:'genus'}])assert.deepEqual(matchReportedTaxon(row,[row],[other]),{status:'unmatched'});
 assert.deepEqual(matchReportedTaxon(row,[],[previous]),{status:'unmatched'});assert.equal(JSON.stringify([row,previous]),source);
});
