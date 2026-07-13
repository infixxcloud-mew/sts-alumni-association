import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content-pages";
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
    title: item ? `${item.title} | 回忆` : "回忆",
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

  return <ContentDetailPage eyebrow="Memory" item={item} />;
}
