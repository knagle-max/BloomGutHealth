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
assert.deepEqual(await bytes('client/src/content/bloomCopy.ts'), await bytes('design/visual-system/r4-branding/bloomCopy.ts'));
const canonical = (await bytes('client/src/styles/bloom-visual-scoped.css')).toString();
const originalCSS = (await bytes(`${designer}/assets/styles/bloom-visual-scoped.css`)).toString();
assert(canonical.startsWith(originalCSS), 'Original R4 CSS preserved as exact prefix');
const m1 = (await bytes('docs/design/r4-m1/Bloom_R4_Mobile_Visual_Media_Full_Build_Spec_M1_Designer_Integrated_2026-11-07.md')).toString();
const finalMediaCSS = m1.match(/### D4\.[\s\S]*?```css\n([\s\S]*?)```/)[1];
assert(canonical.includes(finalMediaCSS), 'Exact M1-D final CSS merged into canonical stylesheet');
const styles = (await bytes('client/src/styles/app.css')).toString();
assert.equal((styles.match(/@import[^;]*bloom-visual-scoped\.css/g) || []).length, 1);
assert(!styles.includes('motion.css'));
const icons = (await bytes('client/src/components/PremiumIcon.tsx')).toString();
for (const [, filename] of icons.matchAll(/"(batch-[\w/-]+\.svg)"/g)) {
  assert(manifest.assets.some(asset => asset.filename === filename), filename);
}
console.log('R4 verified: 87 original SVGs/public copies; 13 original PNG hashes/dimensions/modes; exact copy, original CSS prefix and final M1-D canonical extension.');
