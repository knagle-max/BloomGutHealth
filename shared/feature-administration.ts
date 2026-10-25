/** Internal review metadata only. These fields never authorize feature execution. */
export interface FeatureReviewEntry {
 id:string;name:string;group:string;category:string;approval:string;
 reportedImplementation:string;implementationReadiness:null;registryPublicEnabled:boolean;
 review:{commit:string|null;evidence:string;requirements:string;proposedJurisdiction:string;approvedScopes:never[]};
 deploymentAvailability:'UNVERIFIED';
 activation:{state:'UNCONFIGURED';rolloutPercent:null;targetCohort:null;lastChange:null};
 status:'Pending review'|'Incident disabled'|'Internal research'|'Verification pending'|'Unavailable';
 blockers:string[];
}
export interface FeatureReviewManifest {
 mode:'READ_ONLY';registryVersion:string;buildRevision:string|null;
 entries:FeatureReviewEntry[];limitations:string[];
}
