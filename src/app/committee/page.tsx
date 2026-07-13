import Image from "next/image";
import { Users } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";
import { siteData } from "@/lib/site-data";

export const metadata = {
  title: "委员会 | 泗里街高级(华侨)中学校友会",
};

export default function CommitteePage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-[#f8f6f1]">
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.18em] text-[#7a1f24] uppercase">
            Committee
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-stone-950">委员会</h1>
          <p className="mt-4 max-w-3xl text-stone-600">
            当前公开委员会名单，共 {siteData.committees.length} 位成员。
          </p>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {siteData.committees.map((member) => (
              <article
                key={member.id}
                className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm"
              >
                <div className="relative aspect-[4/5] bg-stone-200">
                  {member.image?.fullSrc ? (
                    <Image
                      src={member.image.fullSrc}
                      alt={String(member.fields.name || member.title)}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Users aria-hidden="true" className="h-10 w-10 text-stone-400" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-sm font-medium text-[#7a1f24]">
                    {String(member.fields.position || member.title)}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-stone-950">
                    {String(member.fields.name || member.title)}
                  </h2>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
