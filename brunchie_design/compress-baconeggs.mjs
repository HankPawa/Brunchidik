import sharp from 'sharp';
import { statSync, writeFileSync } from 'fs';

const input = './src/assets/baconeggs.webp';
const before = statSync(input).size;

const buffer = await sharp(input)
  .resize({ width: 800, withoutEnlargement: true })
  .webp({ quality: 75 })
  .toBuffer();

writeFileSync(input, buffer);

const after = statSync(input).size;
console.log(`✓ baconeggs.webp: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${((1-after/before)*100).toFixed(0)}%)`);
