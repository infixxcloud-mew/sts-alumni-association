import { LegacyAnnouncementListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "通告 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function AnnouncementPage() {
  const cmsAnnouncements = await getPublishedCmsContent("announcement");
  const announcements = mergeCmsFirst(cmsAnnouncements, siteData.announcements);

  return <LegacyAnnouncementListPage announcements={announcements} />;
}
