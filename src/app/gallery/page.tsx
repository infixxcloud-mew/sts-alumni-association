import { LegacyGalleryListPage } from "@/components/legacy/legacy-list-pages";
import { getPublishedCmsAlbums, mergeCmsFirst } from "@/lib/cms-data";
import { publishedAlbums } from "@/lib/site-data";

export const metadata = {
  title: "相册 - 泗里街高级(华侨)中学 - 校友会",
};

export default async function GalleryPage() {
  const cmsAlbums = await getPublishedCmsAlbums();
  const albums = mergeCmsFirst(cmsAlbums, publishedAlbums);

  return <LegacyGalleryListPage albums={albums} />;
}
