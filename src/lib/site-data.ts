import siteDataJson from "@/data/generated/site-data.json";

export type MediaItem = {
  id: string;
  title: string;
  alt: string;
  caption: string;
  description: string;
  originalUrl: string;
  originalUploadPath: string;
  extension: string;
  parentId: string;
  date: string;
  width: number | null;
  height: number | null;
  thumbSrc: string;
  thumbWidth: number | null;
  thumbHeight: number | null;
  fullSrc: string;
  fullWidth: number | null;
  fullHeight: number | null;
  warning?: string;
  error?: string;
};

export type Album = {
  id: string;
  title: string;
  slug: string;
  date: string;
  eventDate: string;
  eventYear: string;
  description: string;
  coverMediaId: string;
  coverSrc: string;
  coverFullSrc: string;
  photoIds: string[];
  photos: MediaItem[];
};

export type ContentItem = {
  id: string;
  type: string;
  title: string;
  slug: string;
  link: string;
  date: string;
  modified: string;
  excerpt: string;
  contentHtml: string;
  text: string;
  image: MediaItem | null;
  fields: Record<string, string | number>;
  meta: Record<string, unknown>;
};

export type SiteData = {
  generatedAt: string;
  sourceUrl: string;
  title: string;
  subtitle: string;
  media: MediaItem[];
  albums: Album[];
  pages: ContentItem[];
  announcements: ContentItem[];
  memories: ContentItem[];
  committees: ContentItem[];
  contributions: ContentItem[];
  posts: ContentItem[];
  stats: Record<string, number>;
};

export const siteData = siteDataJson as SiteData;

export const publishedAlbums = siteData.albums.filter(
  (album) => album.photos.length > 0,
);

export function getAlbumBySlug(slug: string) {
  const decoded = decodeURIComponent(slug);
  return siteData.albums.find((album) => album.slug === decoded);
}

export function getContentBySlug(items: ContentItem[], slug: string) {
  const decoded = decodeURIComponent(slug);
  return items.find((item) => item.slug === decoded);
}

export function displayDate(item: ContentItem) {
  return String(item.fields.displayDate || item.date || "");
}

const legacyStaticImageFallbacks: Record<string, string> = {
  "https://stsalumniassociation.com/wp-content/uploads/2023/09/3.jpg":
    "/legacy-theme/images/announcements/3-hq.jpg",
  "https://stsalumniassociation.com/wp-content/uploads/2023/09/2-scaled.jpg":
    "/legacy-theme/images/announcements/2-scaled.jpg",
  "https://stsalumniassociation.com/wp-content/uploads/2023/09/22789166_2053167941648064_2990332127747441967_n.jpg":
    "/legacy-theme/images/announcements/22789166_2053167941648064_2990332127747441967_n-hq.jpg",
};

function legacyUploadPath(url: string) {
  try {
    const path = decodeURIComponent(new URL(url).pathname);
    return path.replace(/^\/wp-content\/uploads\//, "");
  } catch {
    return url;
  }
}

function normalizeLegacyUploadPath(path: string) {
  return path
    .replace(/-\d+x\d+(?=\.[a-zA-Z0-9]+$)/, "")
    .replace(/-e\d+(?=\.[a-zA-Z0-9]+$)/, "");
}

export function mediaFromLegacyUrl(url: string) {
  if (!url) return null;

  const uploadPath = legacyUploadPath(url);
  const normalizedPath = normalizeLegacyUploadPath(uploadPath);

  return (
    siteData.media.find(
      (media) =>
        media.originalUrl === url ||
        media.originalUploadPath === uploadPath ||
        normalizeLegacyUploadPath(media.originalUploadPath) === normalizedPath ||
        normalizeLegacyUploadPath(legacyUploadPath(media.originalUrl)) === normalizedPath,
    ) || null
  );
}

function metaImageUrl(item: ContentItem) {
  return String(
    item.meta.announcement_photo ||
      item.meta.announcement_small_photo ||
      item.meta.event_main_image ||
      item.meta.committee_profile_photo ||
      item.meta.edu_event_main_image ||
      "",
  );
}

export function itemImage(item: ContentItem) {
  if (item.image?.fullSrc || item.image?.thumbSrc) {
    return item.image?.fullSrc || item.image?.thumbSrc || "";
  }

  const legacyUrl = metaImageUrl(item);
  const staticFallback = legacyStaticImageFallbacks[legacyUrl];
  if (staticFallback) return staticFallback;

  const media = mediaFromLegacyUrl(legacyUrl);
  return media?.fullSrc || media?.thumbSrc || "";
}
