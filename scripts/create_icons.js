import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Simple PNG encoder in pure Node.js
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

function generatePng(size) {
  const width = size;
  const height = size;

  const rawData = [];
  const radius = size * 0.22;

  for (let y = 0; y < height; y++) {
    rawData.push(0); // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      // Rounded rect check
      const dx = Math.max(0, Math.max(radius - x, x - (width - 1 - radius)));
      const dy = Math.max(0, Math.max(radius - y, y - (height - 1 - radius)));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Transparent outside rounded corner
        rawData.push(0, 0, 0, 0);
        continue;
      }

      // Smooth anti-aliased edge
      let alpha = 255;
      if (dist > radius - 1) {
        alpha = Math.floor(255 * (radius - dist));
      }

      // Electric purple to deep indigo gradient + subtle cyan top right
      const t = (x + y) / (width + height);
      let r = Math.floor(139 + (168 - 139) * t); // purple #8B5CF6 to #A855F7
      let g = Math.floor(92 + (85 - 92) * t);
      let b = Math.floor(246 + (247 - 246) * t);

      // Add center emblem highlight / border
      const isBorder = (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) || (dist > radius - 2);
      if (isBorder) {
        r = Math.min(255, r + 40);
        g = Math.min(255, g + 40);
        b = Math.min(255, b + 50);
      }

      rawData.push(r, g, b, alpha);
    }
  }

  const uncompressed = Buffer.from(rawData);
  const compressed = zlib.deflateSync(uncompressed);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // 8-bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve('public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 32, 48, 128].forEach((size) => {
  const buf = generatePng(size);
  fs.writeFileSync(path.join(iconsDir, `icon${size}.png`), buf);
  console.log(`Generated icon${size}.png (${size}x${size})`);
});
