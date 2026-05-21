import sharp from "sharp";
import { readdir, stat, writeFile, rename, unlink } from "fs/promises";
import { join, extname } from "path";

const ASSETS = "./src/assets";
const MAX_KB = 200;
const MAX_DIM = 1200;

const files = await readdir(ASSETS);

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) continue;

  const fullPath = join(ASSETS, file);
  const { size } = await stat(fullPath);
  const kb = size / 1024;

  if (kb <= MAX_KB) {
    console.log(`  skip  ${file.padEnd(30)} ${Math.round(kb)} KB`);
    continue;
  }

  const tmp = fullPath + ".tmp";

  const img = sharp(fullPath).resize({ width: MAX_DIM, height: MAX_DIM, fit: "inside", withoutEnlargement: true });
  let output;
  if (ext === ".png")        output = img.png({ compressionLevel: 8, quality: 80 });
  else if (ext === ".webp")  output = img.webp({ quality: 75 });
  else                       output = img.jpeg({ quality: 75, mozjpeg: true });

  // Escribe a .tmp primero (no toca el original)
  await output.toFile(tmp);

  const newStat = await stat(tmp);
  const newKb = Math.round(newStat.size / 1024);

  if (newStat.size < size) {
    try {
      await unlink(fullPath);
      await rename(tmp, fullPath);
      console.log(`  ✓  ${file.padEnd(30)} ${Math.round(kb)} KB → ${newKb} KB`);
    } catch (e) {
      await unlink(tmp).catch(() => {});
      console.log(`  ERR ${file.padEnd(30)} no se pudo reemplazar: ${e.code}`);
    }
  } else {
    await unlink(tmp);
    console.log(`  skip  ${file.padEnd(30)} ya optimizado`);
  }
}

console.log("\nListo.");
