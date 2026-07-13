import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const workRoot = path.resolve(projectRoot, "..");
const auditRoot = path.join(workRoot, "migration-audit");
const uploadsRoot = path.join(workRoot, "wordpress-source", "wp-content", "uploads");
const publicRoot = path.join(projectRoot, "public");
const generatedRoot = path.join(projectRoot, "src", "data", "generated");
const optimizedRoot = path.join(publicRoot, "media");

const mediaManifestPath = path.join(auditRoot, "media-manifest.json");
const galleryManifestPath = path.join(auditRoot, "gallery-manifest.json");
const publicContentPath = path.join(auditRoot, "public-content-manifest.json");

const imageExtensions = new Set(["jpg", "jpeg", "png", "bmp", "webp", "avif"]);

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function relativeUploadPath(media) {
  if (media.attachedFile) {
    return media.attachedFile.split("/").join(path.sep);
  }

  const url = new URL(media.url);
  const marker = "/wp-content/uploads/";
  const index = url.pathname.indexOf(marker);
  if (index >= 0) {
    return url.pathname.slice(index + marker.length).split("/").join(path.sep);
  }

  return path.basename(url.pathname);
}

function normalizeSlug(slug, fallback) {
  if (!slug) return fallback;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function stripHtml(html) {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHtml(html, urlToMedia) {
  if (!html) return "";

  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<!--\s*\/?wp:[\s\S]*?-->/g, "")
    .replace(/\sclass="wp-[^"]*"/g, "")
    .replace(/\sloading="[^"]*"/g, "");

  for (const [url, media] of urlToMedia.entries()) {
    if (media.fullSrc) {
      cleaned = cleaned.split(url).join(media.fullSrc);
    }
  }

  return cleaned;
}

function metaValue(meta, key) {
  const value = meta?.[key];
  if (Array.isArray(value)) return value[0] || "";
  return value || "";
}

function textToHtml(text) {
  if (!text) return "";
  const escaped = String(text)
    .replace(/&nbsp;/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.trim().replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function mediaUrlKey(url) {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname).replace(/-\d+x\d+(?=\.[a-zA-Z0-9]+$)/, "");
  } catch {
    return String(url).replace(/-\d+x\d+(?=\.[a-zA-Z0-9]+$)/, "");
  }
}

function mediaFromUrl(urlToMedia, urlPathToMedia, url) {
  if (!url) return null;
  return urlToMedia.get(url) || urlPathToMedia.get(mediaUrlKey(url)) || null;
}

function sortByDateDesc(a, b) {
  return String(b.date || "").localeCompare(String(a.date || ""));
}

async function fileExists(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.size > 0;
  } catch {
    return false;
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw.replace(/^\uFEFF/, ""));
}

async function optimizeImage({ inputPath, media }) {
  const thumbPath = path.join(optimizedRoot, "thumbs", `${media.id}.webp`);
  const fullPath = path.join(optimizedRoot, "photos", `${media.id}.webp`);

  const image = sharp(inputPath, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const width = metadata.width || null;
  const height = metadata.height || null;

  await ensureDir(path.dirname(thumbPath));
  await ensureDir(path.dirname(fullPath));

  if (!(await fileExists(thumbPath))) {
    await sharp(inputPath, { failOn: "none" })
      .rotate()
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 72, effort: 4 })
      .toFile(thumbPath);
  }

  if (!(await fileExists(fullPath))) {
    await sharp(inputPath, { failOn: "none" })
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(fullPath);
  }

  const thumbMeta = await sharp(thumbPath).metadata();
  const fullMeta = await sharp(fullPath).metadata();

  return {
    width,
    height,
    thumbSrc: `/media/thumbs/${media.id}.webp`,
    thumbWidth: thumbMeta.width || null,
    thumbHeight: thumbMeta.height || null,
    fullSrc: `/media/photos/${media.id}.webp`,
    fullWidth: fullMeta.width || null,
    fullHeight: fullMeta.height || null,
  };
}

async function copyFileAsset({ inputPath, media }) {
  const safeName = path.basename(relativeUploadPath(media)).replace(/[^a-zA-Z0-9._-]+/g, "-");
  const outputPath = path.join(optimizedRoot, "files", `${media.id}-${safeName}`);
  await ensureDir(path.dirname(outputPath));

  if (!(await fileExists(outputPath))) {
    await fs.copyFile(inputPath, outputPath);
  }

  return {
    width: null,
    height: null,
    thumbSrc: "",
    thumbWidth: null,
    thumbHeight: null,
    fullSrc: `/media/files/${media.id}-${safeName}`,
    fullWidth: null,
    fullHeight: null,
  };
}

async function main() {
  await ensureDir(generatedRoot);
  await ensureDir(optimizedRoot);

  const mediaManifest = await readJson(mediaManifestPath);
  const galleryManifest = await readJson(galleryManifestPath);
  const publicContent = await readJson(publicContentPath);

  const processedMedia = [];
  let optimizedCount = 0;
  let failedCount = 0;

  for (const [index, media] of mediaManifest.entries()) {
    const relPath = relativeUploadPath(media);
    const inputPath = path.join(uploadsRoot, relPath);
    const extension = String(media.extension || path.extname(inputPath).slice(1)).toLowerCase();
    const isImage = imageExtensions.has(extension);

    try {
      const asset = isImage
        ? await optimizeImage({ inputPath, media })
        : await copyFileAsset({ inputPath, media });

      processedMedia.push({
        id: String(media.id),
        title: media.title || "",
        alt: media.alt || media.title || "",
        caption: media.caption || "",
        description: stripHtml(media.description || ""),
        originalUrl: media.url || "",
        originalUploadPath: toPosix(relPath),
        extension,
        parentId: String(media.parentId || ""),
        date: media.date || "",
        ...asset,
      });
      optimizedCount++;
      if ((index + 1) % 100 === 0) {
        console.log(`Processed ${index + 1}/${mediaManifest.length} media assets`);
      }
    } catch (error) {
      try {
        const fallbackAsset = await copyFileAsset({ inputPath, media });
        processedMedia.push({
          id: String(media.id),
          title: media.title || "",
          alt: media.alt || media.title || "",
          caption: media.caption || "",
          description: stripHtml(media.description || ""),
          originalUrl: media.url || "",
          originalUploadPath: toPosix(relPath),
          extension,
          parentId: String(media.parentId || ""),
          date: media.date || "",
          ...fallbackAsset,
          warning: error instanceof Error ? error.message : String(error),
        });
        optimizedCount++;
      } catch (fallbackError) {
        failedCount++;
        processedMedia.push({
          id: String(media.id),
          title: media.title || "",
          alt: media.alt || media.title || "",
          caption: media.caption || "",
          description: stripHtml(media.description || ""),
          originalUrl: media.url || "",
          originalUploadPath: toPosix(relPath),
          extension,
          parentId: String(media.parentId || ""),
          date: media.date || "",
          width: null,
          height: null,
          thumbSrc: "",
          thumbWidth: null,
          thumbHeight: null,
          fullSrc: "",
          fullWidth: null,
          fullHeight: null,
          error: fallbackError instanceof Error ? fallbackError.message : String(fallbackError),
        });
      }
      if ((index + 1) % 100 === 0) {
        console.log(`Processed ${index + 1}/${mediaManifest.length} media assets`);
      }
    }
  }

  const mediaById = new Map(processedMedia.map((item) => [item.id, item]));
  const urlToMedia = new Map(
    processedMedia
      .filter((item) => item.originalUrl)
      .map((item) => [item.originalUrl, item]),
  );
  const urlPathToMedia = new Map(
    processedMedia
      .filter((item) => item.originalUrl)
      .map((item) => [mediaUrlKey(item.originalUrl), item]),
  );

  const albums = galleryManifest
    .filter((gallery) => gallery.status === "publish")
    .map((gallery) => {
      const allPhotoIds = Array.from(
        new Set((gallery.allImageIds || []).map((id) => String(id))),
      ).filter((id) => mediaById.has(id));
      const coverMedia =
        urlToMedia.get(gallery.mainImageUrl || "") ||
        mediaById.get(allPhotoIds[0]) ||
        null;

      return {
        id: String(gallery.id),
        title: gallery.title || "",
        slug: normalizeSlug(gallery.slug, `gallery-${gallery.id}`),
        date: gallery.date || "",
        eventDate: gallery.eventDate || "",
        eventYear: gallery.eventYear || "",
        description: stripHtml(gallery.description || gallery.content || ""),
        coverMediaId: coverMedia?.id || "",
        coverSrc: coverMedia?.thumbSrc || coverMedia?.fullSrc || "",
        coverFullSrc: coverMedia?.fullSrc || "",
        photoIds: allPhotoIds,
        photos: allPhotoIds.map((id) => mediaById.get(id)).filter(Boolean),
      };
    })
    .sort(sortByDateDesc);

  const contentItems = publicContent.map((item) => {
    const meta = item.meta || {};
    let derivedContent = item.content || "";
    let derivedExcerpt = item.excerpt || "";
    let image = null;
    const fields = {};

    if (item.type === "announcement") {
      const photo = mediaFromUrl(urlToMedia, urlPathToMedia, metaValue(meta, "announcement_photo"));
      image = photo;
      fields.displayDate = metaValue(meta, "announcement_date");
      fields.description = metaValue(meta, "announcement_description");
      fields.author = metaValue(meta, "announcement_author");
      fields.category = metaValue(meta, "announcement_category");
      fields.priority = Number(metaValue(meta, "announcement_priority") || 0);
      derivedExcerpt = fields.description;
      derivedContent = textToHtml(metaValue(meta, "announcement_main_content"));
    }

    if (item.type === "memory") {
      const photo = mediaFromUrl(urlToMedia, urlPathToMedia, metaValue(meta, "event_main_image"));
      image = photo;
      fields.displayDate = metaValue(meta, "event_date");
      fields.time = metaValue(meta, "event_time");
      fields.venue = metaValue(meta, "event_venue");
      fields.map = metaValue(meta, "google_map");
      fields.description = metaValue(meta, "event_description");
      derivedExcerpt = fields.description;
      derivedContent = textToHtml(metaValue(meta, "event_full_content"));
    }

    if (item.type === "committee") {
      const photo = mediaFromUrl(urlToMedia, urlPathToMedia, metaValue(meta, "committee_profile_photo"));
      image = photo;
      fields.name = metaValue(meta, "committee_name");
      fields.position = metaValue(meta, "committee_position");
      fields.priority = Number(metaValue(meta, "committee_priority") || 0);
      derivedExcerpt = fields.position;
    }

    if (item.type === "edu-contribution") {
      const photo = mediaFromUrl(urlToMedia, urlPathToMedia, metaValue(meta, "edu_event_main_image"));
      image = photo;
      fields.displayDate = metaValue(meta, "edu_event_date");
      fields.time = metaValue(meta, "edu_event_time");
      fields.venue = metaValue(meta, "edu_event_venue");
      fields.map = metaValue(meta, "edu_google_map");
      fields.description = metaValue(meta, "edu_event_description");
      derivedExcerpt = fields.description;
      derivedContent = textToHtml(metaValue(meta, "edu_event_full_content"));
    }

    const contentHtml = cleanHtml(derivedContent, urlToMedia);

    return {
      id: String(item.id),
      type: item.type,
      title: item.title || "",
      slug: normalizeSlug(item.slug, `${item.type}-${item.id}`),
      link: item.link || "",
      date: item.date || "",
      modified: item.modified || "",
      excerpt: stripHtml(derivedExcerpt || ""),
      contentHtml,
      text: stripHtml(contentHtml || derivedExcerpt || ""),
      image,
      fields,
      meta,
    };
  });

  const pages = contentItems.filter((item) => item.type === "page");
  const announcements = contentItems
    .filter((item) => item.type === "announcement")
    .sort((a, b) => (b.fields.priority || 0) - (a.fields.priority || 0) || sortByDateDesc(a, b));
  const memories = contentItems.filter((item) => item.type === "memory").sort(sortByDateDesc);
  const committees = contentItems
    .filter((item) => item.type === "committee")
    .sort((a, b) => (a.fields.priority || 0) - (b.fields.priority || 0));
  const contributions = contentItems.filter((item) => item.type === "edu-contribution").sort(sortByDateDesc);
  const posts = contentItems.filter((item) => item.type === "post");

  const siteData = {
    generatedAt: new Date().toISOString(),
    sourceUrl: "https://stsalumniassociation.com",
    title: "泗里街高级(华侨)中学校友会",
    subtitle: "Sibu Sungai Merah Alumni Association",
    media: processedMedia,
    albums,
    pages,
    announcements,
    memories,
    committees,
    contributions,
    posts,
    stats: {
      mediaCount: processedMedia.length,
      optimizedCount,
      failedCount,
      albumCount: albums.length,
      pageCount: pages.length,
      announcementCount: announcements.length,
      memoryCount: memories.length,
      committeeCount: committees.length,
    },
  };

  await fs.writeFile(
    path.join(generatedRoot, "site-data.json"),
    JSON.stringify(siteData, null, 2),
    "utf8",
  );

  await fs.writeFile(
    path.join(auditRoot, "next-data-summary.json"),
    JSON.stringify(siteData.stats, null, 2),
    "utf8",
  );

  console.log(JSON.stringify(siteData.stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
