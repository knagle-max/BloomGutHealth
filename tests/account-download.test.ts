import test from 'node:test';import assert from 'node:assert/strict';
import {downloadAccountFile} from '../client/src/lib/account-download';import{bindRequestActor,AccountContextChangedError}from'../client/src/lib/request-actor';
test('private download checks the account after a delayed body and never creates a stale file',async()=>{
 const original=globalThis.fetch,create=URL.createObjectURL;let blobReady!:(b:Blob)=>void,bodyStarted!:()=>void;const started=new Promise<void>(r=>{bodyStarted=r;});let created=0;
 globalThis.fetch=(async(_url,init)=>{assert.equal(new Headers(init?.headers).get('X-Bloom-Actor'),'a');const response=new Response('{}');response.blob=()=>{bodyStarted();return new Promise<Blob>(r=>{blobReady=r;});};return response;})as typeof fetch;
 URL.createObjectURL=()=>{created++;throw Error('Unexpected private download');};
 try{bindRequestActor('a');const download=downloadAccountFile('/api/account/export','test.json');await started;bindRequestActor('b');blobReady(new Blob(['{}']));await assert.rejects(download,AccountContextChangedError);assert.equal(created,0);}finally{globalThis.fetch=original;URL.createObjectURL=create;bindRequestActor(null);}
});
