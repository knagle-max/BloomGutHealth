import {parseArgs} from 'node:util';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {snapshotFoods,loggingFoods,lookupSnapshotNutrition} from '../shared/food-snapshot';
import {nutrientDefinitionDetails} from '../shared/nutrient-definitions';
import {catalogueFoods,lookupCatalogueNutrition,findFoodCandidates} from '../server/food-catalog';
import manifest from '../server/data/fndds-manifest.json';
import {foodSourceCoverage} from '../shared/source-coverage';
// Public checked-in adapter inputs only. No database, environment credentials,
// network requests, user report or clinical evaluation is imported/invoked.
const {values}=parseArgs({options:{output:{type:'string'},verify:{type:'boolean',default:false}},strict:true,allowPositionals:false});
const files=['shared/data/planning-foods.json','shared/data/logging-foods.json','shared/nutrient-definitions.ts','shared/meal-intelligence.ts','shared/food-snapshot.ts','shared/source-coverage.ts','scripts/source-coverage.ts','server/food-catalog.ts','server/data/fndds-manifest.json','server/data/fndds-2021-2023.json.gz'];
const sourceHashes=Object.fromEntries(await Promise.all(files.map(async file=>[file,createHash('sha256').update(await readFile(file)).digest('hex')])));
const probe=[...snapshotFoods,...loggingFoods].map((food,index)=>{const result=lookupSnapshotNutrition([{name:food.name,grams:100,preparation:'',assumption:''}],false);return{index,matched:result.foodMatches.length===1&&result.foodMatches[0].fdcId===food.fdcId,capturedFields:result.nutrientSourceSnapshots[0]?.values.length??0};});
const adapterProbe={basis:'Synthetic100g lookup per public prepared-food row; not a consumed meal or private history',requestedRows:probe.length,exactSourceMatches:probe.filter(row=>row.matched).length,unmatchedSourceIndexes:probe.filter(row=>!row.matched).map(row=>row.index),capturedFieldCounts:Array.from(new Set(probe.map(row=>row.capturedFields))).sort((a,b)=>a-b)};
const fnddsCoverage=foodSourceCoverage({fndds:catalogueFoods.map(food=>({...food,id:`fdc:${food.fdcId}`,name:food.description,tags:[],group:'public-catalogue',dataType:manifest.source,url:`https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`,retrievedAt:manifest.retrievedAt}))},nutrientDefinitionDetails());
const sampleIds=Array.from(new Set([catalogueFoods[0]?.fdcId,catalogueFoods[Math.floor(catalogueFoods.length/2)]?.fdcId,catalogueFoods.at(-1)?.fdcId,findFoodCandidates('pepperoni pizza')[0]?.fdcId])).filter((id):id is number=>typeof id==='number');
const fnddsProbe=sampleIds.map(fdcId=>{const food=catalogueFoods.find(food=>food.fdcId===fdcId)!,lookedUp=lookupCatalogueNutrition([{name:food.description.slice(0,120),grams:100,preparation:'',assumption:'',catalogue:{source:'usda-fndds',fdcId}}],false);return{fdcId,matched:lookedUp.foodMatches.length===1&&lookedUp.foodMatches[0].fdcId===fdcId,capturedFields:lookedUp.nutrientSourceSnapshots[0]?.values.length??0};});
const fndds={...fnddsCoverage,manifest:{source:manifest.source,url:manifest.url,retrievedAt:manifest.retrievedAt,declaredSourceArchiveSHA256:manifest.sourceZipSHA256,sourceArchiveReverified:false,catalogueDigestMatches:sourceHashes['server/data/fndds-2021-2023.json.gz']===manifest.catalogueSHA256,foodCountMatches:catalogueFoods.length===manifest.foodCount,excluded:manifest.excluded},adapterProbe:{basis:'Deterministic first/middle/last and pizza100g source-ID lookups; sampled adapter check, not every recipe or a consumed meal',requestedRows:fnddsProbe.length,exactSourceMatches:fnddsProbe.filter(row=>row.matched).length,sourceIds:sampleIds,capturedFieldCounts:Array.from(new Set(fnddsProbe.map(row=>row.capturedFields)))}};
const result={repositoryHead:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sourceHashes,adapterProbe,fndds,...foodSourceCoverage({planning:snapshotFoods,logging:loggingFoods},nutrientDefinitionDetails())};
const badFndds=!fndds.manifest.catalogueDigestMatches||!fndds.manifest.foodCountMatches||fndds.sourceMetadataIssues.length>0||fndds.fields.some(field=>field.invalid>0)||fndds.adapterProbe.exactSourceMatches!==fndds.adapterProbe.requestedRows;
if(values.verify&&(badFndds||result.sourceRows===0||result.sourceMetadataIssues.length||result.fields.some(field=>field.invalid>0)||adapterProbe.exactSourceMatches!==adapterProbe.requestedRows))throw Error('Public adapter source quality check failed; inspect inventory metadata and source joins.');
const output=JSON.stringify(result,null,2)+'\n';
if(values.output)await writeFile(values.output,output);else process.stdout.write(output);
