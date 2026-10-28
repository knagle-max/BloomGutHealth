import{and,eq,desc}from'drizzle-orm';
import{nutritionProducts}from'../shared/schema';
import{encryptPrecision,decryptPrecision}from'./precision-crypto';
import type{LabelInput,Product}from'../shared/products';
import type{db}from'./db';
type Database=Pick<typeof db,'select'|'insert'|'delete'>;
/** The existing encrypted private label store; source notes do not establish market or provider verification. */
export class PrivateProductStorage{
 constructor(private readonly database:Database){}
 private project(label:LabelInput,id:string,createdAt:Date):Product{
  return{...label,source:'manual',id,url:null,retrievedAt:createdAt.toISOString(),notes:['Entered by you; not independently verified.']};
 }
 async getNutritionProducts(userId:string):Promise<Product[]>{
  const rows=await this.database.select().from(nutritionProducts).where(eq(nutritionProducts.userId,userId)).orderBy(desc(nutritionProducts.createdAt)).limit(200);
  return rows.map(row=>this.project(decryptPrecision(row.encryptedPayload,userId)as LabelInput,row.id,row.createdAt));
 }
 async insertNutritionProduct(userId:string,label:LabelInput):Promise<Product>{
  const[row]=await this.database.insert(nutritionProducts).values({userId,encryptedPayload:encryptPrecision(label,userId)}).returning();
  return this.project(label,row.id,row.createdAt);
 }
 async deleteNutritionProduct(userId:string,id:string):Promise<boolean>{
  const rows=await this.database.delete(nutritionProducts).where(and(eq(nutritionProducts.userId,userId),eq(nutritionProducts.id,id))).returning({id:nutritionProducts.id});return rows.length>0;
 }
}
