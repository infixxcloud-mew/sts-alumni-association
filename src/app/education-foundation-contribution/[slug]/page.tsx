import { notFound } from "next/navigation";
import { LegacyContentDetailPage } from "@/components/legacy/legacy-list-pages";
import { getContentBySlug, siteData } from "@/lib/site-data";

export function generateStaticParams() {
  return siteData.contributions.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getContentBySlug(siteData.contributions, slug);
  return {
    title: item ? `${item.title} - 教育基金/校友贡献 - 泗里街高级(华侨)中学 - 校友会` : "教育基金/校友贡献",
  };
}

export default async function EducationContributionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = getContentBySlug(siteData.contributions, slug);
  if (!item) notFound();

  return (
    <LegacyContentDetailPage
      active="education"
      crumb="教育基金/校友贡献"
      item={item}
    />
  );
}
