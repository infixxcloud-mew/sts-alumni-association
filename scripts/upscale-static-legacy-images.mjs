import { stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const targets = [
  ["public/legacy-theme/images/hcom2.jpg", "public/legacy-theme/images/hcom2-hq.jpg", 2560, 1706],
  ["public/legacy-theme/images/hcom3.jpg", "public/legacy-theme/images/hcom3-hq.jpg", 2560, 1280],
  ["public/legacy-theme/images/feedback.jpg", "public/legacy-theme/images/feedback-hq.jpg", 2000, 1334],
  [
    "public/legacy-theme/images/digital-learning-center-3-1.jpeg",
    "public/legacy-theme/images/digital-learning-center-3-1-hq.jpeg",
    1920,
    1080,
  ],
  [
    "public/legacy-theme/images/digital-learning-center-3-2.jpeg",
    "public/legacy-theme/images/digital-learning-center-3-2-hq.jpeg",
    1920,
    1080,
  ],
  [
    "public/legacy-theme/images/bursary-lim-support.jpg",
    "public/legacy-theme/images/bursary-lim-support-hq.jpg",
    1920,
    1440,
  ],
  [
    "public/legacy-theme/images/bursary-spm-award.jpg",
    "public/legacy-theme/images/bursary-spm-award-hq.jpg",
    1920,
    1440,
  ],
  [
    "public/legacy-theme/images/bursary-tan-ling-moi.jpg",
    "public/legacy-theme/images/bursary-tan-ling-moi-hq.jpg",
    1920,
    1080,
  ],
  ["public/legacy-theme/images/announcements/3.jpg", "public/legacy-theme/images/announcements/3-hq.jpg", 1984, 1488],
  [
    "public/legacy-theme/images/announcements/22789166_2053167941648064_2990332127747441967_n.jpg",
    "public/legacy-theme/images/announcements/22789166_2053167941648064_2990332127747441967_n-hq.jpg",
    1920,
    1440,
  ],
];

for (const [sourceFile, outputFile, targetWidth, targetHeight] of targets) {
  const outputPath = resolve(outputFile);
  try {
    const existing = await sharp(outputPath).metadata();
    if ((existing.width || 0) >= targetWidth && (existing.height || 0) >= targetHeight) {
      console.log(`skip ${outputFile} ${existing.width}x${existing.height}`);
      continue;
    }
  } catch {
    // Create the derived image below.
  }

  const inputPath = resolve(sourceFile);
  const before = await sharp(inputPath).metadata();

  const output = await sharp(inputPath, { failOn: "none" })
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.7 })
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();

  await writeFile(outputPath, output);
  const after = await sharp(outputPath).metadata();
  const size = await stat(outputPath);
  console.log(`${sourceFile} ${before.width}x${before.height} -> ${outputFile} ${after.width}x${after.height} ${Math.round(size.size / 1024)}KB`);
}
