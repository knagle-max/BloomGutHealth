/** drizzle-kit can log SQL errors yet exit0. Fail closed and expose only fixed
 * diagnostic categories, never raw output, SQL parameters or connection strings. */
export function assertSchemaPushResult({status,signal,stdout='',stderr=''}){
 const output=stdout+'\n'+stderr;
 const reason=signal?'terminated':/interactive prompts require|created or renamed/i.test(output)?'interactive-decision':/error:/i.test(output)?'logged-error':status!==0?'nonzero-exit':!/Changes applied|No changes detected/.test(output)?'missing-success':null;
 if(reason){const error=Error('Schema reconciliation did not complete successfully.');error.reason=reason;throw error;}
}
