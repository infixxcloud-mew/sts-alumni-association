import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const source = resolve("public/legacy-theme/images/STS-Alumni-fivicon.png");
const faviconPath = resolve("src/app/favicon.ico");
const iconPath = resolve("src/app/icon.png");
const appleIconPath = resolve("src/app/apple-icon.png");
const faviconSizes = [16, 32, 48, 64, 128, 256];

async function pngIcon(size) {
  return sharp(source, { failOn: "none" })
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function icoFromPngs(entries) {
  const header = Buffer.alloc(6 + entries.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);

  let imageOffset = header.length;
  for (const [index, entry] of entries.entries()) {
    const directoryOffset = 6 + index * 16;
    header[directoryOffset] = entry.size === 256 ? 0 : entry.size;
    header[directoryOffset + 1] = entry.size === 256 ? 0 : entry.size;
    header[directoryOffset + 2] = 0;
    header[directoryOffset + 3] = 0;
    header.writeUInt16LE(1, directoryOffset + 4);
    header.writeUInt16LE(32, directoryOffset + 6);
    header.writeUInt32LE(entry.buffer.length, directoryOffset + 8);
    header.writeUInt32LE(imageOffset, directoryOffset + 12);
    imageOffset += entry.buffer.length;
  }

  return Buffer.concat([header, ...entries.map((entry) => entry.buffer)]);
}

const faviconEntries = await Promise.all(
  faviconSizes.map(async (size) => ({
    size,
    buffer: await pngIcon(size),
  })),
);

await writeFile(faviconPath, icoFromPngs(faviconEntries));
await writeFile(iconPath, await pngIcon(512));
await writeFile(appleIconPath, await pngIcon(180));

console.log(`Generated ${faviconPath}`);
console.log(`Generated ${iconPath}`);
console.log(`Generated ${appleIconPath}`);
