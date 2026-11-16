import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import crosswalk from '../shared/data/microbe-morphology-crosswalk-v1.json';
import manifest from '../design/visual-system/morphology-v1/DELIVERY_MANIFEST.json';
import {organismIllustration,type OrganismArtworkSource} from '../shared/scientific-visuals';
import {reportedTaxa} from '../shared/reported-taxa';
import {parseStructuredReport} from '../shared/structured-report';
import {VIOME_FINDINGS_VERSION} from '../shared/viome-findings';
const sample={id:'synthetic-morphology-source',structuredData:{schemaVersion:'bloom-report-v2',organisms:crosswalk.entries.map(entry=>({name:entry.reportedName,reportedStatus:null,reportedAbundance:'Not quantified',notes:`Provider group: ${entry.reportedGroup}`}))}};
const observations=reportedTaxa(sample,[]);
const source=(index:number):OrganismArtworkSource=>({reportId:sample.id,observationId:observations[index].id,observations});
test('94 exact source observations retain original data and share all eleven thumbnail/portrait morphology identities',()=>{
 const original=JSON.stringify(sample),groups:Record<string,number>={},styles=new Set();
 assert.equal(new Set(crosswalk.entries.map(e=>e.sourceOrdinal)).size,94);assert.equal(new Set(crosswalk.entries.map(e=>e.reportedName)).size,94);
 for(const [index,entry] of crosswalk.entries.entries()){
  groups[entry.reportedGroup]=(groups[entry.reportedGroup]||0)+1;
  const thumb=organismIllustration(entry.reportedName,'thumbnail',source(index)),portrait=organismIllustration(entry.reportedName,'portrait',source(index));
  assert.equal(thumb.styleId,entry.artworkStyleId);assert.equal(portrait.assetId,thumb.assetId);assert.equal(portrait.styleId,thumb.styleId);styles.add(thumb.styleId);
  assert.equal(thumb.label,entry.artworkStyleId==='U00'?crosswalk.disclosure.unknown:crosswalk.disclosure.group);
  assert.equal(observations[index].abundance,null);assert.equal(observations[index].reportedAbundance,'Not quantified');
 }
 assert.deepEqual(groups,{Bacterium:82,Eukaryote:5,Virus:7});assert.equal(styles.size,11);assert.equal(JSON.stringify(sample),original);
});
test('absent, foreign report scope, changed full name, group conflict and ambiguous identities stay neutral without taxonomy inference',()=>{
 const name=observations[0].bacterialName,ctx=source(0);
 const unknown=(label:string|undefined,context?:OrganismArtworkSource)=>assert.equal(organismIllustration(label,'portrait',context).styleId,'U00');
 unknown(name);unknown(undefined,ctx);unknown('Unknown source organism',ctx);unknown(name.toUpperCase(),ctx);unknown(name+' strain synthetic',ctx);
 unknown(name,{...ctx,reportId:'other-report',observations:observations.map(row=>({...row,sampleId:sample.id}))});unknown(name,{...ctx,observationId:'other-observation'});
 for(const row of [{...observations[0],reportedNotes:'Provider group: Virus'},{...observations[0],reportedGroup:'Virus'},{...observations[0],reportedGroup:'Bacterium',reportedNotes:'Provider group: Virus'},{...observations[0],sampleId:'foreign-report'}])unknown(name,{...ctx,observations:[row,...observations.slice(1)]});
 unknown(name,{...ctx,observations:[...observations,{...observations[0],id:'duplicate-source-name'}]});
 unknown(name,{...ctx,observations:[...observations,observations[0]]});
});
test('22 canonical optimized files preserve independently delivered bytes and dimensions; U00 output retains permanent BVA0047 identity',()=>{
 const hash=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
 assert.equal(hash(readFileSync('design/visual-system/morphology-v1/DELIVERY_MANIFEST.json')),'f33739f2bf0bf7562ec482d20b6e2933ef6c1d23a6e20366ea8f32d05a36fbd6');
 for(const style of crosswalk.styles){const asset=manifest.assets.find(row=>row.styleId===style.id)!;
  for(const size of ['thumbnail','portrait'] as const){const file=style[size],bytes=readFileSync('client/public'+file.publicPath);assert.equal(hash(bytes),asset[size].sha256);assert.equal(bytes.length,asset[size].bytes);assert.deepEqual(file.dimensions,size==='thumbnail'?[256,256]:[1024,1024]);assert.ok(file.publicPath.includes(style.registryAssetId));}
 }
 const neutral=crosswalk.styles.find(style=>style.id==='U00')!;assert.equal(neutral.registryAssetId,'BVA-0047');assert.match(neutral.thumbnail.archiveMember,/U00-U00/);assert.match(neutral.thumbnail.publicPath,/U00-BVA-0047/);
});
test('all22 morphology files are normally public under the existing passive resource headers without accounts or feature flags',async()=>{
 const {default:express}=await import('express');const {securityHeaders}=await import('../server/security');
 const app=express();app.use(securityHeaders);app.use(express.static('client/public'));const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));
 try{const port=(server.address() as {port:number}).port;for(const style of crosswalk.styles)for(const size of ['thumbnail','portrait'] as const){const response=await fetch(`http://127.0.0.1:${port}`+style[size].publicPath);assert.equal(response.status,200);assert.match(response.headers.get('content-type')!,/^image\/webp/);assert.equal(response.headers.get('set-cookie'),null);assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.match(response.headers.get('content-security-policy')!,/default-src 'none'/);assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),style[size].sha256);}}
 finally{await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
test('owner-listed exact source names choose reviewed conceptual styles without fixture ordinals or a species-rank gate',()=>{
 const expected:Record<string,string>={'Bacteroides vulgatus ATCC 8482':'C03','Bifidobacterium pseudocatenulatum':'C05','Blautia sp. SC05B48':'C02','Butyricimonas virosa':'C03','Bacteroides caccae':'C03','Bacteroides dorei CL03T12C01':'C03','Bacteroides heparinolyticus':'C03','Bacteroides sp. A1C1':'C03','Bacteroides sp. HF-162':'C03'};
 const legacy=Object.keys(expected).map((bacterialName,index)=>({id:'legacy-'+index,sampleId:'legacy-report',bacterialName,taxonomyLevel:index%2?'strain':null,abundance:index===0?0:null}));
 const original=JSON.stringify(legacy);
 for(const rows of [legacy,[...legacy].reverse(),legacy.map((row,index)=>({...row,reportedOrganismSourceId:'unrelated-provider-index:'+index}))])for(const row of rows){const ctx={reportId:'legacy-report',observationId:row.id,observations:rows},thumb=organismIllustration(row.bacterialName,'thumbnail',ctx),portrait=organismIllustration(row.bacterialName,'portrait',ctx);assert.equal(thumb.styleId,expected[row.bacterialName],row.bacterialName);assert.equal(portrait.styleId,thumb.styleId);}
 assert.equal(JSON.stringify(legacy),original);
});

test('owner mobile screenshot names use their delivered styles with no reported resolution',()=>{
 const expected:Record<string,string>={'Abiotrophia defectiva':'C01','Alistipes communis':'C03','Amedibacterium intestinale':'U00','Adlercreutzia sp. 8CFCBH1':'U00','Alistipes dispar':'C03','Anaerobutyricum hallii':'C04','Akkermansia muciniphila':'C03','Alistipes indistinctus':'C03','Anaerostipes hadrus':'C04','Anaerostipes rhamnosivorans':'C04'};
 const rows=Object.keys(expected).map((bacterialName,index)=>({id:`screenshot-${index}`,bacterialName,taxonomyLevel:null,abundance:null}));
 for(const row of rows)for(const size of ['thumbnail','portrait'] as const){
  const visual=organismIllustration(row.bacterialName,size,{reportId:'synthetic-screenshot',observationId:row.id,observations:rows});
  assert.equal(visual.styleId,expected[row.bacterialName],`${row.bacterialName} ${size}`);
 }
 assert.equal(new Set(rows.map(row=>organismIllustration(row.bacterialName,'thumbnail',{reportId:'synthetic-screenshot',observationId:row.id,observations:rows}).src)).size,4);
});

test('conflicting crosswalk rows fail neutral rather than silently choose a replacement classification',()=>{
 const original=crosswalk.entries.length,name=observations[0].bacterialName;
 try{crosswalk.entries.push({...crosswalk.entries[0],artworkStyleId:'C05'});assert.equal(organismIllustration(name,'thumbnail',source(0)).styleId,'U00');}
 finally{crosswalk.entries.splice(original);}
});
test('actual Viome import provider plurals retain every reviewed morphology style in list and profile',()=>{
 const groups:Record<string,string>={Bacterium:'Bacteria',Virus:'Viruses',Eukaryote:'Eukaryotes'};
 const input={schemaVersion:VIOME_FINDINGS_VERSION,provider:'Viome',documentKind:'active-gut-microbes',specimenType:'fecal',method:'qualitative RNA',biologicalDates:{},reviewConfirmed:true,organisms:crosswalk.entries.map((entry,index)=>({name:entry.reportedName,reportedGroup:groups[entry.reportedGroup],reportedStatus:'reported_present',position:{page:2,column:1,row:index+1}})),assessments:[],foods:[]};
 const imported={id:'synthetic-real-viome-parser',structuredData:parseStructuredReport(input)},rows=reportedTaxa(imported,[]),before=JSON.stringify(imported);
 for(const [index,row] of rows.entries())for(const size of ['thumbnail','portrait'] as const){assert.equal(organismIllustration(row.bacterialName,size,{reportId:imported.id,observationId:row.id,observations:rows}).styleId,crosswalk.entries[index].artworkStyleId,row.bacterialName);}
 assert.equal(JSON.stringify(imported),before);assert.equal(rows[0].taxonomyLevel,null);assert.equal(rows[0].abundance,null);
 const first=rows[0];for(const reportedGroup of ['Viruses','Eukaryotes','Unknown','bacterial-looking'])assert.equal(organismIllustration(first.bacterialName,'thumbnail',{reportId:imported.id,observationId:first.id,observations:[{...first,reportedGroup},...rows.slice(1)]}).styleId,'U00');
});
