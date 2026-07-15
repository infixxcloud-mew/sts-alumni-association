import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

test("keeps Bootstrap slide columns at the Slick slide width", async () => {
  const stylesheet = await readFile(resolve("src/app/globals.css"), "utf8");

  assert.match(
    stylesheet,
    /\.legacy-site \{\s*width: 100%;\s*color: #505050;\s*font-family: "Roboto", sans-serif;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.slick-slide > div > \.col-lg-4,[\s\S]*?\.legacy-site \.slick-slide > div > \.col-lg-6,[\s\S]*?flex: 0 0 100%;[\s\S]*?max-width: 100%;[\s\S]*?width: 100%;/,
  );
  assert.doesNotMatch(
    stylesheet,
    /\.legacy-site \.single-slider \{\s*min-height: 620px;/,
  );
  assert.match(
    stylesheet,
    /@media \(max-width: 767px\) \{[\s\S]*?\.legacy-site \.slider-cont h1 \{\s*font-size: 30px;\s*line-height: 36px;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.patnar-slied \.slick-slide > div > \.col-lg-12 \{\s*display: block !important;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.course-slied \.slick-slide > div > \.col-lg-4\.col-md-6 \{\s*display: block !important;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.category-slied \.singel-category \.icon \{\s*display: inline-block;/,
  );
});

test("keeps the legacy homepage hero, course card, and header markup", async () => {
  const [home, navigation, shell, backgroundSlide, slider, listPages] = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-home.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-nav.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-shell.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-background-slide.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-slider.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8"),
  ]);

  assert.match(home, /image: "\/legacy-theme\/images\/Snapseed-4-scaled\.jpg"/);
  assert.match(home, /image: "\/legacy-theme\/images\/Snapseed-5-scaled\.jpg"/);
  assert.match(home, /image: "\/legacy-theme\/images\/Snapseed-6-scaled\.jpg"/);
  assert.match(home, /function LegacyHomeAlbumCard/);
  assert.match(home, /import \{ LegacyBackgroundSlide \}/);
  assert.match(home, /<LegacyBackgroundSlide/);
  assert.match(backgroundSlide, /^"use client";/);
  assert.match(backgroundSlide, /className/);
  assert.match(backgroundSlide, /\.\.\.style/);
  assert.match(slider, /const \[hasMounted, setHasMounted\]/);
  assert.match(slider, /if \(!hasMounted\)/);
  assert.match(home, /className="fa fa-star"/);
  assert.match(home, /className="fa fa-calendar"/);
  assert.doesNotMatch(home, /<LegacyAlbumCard album=/);
  assert.match(navigation, /width=\{300\}/);
  assert.match(shell, /className="row no-gutters"/);
  assert.match(shell, /className="col-lg-12 col-md-12 col-sm-12 col-12"/);
  assert.match(listPages, /function LegacyAboutPartnerCarousel/);
  assert.match(listPages, /<LegacyAboutPartnerCarousel \/>/);
});

test("keeps partner logos at their legacy intrinsic image size", async () => {
  const home = await readFile(resolve("src/components/legacy/legacy-home.tsx"), "utf8");

  assert.match(home, /<img src=\{image\} alt="Logo" \/>/);
  assert.doesNotMatch(
    home,
    /<Image src=\{image\} alt="Logo" width=\{180\} height=\{100\}/,
  );
});

test("routes public static pages to their original WordPress layouts", async () => {
  const [listPages, shell, navigation, contributionRoute] = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-shell.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-nav.tsx"), "utf8"),
    readFile(resolve("src/app/education-foundation-contribution/[slug]/page.tsx"), "utf8"),
  ]);

  assert.match(shell, /bannerClassName = "pt-105 pb-110 bg_cover"/);
  assert.match(shell, /positionY = "63%"/);
  assert.match(listPages, /function LegacySponsorPage/);
  assert.match(listPages, /function LegacyEducationFoundationPage/);
  assert.match(listPages, /function LegacyEducationContributionPage/);
  assert.match(listPages, /function LegacyEducationSponsorPage/);
  assert.match(listPages, /page\.slug === "sponsor"[\s\S]*?<LegacySponsorPage/);
  assert.match(listPages, /page\.slug === "education-foundation"[\s\S]*?<LegacyEducationFoundationPage/);
  assert.match(listPages, /page\.slug === "education-foundation-contribution"[\s\S]*?<LegacyEducationContributionPage/);
  assert.match(listPages, /page\.slug === "education-foundation-sponsor"[\s\S]*?<LegacyEducationSponsorPage/);
  assert.match(listPages, /active: "announcement" \| "memory" \| "education"/);
  assert.match(listPages, /active === "education" \? "\/education-foundation-contribution"/);
  assert.match(contributionRoute, /siteData\.contributions\.map/);
  assert.match(contributionRoute, /<LegacyContentDetailPage[\s\S]*?active="education"/);
  assert.match(navigation, /<a\s+href=\{item\.href\}/);
  assert.doesNotMatch(navigation, /import Link from "next\/link"/);
});

test("keeps listing pages in the original WordPress card structures", async () => {
  const listPages = await readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8");

  assert.match(listPages, /<LegacyPageBanner title="全部通告" crumb="通告" image="\/legacy-theme\/images\/hcom3\.jpg" bannerClassName="pt-105 pb-130 bg_cover" positionY="15%" \/>/);
  assert.match(listPages, /<LegacyPageBanner title="全部回忆" crumb="回忆" image="\/legacy-theme\/images\/memory-banner\.jpg" positionY="83%" \/>/);
  assert.match(listPages, /<LegacyPageBanner title="全部相册" crumb="相册" image="\/legacy-theme\/images\/gallery-banner\.jpg" positionY="15%" \/>/);
  assert.match(listPages, /<section id="courses-part" className="pt-120 pb-120 gray-bg">/);
  assert.doesNotMatch(listPages, /id="gallery-list"/);
  assert.match(listPages, /<div className="courses-top-search">/);
  assert.match(listPages, /id="myTab" role="tablist"/);
  assert.match(listPages, /显示\{albums\.length\}个相册的其中的\{visibleAlbums\.length\}个/);
  assert.match(listPages, /name="year_sts" placeholder="按年份搜索 \| 例子:2023"/);
  assert.match(listPages, /<div className="col-lg-6" key=\{item\.id\}>[\s\S]*?<LegacyMemoryListItem/);
  assert.match(listPages, /iconText\("fa-calendar"/);
  assert.match(listPages, /iconText\("fa-clock-o"/);
  assert.match(listPages, /iconText\("fa-map-marker"/);
  assert.match(listPages, /<div className="saidbar-search mt-30">/);
  assert.match(listPages, /<div className="singel-post">/);
  assert.match(listPages, /const legacyCategoryOrder = \["活动", "奖励金", "周年活动"\]/);
  assert.match(listPages, /<img src=\{item\.image\?\.fullSrc \|\| image\} alt=\{item\.title\} \/>/);
  assert.doesNotMatch(listPages, /width=\{770\}[\s\S]*?height=\{430\}/);
  assert.match(listPages, /justify-content-lg-end justify-content-center/);
  assert.match(listPages, /&laquo; Previous/);
  assert.match(listPages, /Next &raquo;/);
});

test("keeps sponsor, education, and contact pages on their original WordPress markup", async () => {
  const [listPages, stylesheet] = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8"),
    readFile(resolve("src/app/globals.css"), "utf8"),
  ]);

  assert.match(listPages, /id="prior-sponsor" className="container-fluid pt-50 gray-bg"/);
  assert.match(listPages, /Ads_ \(3\)\.JPG/);
  assert.match(listPages, /Ads_ \(15\)\.JPG/);
  assert.match(listPages, /id="sponsor-photo" className="pt-90 pb-120 gray-bg"/);
  assert.match(listPages, /mediaTitle\("sponsor-list"\)/);
  assert.match(listPages, /title="泗里街高级\(华侨\)中学教育基金委员会" crumb="教育基金" image="\/legacy-theme\/images\/edu-committee\.png"/);
  assert.match(listPages, /title="教育基金\/校友卓越贡献" crumb="教育基金\/校友贡献" image="\/legacy-theme\/images\/edu-sponsor\.png"/);
  assert.match(listPages, /title="母校筑梦之路赞助者" crumb="赞助者" image="\/legacy-theme\/images\/edu-sponsor\.png"/);
  assert.match(listPages, /<div className="main-form pt-30">/);
  assert.match(listPages, /<div className="singel-address">/);
  assert.match(listPages, /stshwachiewalumni@gmail\.com/);
  assert.match(listPages, /019-818 5105/);
  assert.match(listPages, /google\.com\/maps\/embed/);
  assert.match(stylesheet, /\.legacy-site \.contact-from \{\s*padding: 50px;/);
  assert.match(stylesheet, /\.legacy-site \.contact-address \{\s*padding: 20px 50px 50px;/);
  assert.match(stylesheet, /@media \(max-width: 575\.98px\) \{[\s\S]*?\.legacy-site \.contact-from \{\s*padding: 30px;/);
  assert.match(stylesheet, /@media \(max-width: 575\.98px\) \{[\s\S]*?\.legacy-site \.contact-address \{\s*padding: 0 30px 30px;/);
  assert.match(stylesheet, /\.legacy-site \.singel-teachers \.image img \{\s*display: inline;/);
  assert.doesNotMatch(stylesheet, /\.legacy-site \.contact-from,[\s\S]*?\.legacy-site \.contact-address \{\s*padding: 35px;/);
});

test("keeps legacy public navigation on plain anchors without Next route transitions", async () => {
  const legacySources = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-shell.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-home.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8"),
  ]);

  for (const source of legacySources) {
    assert.doesNotMatch(source, /import Link from "next\/link"/);
    assert.doesNotMatch(source, /<Link\b/);
  }

  const listPages = legacySources[2];
  assert.match(listPages, /<a className="prev page-numbers" href=\{href\(currentPage - 1\)\}>/);
  assert.match(listPages, /<a className="next page-numbers" href=\{href\(currentPage \+ 1\)\}>/);
});

test("keeps announcement archives from rendering placeholder image blocks", async () => {
  const listPages = await readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8");

  assert.doesNotMatch(listPages, /legacy-image-placeholder">\u901a\u544a/);
  assert.match(listPages, /\{image \? \(\s*<img src=\{item\.image\?\.fullSrc \|\| image\} alt=\{item\.title\} \/>[\s\S]*?\) : null\}/);
});

test("keeps gallery detail photos centered, captionless, and controlled by the legacy lightbox", async () => {
  const [listPages, interactionLayer, stylesheet] = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-interaction-layer.tsx"), "utf8"),
    readFile(resolve("src/app/globals.css"), "utf8"),
  ]);

  assert.match(stylesheet, /\.legacy-site \.legacy-detail-cover \{[\s\S]*?text-align: center;/);
  assert.match(stylesheet, /\.legacy-site \.legacy-detail-cover img \{[\s\S]*?margin: 0 auto;/);
  assert.doesNotMatch(listPages, /\{photo\.title \? <span>\{photo\.title\}<\/span> : null\}/);
  assert.match(interactionLayer, /legacy-lightbox-prev/);
  assert.match(interactionLayer, /legacy-lightbox-next/);
  assert.match(interactionLayer, /legacy-lightbox-zoom-in/);
  assert.match(interactionLayer, /legacy-lightbox-zoom-out/);
});

test("keeps the about dropdown child pages on their legacy custom templates", async () => {
  const [listPages, stylesheet] = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-list-pages.tsx"), "utf8"),
    readFile(resolve("src/app/globals.css"), "utf8"),
  ]);

  for (const slug of ["quote", "consultant", "bursary", "feedback"]) {
    assert.match(listPages, new RegExp(`page\\.slug === "${slug}"`));
  }

  assert.match(listPages, /function LegacyQuotePage/);
  assert.match(listPages, /function LegacyConsultantPage/);
  assert.match(listPages, /function LegacyBursaryPage/);
  assert.match(listPages, /function LegacyFeedbackPage/);

  assert.match(listPages, /image="\/legacy-theme\/images\/hcom2\.jpg"/);
  assert.match(listPages, /拿督斯里范长锡国会议员/);
  assert.match(listPages, /能获得大家的邀请来说几句话/);

  assert.match(listPages, /image="\/legacy-theme\/images\/previous-committee-banner\.jpg"/);
  assert.match(listPages, /previous-committee-wrapper/);
  assert.match(listPages, /联邦天然资源,环境永续部副部长,泗里街国会议员兼卢勃区立法议员拿督斯里范长锡/);
  assert.match(listPages, /谢祯兴/);

  assert.match(listPages, /id="bursary-banner"/);
  assert.match(listPages, /id="bursary-about"/);
  assert.match(listPages, /共筑梦想 扶助未来/);
  assert.match(listPages, /教育是改变命运的关键/);

  assert.match(listPages, /image="\/legacy-theme\/images\/feedback\.jpg"/);
  assert.match(listPages, /开发团队感言/);
  assert.match(listPages, /lausiexiong99366@gmail\.com/);
  assert.match(listPages, /\+60146992502/);

  assert.match(stylesheet, /\.legacy-site \.previous-committee-wrapper/);
  assert.match(stylesheet, /\.legacy-site \.web-feedback-contact/);

  for (const asset of [
    "hcom2.jpg",
    "previous-committee-banner.jpg",
    "feedback.jpg",
  ]) {
    await access(resolve("public/legacy-theme/images", asset));
  }
});
