/** Implementation and release review are independent. Labels never confer access. */
export type ImplementationReadiness='PLANNED'|'IN_DEVELOPMENT'|'TESTABLE'|'FUNCTIONALLY_COMPLETE'|'VERIFIED';
export function developmentStatusLabel(readiness:ImplementationReadiness,category:string,approval:string):string|null {
 if(category==='DISABLED_INCIDENT')return 'Unavailable';
 const unfinished=readiness!=='VERIFIED'&&readiness!=='FUNCTIONALLY_COMPLETE';
 const implementation=readiness==='PLANNED'?'Not yet functional':unfinished?'In development':readiness==='FUNCTIONALLY_COMPLETE'&&category==='GENERAL_RELEASE'&&approval==='APPROVED'?'Verification pending':null;
 const release=category==='INTERNAL_RESEARCH_ONLY'?'Internal research only':category!=='GENERAL_RELEASE'||approval!=='APPROVED'?'Pending approval':null;
 if(implementation&&release)return `${implementation} · ${release.toLowerCase()}`;
 return implementation||release;
}
