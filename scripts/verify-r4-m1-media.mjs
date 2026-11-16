import {dimensions} from './lib/raster-dimensions.mjs';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = file => readFile(path.join(root, file));
const manifest = JSON.parse(await read('design/visual-system/r4-m1-media/manifest.json'));
assert.equal(manifest.files.length, 13);
const original = JSON.parse(await read('design/visual-system/r4-editorial/bloom-editorial-visuals/MANIFEST.json'));
const paths = new Set();
const files = [];

for (const asset of manifest.files) {
  assert.equal(asset.variants.length, 2);
  assert.deepEqual(asset.variants.map(row => row.variant), ['1x', '2x']);
  assert.equal(original.assets.find(row => row.path.endsWith(`/${asset.name}.png`))?.sha256, asset.source.sha256);
  for (const file of [asset.source, ...asset.variants]) {
    assert.match(file.file, /^client\/public\/images\/editorial\/(?:cutouts|heroes)\/[\w@.-]+\.(?:png|webp)$/);
    assert(!paths.has(file.file)); paths.add(file.file);
    files.push(file);
    const bytes = await read(file.file);
    assert.equal(bytes.length, file.bytes, file.file);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256, file.file);
    assert.deepEqual(dimensions(bytes), [file.width, file.height], file.file);
    if ('original_detail_upscaled' in file) assert.equal(file.original_detail_upscaled, file.width > asset.source.width || file.height > asset.source.height);
    if (process.argv.includes('--built')) assert.deepEqual(await read(file.file.replace('client/public/', 'dist/public/')), bytes);
  }
}
assert.equal(paths.size, 39);
console.log('M1 media PASS: 13 original PNGs and 26 supplied paired WebPs; exact hashes/bytes/dimensions/paths, prior-original identity and declared upscaling; built copies checked when requested.');

const httpAt = process.argv.indexOf('--http');
if (httpAt >= 0) {
  const base = new URL(process.argv[httpAt + 1]);
  assert(!base.username && !base.password && !base.search && !base.hash && base.pathname === '/');
  assert((base.hostname === 'bloomguthealth.onrender.com' && base.protocol === 'https:') || (base.hostname === '127.0.0.1' && base.protocol === 'http:'));
  async function verifyHTTP(file) {
    const relative = file.file.replace('client/public/', '');
    const response = await fetch(new URL(relative, base), { signal: AbortSignal.timeout(15000), redirect: 'error' });
    assert.equal(response.status, 200, `HTTP status: ${relative}`);
    assert.match(response.headers.get('content-type') ?? '', file.file.endsWith('.png') ? /^image\/png(?:;|$)/ : file.file.endsWith('.css') ? /^text\/css(?:;|$)/ : /^image\/webp(?:;|$)/, relative);
    const chunks = []; let length = 0;
    for await (const chunk of response.body) {
      length += chunk.length; assert(length <= file.bytes, `Oversized image: ${relative}`); chunks.push(chunk);
    }
    assert.equal(length, file.bytes, relative);
    assert.equal(createHash('sha256').update(Buffer.concat(chunks)).digest('hex'), file.sha256, relative);
  }
  // Existing Render auto-deploy can still be finishing when CI reaches this step.
  // Probe only immutable public artwork: no account, private APIs or credentials.
  let ready = false;
  for (let attempt = 0; attempt < 7; attempt++) {
    try { await verifyHTTP(files[0]); ready = true; break; }
    catch { if (attempt < 6) await new Promise(resolve => setTimeout(resolve, 8000)); }
  }
  assert(ready, 'Preview media did not become available within the bounded deployment wait');
  for (let at = 0; at < files.length; at += 4) {
    const results = await Promise.allSettled(files.slice(at, at + 4).map(verifyHTTP));
    for (const result of results) if (result.status === 'rejected') throw result.reason;
  }
  if (process.argv.includes('--built')) {
    const styles = (await readdir(path.join(root, 'dist/public/assets'))).filter(name => name.endsWith('.css'));
    assert(styles.length > 0, 'Built stylesheet missing');
    for (const name of styles) {
      const bytes = await read(`dist/public/assets/${name}`);
      await verifyHTTP({ file: `client/public/assets/${name}`, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
    }
    console.log('M1 HTTP PASS: deployed production CSS MIME/bytes/SHA256 match this exact local build.');
  }
  console.log(`M1 HTTP PASS: 39/39 unauthenticated public PNG/WebP responses, MIME, lengths and SHA256 match ${base.origin}. No private API or database operations.`);
}
