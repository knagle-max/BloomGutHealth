/** Read-only source/build inventory. Static reachability is not execution or Design approval. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import ts from 'typescript';
const root=process.cwd();
const relative=(file:string)=>path.relative(root,file).split(path.sep).join('/');
function walk(dir:string):string[]{return fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]):[];}
const hash=(file:string)=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const resolveImport=(from:string,specifier:string)=>{
 const prefix=specifier.startsWith('@/')?'client/src/'+specifier.slice(2):specifier.startsWith('@shared/')?'shared/'+specifier.slice(8):specifier.startsWith('@assets/')?'attached_assets/'+specifier.slice(8):null;
 const base=prefix?path.resolve(root,prefix):specifier.startsWith('.')?path.resolve(path.dirname(from),specifier):specifier.startsWith('/src/')?path.resolve(root,'client',specifier.slice(1)):null;
 if(!base||!base.startsWith(root+path.sep))return null;
 return [base,...['.ts','.tsx','.js','.jsx','.json','.css'].map(ext=>base+ext),...['index.ts','index.tsx','index.js'].map(file=>path.join(base,file))].find(file=>fs.existsSync(file)&&fs.statSync(file).isFile())||null;
};
const pending=[path.resolve('client/src/main.tsx'),path.resolve('client/index.html')],seen=new Set<string>();
const imports:{from:string;to:string;kind:string}[]=[],dynamic:{file:string;line:number;kind:string}[]=[],texts=new Map<string,string>();
while(pending.length){const file=pending.pop()!;if(seen.has(file)||!fs.existsSync(file))continue;seen.add(file);if(!/\.(tsx?|jsx?|css|json|html)$/.test(file))continue;const text=fs.readFileSync(file,'utf8');texts.set(file,text);
 const add=(specifier:string,kind:string)=>{const target=resolveImport(file,specifier);if(target){imports.push({from:relative(file),to:relative(target),kind});pending.push(target);}};
 if(/\.[jt]sx?$/.test(file)){
  const ast=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,file.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const visit=(node:ts.Node)=>{
   if(ts.isImportDeclaration(node)&&ts.isStringLiteral(node.moduleSpecifier)){
    const c=node.importClause;const typeOnly=c?.isTypeOnly||!!c&&!c.name&&c.namedBindings&&ts.isNamedImports(c.namedBindings)&&c.namedBindings.elements.length>0&&c.namedBindings.elements.every(i=>i.isTypeOnly);
    if(!typeOnly)add(node.moduleSpecifier.text,'static-import');
   }
   if(ts.isExportDeclaration(node)&&!node.isTypeOnly&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))add(node.moduleSpecifier.text,'re-export');
   if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword){const arg=node.arguments[0];if(arg&&ts.isStringLiteral(arg))add(arg.text,'possible-lazy-import');else dynamic.push({file:relative(file),line:ast.getLineAndCharacterOfPosition(node.pos).line+1,kind:'computed-import-not-resolved'});}
   ts.forEachChild(node,visit);
  };visit(ast);
 }else if(file.endsWith('.css'))for(const m of text.matchAll(/@import\s+["']([^"']+)["']/g))add(m[1],'css-import');
 else if(file.endsWith('.html'))for(const m of text.matchAll(/<script[^>]+src=["']([^"']+)["']/g))add(m[1],'html-script');
}
// Manifests and public metadata are evaluated as files, not assumed to execute.
for(const file of walk(path.resolve('client/public')).filter(f=>/\.(json|webmanifest|html|css)$/.test(f)))texts.set(file,fs.readFileSync(file,'utf8'));
const designFiles=walk(path.resolve('design/bloom')).filter(f=>!f.endsWith('asset-runtime-audit.json'));
const publicFiles=walk(path.resolve('client/public'));
const designByHash=new Map<string,string[]>();for(const f of designFiles){const key=hash(f);designByHash.set(key,[...(designByHash.get(key)||[]),relative(f)]);}
const buildFiles=walk(path.resolve('dist/public'));if(!buildFiles.length)throw Error('Run npm run build before the source/build audit');
const engineeringTexts=walk(path.resolve('scripts')).filter(f=>/\.(tsx?|m?js|py|sh)$/.test(f)).map(file=>({file:relative(file),text:fs.readFileSync(file,'utf8')}));
const runtime=publicFiles.map(file=>{
 const url='/'+path.relative(path.resolve('client/public'),file).split(path.sep).join('/'),sha256=hash(file);
 const references=[...texts].filter(([,text])=>text.includes(url)).map(([file])=>relative(file));
 const built=path.resolve('dist/public',url.slice(1));
 return {path:relative(file),url,sha256,bytes:fs.statSync(file).size,sourceReferences:references,engineeringReferences:engineeringTexts.filter(s=>s.text.includes(url)).map(s=>s.file),classification:references.length?'STATIC_REFERENCE_CANDIDATE':'PUBLIC_FILE_WITHOUT_EXACT_STATIC_REFERENCE',buildCopy:fs.existsSync(built)?hash(built)===sha256?'BYTE_IDENTICAL':'DIFFERENT':'ABSENT',originalDesignMatches:designByHash.get(sha256)||[]};
});
const sourceImports=new Set(imports.map(i=>i.to));
const originalAssets=designFiles.map(file=>{const sha256=hash(file),r=relative(file);return{path:r,sha256,bytes:fs.statSync(file).size,runtimeCopies:runtime.filter(p=>p.sha256===sha256).map(p=>p.path),runtimeImported:sourceImports.has(r),classification:runtime.some(p=>p.sha256===sha256)||sourceImports.has(r)?'MAPPED_TO_RUNTIME_BYTES':'DESIGN_SOURCE_OR_REFERENCE_ONLY'};});
const duplicateHashes=[...designByHash].filter(([,files])=>files.length>1).map(([sha256,files])=>({sha256,files}));
const manifest=JSON.parse(fs.readFileSync('design/bloom/asset-manifest.json','utf8'));
const manifestVerification=manifest.files.map((entry:{path:string;sha256:string;bytes:number})=>{const file=path.resolve(root,entry.path);const allowed=file.startsWith(path.resolve('design/bloom')+path.sep);return{path:entry.path,status:!allowed?'INVALID_PATH':!fs.existsSync(file)?'MISSING':hash(file)===entry.sha256&&fs.statSync(file).size===entry.bytes?'BYTE_IDENTICAL':'MISMATCH'};});
const designFileTypes:Record<string,number>={};for(const f of designFiles){const extension=path.extname(f)||'(no extension)';designFileTypes[extension]=(designFileTypes[extension]||0)+1;}
const builtArtifacts=buildFiles.map(file=>({path:relative(file),sha256:hash(file),bytes:fs.statSync(file).size}));
const result={schemaVersion:1,auditorSha256:hash(path.resolve("scripts/asset-runtime-audit.ts")),sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scope:'All checked-out design/bloom files, client/public files, reachable local runtime imports from client entry and index.html, and current dist/public build. Type-only imports excluded; literal lazy imports are potential reachability.',limits:['Exact string references are candidates, not proof of rendering. Public files are shipped even when unreferenced.','Computed imports are reported; package internals, browser cache, conditional activation and computed public URLs are not fully resolved.','Concept/CSS adaptation cannot be inferred by equal bytes. Design-only reference does not mean unused or disposable. No deletions recommended.','No authenticated hosted resource trace or independent Design/licence approval is asserted.'],summary:{designFileTypes,manifestPaths:manifestVerification.length,manifestVerified:manifestVerification.filter((e:{status:string})=>e.status==='BYTE_IDENTICAL').length,manifestMissing:manifestVerification.filter((e:{status:string})=>e.status==='MISSING').length,designFiles:originalAssets.length,publicFiles:runtime.length,reachableModules:seen.size,possibleLazyImports:imports.filter(i=>i.kind==='possible-lazy-import').length,computedImports:dynamic.length,byteIdenticalPublicBuildCopies:runtime.filter(p=>p.buildCopy==='BYTE_IDENTICAL').length,originalFilesMappedToRuntime:originalAssets.filter(p=>p.classification==='MAPPED_TO_RUNTIME_BYTES').length,duplicateDesignGroups:duplicateHashes.length},manifestVerification,builtArtifacts,runtimePublic:runtime,originalAssets,sourceImports:imports,unresolvedDynamic:dynamic,duplicateDesignGroups:duplicateHashes};
const out='docs/operations/ASSET_RUNTIME_AUDIT.json';fs.writeFileSync(out,JSON.stringify(result,null,2)+'\n');
const wordmark=runtime.find(p=>p.url==='/brand/bloom-wordmark-dark.svg');if(!wordmark?.sourceReferences.some(p=>p.endsWith('BloomBrand.tsx'))||wordmark.buildCopy!=='BYTE_IDENTICAL'||!wordmark.originalDesignMatches.length)throw Error('Expected original wordmark source/build mapping missing');
const empty=runtime.find(p=>p.url==='/brand/empty-journal-illustration.svg');if(!empty?.sourceReferences.some(p=>p.endsWith('Dashboard.tsx')))throw Error('Expected empty-journal reference missing');
console.log(JSON.stringify(result.summary));console.log(out+'; static/source/build evidence only, not an unused-assets or visual-acceptance claim.');
