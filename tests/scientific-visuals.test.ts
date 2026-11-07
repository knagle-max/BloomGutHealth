import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import registry from '../shared/data/scientific-visual-assets.json';
import {neutralMicroorganismVisual,MICROORGANISM_SYMBOL_LABEL} from '../shared/scientific-visuals';
import {assertPassiveScientificSvg} from '../scripts/lib/scientific-svg.mjs';

test('the enabled microorganism asset is fingerprinted first-party neutral geometry with no taxon or chemical identity',()=>{
 assert.equal(registry.assets.length,1);const asset=registry.assets[0],bytes=readFileSync(new URL('../client/public'+asset.src,import.meta.url));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);assertPassiveScientificSvg(bytes.toString('utf8'));
 assert.equal(asset.depiction,'generic-symbol');assert.equal(asset.taxonomyId,null);assert.equal(asset.moleculeId,null);
 const fixture=readFileSync(new URL('../scripts/qa/microbial-profile-journey.mjs',import.meta.url),'utf8').match(/const names=(\[.*?\]);/)![1];
 const names=Array.from(fixture.matchAll(/'([^']+)'/g),match=>match[1]);
 const rows=readFileSync(new URL('../docs/review/scientific-visuals-20261105/IDENTITY_STATUS.csv',import.meta.url),'utf8').trim().split('\n').slice(1);
 assert.equal(names.length,20);assert.equal(rows.length,20);assert.deepEqual(rows.map(row=>/^"([^"]+)"/.exec(row)![1]).sort(),[...names].sort());assert.ok(rows.every(row=>row.includes(asset.sha256)&&row.includes('no taxonomy ID invented')));
 assert.match(asset.source,/no organism morphology or chemical structure/);assert.equal(neutralMicroorganismVisual().label,MICROORGANISM_SYMBOL_LABEL);
 assert.equal(neutralMicroorganismVisual(true).src,null,'Disabled or withdrawn artwork never needs a cached image to keep its labeled slot');
 const original={...asset};try{for(const invalid of[{src:'https://example.test/a.svg'},{src:'/science/../private.svg'},{src:'/science/%2e%2e/private.svg'},{sha256:'changed'},{depiction:'taxon-illustration'},{taxonomyId:'unreviewed-id'},{moleculeId:'butyrate'},{lifecycle:'withdrawn'},{lifecycle:'disabled'}]){Object.assign(asset,original,invalid);assert.equal(neutralMicroorganismVisual().src,null);}}finally{Object.assign(asset,original);}
 const url=new URL(neutralMicroorganismVisual().src!,'https://synthetic.local');assert.equal(url.pathname,asset.src);assert.deepEqual([...url.searchParams.keys()],['v']);assert.equal(url.searchParams.get('v'),asset.sha256);
});
test('scientific SVG checking rejects active/external/encoded/malformed content rather than treating it as approved art',()=>{
 const wrap=(value:string)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">${value}</svg>`;
 for(const payload of['<script>bad()</script>','<foreignObject/>','<a href="https://example.test"><circle r="3"/></a>','<image href="https://example.test/a.png"/>','<style>@import url(https://example.test)</style>','<circle onload="bad()" r="3"/>','<circle fill="url(https://example.test)" r="3"/>','<circle style="fill:red" r="3"/>','<circle xlink:href="x"/>','<circle r="3" r="4"/>','<circle r="3"></g>'])assert.throws(()=>assertPassiveScientificSvg(wrap(payload)));
 for(const input of['<!DOCTYPE svg [<!ENTITY source SYSTEM "file:///secret">]>'+wrap(''),'<?xml-stylesheet href="https://example.test/style"?>'+wrap(''),wrap('<title>&#60;script&#62;</title>'),wrap('<title>Bad < text</title>'),wrap('')+wrap(''),'<svg xmlns="https://example.test"/>',wrap('x'.repeat(100001))])assert.throws(()=>assertPassiveScientificSvg(input));
 assert.equal(assertPassiveScientificSvg(wrap('<circle cx="60" cy="60" r="20" fill="none" stroke="#246B50"/>')),true);
});
