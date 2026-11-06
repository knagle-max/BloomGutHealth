import{z}from"zod";
export const microbiomeReportId=z.string().min(1).max(200).regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]*$/);
export const REPORT_DELETE_CONFIRM="delete-microbiome-report";
export class ReportDeletionConflict extends Error{constructor(){super("This report changed after you opened it. Reload and review the current report before deleting.");}}
export type MicrobiomeDeleteResult={success:true;state:"deleted"|"not-present"};
