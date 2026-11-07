import test from "node:test";
import assert from "node:assert/strict";
import {functionalResearchFor,functionalResearchGroups} from "../shared/functional-microbiome";
import {evidenceSources} from "../shared/science-coach";
import {reportedTaxa,reportedTaxonAmount} from "../shared/reported-taxa";
import {parseStructuredReport} from "../shared/structured-report";

test("full-name research lookup preserves species/strain boundaries and uses the existing source",()=>{
  const research=functionalResearchFor({bacterialName:" RUMINococcus   bromii "});
  assert.equal(research?.source,evidenceSources.find(s=>s.id==="resistant-starch-2012"));
  assert.equal(research?.groupId,"starch-butyrate");
  assert.match(research!.source.design,/cultures/);
  for(const bacterialName of ["Ruminococcus","Ruminococcus spp.","Ruminococcus bromii strain L2-63","R. bromii","Ruminococcus bromii-like","Unknown organism"])
    assert.equal(functionalResearchFor({bacterialName}),null);
});
test("withdrawing or replacing a cited source withdraws education, without changing original observations",()=>{
  const taxon={id:"source-observation",bacterialName:"Ruminococcus bromii",reportedAbundance:"Not quantified",reportedStatus:"Not detected"};
  const before=JSON.stringify(taxon);
  assert.equal(functionalResearchFor(taxon,[]),null);
  assert.equal(functionalResearchFor(taxon,evidenceSources.map(s=>({...s,doi:"withdrawn"}))),null);
  assert.ok(functionalResearchFor(taxon));assert.equal(JSON.stringify(taxon),before);
});
test("groups count actual listed observations, retaining unknowns, true zero, duplicates and all source rows",()=>{
  const sample={id:"synthetic",structuredData:parseStructuredReport({organisms:[{name:"Ruminococcus bromii",status:"Not detected"},"Ruminococcus bromii","Other source organism","Ruminococcus bromii strain X"]})};
  const taxa=reportedTaxa(sample,[{id:"numeric",bacterialName:"Ruminococcus bromii",abundance:0}]);
  const before=JSON.stringify({sample,taxa});
  const groups=functionalResearchGroups(taxa);
  assert.equal(groups.length,1);assert.equal(groups[0].observationIds.length,3);
  assert.equal(reportedTaxonAmount(taxa[0]),"0%");
  assert.equal(taxa.length,5);assert.equal(JSON.stringify({sample,taxa}),before);
  assert.deepEqual(functionalResearchGroups(taxa.filter(t=>!groups[0].observationIds.includes(t.id))),[]);
  assert.deepEqual(functionalResearchGroups([]),[]);
});
