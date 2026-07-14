import { LegacyGalleryListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsAlbums, mergeCmsFirst } from "@/lib/cms-data";
import { publishedAlbums } from "@/lib/site-data";

export const metadata = {
  title: "相册 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function GalleryPaginationPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const [{ page }, cmsAlbums] = await Promise.all([params, getPublishedCmsAlbums()]);
  const albums = mergeCmsFirst(cmsAlbums, publishedAlbums);
  const pageNumber = Number.parseInt(page, 10);

  return <LegacyGalleryListPage albums={albums} page={pageNumber} />;
}
