/** drizzle-kit can log SQL errors yet exit0. Treat missing success or any logged
 * error as failure, without exposing its raw output or connection configuration. */
export function assertSchemaPushResult({status,signal,stdout='',stderr=''}){
 const output=stdout+'\n'+stderr;
 if(status!==0||signal||/error:|interactive prompts require/i.test(output)||!/Changes applied|No changes detected/.test(output))throw Error('Schema reconciliation did not complete successfully.');
}
