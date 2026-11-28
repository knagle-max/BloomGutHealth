import assert from 'node:assert/strict';
export function dimensions(data) {
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
