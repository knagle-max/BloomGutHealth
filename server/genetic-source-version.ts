import {createHash} from 'node:crypto';
import type {PrecisionRecord} from '../shared/precision-nutrition';
/** Same canonical revision used by the existing owned genetic source manager. */
export function geneticSourceRevision(userId:string,row:PrecisionRecord){
 return createHash('sha256').update(JSON.stringify(['genetic-source-v1',userId,row.id,row.kind,row.createdAt,row.payload])).digest('hex');
}
