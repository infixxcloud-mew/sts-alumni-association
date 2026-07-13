import { ContentListPage } from "@/components/content-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "通告 | 泗里街高级(华侨)中学校友会",
};

export default async function AnnouncementPage() {
  const cmsAnnouncements = await getPublishedCmsContent("announcement");
  const announcements = mergeCmsFirst(cmsAnnouncements, siteData.announcements);

  return (
    <ContentListPage
      eyebrow="Notice"
      title="通告"
      description="校友会奖励金、活动与返校日等公开通告。"
      basePath="/announcement"
      items={announcements}
    />
  );
}
