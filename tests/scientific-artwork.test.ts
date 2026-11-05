import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import registry from '../shared/data/scientific-visual-assets.json';
import {organismIllustration,GENERIC_MORPHOLOGY_LABEL,REPRESENTATIVE_ILLUSTRATION_LABEL} from '../shared/scientific-visuals';
import {assertScientificArtworkSvg} from '../scripts/lib/scientific-artwork-svg.mjs';
test('all20 public representative portraits and thumbnails preserve exact40 original blobs and honest five-generic labels',()=>{
 assert.equal(registry.organismIllustrations.length,20);assert.equal(registry.organismIllustrations.filter(entry=>entry.genericMorphology).length,5);
 assert.equal(registry.illustrationProvenance.rights_basis,'owner_asserted_original_AI_assisted');
 for(const entry of registry.organismIllustrations)for(const size of ['thumbnail','portrait'] as const){
  const asset=entry[size],bytes=readFileSync('client/public'+asset.src);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${bytes.length}\0`),bytes])).digest('hex'),asset.sourceGitBlob);
  assertScientificArtworkSvg(bytes.toString());
  const image=organismIllustration(entry.sourceName,size)!;assert.equal(image.src,asset.src+'?v='+asset.sha256);assert.equal(image.label,entry.genericMorphology?GENERIC_MORPHOLOGY_LABEL:REPRESENTATIVE_ILLUSTRATION_LABEL);
 }
 assert.equal(organismIllustration('Unknown source organism','portrait'),null);
 assert.equal(organismIllustration('Blautia','portrait'),null,'A genus name does not select a species-named illustration');
 assert.equal(organismIllustration('blautia wexlerae','portrait'),null,'No unreviewed taxonomy aliasing');
});
test('namespace-aware illustration gate rejects active, remote, malformed and namespace-smuggled SVG',()=>{
 const svg=(value:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">${value}</svg>`;
 for(const payload of ['<script/>','<foreignObject/>','<image href="https://example.test/a"/>','<a href="x"/>','<circle onload="x"/>','<circle style="fill:red"/>','<style/>','<circle fill="url(https://example.test)"/>','<circle fill="url(#missing)"/>','<g xmlns="https://example.test"><circle/></g>','<x:circle xmlns:x="http://www.w3.org/2000/svg"/>','<circle xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="x"/>','<text font-family="Remote Font">Text</text>','<circle id="same"/><circle id="same"/>','<circle></g>'])assert.throws(()=>assertScientificArtworkSvg(svg(payload)));
 for(const value of ['<!DOCTYPE svg [<!ENTITY remote SYSTEM "https://example.test">]>'+svg(''),svg('<text>&#60;script&#62;</text>'),'<?xml-stylesheet href="https://example.test"?>'+svg(''),svg('')+svg(''),svg('<circle r="3" r="4"/>')])assert.throws(()=>assertScientificArtworkSvg(value));
 assert.equal(assertScientificArtworkSvg(svg('<defs><linearGradient id="shade"><stop stop-color="#123456"/></linearGradient></defs><circle r="3" fill="url(#shade)"/>')),true);
});
test('representative artwork is normally public with SVG MIME, passive-document headers and exact source bytes',async()=>{
 const {default:express}=await import('express');const {securityHeaders}=await import('../server/security');
 const app=express();app.use(securityHeaders);app.use(express.static('client/public'));app.use('/science',(_req,res)=>res.status(404).end());
 const server=app.listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+(server.address() as any).port;
 try{
  for(const entry of registry.organismIllustrations)for(const size of ['thumbnail','portrait'] as const){const asset=entry[size],response=await fetch(base+asset.src+'?v='+asset.sha256);assert.equal(response.status,200,'No session, reviewer role or approval flag is required');assert.match(response.headers.get('content-type')!,/^image\/svg\+xml/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.match(response.headers.get('content-security-policy')!,/default-src 'none'/);assert.equal(response.headers.get('cache-control'),'no-cache');assert.equal(response.headers.get('set-cookie'),null);assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),asset.sha256);}
  assert.equal((await fetch(base+'/science/organisms-v4/missing.svg')).status,404);
 }finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
});
