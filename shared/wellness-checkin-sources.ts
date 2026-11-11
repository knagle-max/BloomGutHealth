import {z} from 'zod';
import {checkinSchema} from './experience';
export const checkinRecordSourceSchema=z.object({id:z.string().min(1),kind:z.literal('checkin'),payload:checkinSchema,createdAt:z.iso.datetime({offset:true}),updatedAt:z.iso.datetime({offset:true})}).strict();
export type CheckinRecordSource=z.infer<typeof checkinRecordSourceSchema>;
export type CheckinSourceObservation={sourceId:string;sourceKind:'weekly-checkin'|'dated-measurement';sourceRevision:string;reportedOn:string;recordedAt:string|null;savedAt:string|null;updatedAt:string|null;temporalStatus:'future-entry'|'elapsed-entry'|'unknown';mode:'everyday'|'athlete'|null;recordedFields:string[]};
export type CheckinSourceGroup={status:'available'|'unavailable';limited:boolean;observations:CheckinSourceObservation[]};
export type CheckinSources={version:'wellness-checkin-sources-v1';purpose:'own-account-app';from:string;to:string;weekly:CheckinSourceGroup;body:CheckinSourceGroup};
