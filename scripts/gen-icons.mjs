// Generates simple solid PNG app icons (no external deps) using zlib.
import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

// Draw a forest-green rounded icon with a sandy island ellipse + sun.
function makePng(size) {
  const bg = [91, 184, 154]; // #5BB89A
  const sand = [232, 217, 168];
  const grass = [123, 201, 127];
  const sun = [252, 211, 77];
  const house = [255, 251, 240];

  const raw = Buffer.alloc(size * (size * 3 + 1));
  const cx = size / 2;
  const cy = size * 0.62;
  const sunX = size * 0.74;
  const sunY = size * 0.26;
  const sunR = size * 0.11;

  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // filter byte
    for (let x = 0; x < size; x++) {
      let c = bg;
      // sun
      if ((x - sunX) ** 2 + (y - sunY) ** 2 < sunR ** 2) c = sun;
      // island sand ellipse
      const sa = ((x - cx) / (size * 0.36)) ** 2 + ((y - cy) / (size * 0.13)) ** 2;
      if (sa < 1) c = sand;
      // grass ellipse
      const ga =
        ((x - cx) / (size * 0.3)) ** 2 + ((y - cy + size * 0.05) / (size * 0.1)) ** 2;
      if (ga < 1) c = grass;
      // house
      if (
        x > cx - size * 0.08 &&
        x < cx + size * 0.08 &&
        y > size * 0.4 &&
        y < size * 0.52
      )
        c = house;
      const idx = y * (size * 3 + 1) + 1 + x * 3;
      raw[idx] = c[0];
      raw[idx + 1] = c[1];
      raw[idx + 2] = c[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192x192.png', makePng(192));
writeFileSync('public/pwa-512x512.png', makePng(512));
writeFileSync('public/apple-touch-icon.png', makePng(180));
console.log('icons generated');
