import {createHash} from "node:crypto";
import {experienceSettingsSchema,type ExperienceSettings} from "../shared/experience";
export const settingsRevision=(userId:string,settings:ExperienceSettings)=>createHash("sha256").update(JSON.stringify([userId,experienceSettingsSchema.parse(settings)])).digest("hex");
export class SettingsRevisionConflict extends Error{constructor(){super("Saved experience settings changed. Your draft was not applied; review the latest saved settings before saving again.");}}
