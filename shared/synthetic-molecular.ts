import {z} from "zod";
export const syntheticMolecularCommandSchema=z.object({version:z.literal("synthetic-molecular-v1"),scenario:z.enum(["crossfeed-default","substrate-absent","consumption-exceeds-supply","uptake-reversal"])}).strict();
export type SyntheticMolecularCommand=z.infer<typeof syntheticMolecularCommandSchema>;
const rational=z.string().max(40).regex(/^-?\d+(?:\/[1-9]\d*)?$/);
const values=z.object({entry:rational,producer:rational,consumer:rational,exit:rational,exchange:rational}).strict();
export const syntheticMolecularResultSchema=z.object({
 version:z.literal("synthetic-molecular-v1"),scenario:syntheticMolecularCommandSchema.shape.scenario,
 requestHash:z.string().regex(/^[a-f0-9]{64}$/),engine:z.literal("synthetic-vertex-lp-v1"),modelVersion:z.literal("synthetic-crossfeed-v1"),
 scope:z.literal("synthetic"),unit:z.literal("synthetic-flux-unit"),evidenceState:z.literal("modelled_reaction_flux"),personalPrediction:z.literal(false),applyToUser:z.literal(false),
 status:z.enum(["optimal","infeasible"]),objective:rational.nullable(),fluxes:values.nullable(),balanceResiduals:z.object({a:z.literal("0"),b:z.literal("0"),shared:z.literal("0")}).strict().nullable(),
 limitations:z.array(z.string().min(1).max(500)).min(1).max(10),
}).strict().superRefine((row,ctx)=>{if(row.status==="infeasible"?(row.objective!==null||row.fluxes!==null||row.balanceResiduals!==null):(row.objective===null||row.fluxes===null||row.balanceResiduals===null))ctx.addIssue({code:"custom",message:"Infeasibility must remain distinct from a zero solution"});});
