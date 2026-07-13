import Image from "next/image";
import { notFound } from "next/navigation";
import { PhotoGallery } from "@/components/photo-gallery";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
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
      ? `${album.title} | 相册 | 泗里街高级(华侨)中学校友会`
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

  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8f6f1]">
        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
              Gallery
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-stone-950 sm:text-5xl">
              {album.title}
            </h1>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="border-l border-stone-300 pl-4">
                <dt className="text-stone-500">日期</dt>
                <dd className="mt-1 font-semibold text-stone-950">
                  {album.eventDate || album.eventYear || "未注明"}
                </dd>
              </div>
              <div className="border-l border-stone-300 pl-4">
                <dt className="text-stone-500">照片</dt>
                <dd className="mt-1 font-semibold text-stone-950">
                  {album.photos.length} 张
                </dd>
              </div>
            </dl>
            {album.description ? (
              <p className="mt-6 leading-7 text-stone-600">{album.description}</p>
            ) : null}
          </div>

          {album.coverFullSrc ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-stone-200 bg-stone-200 shadow-sm">
              <Image
                src={album.coverFullSrc}
                alt={album.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <PhotoGallery photos={album.photos} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
