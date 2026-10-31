import { createHash } from 'node:crypto';
import { checkinSchema, type ExperienceEntry, type CheckinFeedbackView } from '../shared/experience';
export function checkinFeedbackView(userId:string,id:string,input:unknown):CheckinFeedbackView {
 const payload=checkinSchema.parse(input);
 const source={id,date:payload.date,mode:payload.mode,focus:payload.focus};
 const revision=createHash('sha256').update(JSON.stringify(['focus-feedback-v1',userId,source,payload.focusFeedback??null])).digest('hex');
 const feedback=payload.focusFeedback;
 return {source,revision,feedback:feedback?{version:feedback.version,response:feedback.response,focus:feedback.focus,date:feedback.date,mode:feedback.mode,recordedAt:feedback.recordedAt}:null};
}
/** Old clients cannot erase or silently retarget a server-owned subjective response. */
export function preserveFocusFeedback(entry:ExperienceEntry,previous:unknown){
 if(entry.kind!=='checkin')return entry.payload;
 if(entry.payload.focusFeedback!==undefined)throw Error('CHECKIN_FEEDBACK_ACTION_REQUIRED');
 if(previous&&typeof previous==='object'&&'focusFeedback' in previous&&previous.focusFeedback!==undefined){
  const parsed=checkinSchema.safeParse(previous);
  if(!parsed.success)throw Error('CHECKIN_FEEDBACK_SOURCE_INVALID');
  return {...entry.payload,focusFeedback:parsed.data.focusFeedback};
 }
 return entry.payload;
}

export class CheckinFeedbackConflict extends Error { constructor(){super("This focus or response changed. Review the current check-in before responding again.");} }
export class CheckinFeedbackInvalid extends Error { constructor(){super("Choose a saved focus before responding, or an existing response to clear.");} }
export const focusFeedbackReceipt=(userId:string,key:string)=>createHash("sha256").update(JSON.stringify(["focus-feedback-receipt-v1",userId,key])).digest("hex");
