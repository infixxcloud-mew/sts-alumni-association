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

export function itemImage(item: ContentItem) {
  return item.image?.thumbSrc || item.image?.fullSrc || "";
}
