import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {extractApiDeclarations} from '../scripts/lib/api-exposure';
test('source audit includes static arrays/templates and flags mixed/indirect dynamic paths without executing source',()=>{
 const source='throw new Error("Never execute app source");\napp.get(["/api/meals", `/api/meals/:userId`] as const, auth, async(req,res)=>{});\napp.post(["/api/static", dynamicPath], handler);\napp.get(`/api/auth/${action}`, handler);\napp.delete(pathFromEnvironment(),handler);\nrouter.use("/api", auth);';
 const result=extractApiDeclarations('fixture.ts',source);
 assert.deepEqual(result.entries.map(row=>row.path),['/api/meals','/api/meals/:userId','/api/static','/api']);
 assert.deepEqual(result.entries[0].declaredMiddleware,['auth']);
 assert.equal(result.entries[0].line,2);
 assert.equal(result.unresolved.length,3);
 assert.deepEqual(result.unresolved.map(row=>row.method),['POST','GET','DELETE']);
 assert.ok([...result.entries,...result.unresolved].every(row=>row.review==='REVIEW_REQUIRED'));
});
test('non-API literals and unrelated object getters are not counted; unresolved receiver aliases are explicitly outside scope',()=>{
 const result=extractApiDeclarations('fixture.ts','app.get("/apiary", handler);app.get("/help",handler);storage.get("/api/private");app.get(`/help/${kind}`,handler);');
 assert.deepEqual(result.entries,[]);assert.deepEqual(result.unresolved,[]);
});
test('partial API prefixes and unscoped middleware remain reviewable without copying inline bodies or call arguments',()=>{
 const result=extractApiDeclarations('fixture.ts','app.get(`/${namespace}/x`,handler);app.get(`/ap${suffix}`,handler);app.use(session({secret:"do-not-copy"}));app.use((req,res,next)=>{ const confidential="do-not-copy";next();});');
 assert.equal(result.unresolved.length,4);
 assert.equal(result.unresolved[2].reason,'DYNAMIC_PATH_OR_UNSCOPED_MIDDLEWARE');
 assert.doesNotMatch(JSON.stringify(result),/do-not-copy/);
});
test('current meal routes are inventoried and generated auth/weekly/retired declarations remain visible for review',async()=>{
 const meals=extractApiDeclarations('server/routes.ts',await readFile(new URL('../server/routes.ts',import.meta.url),'utf8'));
 assert.ok(meals.entries.some(row=>row.path==='/api/meals'&&row.method==='GET'));
 assert.ok(meals.entries.some(row=>row.path==='/api/meals/:userId'&&row.method==='GET'));
 for(const file of ['auth-routes.ts','precision-routes.ts','retired-health-routes.ts']){
  const result=extractApiDeclarations('server/'+file,await readFile(new URL('../server/'+file,import.meta.url),'utf8'));
  assert.equal(result.unresolved.length,1,file);assert.match(result.unresolved[0].pathExpression,/^`\/api\//);
 }
});
