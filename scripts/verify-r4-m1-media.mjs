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
function dimensions(data) {
  if (data.subarray(0, 8).toString('hex') === '89504e470d0a1a0a') return [data.readUInt32BE(16), data.readUInt32BE(20)];
  assert.equal(data.toString('ascii', 0, 4), 'RIFF');
  assert.equal(data.toString('ascii', 8, 12), 'WEBP');
  assert.equal(data.readUInt32LE(4) + 8, data.length);
  for (let at = 12; at + 8 <= data.length;) {
    const type = data.toString('ascii', at, at + 4), size = data.readUInt32LE(at + 4), start = at + 8;
    assert(start + size <= data.length);
    if (type === 'VP8X') return [data.readUIntLE(start + 4, 3) + 1, data.readUIntLE(start + 7, 3) + 1];
    if (type === 'VP8 ') {
      assert.equal(data.subarray(start + 3, start + 6).toString('hex'), '9d012a');
      return [data.readUInt16LE(start + 6) & 0x3fff, data.readUInt16LE(start + 8) & 0x3fff];
    }
    if (type === 'VP8L') {
      assert.equal(data[start], 0x2f);
      const bits = data.readUInt32LE(start + 1);
      return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
    }
    at = start + size + (size % 2);
  }
  throw Error('WebP dimensions unavailable');
}
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
