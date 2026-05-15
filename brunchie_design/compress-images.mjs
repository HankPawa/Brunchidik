import sharp from 'sharp';
import { readdirSync, statSync, renameSync, unlinkSync } from 'fs';
import { join, extname } from 'path';

const ASSETS = './src/assets';
const MAX_WIDTH = 800;
const QUALITY = 75;

const files = readdirSync(ASSETS).filter(f => /\.(jpg|jpeg|webp|png)$/i.test(f));

for (const file of files) {
  const input = join(ASSETS, file);
  const tmp   = input + '.tmp';
  const ext   = extname(file).toLowerCase();
  const before = statSync(input).size;

  try {
    const img = sharp(input).resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.webp') {
      await img.webp({ quality: QUALITY }).toFile(tmp);
    } else {
      await img.jpeg({ quality: QUALITY, progressive: true }).toFile(tmp);
    }

    const after = statSync(tmp).size;
    const saved = ((1 - after / before) * 100).toFixed(0);

    renameSync(tmp, input);
    console.log(`✓ ${file}: ${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB (-${saved}%)`);
  } catch (e) {
    try { unlinkSync(tmp); } catch {}
    console.error(`✗ ${file}: ${e.message}`);
  }
}
