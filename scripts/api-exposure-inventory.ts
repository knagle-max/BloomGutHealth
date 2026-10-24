import ts from 'typescript';
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
// Source evidence, not an authorization or runtime reachability proof. No source execution.
const entries:Array<{file:string;line:number;method:string;path:string;declaredMiddleware:string[];review:'REVIEW_REQUIRED'}>=[];
const sourceHashes:Record<string,string>={};
for(const file of (await readdir(new URL('../server/',import.meta.url))).filter(file=>file.endsWith('.ts')).sort()){
 const content=await readFile(new URL('../server/'+file,import.meta.url),'utf8');
 const source=ts.createSourceFile(file,content,ts.ScriptTarget.Latest,true);
 const before=entries.length;
 function visit(node:ts.Node){
  if(ts.isCallExpression(node)&&ts.isPropertyAccessExpression(node.expression)&&['get','post','put','patch','delete','use'].includes(node.expression.name.text)){
   const path=node.arguments[0];
   if(path&&ts.isStringLiteral(path)&&path.text.startsWith('/api'))entries.push({file:'server/'+file,line:source.getLineAndCharacterOfPosition(node.getStart()).line+1,method:node.expression.name.text.toUpperCase(),path:path.text,declaredMiddleware:node.arguments.slice(1,-1).filter(arg=>!ts.isArrowFunction(arg)&&!ts.isFunctionExpression(arg)).map(arg=>arg.getText(source)),review:'REVIEW_REQUIRED'});
  }
  ts.forEachChild(node,visit);
 }
 visit(source);if(entries.length>before)sourceHashes['server/'+file]=createHash('sha256').update(content).digest('hex');
}
const output=JSON.stringify({version:1,scope:'Literal /api Express declarations in top-level server/*.ts only',limitations:['USE rows are middleware mounts, not endpoints','In-handler auth, execution guards, family mounts and output filtering require manual review','Does not enumerate Python, dynamic routes, UI, jobs, tools, export fields or caches','REVIEW_REQUIRED is an inventory disposition, not a change to release approval or public access'],sourceHashes,entries},null,2)+'\n';
const target=new URL('../docs/operations/API_EXPOSURE_INVENTORY.json',import.meta.url);
if(process.argv.includes('--check')){if(await readFile(target,'utf8')!==output)throw Error('API source inventory changed; regenerate and review actual exposure');console.log('API source inventory matches current declarations');}
else{await writeFile(target,output);console.log(`Recorded ${entries.length} API declarations, including middleware mounts; authorization review remains open`);}
