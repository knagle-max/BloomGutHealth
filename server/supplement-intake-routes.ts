import type {Express,RequestHandler} from 'express';
import {z} from 'zod';
import {supplementDraftSchema,supplementCreateCommandSchema,supplementEditCommandSchema,supplementRemoveCommandSchema} from '../shared/supplement-commands';
import {productResponseSchema} from '../shared/products';
import {productService,type ProductService} from './products';
import {SupplementIntakeError,supplementReviewRevision,type SupplementIntakeStorage} from './supplement-intake-storage';
import type {IStorage} from './storage';

const idSchema=z.string().regex(/^[a-f0-9]{64}$/);
const reviewSchema=z.object({draft:supplementDraftSchema,target:z.object({id:idSchema,revision:z.uuid()}).strict().optional(),refreshSource:z.boolean().default(false)}).strict();
/** Parent /api/experience middleware supplies active-account auth/no-store and
 * the canonical shared workspace budget; no caller-provided account ID. */
export function registerSupplementIntakeRoutes(app:Express,store:IStorage,source:SupplementIntakeStorage,limit:RequestHandler,products:Pick<ProductService,'resolve'>=productService){
 const fail=(res:any,error:unknown)=>error instanceof SupplementIntakeError?res.status(error.status).json({error:error.message,code:error.code}):error instanceof z.ZodError?res.status(400).json({error:'Check the supplement, time, amount and source fields.'}):res.status(503).json({error:'Supplement details could not load or save. Your draft has not been replaced.'});
 const material=async(userId:string,draft:z.infer<typeof supplementDraftSchema>,target?:{id:string;revision:string},refresh=false)=>{
  if(draft.source.kind==='unlabelled')return null;
  if(target){
   const saved=await source.get(userId,target.id);
   if(!saved)throw new SupplementIntakeError(404,'NOT_FOUND','This intake is not in your account.');
   if(saved.payload.revision!==target.revision)throw new SupplementIntakeError(409,'SOURCE_CHANGED','This intake changed. Reload its current details.');
   const captured=saved.payload.current.label;
   if(!refresh&&captured?.id===draft.source.product.id&&captured.source===draft.source.product.source)return captured;
  }
  const identity=draft.source.product;
  const label=(await products.resolve(identity,store,userId)).find(label=>label.id===identity.id&&label.source===identity.source);
  if(!label)throw new SupplementIntakeError(503,'SOURCE_UNAVAILABLE','This label is unavailable. Retry or explicitly choose an unlabelled entry; no substitute was selected.');
  return productResponseSchema.parse(label);
 };
 app.get('/api/experience/supplement-intakes',async(req,res)=>{
  res.setHeader('X-Bloom-Supplement-Reader','supplement-intake-v1');
  const page=z.object({offset:z.coerce.number().int().min(0).max(10000).default(0),limit:z.coerce.number().int().min(1).max(25).default(25)}).strict().safeParse(req.query);
  if(!page.success)return res.status(400).json({error:'Choose a valid intake page.'});
  try{res.json(await source.list(req.session.userId!,page.data.offset,page.data.limit));}catch(error){fail(res,error);}
 });
 app.get('/api/experience/supplement-intakes/:id',async(req,res)=>{
  if(!idSchema.safeParse(req.params.id).success)return res.status(400).json({error:'Choose a valid intake entry.'});
  try{const record=await source.get(req.session.userId!,req.params.id);if(!record)return res.status(404).json({error:'This intake is not in your account.'});res.json(record);}catch(error){fail(res,error);}
 });
 app.post('/api/experience/supplement-intakes/review',limit,async(req,res)=>{
  const parsed=reviewSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Check the supplement, time, amount and source fields.'});
  try{
   const userId=req.session.userId!,lifecycleId=await source.reviewScope(userId),{draft,target,refreshSource}=parsed.data;
   // Check target ownership/revision even when the new source is unlabelled.
   if(target){const current=await source.get(userId,target.id);if(!current)return res.status(404).json({error:'This intake is not in your account.'});if(current.payload.revision!==target.revision)return res.status(409).json({error:'This intake changed. Reload its current details.',code:'SOURCE_CHANGED'});}
   const label=await material(userId,draft,target,refreshSource),reviewRevision=supplementReviewRevision(userId,lifecycleId,draft,label,target);
   res.json({userId,lifecycleId,reviewRevision,label,draft,previewOnly:true,ingestionRecorded:false});
  }catch(error){fail(res,error);}
 });
 app.post('/api/experience/supplement-intakes/confirm',limit,async(req,res)=>{
  const parsed=supplementCreateCommandSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Review the entry and explicitly confirm it was taken.'});
  try{
   const userId=req.session.userId!,command=parsed.data,replay=await source.recoverCreate(userId,command);
   if(replay)return res.json(replay);
   await source.validateScope(userId,command.lifecycleId);
   const label=await material(userId,command.draft);
   res.json(await source.create(userId,command,label));
  }catch(error){fail(res,error);}
 });
 app.put('/api/experience/supplement-intakes/:id/confirm',limit,async(req,res)=>{
  if(!idSchema.safeParse(req.params.id).success)return res.status(400).json({error:'Choose a valid intake entry.'});
  const parsed=supplementEditCommandSchema.extend({refreshSource:z.boolean().default(false)}).safeParse(req.body);
  if(!parsed.success)return res.status(400).json({error:'Review the correction before confirming it.'});
  try{
   const userId=req.session.userId!,{refreshSource,...command}=parsed.data,current=await source.get(userId,req.params.id);
   if(!current)return res.status(404).json({error:'This intake is not in your account.'});
   // A committed latest edit replays without re-fetching any removed source.
   if(current.payload.revision===command.editId)return res.json(await source.correct(userId,current.id,command));
   await source.validateScope(userId,command.lifecycleId);
   const target={id:current.id,revision:command.expectedRevision},label=await material(userId,command.draft,target,refreshSource);
   const captured=current.payload.current.label;
   const retaining=!refreshSource&&command.draft.source.kind==='label'&&captured?.id===command.draft.source.product.id&&captured.source===command.draft.source.product.source;
   res.json(await source.correct(userId,current.id,command,retaining?undefined:label));
  }catch(error){fail(res,error);}
 });
 app.delete('/api/experience/supplement-intakes/:id',limit,async(req,res)=>{
  if(!idSchema.safeParse(req.params.id).success)return res.status(400).json({error:'Choose a valid intake entry.'});
  const parsed=supplementRemoveCommandSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Reload the entry before removing it.'});
  try{if(!await source.remove(req.session.userId!,req.params.id,parsed.data))return res.status(404).json({error:'This intake is not in your account.'});res.status(204).end();}catch(error){fail(res,error);}
 });
}
