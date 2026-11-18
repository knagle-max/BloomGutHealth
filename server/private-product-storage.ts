import{and,eq,desc,notLike,sql}from'drizzle-orm';
import{nutritionProducts,users}from'../shared/schema';
import{createHash}from'node:crypto';
import{stableReviewSourceValue}from'./meal-review-source';
import{encryptPrecision,decryptPrecision}from'./precision-crypto';
import {labelInputSchema,type LabelInput,type Product}from'../shared/products';
import {z} from 'zod';
import type{db}from'./db';
type Database=Pick<typeof db,'select'|'insert'|'delete'|'update'|'transaction'>;
export const spentLabelPrefix='spent-label:';
export const privateLabelEnvelopeSchema=z.object({version:z.literal('private-label-save-v1'),intentId:z.uuid(),requestHash:z.string().regex(/^[a-f0-9]{64}$/),label:labelInputSchema}).strict();
export class PrivateLabelSaveError extends Error {
 constructor(readonly status:number,readonly code:string,message:string){super(message);}
}
const labelIdentity=(actor:string,intentId:string)=>createHash('sha256').update(JSON.stringify(['private-label-save-v1',actor,intentId])).digest('hex');
const labelRevision=(actor:string,label:LabelInput)=>createHash('sha256').update(JSON.stringify(stableReviewSourceValue({version:'private-label-save-v1',actor,label}))).digest('hex');
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
 async insertNutritionProduct(userId:string,input:LabelInput,intent?:string):Promise<Product>{
  if(typeof userId!=='string'||!userId)throw new PrivateLabelSaveError(401,'ACCOUNT_REQUIRED','Sign in before saving a private label.');
  const label=labelInputSchema.parse(input),intentId=intent===undefined?undefined:z.uuid().parse(intent).toLowerCase();
  return this.database.transaction(async tx=>{
   await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId},2))`);
   const[actor]=await tx.select({id:users.id}).from(users).where(eq(users.id,userId)).for('key share');
   if(!actor)throw new PrivateLabelSaveError(401,'ACCOUNT_REQUIRED','Sign in before saving a private label.');
   const id=intentId?labelIdentity(userId,intentId):undefined,requestHash=labelRevision(userId,label);
   if(id){
    const[spent]=await tx.select({id:nutritionProducts.id}).from(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),eq(nutritionProducts.id,spentLabelPrefix+id)));
    if(spent)throw new PrivateLabelSaveError(409,'LABEL_SAVE_DELETED','This saved label was removed. Start a new label entry to save it again.');
    const[previous]=await tx.select().from(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),eq(nutritionProducts.id,id))).for('update');
    if(previous){
     const receipt=privateLabelEnvelopeSchema.safeParse(decryptPrecision(previous.encryptedPayload,userId));
     if(!receipt.success||receipt.data.intentId!==intentId||receipt.data.requestHash!==requestHash||labelRevision(userId,receipt.data.label)!==requestHash)throw new PrivateLabelSaveError(409,'LABEL_SAVE_CONFLICT','This save attempt changed. Review the label and start a new entry.');
     return this.project(receipt.data.label,previous.id,previous.createdAt);
    }
   }
   const[count]=await tx.select({count:sql<number>`count(*)::int`}).from(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),notLike(nutritionProducts.id,spentLabelPrefix+'%')));
   if(count.count>=200)throw new PrivateLabelSaveError(422,'LABEL_LIMIT','Your private label list is full. Remove an unused label before saving another.');
   const payload=intentId?privateLabelEnvelopeSchema.parse({version:'private-label-save-v1',intentId,requestHash,label}):label;
   const[row]=await tx.insert(nutritionProducts).values({...(id?{id}:{}),userId,encryptedPayload:encryptPrecision(payload,userId)}).returning();
   return this.project(label,row.id,row.createdAt);
  });
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
