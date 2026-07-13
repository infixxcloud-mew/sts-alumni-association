import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content-pages";
import { getPublishedCmsContentBySlug } from "@/lib/cms-data";
import { getContentBySlug, siteData } from "@/lib/site-data";

export function generateStaticParams() {
  return siteData.announcements.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item =
    getContentBySlug(siteData.announcements, slug) ||
    (await getPublishedCmsContentBySlug("announcement", slug));
  return {
    title: item ? `${item.title} | 通告` : "通告",
  };
}

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item =
    getContentBySlug(siteData.announcements, slug) ||
    (await getPublishedCmsContentBySlug("announcement", slug));
  if (!item) notFound();

  return <ContentDetailPage eyebrow="Notice" item={item} />;
}
