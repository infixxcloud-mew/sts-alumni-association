import { LegacyAnnouncementListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "通告 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function AnnouncementPaginationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const [{ page }, cmsAnnouncements] = await Promise.all([
    params,
    getPublishedCmsContent("announcement"),
  ]);
  const announcements = mergeCmsFirst(cmsAnnouncements, siteData.announcements);
  const pageNumber = Number.parseInt(page, 10);

  return <LegacyAnnouncementListPage announcements={announcements} page={pageNumber} />;
}
