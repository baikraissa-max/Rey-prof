const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table & function
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPngBuffer(width, height, getPixelRgba) {
  // 1. Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // 2. IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // 3. Raw image data (with row filter byte = 0)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // No filter
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRgba(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // 4. IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // 5. IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function getIconPixel(x, y, size, sizeHeight, isMaskable) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 512;
  const contentScale = isMaskable ? scale * 0.78 : scale;

  // Canvas background: #060608
  let r = 6;
  let g = 6;
  let b = 8;
  let a = 255;

  // Ambient radial purple bloom
  const distToGlow = Math.hypot(x - cx, y - (cy - 30 * scale));
  const maxGlowRadius = 240 * scale;
  if (distToGlow < maxGlowRadius) {
    const glow = Math.pow(1 - distToGlow / maxGlowRadius, 2);
    // Purple #9333ea
    r = Math.min(255, Math.round(r + 147 * glow * 0.5));
    g = Math.min(255, Math.round(g + 51 * glow * 0.5));
    b = Math.min(255, Math.round(b + 234 * glow * 0.5));
  }

  // Card geometry
  const cardW = 384 * contentScale;
  const cardH = 384 * contentScale;
  const cardX = cx - cardW / 2;
  const cardY = cy - cardH / 2;
  const cardR = 88 * contentScale;

  let inCard = false;
  let cardBorderDist = 999;

  if (x >= cardX && x <= cardX + cardW && y >= cardY && y <= cardY + cardH) {
    const dx = Math.max(cardX + cardR - x, 0, x - (cardX + cardW - cardR));
    const dy = Math.max(cardY + cardR - y, 0, y - (cardY + cardH - cardR));
    const distCorner = Math.hypot(dx, dy);
    if (distCorner <= cardR) {
      inCard = true;
      cardBorderDist = cardR - distCorner;
    }
  }

  if (inCard) {
    const t = (y - cardY) / cardH;
    const glassR = Math.round(35 * (1 - t) + 12 * t);
    const glassG = Math.round(28 * (1 - t) + 10 * t);
    const glassB = Math.round(55 * (1 - t) + 22 * t);

    r = Math.round(r * 0.35 + glassR * 0.65);
    g = Math.round(g * 0.35 + glassG * 0.65);
    b = Math.round(b * 0.35 + glassB * 0.65);

    if (cardBorderDist < 2.5 * scale) {
      const borderAlpha = Math.max(0, 1 - cardBorderDist / (2.5 * scale));
      r = Math.min(255, Math.round(r + (255 - r) * borderAlpha * 0.5));
      g = Math.min(255, Math.round(g + (255 - g) * borderAlpha * 0.5));
      b = Math.min(255, Math.round(b + (255 - b) * borderAlpha * 0.5));
    }
  }

  // Lettermark "R" geometry
  const lx = (x - cx) / contentScale;
  const ly = (y - cy) / contentScale;

  let isLetter = false;

  // Stem
  const stemDistX = Math.max(-90 - lx, 0, lx - (-52));
  const stemDistY = Math.max(-95 - ly, 0, ly - 95);
  if (Math.hypot(stemDistX, stemDistY) <= 15) {
    isLetter = true;
  }

  // Top Bowl
  if (lx >= -60 && lx <= 75 && ly >= -110 && ly <= 30) {
    const bowlDx = Math.max(0, lx - 5);
    const bowlDy = ly - (-40);
    const bowlDist = Math.hypot(bowlDx, bowlDy);
    if (bowlDist <= 68 && bowlDist >= 30) {
      isLetter = true;
    }
  }

  // Diagonal Leg
  if (ly >= 0 && ly <= 110) {
    const expectedX = -20 + (ly / 110) * 85;
    if (Math.abs(lx - expectedX) <= 18) {
      isLetter = true;
    }
  }

  // Purple Accent Dot
  const dotDx = lx - 72;
  const dotDy = ly - (-88);
  if (Math.hypot(dotDx, dotDy) <= 10) {
    isLetter = true;
  }

  if (isLetter) {
    const letterT = Math.min(1, Math.max(0, (ly + 100) / 200));
    r = Math.round(255 * (1 - letterT) + 192 * letterT);
    g = Math.round(255 * (1 - letterT) + 132 * letterT);
    b = Math.round(255 * (1 - letterT) + 252 * letterT);
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNG files
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.png'),
  createPngBuffer(192, 192, (x, y, w, h) => getIconPixel(x, y, w, h, false))
);

console.log('Generating pwa-512x512.png...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.png'),
  createPngBuffer(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, false))
);

console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(
  path.join(publicDir, 'pwa-maskable-512x512.png'),
  createPngBuffer(512, 512, (x, y, w, h) => getIconPixel(x, y, w, h, true))
);

console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(
  path.join(publicDir, 'apple-touch-icon.png'),
  createPngBuffer(180, 180, (x, y, w, h) => getIconPixel(x, y, w, h, false))
);

console.log('Generating favicon.ico (PNG format)...');
fs.writeFileSync(
  path.join(publicDir, 'favicon.ico'),
  createPngBuffer(64, 64, (x, y, w, h) => getIconPixel(x, y, w, h, false))
);

console.log('All icons generated successfully!');
