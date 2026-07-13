import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { getContentBySlug, siteData } from "@/lib/site-data";
import { staticPageContent } from "@/lib/static-pages";

const excludedSlugs = new Set(["gallery", "memory", "announcement", "committee"]);

export function generateStaticParams() {
  return siteData.pages
    .filter((page) => !excludedSlugs.has(page.slug))
    .map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getContentBySlug(siteData.pages, slug);
  return {
    title: page ? `${page.title} | 泗里街高级(华侨)中学校友会` : "页面",
  };
}

export default async function GenericPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getContentBySlug(siteData.pages, slug);
  if (!page || excludedSlugs.has(page.slug)) notFound();

  const staticContent = staticPageContent[page.slug];

  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8f6f1]">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
            {staticContent?.eyebrow || "Page"}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-950">
            {staticContent?.heading || page.title}
          </h1>

          <div className="mt-8 rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            {staticContent ? (
              <div className="space-y-5 text-base leading-8 text-stone-700">
                {staticContent.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}

                {staticContent.facts ? (
                  <dl className="grid gap-4 pt-4 sm:grid-cols-3">
                    {staticContent.facts.map((fact) => (
                      <div key={fact.label} className="border-l border-stone-300 pl-4">
                        <dt className="text-sm text-stone-500">{fact.label}</dt>
                        <dd className="mt-1 font-semibold text-stone-950">
                          {fact.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
              </div>
            ) : page.contentHtml ? (
              <div
                className="prose-content"
                dangerouslySetInnerHTML={{ __html: page.contentHtml }}
              />
            ) : (
              <div className="space-y-4 text-stone-700">
                <p>{page.title} 的资料正在整理中。</p>
                <p>您可以先浏览相册、回忆、通告和委员会资料。</p>
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["/gallery", "相册"],
              ["/memory", "回忆"],
              ["/announcement", "通告"],
            ].map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center justify-between rounded-lg border border-stone-200 bg-white p-4 font-semibold text-stone-800 shadow-sm transition hover:border-[#7a1f24] hover:text-[#7a1f24]"
              >
                {label}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
