"use client";

/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";
import { useState } from "react";

export type LegacyActive =
  | "home"
  | "memory"
  | "gallery"
  | "announcement"
  | "sponsor"
  | "committee"
  | "education"
  | "about"
  | "contact";

type NavItem = {
  href: string;
  label: string;
  active: LegacyActive;
  children?: { href: string; label: string }[];
};

const navItems: NavItem[] = [
  { href: "/", label: "主页", active: "home" },
  { href: "/memory", label: "回忆", active: "memory" },
  { href: "/gallery", label: "相册", active: "gallery" },
  { href: "/announcement", label: "通告", active: "announcement" },
  { href: "/sponsor", label: "赞助商", active: "sponsor" },
  {
    href: "/committee",
    label: "委员会",
    active: "committee",
    children: [
      { href: "/committee", label: "现任执委" },
      { href: "/previous-committee", label: "历届执委" },
      { href: "/join-us", label: "申请加入" },
    ],
  },
  {
    href: "/education-foundation",
    label: "教育基金",
    active: "education",
    children: [
      { href: "/education-foundation", label: "委员会" },
      { href: "/education-foundation-contribution", label: "贡献" },
      { href: "/education-foundation-sponsor", label: "赞助者" },
    ],
  },
  {
    href: "/about-us",
    label: "关于我们",
    active: "about",
    children: [
      { href: "/about-us", label: "校友会详情" },
      { href: "/quote", label: "精辟语录" },
      { href: "/consultant", label: "顾问团" },
      { href: "/bursary", label: "助学金计划" },
      { href: "/feedback", label: "网站反馈" },
    ],
  },
  { href: "/contact-us", label: "联络我们", active: "contact" },
];

export function LegacyNav({ active }: { active: LegacyActive }) {
  const [open, setOpen] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<string[]>([]);

  function closeNavigation() {
    setOpen(false);
    setOpenSubmenus([]);
  }

  function toggleSubmenu(href: string) {
    setOpenSubmenus((current) =>
      current.includes(href) ? current.filter((value) => value !== href) : [...current, href],
    );
  }

  return (
    <nav className="navbar navbar-expand-lg">
      <a className="navbar-brand" href="/" aria-label="泗里街高级(华侨)中学校友会">
        <Image
          src="/legacy-theme/images/sts-logo.png"
          alt="泗里街高级(华侨)中学校友会"
          width={300}
          height={87}
          priority
        />
      </a>

      <button
        className={`navbar-toggler${open ? " active" : ""}`}
        type="button"
        aria-controls="navbarSupportedContent"
        aria-expanded={open}
        aria-label="切换导航"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="icon-bar" />
        <span className="icon-bar" />
        <span className="icon-bar" />
      </button>

      <div
        className={`collapse navbar-collapse sub-menu-bar${open ? " show" : ""}`}
        id="navbarSupportedContent"
      >
        <ul className="navbar-nav ml-auto">
          {navItems.map((item) => (
            <li key={item.href} className="nav-item">
              <a
                href={item.href}
                className={item.active === active ? "active" : undefined}
                onClick={closeNavigation}
              >
                {item.label}
              </a>
              {item.children ? (
                <>
                  <button
                    type="button"
                    className="sub-nav-toggler"
                    aria-expanded={openSubmenus.includes(item.href)}
                    onClick={() => toggleSubmenu(item.href)}
                  >
                    <i className="fa fa-chevron-down" aria-hidden="true" />
                  </button>
                  <ul
                    className={`sub-menu${openSubmenus.includes(item.href) ? " legacy-submenu-open" : ""}`}
                  >
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <a href={child.href} onClick={closeNavigation}>
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
