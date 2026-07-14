import { LegacyMemoryListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "回忆 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function MemoryPage() {
  const cmsMemories = await getPublishedCmsContent("memory");
  const memories = mergeCmsFirst(cmsMemories, siteData.memories);

  return <LegacyMemoryListPage memories={memories} />;
}
