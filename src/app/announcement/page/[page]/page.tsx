import { LegacyAnnouncementListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { filterAnnouncements, firstSearchParam } from "@/lib/announcement-filter";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "通告 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function AnnouncementPaginationPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ page }, query, cmsAnnouncements] = await Promise.all([
    params,
    searchParams,
    getPublishedCmsContent("announcement"),
  ]);
  const allAnnouncements = mergeCmsFirst(cmsAnnouncements, siteData.announcements);
  const category = firstSearchParam(query.cat_);
  const keyword = firstSearchParam(query.keyword_search);
  const announcements = filterAnnouncements(allAnnouncements, { category, keyword });
  const pageNumber = Number.parseInt(page, 10);

  return (
    <LegacyAnnouncementListPage
      announcements={announcements}
      allAnnouncements={allAnnouncements}
      category={category}
      keyword={keyword}
      page={pageNumber}
    />
  );
}
