import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {randomBytes,randomUUID} from 'node:crypto';
import {PGlite} from '@electric-sql/pglite';
import {drizzle} from 'drizzle-orm/pglite';
import {nutritionProducts} from '../shared/schema';
import {encryptPrecision,decryptPrecision} from '../server/precision-crypto';
import {PrivateProductStorage,spentLabelPrefix} from '../server/private-product-storage';
test('canonical private labels read legacy and future receipt envelopes, hide spent rows before limits, and delete envelopes without retaining label facts',async()=>{
 const pg=new PGlite(),prior=process.env.PRECISION_DATA_KEY;process.env.PRECISION_DATA_KEY=randomBytes(32).toString('base64');
 try{await pg.exec("CREATE TABLE users(id varchar PRIMARY KEY);INSERT INTO users VALUES('a'),('b')");await pg.exec(readFileSync(new URL('../migrations/0003_nutrition_products.sql',import.meta.url),'utf8'));const database=drizzle(pg),store=new PrivateProductStorage(database as any);
 const label={name:'Synthetic private source',barcode:'023249090021',brand:'Synthetic',servingDescription:'1 capsule',servingGrams:null,perServing:{protein_g:0},sourceNote:'Owned source note'};
 const legacy=await store.insertNutritionProduct('a',label),intentId=randomUUID(),id='a'.repeat(64),envelope={version:'private-label-save-v1',intentId,requestHash:'b'.repeat(64),label};await database.insert(nutritionProducts).values({id,userId:'a',encryptedPayload:encryptPrecision(envelope,'a')});
 await database.insert(nutritionProducts).values(Array.from({length:201},(_,index)=>({id:spentLabelPrefix+String(index),userId:'a',encryptedPayload:encryptPrecision({version:'private-label-intent-spent-v1',intentId:randomUUID()},'a')})));
 const loaded=await store.getNutritionProducts('a');assert.equal(loaded.length,2);assert.ok(loaded.every(product=>product.name===label.name&&product.barcode===label.barcode));assert.ok(loaded.every(product=>!('requestHash'in product)&&!('intentId'in product)));assert.deepEqual(await store.getNutritionProducts('b'),[]);
 assert.equal(await store.deleteNutritionProduct('b',id),false);assert.equal(await store.deleteNutritionProduct('a',id),true);assert.equal((await store.getNutritionProducts('a')).length,1);assert.equal(await store.deleteNutritionProduct('a',spentLabelPrefix+id),false);
 const raw=(await pg.query('SELECT encrypted_payload FROM nutrition_products WHERE id=$1',[spentLabelPrefix+id])).rows[0]as any,spent=decryptPrecision(raw.encrypted_payload,'a');assert.deepEqual(spent,{version:'private-label-intent-spent-v1',intentId});assert.doesNotMatch(JSON.stringify(spent),/Synthetic|protein|023249|requestHash|Owned/);
 assert.equal(await store.deleteNutritionProduct('a',legacy.id),true);assert.deepEqual(await store.getNutritionProducts('a'),[]);
 }finally{await pg.close();if(prior===undefined)delete process.env.PRECISION_DATA_KEY;else process.env.PRECISION_DATA_KEY=prior;}
});
