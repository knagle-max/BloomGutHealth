// Bloom modular-monolith import guard. Run: node scripts/qa/check-architecture-boundaries.mjs
// Conservative: only hard architectural layering rules fail. Cross-domain coupling and cycles are reported for inspection.
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const dirs=['shared','server','client/src'];
const files=[];
function walk(d){if(!fs.existsSync(d))return;for(const ent of fs.readdirSync(d,{withFileTypes:true})){let p=path.join(d,ent.name);if(ent.isDirectory())walk(p);else if(/\.(ts|tsx|js|mjs)$/.test(ent.name))files.push(p.replaceAll('\\','/'));}}
for(const d of dirs)walk(d);
const known=new Set(files);const edges=new Map();const violations=[];
const resolve=(src,spec)=>{let base=spec.startsWith('@shared/')?'shared/'+spec.slice(8):spec.startsWith('@/')?'client/src/'+spec.slice(2):spec.startsWith('.')?path.posix.normalize(path.posix.join(path.posix.dirname(src),spec)):null;if(!base)return null;for(const c of [base,base+'.ts',base+'.tsx',base+'.js',base+'.mjs',base+'/index.ts',base+'/index.tsx'])if(known.has(c))return c;return null;};
for(const file of files){const code=fs.readFileSync(file,'utf8');const imports=[...code.matchAll(/(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]|\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g)].map(m=>m[1]||m[2]);let dependencies=[];for(const spec of imports){const target=resolve(file,spec);if(!target)continue;dependencies.push(target);if(file.startsWith('shared/')&&!target.startsWith('shared/'))violations.push(file+' -> '+target+' (shared must not depend on runtime layers)');if(file.startsWith('server/')&&target.startsWith('client/'))violations.push(file+' -> '+target+' (server importing client)');if(file.startsWith('client/')&&target.startsWith('server/'))violations.push(file+' -> '+target+' (client importing server)');}edges.set(file,dependencies);}
const cycles=[];const state=new Map();const stack=[];
function visit(node){const s=state.get(node);if(s===2)return;if(s===1){const i=stack.indexOf(node);if(i>=0){const cyc=[...stack.slice(i),node];const sig=cyc.slice(0,-1).sort().join('|');if(!cycles.some(x=>x.sig===sig))cycles.push({sig,path:cyc});}return;}state.set(node,1);stack.push(node);for(const dep of edges.get(node)||[])visit(dep);stack.pop();state.set(node,2);}
for(const file of files)visit(file);
const soft= [...edges.entries()].flatMap(([from,to])=>to.filter(x=>from.startsWith('shared/')&&(/weekly-planner|meal-intelligence|practical-planner/.test(from))&&(/science-coach|evidence-network/.test(x))).map(x=>from+' -> '+x));
console.log(JSON.stringify({filesScanned:files.length,edges:[...edges.values()].reduce((a,b)=>a+b.length,0),layeringViolations:violations,circularImports:cycles.map(x=>x.path),plannerEvidenceImports:soft},null,2));
if(violations.length)process.exitCode=1;
// Cycles and soft risks are reported, not auto-failed until observed in baseline and triaged.
