import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ContentItem, displayDate, itemImage } from "@/lib/site-data";

export function SectionHeader({
  eyebrow,
  title,
  href,
}: {
  eyebrow: string;
  title: string;
  href?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-stone-950 sm:text-3xl">
          {title}
        </h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="hidden items-center gap-2 rounded-md border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-[#7a1f24] hover:text-[#7a1f24] sm:inline-flex"
        >
          查看全部
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function ContentCard({
  item,
  href,
}: {
  item: ContentItem;
  href: string;
}) {
  const image = itemImage(item);

  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      {image ? (
        <Link href={href} className="relative block aspect-[4/3] bg-stone-200">
          <Image
            src={image}
            alt={item.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        </Link>
      ) : null}
      <div className="p-5">
        <p className="text-xs font-medium tracking-[0.14em] text-stone-500 uppercase">
          {displayDate(item)}
        </p>
        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-950">
          <Link href={href}>{item.title}</Link>
        </h3>
        {item.excerpt ? (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-stone-600">
            {item.excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
