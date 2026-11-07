import test from'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';
test('self-hosted image-reader model/core/worker and notices match the pinned original asset receipts',()=>{
 const base=new URL('../client/public/ocr/v1/',import.meta.url),manifest=JSON.parse(readFileSync(new URL('ASSET_MANIFEST.json',base),'utf8'));
 assert.equal(manifest.engine,'tesseract.js@7.0.0');assert.equal(manifest.core,'tesseract.js-core@7.0.0');assert.ok(manifest.files.length>=10);const paths=new Set<string>();
 for(const f of manifest.files){assert.match(f.path,/^[a-zA-Z0-9._/-]+$/);assert.ok(!f.path.split('/').includes('..'));assert.ok(!paths.has(f.path));paths.add(f.path);const bytes=readFileSync(new URL(f.path,base));assert.equal(bytes.length,f.bytes,f.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256,f.path);}
 for(const f of['worker.min.js','core/tesseract-core-lstm.wasm.js','core/tesseract-core-simd-lstm.wasm.js','core/tesseract-core-relaxedsimd-lstm.wasm.js','language/eng.traineddata.gz','LICENSE-TESSDATA','LICENSE-TESSERACT.md','LICENSE-CORE'])assert.ok(paths.has(f),f);
});
