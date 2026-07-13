import { ContentListPage } from "@/components/content-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "回忆 | 泗里街高级(华侨)中学校友会",
};

export default async function MemoryPage() {
  const cmsMemories = await getPublishedCmsContent("memory");
  const memories = mergeCmsFirst(cmsMemories, siteData.memories);

  return (
    <ContentListPage
      eyebrow="Memory"
      title="回忆"
      description="校友会活动、母校建设、奖励金与校友回馈记录。"
      basePath="/memory"
      items={memories}
    />
  );
}
