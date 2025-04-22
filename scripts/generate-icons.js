import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ICON_SIZES = [192, 512];
const ICON_DIR = join(__dirname, '../public/icons');

// Create icons directory if it doesn't exist
if (!fs.existsSync(ICON_DIR)) {
  fs.mkdirSync(ICON_DIR, { recursive: true });
}

// Create a basic icon - blue circle with a snowflake-like shape
async function generateIcon(size, isMaskable = false) {
  const padding = isMaskable ? 0 : size * 0.1; // 10% padding for non-maskable
  const innerSize = size - (padding * 2);
  
  // Create a new image with transparent background
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#2B6CB0;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4299E1;stop-opacity:1" />
        </linearGradient>
      </defs>
      ${isMaskable ? `<rect width="${size}" height="${size}" fill="#2B6CB0"/>` : ''}
      <circle cx="${size/2}" cy="${size/2}" r="${innerSize/2}" fill="url(#grad)"/>
      <g transform="translate(${size/2},${size/2}) scale(${innerSize/100})">
        <path d="M0,-30 L5,-5 L30,0 L5,5 L0,30 L-5,5 L-30,0 L-5,-5 Z" 
              fill="white" opacity="0.9"/>
      </g>
    </svg>`;

  const fileName = `icon-${size}${isMaskable ? '-maskable' : ''}.png`;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(ICON_DIR, fileName));
  
  console.log(`Generated ${fileName}`);
}

async function generateAllIcons() {
  for (const size of ICON_SIZES) {
    await generateIcon(size, false); // Regular icons
    await generateIcon(size, true);  // Maskable icons
  }
}

generateAllIcons().catch(console.error); 