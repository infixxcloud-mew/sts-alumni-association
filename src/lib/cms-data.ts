import { connection } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Album, ContentItem, MediaItem } from "@/lib/site-data";

export type CmsContentType = "announcement" | "memory";

type CmsMediaRow = {
  id: string;
  title: string | null;
  alt: string | null;
  caption: string | null;
  storage_path: string | null;
  public_url: string | null;
  width: number | null;
  height: number | null;
  created_at: string | null;
};

type CmsAlbumRow = {
  id: string;
  slug: string;
  title: string;
  event_date: string | null;
  event_year: string | null;
  description: string | null;
  cover_media_id: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type CmsAlbumPhotoRow = {
  album_id: string;
  media_id: string;
  title: string | null;
  caption: string | null;
  sort_order: number | null;
};

type CmsContentRow = {
  id: string;
  type: CmsContentType;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  display_date: string | null;
  category: string | null;
  venue: string | null;
  cover_media_id: string | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};

let serverClient: SupabaseClient | null = null;

function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

function getSupabasePublicClient() {
  if (!isSupabaseConfigured()) return null;

  serverClient ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
      },
    },
  );

  return serverClient;
}

async function runCmsQuery<T>(
  fallback: T,
  query: (client: SupabaseClient) => Promise<T>,
) {
  const client = getSupabasePublicClient();
  if (!client) return fallback;

  await connection();

  try {
    return await query(client);
  } catch (error) {
    console.error("Supabase CMS query failed", error);
    return fallback;
  }
}

function extensionFromPath(path: string) {
  const clean = path.split("?")[0] || "";
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

function mediaFromRow(row: CmsMediaRow | null | undefined): MediaItem | null {
  if (!row?.public_url) return null;

  const title = row.title || row.alt || "";

  return {
    id: `cms-media-${row.id}`,
    title,
    alt: row.alt || title,
    caption: row.caption || "",
    description: "",
    originalUrl: row.public_url,
    originalUploadPath: row.storage_path || "",
    extension: extensionFromPath(row.storage_path || row.public_url),
    parentId: "",
    date: row.created_at || "",
    width: row.width,
    height: row.height,
    thumbSrc: row.public_url,
    thumbWidth: row.width,
    thumbHeight: row.height,
    fullSrc: row.public_url,
    fullWidth: row.width,
    fullHeight: row.height,
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function textToHtml(value: string) {
  const text = value.trim();
  if (!text) return "";

  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replaceAll("\n", "<br />")}</p>`)
    .join("");
}

function yearFromDate(date: string) {
  return date.match(/\b(19|20)\d{2}\b/)?.[0] || "";
}

async function fetchMediaByIds(client: SupabaseClient, ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return new Map<string, CmsMediaRow>();

  const { data, error } = await client
    .from("cms_media")
    .select("id,title,alt,caption,storage_path,public_url,width,height,created_at")
    .in("id", uniqueIds);

  if (error) throw error;

  return new Map((data as CmsMediaRow[] | null)?.map((row) => [row.id, row]) || []);
}

async function hydrateAlbums(client: SupabaseClient, rows: CmsAlbumRow[]) {
  if (rows.length === 0) return [];

  const albumIds = rows.map((row) => row.id);
  const { data: photoData, error: photoError } = await client
    .from("cms_album_photos")
    .select("album_id,media_id,title,caption,sort_order")
    .in("album_id", albumIds)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (photoError) throw photoError;

  const photoRows = (photoData as CmsAlbumPhotoRow[] | null) || [];
  const mediaById = await fetchMediaByIds(client, [
    ...rows.map((row) => row.cover_media_id || ""),
    ...photoRows.map((row) => row.media_id),
  ]);

  const photosByAlbum = new Map<string, MediaItem[]>();
  for (const photoRow of photoRows) {
    const baseMedia = mediaFromRow(mediaById.get(photoRow.media_id));
    if (!baseMedia) continue;

    const photo: MediaItem = {
      ...baseMedia,
      id: `cms-photo-${photoRow.album_id}-${photoRow.media_id}`,
      title: photoRow.title || baseMedia.title,
      caption: photoRow.caption || baseMedia.caption,
    };
    const photos = photosByAlbum.get(photoRow.album_id) || [];
    photos.push(photo);
    photosByAlbum.set(photoRow.album_id, photos);
  }

  return rows.map((row): Album => {
    const photos = photosByAlbum.get(row.id) || [];
    const cover = mediaFromRow(
      row.cover_media_id ? mediaById.get(row.cover_media_id) : undefined,
    );
    const firstPhoto = photos[0] || null;
    const coverSrc = cover?.thumbSrc || firstPhoto?.thumbSrc || "";
    const coverFullSrc = cover?.fullSrc || firstPhoto?.fullSrc || "";
    const eventDate = row.event_date || "";

    return {
      id: `cms-album-${row.id}`,
      title: row.title,
      slug: row.slug,
      date: row.created_at || "",
      eventDate,
      eventYear: row.event_year || yearFromDate(eventDate),
      description: row.description || "",
      coverMediaId: row.cover_media_id ? `cms-media-${row.cover_media_id}` : "",
      coverSrc,
      coverFullSrc,
      photoIds: photos.map((photo) => photo.id),
      photos,
    };
  });
}

function contentFromRow(
  row: CmsContentRow,
  mediaById: Map<string, CmsMediaRow>,
): ContentItem {
  const image = mediaFromRow(
    row.cover_media_id ? mediaById.get(row.cover_media_id) : undefined,
  );
  const displayDate = row.display_date || "";
  const body = row.body || "";

  return {
    id: `cms-content-${row.id}`,
    type: row.type,
    title: row.title,
    slug: row.slug,
    link: `/${row.type}/${encodeURIComponent(row.slug)}`,
    date: row.created_at || "",
    modified: row.updated_at || row.created_at || "",
    excerpt: row.excerpt || "",
    contentHtml: textToHtml(body),
    text: body,
    image,
    fields: {
      displayDate,
      category: row.category || "",
      venue: row.venue || "",
      sortOrder: row.sort_order || 0,
    },
    meta: {
      source: "supabase",
    },
  };
}

async function hydrateContent(client: SupabaseClient, rows: CmsContentRow[]) {
  const mediaById = await fetchMediaByIds(
    client,
    rows.map((row) => row.cover_media_id || ""),
  );
  return rows.map((row) => contentFromRow(row, mediaById));
}

export async function getPublishedCmsAlbums() {
  return runCmsQuery<Album[]>([], async (client) => {
    const { data, error } = await client
      .from("cms_albums")
      .select(
        "id,slug,title,event_date,event_year,description,cover_media_id,sort_order,created_at,updated_at",
      )
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return hydrateAlbums(client, (data as CmsAlbumRow[] | null) || []);
  });
}

export async function getPublishedCmsAlbumBySlug(slug: string) {
  return runCmsQuery<Album | null>(null, async (client) => {
    const decoded = decodeURIComponent(slug);
    const { data, error } = await client
      .from("cms_albums")
      .select(
        "id,slug,title,event_date,event_year,description,cover_media_id,sort_order,created_at,updated_at",
      )
      .eq("slug", decoded)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [album] = await hydrateAlbums(client, [data as CmsAlbumRow]);
    return album || null;
  });
}

export async function getPublishedCmsContent(type: CmsContentType) {
  return runCmsQuery<ContentItem[]>([], async (client) => {
    const { data, error } = await client
      .from("cms_content")
      .select(
        "id,type,slug,title,excerpt,body,display_date,category,venue,cover_media_id,sort_order,created_at,updated_at",
      )
      .eq("type", type)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return hydrateContent(client, (data as CmsContentRow[] | null) || []);
  });
}

export async function getPublishedCmsContentBySlug(
  type: CmsContentType,
  slug: string,
) {
  return runCmsQuery<ContentItem | null>(null, async (client) => {
    const decoded = decodeURIComponent(slug);
    const { data, error } = await client
      .from("cms_content")
      .select(
        "id,type,slug,title,excerpt,body,display_date,category,venue,cover_media_id,sort_order,created_at,updated_at",
      )
      .eq("type", type)
      .eq("slug", decoded)
      .eq("is_published", true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const [item] = await hydrateContent(client, [data as CmsContentRow]);
    return item || null;
  });
}

export function mergeCmsFirst<T extends { id: string; slug: string }>(
  cmsItems: T[],
  staticItems: T[],
) {
  const seen = new Set<string>();
  const merged: T[] = [];

  for (const item of [...cmsItems, ...staticItems]) {
    const key = item.slug || item.id;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}
