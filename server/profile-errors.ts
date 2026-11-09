export class ProfileRevisionConflict extends Error {constructor(){super("Saved profile changed. Your draft was not applied; reload the latest saved profile before saving again.");}}
export class ProfileMeasurementMismatch extends Error {}
