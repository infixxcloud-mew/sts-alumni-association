import { LegacyGalleryListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsAlbums, mergeCmsFirst } from "@/lib/cms-data";
import { filterAlbumsByYear, publishedAlbums } from "@/lib/site-data";

export const metadata = {
  title: "相册 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function GalleryPaginationPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ page }, query, cmsAlbums] = await Promise.all([
    params,
    searchParams,
    getPublishedCmsAlbums(),
  ]);
  const allAlbums = mergeCmsFirst(cmsAlbums, publishedAlbums);
  const yearValue = query.year_sts;
  const year = (Array.isArray(yearValue) ? yearValue[0] : yearValue)?.trim() || "";
  const albums = filterAlbumsByYear(allAlbums, year);
  const pageNumber = Number.parseInt(page, 10);

  return <LegacyGalleryListPage albums={albums} page={pageNumber} year={year} />;
}
