import { notFound } from "next/navigation";
import { LegacyContentDetailPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsContentBySlug } from "@/lib/cms-data";
import { getContentBySlug, siteData } from "@/lib/site-data";

export function generateStaticParams() {
  return siteData.memories.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item =
    getContentBySlug(siteData.memories, slug) ||
    (await getPublishedCmsContentBySlug("memory", slug));
  return {
    title: item ? `${item.title} - 回忆 - 泗里街高级(华侨)中学 - 校友会` : "回忆",
  };
}

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item =
    getContentBySlug(siteData.memories, slug) ||
    (await getPublishedCmsContentBySlug("memory", slug));
  if (!item) notFound();

  return <LegacyContentDetailPage active="memory" crumb="回忆" item={item} />;
}
