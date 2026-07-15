import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import sharp from "sharp";

function icoEntrySizes(buffer: Buffer) {
  assert.equal(buffer.readUInt16LE(0), 0);
  assert.equal(buffer.readUInt16LE(2), 1);
  const count = buffer.readUInt16LE(4);

  return Array.from({ length: count }, (_, index) => {
    const offset = 6 + index * 16;
    const width = buffer[offset] || 256;
    const height = buffer[offset + 1] || 256;
    return `${width}x${height}`;
  });
}

test("uses the STS Alumni logo for browser and touch icons", async () => {
  const sourcePath = resolve("public/legacy-theme/images/STS-Alumni-fivicon.png");
  const faviconPath = resolve("src/app/favicon.ico");
  const iconPath = resolve("src/app/icon.png");
  const appleIconPath = resolve("src/app/apple-icon.png");

  const sourceMeta = await sharp(sourcePath).metadata();
  assert.equal(sourceMeta.width, 1280);
  assert.equal(sourceMeta.height, 1280);

  const iconMeta = await sharp(iconPath).metadata();
  assert.equal(iconMeta.width, 512);
  assert.equal(iconMeta.height, 512);

  const appleIconMeta = await sharp(appleIconPath).metadata();
  assert.equal(appleIconMeta.width, 180);
  assert.equal(appleIconMeta.height, 180);

  const favicon = await readFile(faviconPath);
  assert.deepEqual(icoEntrySizes(favicon), [
    "16x16",
    "32x32",
    "48x48",
    "64x64",
    "128x128",
    "256x256",
  ]);
});
