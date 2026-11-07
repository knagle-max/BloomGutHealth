import {createHash} from "node:crypto";
import {syntheticMolecularCommandSchema,syntheticMolecularResultSchema} from "../shared/synthetic-molecular";
import {mlServiceFetch} from "./ml-service";
/** Internal synthetic-only adapter. Not registered as a public app route and
 * never called with account observations, consent records, food or taxa. */
export async function runSyntheticMolecular(input:unknown,environment:Record<string,string|undefined>=process.env){
 const command=syntheticMolecularCommandSchema.parse(input);
 const response=await mlServiceFetch("/api/ml/research/synthetic",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(command)},environment);
 if(!response.ok)throw Error("Synthetic research is unavailable. Ordinary logging is unchanged.");
 const result=syntheticMolecularResultSchema.parse(await response.json());
 const requestHash=createHash("sha256").update(JSON.stringify(["synthetic-molecular-request-v1",command.scenario])).digest("hex");
 if(result.requestHash!==requestHash||result.scenario!==command.scenario)throw Error("The synthetic result does not match its request.");
 return result;
}
