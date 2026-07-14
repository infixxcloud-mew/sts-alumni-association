import { notFound } from "next/navigation";
import { LegacyGenericPage } from "@/components/legacy/legacy-list-pages";
import { getContentBySlug, siteData } from "@/lib/site-data";

const excludedSlugs = new Set(["gallery", "memory", "announcement", "committee"]);

export function generateStaticParams() {
  return siteData.pages
    .filter((page) => !excludedSlugs.has(page.slug))
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getContentBySlug(siteData.pages, slug);
  return {
    title: page ? `${page.title} - 泗里街高级(华侨)中学 - 校友会` : "页面",
  };
}

export default async function GenericPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getContentBySlug(siteData.pages, slug);
  if (!page || excludedSlugs.has(page.slug)) notFound();

  return <LegacyGenericPage page={page} />;
}
