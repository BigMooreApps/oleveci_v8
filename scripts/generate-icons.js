import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

function createIco(images) {
  const count = images.length;
  const headerSize = 6 + count * 16;
  let currentOffset = headerSize;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const dirEntries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.buffer.length, 8);
    entry.writeUInt32LE(currentOffset, 12);
    dirEntries.push(entry);
    currentOffset += img.buffer.length;
  }
  return Buffer.concat([header, ...dirEntries, ...images.map((img) => img.buffer)]);
}

async function generate() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Load the authoritative real OleVeci icon
  const sourceIconPath = path.join(publicDir, 'Icono_Oleveci_sin_fondo.png');
  if (!fs.existsSync(sourceIconPath)) {
    throw new Error(`Source icon not found at ${sourceIconPath}`);
  }

  console.log('Reading real authoritative OleVeci icon from Icono_Oleveci_sin_fondo.png...');
  const trimmed = await sharp(sourceIconPath).trim().toBuffer();

  // Helper to fit trimmed icon squarely with proportional padding
  const makeSquareIcon = async (size, innerRatio = 0.94) => {
    const innerSize = Math.round(size * innerRatio);
    const pad = Math.floor((size - innerSize) / 2);
    return sharp(trimmed)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: pad,
        bottom: size - innerSize - pad,
        left: pad,
        right: size - innerSize - pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  };

  console.log('Generating crisp multi-resolution favicons...');
  const [b16, b32, b48, b180, b192, b512] = await Promise.all([
    makeSquareIcon(16, 0.96),
    makeSquareIcon(32, 0.94),
    makeSquareIcon(48, 0.94),
    makeSquareIcon(180, 0.92),
    makeSquareIcon(192, 0.92),
    makeSquareIcon(512, 0.92),
  ]);

  // Write PNG Favicons
  fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), b16);
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), b32);
  fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), b48);
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), b180);
  fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), b192);
  fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), b512);

  // Generate standard ICO file containing 16x16, 32x32, 48x48
  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: b16 },
    { width: 32, height: 32, buffer: b32 },
    { width: 48, height: 48, buffer: b48 },
  ]);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  // Generate Maskable PWA icon on OleVeci Deep Navy background (#041f5e)
  const maskableInner = await makeSquareIcon(380, 0.92);
  const maskable = await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 4, g: 31, b: 94, alpha: 1 }, // #041f5e
    },
  })
    .composite([{ input: maskableInner, gravity: 'center' }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), maskable);

  // Generate authoritative icon.svg wrapping the high-res 512x512 PNG
  const b64 = b512.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${b64}" x="0" y="0" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>
`;
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf-8');

  console.log('Successfully generated all real OleVeci icon assets in /public:');
  console.log(' - favicon-16x16.png');
  console.log(' - favicon-32x32.png');
  console.log(' - favicon-48x48.png');
  console.log(' - favicon.ico (16, 32, 48)');
  console.log(' - icon.svg (real icon)');
  console.log(' - apple-touch-icon.png (180x180)');
  console.log(' - pwa-192x192.png');
  console.log(' - pwa-512x512.png');
  console.log(' - pwa-maskable-512x512.png');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
