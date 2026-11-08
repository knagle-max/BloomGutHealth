import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const bytes = relative => readFile(path.join(root, relative));
const digest = value => createHash('sha256').update(value).digest('hex');
const designer = 'design/visual-system/r4-final';
const editorial = 'design/visual-system/r4-editorial/bloom-editorial-visuals';
const manifest = JSON.parse(await bytes(`${designer}/FINAL_R4_DESIGNER_ASSET_MANIFEST.json`));
assert.equal(manifest.assets.length, 87);
for (const asset of manifest.assets) {
  assert(!asset.filename.split('/').includes('..') && !path.isAbsolute(asset.filename));
  const original = await bytes(`${designer}/assets/${asset.filename}`);
  assert.equal(digest(original), asset.sha256, asset.filename);
  assert.equal(original.length, asset.bytes, asset.filename);
  assert.deepEqual(await bytes(`client/public/brand/visual-v2/${asset.filename}`), original);
  if (process.argv.includes('--built')) {
    assert.deepEqual(await bytes(`dist/public/brand/visual-v2/${asset.filename}`), original);
  }
}
const raster = JSON.parse(await bytes(`${editorial}/MANIFEST.json`));
assert.equal(raster.assets.length, 13);
for (const asset of raster.assets) {
  const original = await bytes(`${editorial}/${asset.path}`);
  assert.equal(digest(original), asset.sha256, asset.path);
  assert.equal(original.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(original.readUInt32BE(16), asset.width, asset.path);
  assert.equal(original.readUInt32BE(20), asset.height, asset.path);
  assert.equal(original[25], asset.mode === 'RGBA' ? 6 : 2, asset.path);
}
const derivativeRoot = 'client/public/brand/editorial-r4';
const derivatives = JSON.parse(await bytes(`${derivativeRoot}/MANIFEST.json`));
assert.equal(derivatives.assets.length, 26);
for (const asset of derivatives.assets) {
  assert.equal(digest(await bytes(`${derivativeRoot}/${asset.path}`)), asset.sha256, asset.path);
  const source = raster.assets.find(row => row.path === asset.source);
  assert.equal(source?.sha256, asset.sourceSha256, asset.path);
  assert(asset.width <= source.width && asset.height <= source.height, 'Never upscale');
  if (process.argv.includes('--built')) {
    assert.equal(digest(await bytes(`dist/public/brand/editorial-r4/${asset.path}`)), asset.sha256);
  }
}
assert.deepEqual(await bytes('client/src/content/bloomCopy.ts'), await bytes('design/visual-system/r4-branding/bloomCopy.ts'));
assert.deepEqual(await bytes('client/src/styles/bloom-visual-scoped.css'), await bytes(`${designer}/assets/styles/bloom-visual-scoped.css`));
const styles = (await bytes('client/src/styles/app.css')).toString();
assert.equal((styles.match(/@import[^;]*bloom-visual-scoped\.css/g) || []).length, 1);
assert(!styles.includes('motion.css'));
const icons = (await bytes('client/src/components/PremiumIcon.tsx')).toString();
for (const [, filename] of icons.matchAll(/"(batch-[\w/-]+\.svg)"/g)) {
  assert(manifest.assets.some(asset => asset.filename === filename), filename);
}
console.log('R4 verified: 87 original SVGs/public copies; 13 original PNG hashes/dimensions/modes; 26 source-linked WebP derivatives; exact copy and canonical CSS.');
