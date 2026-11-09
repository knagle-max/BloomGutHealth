import type {Activity} from './experience';
/** Source-zone display only; duration never becomes an energy/workload estimate. */
export function activityTimeText(activity:Activity){return new Date(activity.startedAt).toLocaleString(undefined,{...(activity.timeZone?{timeZone:activity.timeZone}:{})});}
