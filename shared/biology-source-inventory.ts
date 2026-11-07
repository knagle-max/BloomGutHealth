/** Navigation state counts stored source documents, never organisms, samples,
 * biological measurements, assay coverage or validated interpretations. */
export type GutReportInventory={saved:number;awaitingReview:number};
export function gutReportInventory(sources:readonly {processingStatus:string}[]):GutReportInventory{
 const saved=sources.filter(source=>source.processingStatus==="completed").length;
 return{saved,awaitingReview:sources.length-saved};
}
