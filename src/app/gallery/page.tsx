import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getPublishedCmsAlbums, mergeCmsFirst } from "@/lib/cms-data";
import { publishedAlbums } from "@/lib/site-data";

export const metadata = {
  title: "相册 | 泗里街高级(华侨)中学校友会",
};

export default async function GalleryPage() {
  const cmsAlbums = await getPublishedCmsAlbums();
  const albums = mergeCmsFirst(cmsAlbums, publishedAlbums);

  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8f6f1]">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
            Gallery
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-950">相册</h1>
          <p className="mt-4 max-w-3xl text-stone-600">
            共整理 {albums.length} 个公开相册，照片来自 WordPress 媒体库本地备份和后台 CMS。
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <Link
                key={album.id}
                href={`/gallery/${encodeURIComponent(album.slug)}`}
                className="group overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/3] bg-stone-200">
                  {album.coverSrc ? (
                    <Image
                      src={album.coverSrc}
                      alt={album.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="p-5">
                  <p className="text-xs font-medium tracking-[0.14em] text-stone-500 uppercase">
                    {album.eventDate}
                  </p>
                  <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-950">
                    {album.title}
                  </h2>
                  <p className="mt-2 text-sm text-stone-500">
                    {album.photos.length} 张照片
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
