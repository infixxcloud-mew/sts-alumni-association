import Link from "next/link";
import { BookOpen, Camera, Home, Mail, Megaphone, Users } from "lucide-react";
import { siteData } from "@/lib/site-data";

const navItems = [
  { href: "/", label: "主页", icon: Home },
  { href: "/gallery", label: "相册", icon: Camera },
  { href: "/memory", label: "回忆", icon: BookOpen },
  { href: "/announcement", label: "通告", icon: Megaphone },
  { href: "/committee", label: "委员会", icon: Users },
  { href: "/contact-us", label: "联络我们", icon: Mail },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/80 bg-[#f8f6f1]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link href="/" className="group">
          <p className="text-base font-semibold tracking-[0.08em] text-[#7a1f24]">
            泗里街高级(华侨)中学
          </p>
          <p className="text-sm text-stone-600">{siteData.subtitle}</p>
        </Link>

        <nav className="flex gap-1 overflow-x-auto pb-1 lg:pb-0" aria-label="主要导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-white hover:text-[#7a1f24]"
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-white">{siteData.title}</p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-400">
            本站由 WordPress 资料本地迁移重构，保留校友会相册、回忆、通告与委员会资料。
          </p>
        </div>
        <div className="text-sm text-stone-400 md:text-right">
          <p>Source backup verified locally</p>
          <p className="mt-1">Generated {new Date(siteData.generatedAt).toLocaleDateString("zh-CN")}</p>
        </div>
      </div>
    </footer>
  );
}
