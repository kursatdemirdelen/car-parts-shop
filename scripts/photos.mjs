// Downloads the approved Unsplash photos once and converts them to WebP in public/photos.
// Usage: node scripts/photos.mjs   (re-run only when the list below changes)
import { mkdir, stat, writeFile } from "node:fs/promises";
import sharp from "sharp";

/** Approved list (Unsplash License). `hero` photos are used full-width, the rest on cards; `position` overrides the automatic crop. */
const PHOTOS = [
  { key: "oil-change", id: "photo-1642075223291-f9ec545889fa", hero: true },
  { key: "air-filter", id: "photo-1522598140461-ec9911e01c53", hero: true, position: "centre" },
  { key: "spark-plug", id: "photo-1782885044133-27c4df887d96", hero: true },
  { key: "open-road", id: "photo-1566518447933-8f9399038f23", hero: true, position: "centre" },
  { key: "brake-disc", id: "photo-1609682932589-5ef2bd85980d", hero: true, position: "centre" },
  { key: "detailing", id: "photo-1620584898989-d39f7f9ed1b7", hero: false },
  { key: "tools", id: "photo-1613206485381-b028e578e791", hero: false },
];

const OUT = "public/photos";
await mkdir(OUT, { recursive: true });

for (const { key, id, hero, position } of PHOTOS) {
  const width = hero ? 1600 : 800;
  const res = await fetch(`https://images.unsplash.com/${id}?w=${width}&q=85&fm=jpg`);
  if (!res.ok) throw new Error(`${key}: HTTP ${res.status}`);
  const input = Buffer.from(await res.arrayBuffer());
  const target = `${OUT}/${key}.webp`;
  const limit = hero ? 200_000 : 90_000;
  // Lower the quality until the file fits the size budget.
  for (const quality of [72, 64, 56, 48, 40, 32, 26]) {
    // Landscape crop focused on the most interesting region: hero 16:9, cards 4:3.
    const output = await sharp(input)
      .resize({ width, height: hero ? 900 : 600, fit: "cover", position: position ?? sharp.strategy.attention })
      .webp({ quality })
      .toBuffer();
    await writeFile(target, output);
    if (output.length <= limit) break;
  }
  const meta = await sharp(target).metadata();
  console.log(`${key}: ${meta.width}x${meta.height}, ${Math.round((await stat(target)).size / 1024)} KB`);
}
