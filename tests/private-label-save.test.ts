import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {nutritionProducts} from '../shared/schema';
import {PrivateProductStorage,spentLabelPrefix} from '../server/private-product-storage';
import {decryptPrecision,encryptPrecision} from '../server/precision-crypto';
const label={name:'Synthetic exact package',barcode:'023249090021',brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{protein_g:0,iron_mg:10},sourceNote:'Original source, not independently verified'};
test('committed reusable-label save recovers once after a lost reply, rejects changed intent, stays owned and cannot resurrect after deletion',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 try{await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b')");await pg.exec(readFileSync(new URL('../migrations/0003_nutrition_products.sql',import.meta.url),'utf8'));const store=new PrivateProductStorage(drizzle(pg)as any),intent=randomUUID();
 const [first,concurrent]=await Promise.all([(store.insertNutritionProduct as any)('a',label,intent),(store.insertNutritionProduct as any)('a',label,intent)]);assert.equal(first.id,concurrent.id,'A lost reply or concurrent retry is not a second reusable label');assert.equal((await store.getNutritionProducts('a')).length,1);assert.equal(first.perServing.protein_g,0);assert.equal(first.perServing.sodium_mg,undefined);
 const replay=await(store.insertNutritionProduct as any)('a',label,intent.toUpperCase());assert.equal(replay.id,first.id);assert.equal(replay.retrievedAt,first.retrievedAt);assert.ok(!('intentId'in replay)&&!('requestHash'in replay));
 await assert.rejects(()=>(store.insertNutritionProduct as any)('a',{...label,perServing:{protein_g:1}},intent),(error:any)=>error.code==='LABEL_SAVE_CONFLICT');
 const foreign=await(store.insertNutritionProduct as any)('b',label,intent);assert.notEqual(foreign.id,first.id);assert.equal((await store.getNutritionProducts('b')).length,1);
 const frozen=structuredClone(first);assert.equal(await store.deleteNutritionProduct('a',first.id),true);assert.equal(await store.deleteNutritionProduct('a',first.id),false);assert.equal(await store.deleteNutritionProduct('a',spentLabelPrefix+first.id),false);
 await assert.rejects(()=>(store.insertNutritionProduct as any)('a',label,intent),(error:any)=>error.code==='LABEL_SAVE_DELETED');assert.equal((await store.getNutritionProducts('a')).length,0);assert.equal(frozen.perServing.iron_mg,10,'Independent saved event snapshots retain their original source');
 const marker=(await pg.query('SELECT encrypted_payload FROM nutrition_products WHERE id=$1',[spentLabelPrefix+first.id])).rows[0]as any;const plain=decryptPrecision(marker.encrypted_payload,'a');assert.deepEqual(plain,{version:'private-label-intent-spent-v1',intentId:intent});
 const freshIntent=randomUUID(),deliberate=await(store.insertNutritionProduct as any)('a',label,freshIntent);assert.notEqual(deliberate.id,first.id);assert.equal((await store.getNutritionProducts('a')).length,1);

 await drizzle(pg).insert(nutritionProducts).values(Array.from({length:199},(_,index)=>({id:'capacity:'+index,userId:'a',encryptedPayload:encryptPrecision({...label,name:'Synthetic capacity '+index},'a')})));assert.equal((await store.getNutritionProducts('a')).length,200);assert.equal((await(store.insertNutritionProduct as any)('a',label,freshIntent)).id,deliberate.id,'A committed receipt recovers even at the active-label ceiling');await assert.rejects(()=>(store.insertNutritionProduct as any)('a',label,randomUUID()),(error:any)=>error.code==='LABEL_LIMIT');
 await pg.query('DELETE FROM users WHERE id=$1',['a']);assert.equal(Number((await pg.query('SELECT count(*) AS count FROM nutrition_products WHERE user_id=$1',['a'])).rows[0].count),0,'Account erasure removes technical markers too');
 await assert.rejects(()=>(store.insertNutritionProduct as any)('a',label,randomUUID()),(error:any)=>error.code==='ACCOUNT_REQUIRED');
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
