import type { ContentItem } from "@/lib/site-data";

export type AnnouncementFilters = {
  category: string;
  keyword: string;
};

export function firstSearchParam(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value)?.trim() || "";
}

export function filterAnnouncements(
  announcements: ContentItem[],
  { category, keyword }: AnnouncementFilters,
) {
  const normalizedKeyword = keyword.toLocaleLowerCase();

  return announcements.filter((item) => {
    const itemCategory = String(item.fields.category || "");
    if (category && itemCategory !== category) return false;
    if (!normalizedKeyword) return true;

    const searchableText = [
      item.title,
      item.excerpt,
      item.text,
      itemCategory,
      String(item.fields.venue || ""),
    ]
      .join(" ")
      .toLocaleLowerCase();

    return searchableText.includes(normalizedKeyword);
  });
}

export function featuredAnnouncements(announcements: ContentItem[]) {
  const selected = announcements.filter((item) => item.fields.isFeatured === true);
  return selected.length > 0 ? selected : announcements.slice(0, 3);
}
