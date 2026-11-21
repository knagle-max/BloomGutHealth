import original from './data/biology-content-r4m1-v2.json';
import {additionalLabProfiles,ADDITIONAL_LAB_CATALOG_VERSION} from './additional-lab-markers';
/** One canonical assembled registry. Original supplied and v2 source bytes and
 * their review statuses remain unchanged; additions have their own draft provenance. */
const labMarkerDefinitions=[...original.labMarkerDefinitions,...additionalLabProfiles];
const registry={...original,schemaVersion:original.schemaVersion+'+'+ADDITIONAL_LAB_CATALOG_VERSION,labMarkerDefinitions,counts:{...original.counts,supportedLab:labMarkerDefinitions.length}};
export default registry;
