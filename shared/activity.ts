import type {Activity} from './experience';
/** Source-zone display only; duration never becomes an energy/workload estimate. */
export function activityTimeText(activity:Activity){const stamp=new Date(activity.startedAt).toLocaleString(undefined,{...(activity.timeZone?{timeZone:activity.timeZone}:{})});return activity.routineSource?.timestampBasis==='log-time'?`Recorded ${stamp}; activity start time not supplied`:stamp;}
