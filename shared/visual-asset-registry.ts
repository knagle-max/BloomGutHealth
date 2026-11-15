import {z} from 'zod';

export const visualAssetIdSchema=z.string().regex(/^BVA-[0-9]{4}$/);
export const visualAssetLifecycleSchema=z.enum(['Identified','Briefed','Approved for Production','Generated','Design Reviewed','Scientific Reviewed','Approved','Integrated','Visually Verified','Retired']);
const localAssetPath=z.string().regex(/^\/(?:images|brand|science)\/[A-Za-z0-9_@./-]+$/).refine(path=>!path.split('/').includes('..'),'Asset paths cannot escape public artwork');
export const visualAssetRegistrySchema=z.object({
 schemaVersion:z.literal('1.0.0'),
 assets:z.array(z.object({id:visualAssetIdSchema,name:z.string().min(1),route:z.string().min(1),component:z.string().min(1),purpose:z.string().min(1),category:z.string().min(1),mode:z.array(z.string().min(1)).min(1),lifecycle:visualAssetLifecycleSchema,ownerApproval:z.object({approved:z.boolean()}).passthrough().optional(),filePaths:z.array(localAssetPath),sourceRelation:z.object({existingRegistry:z.string().nullable(),existingSlot:z.string().nullable()}).passthrough(),integration:z.object({verified:z.boolean()}).passthrough()}).passthrough()),
 retiredAssetIds:z.array(visualAssetIdSchema),
}).passthrough().superRefine((registry,ctx)=>{
 const ids=new Set<string>(),slots=new Set<string>(),retired=new Set(registry.retiredAssetIds);
 registry.assets.forEach((asset,index)=>{
  if(ids.has(asset.id))ctx.addIssue({code:'custom',path:['assets',index,'id'],message:'Permanent visual IDs must be unique'});ids.add(asset.id);
  if(retired.has(asset.id)&&asset.lifecycle!=='Retired')ctx.addIssue({code:'custom',path:['assets',index,'lifecycle'],message:'Retired IDs cannot be reused'});
  if((asset.lifecycle==='Integrated'||asset.lifecycle==='Visually Verified'||asset.integration.verified)&&asset.ownerApproval?.approved===false)ctx.addIssue({code:'custom',path:['assets',index,'ownerApproval'],message:'A rejected or unapproved rendition cannot become an integrated asset'});
  if((asset.lifecycle==='Integrated'||asset.lifecycle==='Visually Verified'||asset.integration.verified)&&asset.filePaths.length===0)ctx.addIssue({code:'custom',path:['assets',index,'filePaths'],message:'Integration requires local first-party artwork'});
  if(asset.sourceRelation.existingRegistry==='client/src/content/editorial-media.ts'&&asset.sourceRelation.existingSlot){
   const slot=asset.sourceRelation.existingSlot;if(slots.has(slot))ctx.addIssue({code:'custom',path:['assets',index,'sourceRelation'],message:'An editorial slot must have one authoritative visual ID'});slots.add(slot);
  }
 });
});
export type VisualAssetRegistry=z.infer<typeof visualAssetRegistrySchema>;

/** Build projection only. The full planning/prompts registry is never bundled
 * into the client. This is a delivery binding, not a second production registry. */
export function editorialVisualProjection(input:unknown){
 const registry=visualAssetRegistrySchema.parse(input);
 const bindings=Object.fromEntries(registry.assets.filter(asset=>asset.lifecycle!=='Retired'&&asset.sourceRelation.existingRegistry==='client/src/content/editorial-media.ts'&&asset.sourceRelation.existingSlot).map(asset=>[asset.sourceRelation.existingSlot!,asset.id]));
 return{ids:registry.assets.filter(asset=>asset.lifecycle!=='Retired').map(asset=>asset.id),bindings};
}
