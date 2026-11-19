import {test} from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';

test('production server and worker dependency graphs exclude optional Mac development tools',async()=>{
 const result=await build({
  absWorkingDir:fileURLToPath(new URL('..',import.meta.url)),
  entryPoints:['server/index.ts','server/weekly-worker.ts'],
  platform:'node',packages:'external',bundle:true,format:'esm',
  outdir:'dist',write:false,metafile:true,logLevel:'silent',
 });
 const paths=Object.keys(result.metafile!.inputs).map(path=>path.replaceAll('\\','/'));
 assert.ok(paths.includes('server/index.ts'));
 assert.ok(paths.includes('server/weekly-worker.ts'));
 const developmentPath=/(?:^|\/)(?:scripts\/development-science|ml_service\/development\.py|ml_service\/research\/(?:development_|ollama_development|micom_reference|reference_model_audit))/;
 for(const path of paths)assert.equal(developmentPath.test(path),false,`Development-only input: ${path}`);
 for(const path of paths)assert.equal(/(?:^|\/)server\/private-data-prototype\.ts$/.test(path),false,'Synthetic private transport must not enter production server/worker graphs');
 const optionalPackage=/^(?:ollama|tailscale|micom|cobra|cobrapy|https-proxy-agent)(?:\/|$)/;
 for(const input of Object.values(result.metafile!.inputs))for(const dependency of input.imports)
  if(dependency.external)assert.equal(optionalPackage.test(dependency.path),false,`Development-only dependency: ${dependency.path}`);
});
