import { LegacyMemoryListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContent, mergeCmsFirst } from "@/lib/cms-data";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "回忆 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function MemoryPaginationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const [{ page }, cmsMemories] = await Promise.all([params, getPublishedCmsContent("memory")]);
  const memories = mergeCmsFirst(cmsMemories, siteData.memories);
  const pageNumber = Number.parseInt(page, 10);

  return <LegacyMemoryListPage memories={memories} page={pageNumber} />;
}
