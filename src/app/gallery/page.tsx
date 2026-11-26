import { LegacyGalleryListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsAlbums, mergeCmsFirst } from "@/lib/cms-data";
import { filterAlbumsByYear, publishedAlbums } from "@/lib/site-data";

export const metadata = {
  title: "相册 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [params, cmsAlbums] = await Promise.all([searchParams, getPublishedCmsAlbums()]);
  const allAlbums = mergeCmsFirst(cmsAlbums, publishedAlbums);
  const yearValue = params.year_sts;
  const year = (Array.isArray(yearValue) ? yearValue[0] : yearValue)?.trim() || "";
  const albums = filterAlbumsByYear(allAlbums, year);

  return <LegacyGalleryListPage albums={albums} year={year} />;
}
