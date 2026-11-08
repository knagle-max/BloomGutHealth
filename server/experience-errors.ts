export class ExperimentHistoryUnavailable extends Error {
 constructor(){super("Previous-version storage is unavailable. Your saved routine was not changed. Please retry after storage is restored.");}
}
