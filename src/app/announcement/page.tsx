import { LegacyAnnouncementListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { filterAnnouncements, firstSearchParam } from "@/lib/announcement-filter";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "通告 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function AnnouncementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const cmsAnnouncements = await getPublishedCmsContent("announcement");
  const allAnnouncements = mergeCmsFirst(cmsAnnouncements, siteData.announcements);
  const category = firstSearchParam(params.cat_);
  const keyword = firstSearchParam(params.keyword_search);
  const announcements = filterAnnouncements(allAnnouncements, { category, keyword });

  return (
    <LegacyAnnouncementListPage
      announcements={announcements}
      allAnnouncements={allAnnouncements}
      category={category}
      keyword={keyword}
    />
  );
}
