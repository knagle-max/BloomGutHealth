import assert from 'node:assert/strict';
import net from 'node:net';
import {spawn} from 'node:child_process';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
// Accept the PostgreSQL socket but never answer its handshake: reproduces a
// stalled dependency without using credentials, real databases or health data.
const sockets=new Set(),database=net.createServer(socket=>{sockets.add(socket);socket.on('close',()=>sockets.delete(socket));});database.listen(0,'127.0.0.1');await new Promise(resolve=>database.once('listening',resolve));
const cwd=await mkdtemp(path.join(tmpdir(),'bloom-startup-')),secret='synthetic-startup-secret-for-isolated-test-only',entry=fileURLToPath(new URL('../../dist/index.js',import.meta.url));
const child=spawn(process.execPath,[entry],{cwd,env:{PATH:process.env.PATH,NODE_ENV:'production',DATABASE_URL:`postgresql://unused:unused@127.0.0.1:${database.address().port}/unused?sslmode=disable`,SESSION_SECRET:secret,PORT:'58999'},stdio:['ignore','pipe','pipe']});let output='';child.stdout.on('data',data=>{output+=data;});child.stderr.on('data',data=>{output+=data;});let timer;
try{
 const result=await Promise.race([new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal}))),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Startup did not fail within the bounded dependency window')),10000);})]);
 assert.equal(result.code,1);assert.match(output,/Initializing shared request budgets before readiness/);assert.match(output,/Application startup failed before readiness/);assert.doesNotMatch(output,/serving on port|postgresql:\/\/|synthetic-startup-secret|unused@|Connection terminated|Error:/);console.log('PASS production bundle with silent database handshake fails within10s, never binds readiness, and emits safe stage logs only');
}finally{clearTimeout(timer);if(child.exitCode===null)child.kill('SIGKILL');for(const socket of sockets)socket.destroy();await new Promise(resolve=>database.close(resolve));await rm(cwd,{recursive:true,force:true});}
