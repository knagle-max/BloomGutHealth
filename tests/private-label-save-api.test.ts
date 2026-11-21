import test from 'node:test';
import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import express from 'express';
import {PrivateProductStorage} from '../server/private-product-storage';
import {registerProductRoutes,ProductService} from '../server/products';
test('owned versioned label HTTP command recovers a committed save, rejects conflicts/malformed commands, scrubs deletion and preserves legacy API',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');let server:any;
 try{await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b')");await pg.exec(readFileSync(new URL('../migrations/0003_nutrition_products.sql',import.meta.url),'utf8'));const store=new PrivateProductStorage(drizzle(pg)as any);const app=express();app.use(express.json());registerProductRoutes(app,((req:any,res:any,next:any)=>{const actor=req.get('x-owner');if(!['a','b'].includes(actor))return res.sendStatus(401);req.session={userId:actor};next();})as any,store,new ProductService(async()=>{throw Error('No source request during private save');},()=>false,()=>undefined));server=app.listen(0,'127.0.0.1');await new Promise<void>(r=>server.once('listening',r));const root=`http://127.0.0.1:${server.address().port}/api/products`;
 const send=async(method:string,path:string,body?:unknown,owner='a')=>{const response=await fetch(root+path,{method,headers:{'x-owner':owner,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return{status:response.status,headers:response.headers,body:await response.json().catch(()=>null)};};
 const label={name:'Synthetic exact private package',barcode:'023249090021',servingDescription:'1 capsule',servingGrams:null,perServing:{protein_g:0}},command={version:'private-label-save-v1',intentId:randomUUID(),label};
 assert.equal((await send('POST','',command,'')).status,401);const first=await send('POST','',command);assert.equal(first.status,201);assert.equal(first.headers.get('cache-control'),'no-store');assert.equal(first.body.barcode,label.barcode);assert.equal(first.body.perServing.protein_g,0);
 const replay=await send('POST','',command);assert.equal(replay.status,201);assert.equal(replay.body.id,first.body.id);assert.equal(replay.body.retrievedAt,first.body.retrievedAt);assert.equal((await store.getNutritionProducts('a')).length,1);
 assert.equal((await send('POST','',{...command,label:{...label,name:'Changed'}})).body.code,'LABEL_SAVE_CONFLICT');assert.equal((await send('POST','',{...command,userId:'b'})).status,400);
 const foreign=await send('POST','',command,'b');assert.equal(foreign.status,201);assert.notEqual(foreign.body.id,first.body.id);assert.equal((await send('DELETE','/'+first.body.id,undefined,'b')).status,404);
 assert.equal((await send('DELETE','/'+first.body.id)).status,204);assert.equal((await send('POST','',command)).body.code,'LABEL_SAVE_DELETED');assert.deepEqual((await send('GET','/saved')).body,[]);
 const legacy=await send('POST','',label);assert.equal(legacy.status,201);assert.equal(legacy.body.name,label.name);assert.equal((await send('GET','/saved')).body.length,1);
 }finally{server?.closeAllConnections();if(server)await new Promise<void>(r=>server.close(r));await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
