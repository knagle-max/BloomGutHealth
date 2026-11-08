import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { serveStatic } from '../server/vite';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

test('production editorial assets return original bytes/MIME without auth; missing images are404 and application routes retain SPA fallback', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'bloom-editorial-static-'));
  const files = ['images/editorial/heroes/bloom-today-meadow.webp', 'images/editorial/heroes/bloom-today-meadow.png', 'brand/visual-v2/batch-1-original/hero-today.svg'];
  for (const file of files) {
    await mkdir(path.dirname(path.join(root, file)), { recursive: true });
    await writeFile(path.join(root, file), await readFile(path.join('client/public', file)));
  }
  await writeFile(path.join(root, 'index.html'), '<!doctype html><title>Bloom synthetic SPA fixture</title>');
  const app = express(); serveStatic(app, root);
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as {port:number}).port}`;
  try {
    for (const file of files) {
      const response = await fetch(`${base}/${file}`);
      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type')!, file.endsWith('.webp') ? /image\/webp/ : file.endsWith('.png') ? /image\/png/ : /image\/svg\+xml/);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(path.join(root, file)));
    }
    for (const url of ['/images/editorial/missing.webp', '/images/editorial/missing.png', '/brand/visual-v2/missing.svg', '/science/missing.svg']) {
      const response = await fetch(base + url);
      assert.equal(response.status, 404, url);
      assert.equal(await response.text(), '');
    }
    const page = await fetch(base + '/progress');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Bloom synthetic SPA fixture/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    await rm(root, { recursive: true, force: true });
  }
});

test('M1 deployment verifier checks all39 real PNG/WebP HTTP responses against the supplied manifest', async () => {
  const app = express(); serveStatic(app, path.resolve('client/public'));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${(server.address() as {port:number}).port}/`;
  try {
    const { stdout } = await promisify(execFile)(process.execPath, ['scripts/verify-r4-m1-media.mjs', '--http', base]);
    assert.match(stdout, /M1 HTTP PASS: 39\/39 unauthenticated public PNG\/WebP responses/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
