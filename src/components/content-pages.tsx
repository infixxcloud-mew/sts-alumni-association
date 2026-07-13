import Image from "next/image";
import { ContentCard } from "@/components/content-card";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { ContentItem, displayDate } from "@/lib/site-data";

export function ContentListPage({
  eyebrow,
  title,
  description,
  basePath,
  items,
}: {
  eyebrow: string;
  title: string;
  description: string;
  basePath: string;
  items: ContentItem[];
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8f6f1]">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-950">{title}</h1>
          <p className="mt-4 max-w-3xl text-stone-600">{description}</p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                href={`${basePath}/${encodeURIComponent(item.slug)}`}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

export function ContentDetailPage({
  eyebrow,
  item,
}: {
  eyebrow: string;
  item: ContentItem;
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8f6f1]">
        <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-stone-950 sm:text-5xl">
            {item.title}
          </h1>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-stone-500">
            {displayDate(item) ? <span>{displayDate(item)}</span> : null}
            {item.fields.category ? <span>{String(item.fields.category)}</span> : null}
            {item.fields.venue ? <span>{String(item.fields.venue)}</span> : null}
          </div>

          {item.image?.fullSrc ? (
            <div className="relative mt-8 aspect-[16/10] overflow-hidden rounded-lg border border-stone-200 bg-stone-200 shadow-sm">
              <Image
                src={item.image.fullSrc}
                alt={item.title}
                fill
                sizes="(max-width: 1024px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          ) : null}

          {item.excerpt ? (
            <p className="mt-8 rounded-lg border border-stone-200 bg-white p-5 text-lg leading-8 text-stone-700 shadow-sm">
              {item.excerpt}
            </p>
          ) : null}

          {item.contentHtml ? (
            <div
              className="prose-content mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm"
              dangerouslySetInnerHTML={{ __html: item.contentHtml }}
            />
          ) : null}
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
