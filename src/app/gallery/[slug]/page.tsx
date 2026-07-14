import { notFound } from "next/navigation";
import { LegacyAlbumDetailPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsAlbumBySlug } from "@/lib/cms-data";
import { getAlbumBySlug, publishedAlbums } from "@/lib/site-data";

export function generateStaticParams() {
  return publishedAlbums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug) || (await getPublishedCmsAlbumBySlug(slug));
  return {
    title: album
      ? `${album.title} - 相册 - 泗里街高级(华侨)中学 - 校友会`
      : "相册",
  };
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = getAlbumBySlug(slug) || (await getPublishedCmsAlbumBySlug(slug));
  if (!album) notFound();

  return <LegacyAlbumDetailPage album={album} />;
}
