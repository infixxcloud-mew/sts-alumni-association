/* eslint-disable @next/next/no-html-link-for-pages */
import Image from "next/image";
import type { ReactNode } from "react";
import { LegacyInteractionLayer } from "@/components/legacy/legacy-interaction-layer";
import { siteData } from "@/lib/site-data";
import { LegacyNav, type LegacyActive } from "@/components/legacy/legacy-nav";

const themeCss = [
  "/legacy-theme/css/slick.css",
  "/legacy-theme/css/animate.css",
  "/legacy-theme/css/nice-select.css",
  "/legacy-theme/css/jquery.nice-number.min.css",
  "/legacy-theme/css/magnific-popup.css",
  "/legacy-theme/css/bootstrap.min.css",
  "/legacy-theme/css/font-awesome.min.css",
  "/legacy-theme/css/default.css",
  "/legacy-theme/css/style-1.1.1.css",
  "/legacy-theme/css/responsive.css",
];

export function LegacyThemeLinks() {
  return (
    <>
      {themeCss.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </>
  );
}

export function LegacyShell({
  active,
  children,
}: {
  active: LegacyActive;
  children: ReactNode;
}) {
  return (
    <>
      <LegacyThemeLinks />
      <div className="legacy-site">
        <LegacyHeader active={active} />
        <main>{children}</main>
        <LegacyFooter />
        <LegacyInteractionLayer />
      </div>
    </>
  );
}

export function LegacyHeader({ active }: { active: LegacyActive }) {
  return (
    <header id="header-part">
      <div className="navigation navigation-2">
        <div className="container">
          <div className="row no-gutters">
            <div className="col-lg-12 col-md-12 col-sm-12 col-12">
              <LegacyNav active={active} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function LegacyPageBanner({
  title,
  crumb,
  image = "/legacy-theme/images/about-banner.JPG",
  bannerClassName = "pt-105 pb-110 bg_cover",
  positionY = "63%",
}: {
  title: string;
  crumb: string;
  image?: string;
  bannerClassName?: string;
  positionY?: string;
}) {
  return (
    <section
      id="page-banner"
      className={bannerClassName}
      data-overlay="6"
      style={{
        backgroundImage: `url(${image})`,
        backgroundPositionY: positionY,
      }}
    >
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="page-banner-cont">
              <h2>{title}</h2>
              <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <a href="/">主页</a>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {crumb}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LegacySectionTitle({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`section-title pb-45${align === "center" ? " text-center" : ""}`}>
      <h5>{eyebrow}</h5>
      <h2>{title}</h2>
    </div>
  );
}

export function LegacyFooter() {
  return (
    <footer id="footer-part">
      <div className="footer-top pt-40 pb-70">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="footer-about mt-15">
                <div className="logo">
                  <a href="/">
                    <Image
                      src="/legacy-theme/images/logo-2.png"
                      alt={siteData.title}
                      width={180}
                      height={78}
                    />
                  </a>
                </div>
                <p>
                  共同秉承着华侨精神，骄傲地凝聚了辉煌的过去，并在未来不懈筑梦，追求卓越的教育使命。我们致力于连接校友，传承学校的光荣传统，激发更多的卓越成就。
                </p>
                <ul className="mt-20">
                  <li>
                    <a href="https://www.facebook.com/stshwachiewalumni" target="_blank" rel="noreferrer">
                      <i className="fa fa-facebook-f" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="mailto:stshwachiewalumni@gmail.com">
                      <i className="fa fa-envelope-o" aria-hidden="true" />
                    </a>
                  </li>
                  <li>
                    <a href="tel:084-655686">
                      <i className="fa fa-phone" aria-hidden="true" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-5 col-md-6 col-sm-6">
              <div className="footer-link mt-40">
                <div className="footer-title pb-25">
                  <h6>导览</h6>
                </div>
                <ul>
                  <li>
                    <a href="/about-us">关于我们</a>
                  </li>
                  <li>
                    <a href="/committee">委员会</a>
                  </li>
                  <li>
                    <a href="/announcement">文章</a>
                  </li>
                  <li>
                    <a href="/gallery">相册</a>
                  </li>
                </ul>
                <ul>
                  <li>
                    <a href="/education-foundation">教育基金</a>
                  </li>
                  <li>
                    <a href="/memory">回忆</a>
                  </li>
                  <li>
                    <a href="/contact-us">联络我们</a>
                  </li>
                  <li>
                    <a href="/feedback">网站反馈</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-lg-3 col-md-6">
              <div className="footer-address mt-40">
                <div className="footer-title pb-25">
                  <h6>联络我们</h6>
                </div>
                <ul>
                  <li>
                    <div className="icon">
                      <i className="fa fa-map-marker" aria-hidden="true" />
                    </div>
                    <div className="cont">
                      <p>Peti Surat 78, 96100, Sarikei, Sarawak, Malaysia</p>
                    </div>
                  </li>
                  <li>
                    <div className="icon">
                      <i className="fa fa-phone" aria-hidden="true" />
                    </div>
                    <div className="cont">
                      <p>084-655 686</p>
                    </div>
                  </li>
                  <li>
                    <div className="icon">
                      <i className="fa fa-envelope-o" aria-hidden="true" />
                    </div>
                    <div className="cont">
                      <p>stsalumniassociationweb@gmail.com</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
