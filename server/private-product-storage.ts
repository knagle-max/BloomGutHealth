import{and,eq,desc,notLike,sql}from'drizzle-orm';
import{nutritionProducts}from'../shared/schema';
import{encryptPrecision,decryptPrecision}from'./precision-crypto';
import {labelInputSchema,type LabelInput,type Product}from'../shared/products';
import {z} from 'zod';
import type{db}from'./db';
type Database=Pick<typeof db,'select'|'insert'|'delete'|'update'|'transaction'>;
export const spentLabelPrefix='spent-label:';
export const privateLabelEnvelopeSchema=z.object({version:z.literal('private-label-save-v1'),intentId:z.uuid(),requestHash:z.string().regex(/^[a-f0-9]{64}$/),label:labelInputSchema}).strict();
function savedLabel(payload:unknown):LabelInput {
 if(payload&&typeof payload==='object'&&'version'in payload&&payload.version==='private-label-save-v1')return privateLabelEnvelopeSchema.parse(payload).label;
 return payload as LabelInput;
}
/** The existing encrypted private label store; source notes do not establish market or provider verification. */
export class PrivateProductStorage{
 constructor(private readonly database:Database){}
 private project(label:LabelInput,id:string,createdAt:Date):Product{
  return{...label,source:'manual',id,url:null,retrievedAt:createdAt.toISOString(),notes:['Entered by you; not independently verified.']};
 }
 async getNutritionProducts(userId:string):Promise<Product[]>{
  const rows=await this.database.select().from(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),notLike(nutritionProducts.id,spentLabelPrefix+'%'))).orderBy(desc(nutritionProducts.createdAt)).limit(200);
  return rows.map(row=>this.project(savedLabel(decryptPrecision(row.encryptedPayload,userId)),row.id,row.createdAt));
 }
 async insertNutritionProduct(userId:string,label:LabelInput):Promise<Product>{
  const[row]=await this.database.insert(nutritionProducts).values({userId,encryptedPayload:encryptPrecision(label,userId)}).returning();
  return this.project(label,row.id,row.createdAt);
 }
 async deleteNutritionProduct(userId:string,id:string):Promise<boolean>{
  if(id.startsWith(spentLabelPrefix))return false;
  return this.database.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},2))`);
   const where=and(eq(nutritionProducts.userId,userId),eq(nutritionProducts.id,id));
   const[row]=await tx.select().from(nutritionProducts).where(where).for('update');
   if(!row)return false;
   const raw=decryptPrecision(row.encryptedPayload,userId);
   if(raw&&typeof raw==='object'&&'version'in raw&&raw.version==='private-label-save-v1'){
    const receipt=privateLabelEnvelopeSchema.parse(raw);
    // Reader/deleter compatibility first: a later reviewed producer can use an
    // intent envelope without old readers leaking markers or resurrecting it.
    await tx.update(nutritionProducts).set({id:spentLabelPrefix+id,createdAt:new Date(),encryptedPayload:encryptPrecision({version:'private-label-intent-spent-v1',intentId:receipt.intentId},userId)}).where(where);
   }else await tx.delete(nutritionProducts).where(where);
   return true;
  });
 }
}
