import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Users } from "lucide-react";
import { ContentCard, SectionHeader } from "@/components/content-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import {
  getPublishedCmsAlbums,
  getPublishedCmsContent,
  mergeCmsFirst,
} from "@/lib/cms-data";
import { publishedAlbums, siteData } from "@/lib/site-data";

export default async function Home() {
  const [cmsAlbums, cmsAnnouncements, cmsMemories] = await Promise.all([
    getPublishedCmsAlbums(),
    getPublishedCmsContent("announcement"),
    getPublishedCmsContent("memory"),
  ]);
  const allAlbums = mergeCmsFirst(cmsAlbums, publishedAlbums);
  const allAnnouncements = mergeCmsFirst(cmsAnnouncements, siteData.announcements);
  const allMemories = mergeCmsFirst(cmsMemories, siteData.memories);
  const heroAlbum = allAlbums[0];
  const featuredAlbums = allAlbums.slice(0, 6);
  const announcements = allAnnouncements.slice(0, 3);
  const memories = allMemories.slice(0, 3);
  const committeePreview = siteData.committees.slice(0, 6);
  const photoCount = allAlbums.reduce(
    (total, album) => total + album.photos.length,
    0,
  );

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-[#f8f6f1]">
          <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-[0.2em] text-[#7a1f24] uppercase">
                Alumni Association
              </p>
              <h1 className="mt-5 text-4xl font-semibold leading-tight text-stone-950 sm:text-5xl lg:text-6xl">
                泗里街高级(华侨)中学校友会
              </h1>
              <p className="mt-5 text-lg leading-8 text-stone-600">
                保存校友回忆、整理历史照片、发布活动通告，让历届校友可以更快找到共同的校园记忆。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 rounded-md bg-[#7a1f24] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5f171b]"
                >
                  <Camera aria-hidden="true" className="h-4 w-4" />
                  浏览相册
                </Link>
                <Link
                  href="/memory"
                  className="inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-800 transition hover:border-[#7a1f24] hover:text-[#7a1f24]"
                >
                  查看回忆
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
              <dl className="mt-10 grid grid-cols-3 gap-3">
                {[
                  ["相册", allAlbums.length],
                  ["照片", photoCount],
                  ["委员会", siteData.stats.committeeCount],
                ].map(([label, value]) => (
                  <div key={label} className="border-l border-stone-300 pl-4">
                    <dt className="text-sm text-stone-500">{label}</dt>
                    <dd className="mt-1 text-2xl font-semibold text-stone-950">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {heroAlbum?.coverFullSrc ? (
              <Link
                href={`/gallery/${encodeURIComponent(heroAlbum.slug)}`}
                className="group block"
              >
                <figure className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
                  <div className="relative aspect-[4/3] bg-stone-200">
                    <Image
                      src={heroAlbum.coverFullSrc}
                      alt={heroAlbum.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="p-5">
                    <p className="text-sm font-medium text-[#7a1f24]">
                      最新相册 · {heroAlbum.eventDate}
                    </p>
                    <p className="mt-2 text-xl font-semibold text-stone-950">
                      {heroAlbum.title}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">
                      {heroAlbum.photos.length} 张照片
                    </p>
                  </figcaption>
                </figure>
              </Link>
            ) : null}
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Gallery" title="精选相册" href="/gallery" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAlbums.map((album) => (
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
                    <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-950">
                      {album.title}
                    </h3>
                    <p className="mt-2 text-sm text-stone-500">
                      {album.photos.length} 张照片
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f8f6f1] py-14">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
            <div>
              <SectionHeader eyebrow="Notice" title="最新通告" href="/announcement" />
              <div className="grid gap-5">
                {announcements.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    href={`/announcement/${encodeURIComponent(item.slug)}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <SectionHeader eyebrow="Memory" title="校友回忆" href="/memory" />
              <div className="grid gap-5">
                {memories.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    href={`/memory/${encodeURIComponent(item.slug)}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader eyebrow="Committee" title="委员会成员" href="/committee" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {committeePreview.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-stone-200">
                    {member.image?.thumbSrc ? (
                      <Image
                        src={member.image.thumbSrc}
                        alt={String(member.fields.name || member.title)}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <Users aria-hidden="true" className="m-5 h-6 w-6 text-stone-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-950">
                      {String(member.fields.name || member.title)}
                    </p>
                    <p className="text-sm text-stone-500">
                      {String(member.fields.position || member.title)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
