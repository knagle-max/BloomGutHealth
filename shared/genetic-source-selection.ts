import{z}from"zod";
export const geneticsSourceControlSchema=z.object({sourceId:z.string().min(1).max(100).nullable(),revision:z.string().uuid()}).strict();
export type GeneticsSourceControl=z.infer<typeof geneticsSourceControlSchema>;
type SourceRecord={id:string;kind:string;createdAt:Date|string};
/** Legacy accounts retain their last source until a deliberate lifecycle action.
 * An explicit none/missing selection must never activate a historical dataset. */
export function selectedGeneticSource<T extends SourceRecord>(records:readonly T[],control?:GeneticsSourceControl):T|undefined{
 const sources=records.filter(r=>r.kind==="genetics");
 if(control)return control.sourceId===null?undefined:sources.find(r=>r.id===control.sourceId);
 return [...sources].sort((a,b)=>+new Date(b.createdAt)-+new Date(a.createdAt)||(a.id<b.id?1:a.id>b.id?-1:0))[0];
}
export function healthContextOnly<T extends{geneticsSelection?:unknown}>(context:T):Omit<T,"geneticsSelection">{const{geneticsSelection:_control,...health}=context;return health;}
export type GeneticDatasetSummary={id:string;revision:string;provider:"manual"|"23andMe"|"unrecognized";createdAt:string;collectedAt:string|null;callCount:number|null;readable:boolean;active:boolean};
export type GeneticSourceSnapshot={selectionRevision:string;activeId:string|null;state:"active"|"none"|"unavailable";sources:GeneticDatasetSummary[]};
export const geneticSourceCommandSchema=z.object({action:z.enum(["activate","delete"]),sourceId:z.string().min(1).max(100).nullable(),sourceRevision:z.string().regex(/^[a-f0-9]{64}$/).nullable(),selectionRevision:z.string().regex(/^[a-f0-9]{64}$/),confirmed:z.literal(true)}).strict().superRefine((v,ctx)=>{if(v.action==="delete"&&v.sourceId===null||v.sourceId!==null&&!v.sourceRevision||v.sourceId===null&&v.sourceRevision!==null)ctx.addIssue({code:"custom",message:"Choose a saved source and its current revision"});});
export type GeneticSourceCommand=z.infer<typeof geneticSourceCommandSchema>;
export const GENETIC_SOURCE_CONFIRM="manage-genetic-dataset";
export class GeneticSourceError extends Error{constructor(readonly code:"changed"|"unavailable"|"invalid"|"read-only"){super("Genetic source action could not be confirmed.");}}

const sourceSummarySchema=z.object({id:z.string().min(1).max(100),revision:z.string().regex(/^[a-f0-9]{64}$/),provider:z.enum(["manual","23andMe","unrecognized"]),createdAt:z.string().datetime({offset:true}),collectedAt:z.string().datetime({offset:true}).nullable(),callCount:z.number().int().nonnegative().nullable(),readable:z.boolean(),active:z.boolean()});
export const geneticSourceSnapshotSchema=z.object({selectionRevision:z.string().regex(/^[a-f0-9]{64}$/),activeId:z.string().nullable(),state:z.enum(["active","none","unavailable"]),sources:z.array(sourceSummarySchema)}).superRefine((v,ctx)=>{const active=v.sources.filter(r=>r.active);if(new Set(v.sources.map(r=>r.id)).size!==v.sources.length||(v.state==="active"?(active.length!==1||active[0]?.id!==v.activeId):active.length!==0||v.activeId!==null))ctx.addIssue({code:"custom",message:"Inconsistent genetic source snapshot"});});

export const geneticSourceDetailSchema=z.object({id:z.string().min(1).max(100),readable:z.boolean(),provider:z.string().max(100),collectedAt:z.string().datetime({offset:true}).nullable(),createdAt:z.string().datetime({offset:true}),build:z.string().max(200).nullable(),strand:z.string().max(40),observations:z.array(z.object({rsid:z.string().regex(/^rs[0-9]{1,12}$/),gene:z.string().max(60).nullable(),genotype:z.string().min(1).max(16),original:z.string().max(16).nullable()})),limitation:z.string().max(1500)});
