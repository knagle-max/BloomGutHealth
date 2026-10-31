import {validateAIConfiguration} from '../server/ai-configuration';
// Offline review helper: no database, credential, provider or installation path.
try{
 if(process.argv.length!==2)throw Error('Invalid arguments');
 const chunks:Buffer[]=[];let size=0;
 for await(const chunk of process.stdin){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>128*1024)throw Error('Policy too large');chunks.push(bytes);}
 validateAIConfiguration(JSON.parse(Buffer.concat(chunks).toString('utf8')));
 console.log(JSON.stringify({configuration:'STRUCTURALLY_VALID_AND_CURRENT',approval:'NOT_VERIFIED',executorInstalled:false,providerCalls:0}));
}catch{
 console.error('AI policy validation failed. Review the strict schema, current dates, pinned model/tariff, reservation bounds, shared limits, grants and circuits privately. No executor installed.');
 process.exitCode=1;
}
