/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { LegacyBackgroundSlide } from "@/components/legacy/legacy-background-slide";
import { getPaginationWindow } from "@/components/legacy/legacy-interactions";
import { LegacyCounter } from "@/components/legacy/legacy-counter";
import { LegacySlider } from "@/components/legacy/legacy-slider";
import { LegacyPageBanner, LegacySectionTitle, LegacyShell } from "@/components/legacy/legacy-shell";
import type { Album, ContentItem, MediaItem } from "@/lib/site-data";
import { displayDate, itemImage, siteData } from "@/lib/site-data";
import { staticPageContent } from "@/lib/static-pages";

function contentPath(basePath: string, item: ContentItem) {
  return `${basePath}/${encodeURIComponent(item.slug)}`;
}

function albumPath(album: Album) {
  return `/gallery/${encodeURIComponent(album.slug)}`;
}

function mediaTitle(title: string) {
  return siteData.media.find((media) => media.title === title);
}

function imageSource(media: MediaItem | null | undefined) {
  return media?.fullSrc || media?.thumbSrc || "";
}

function iconText(icon: string, text: string | number | undefined) {
  if (!text) return null;

  return (
    <span>
      <i className={`fa ${icon}`} aria-hidden="true" />
      {String(text)}
    </span>
  );
}

const sponsorPriorImages = [
  "Ads_ (3).JPG",
  "Ads_ (2).JPG",
  "Ads_ (1).JPG",
  "Ads_ (4).JPG",
  "Ads_ (7).JPG",
  "Ads_ (8).JPG",
];

const sponsorGalleryImages = [
  "Ads_ (13).JPG",
  "Ads_ (12).JPG",
  "Ads_ (10).JPG",
  "Ads_ (16).JPG",
  "Ads_ (11).JPG",
  "Ads_ (15).JPG",
  "Ads_ (6).JPG",
  "Ads_ (14).JPG",
  "Ads_ (17).JPG",
  "Ads_ (5).JPG",
  "Ads_ (9).JPG",
];

function sponsorAdSrc(name: string) {
  return `/legacy-theme/images/ads/${name}`;
}

function LegacyPagination({
  basePath,
  currentPage,
  pageCount,
  alignmentClassName = "justify-content-center",
}: {
  basePath: string;
  currentPage: number;
  pageCount: number;
  alignmentClassName?: string;
}) {
  if (pageCount <= 1) return null;

  const pages =
    pageCount <= 4
      ? Array.from({ length: pageCount }, (_, index) => index + 1)
      : currentPage <= 2
        ? [1, 2, 3, "dots", pageCount]
        : currentPage >= pageCount - 1
          ? [1, "dots", pageCount - 2, pageCount - 1, pageCount]
          : [1, "dots", currentPage - 1, currentPage, currentPage + 1, "dots-end", pageCount];

  function href(page: number) {
    return `${basePath}/page/${page}`;
  }

  return (
    <nav className="courses-pagination mt-50">
      <ul className={`pagination ${alignmentClassName}`}>
        <li className="page-item">
          {currentPage > 1 ? (
            <a className="prev page-numbers" href={href(currentPage - 1)}>
              &laquo; Previous
            </a>
          ) : null}
          {pages.map((page) => {
            if (typeof page === "string") {
              return (
                <span className="page-numbers dots" key={page}>
                  &hellip;
                </span>
              );
            }

            return page === currentPage ? (
              <span aria-current="page" className="page-numbers current" key={page}>
                {page}
              </span>
            ) : (
              <a className="page-numbers" href={href(page)} key={page}>
                {page}
              </a>
            );
          })}
          {currentPage < pageCount ? (
            <a className="next page-numbers" href={href(currentPage + 1)}>
              Next &raquo;
            </a>
          ) : null}
        </li>
      </ul>
    </nav>
  );
}

export function LegacyAlbumCard({ album }: { album: Album }) {
  const href = albumPath(album);

  return (
    <div className="singel-course mt-30">
      <div className="thum">
        <div className="image">
          <a href={href}>
            {album.coverSrc ? (
              <Image
                src={album.coverSrc}
                alt={album.title}
                width={370}
                height={255}
                sizes="(max-width: 991px) 100vw, 33vw"
              />
            ) : (
              <span className="legacy-image-placeholder">相册</span>
            )}
          </a>
        </div>
        <div className="price">
          <span>{album.eventYear || "相册"}</span>
        </div>
      </div>
      <div className="cont">
        {album.eventDate ? <span>{album.eventDate}</span> : null}
        <a href={href}>
          <h4>{album.title}</h4>
        </a>
        {album.description ? (
          <p className="gallery-description">{album.description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LegacyGalleryListPage({ albums, page = 1 }: { albums: Album[]; page?: number }) {
  const pagination = getPaginationWindow(albums.length, 6, page);
  const visibleAlbums = albums.slice(pagination.start, pagination.end);

  return (
    <LegacyShell active="gallery">
      <LegacyPageBanner title="全部相册" crumb="相册" image="/legacy-theme/images/gallery-banner.jpg" positionY="15%" />
      <section id="courses-part" className="pt-120 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="courses-top-search">
                <ul className="nav float-left" id="myTab" role="tablist">
                  <li className="nav-item">
                    <a
                      className="active"
                      id="gallery-grid-tab"
                      data-toggle="tab"
                      href="#gallery-grid"
                      role="tab"
                      aria-controls="gallery-grid"
                      aria-selected="true"
                    >
                      <i className="fa fa-th-large" aria-hidden="true" />
                    </a>
                  </li>
                  <li className="nav-item">
                    显示{albums.length}个相册的其中的{visibleAlbums.length}个
                  </li>
                </ul>

                <div className="courses-search float-right">
                  <form action="/gallery" method="GET">
                    <input type="text" name="year_sts" placeholder="按年份搜索 | 例子:2023" />
                    <button type="submit">
                      <i className="fa fa-search" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="tab-content" id="myTabContent">
            <div className="tab-pane fade show active" id="gallery-grid" role="tabpanel" aria-labelledby="gallery-grid-tab">
              <div className="row">
                {visibleAlbums.map((album) => (
                  <div className="col-lg-4 col-md-6" key={album.id}>
                    <LegacyAlbumCard album={album} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <LegacyPagination
                basePath="/gallery"
                currentPage={pagination.currentPage}
                pageCount={pagination.pageCount}
              />
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

export function LegacyAlbumDetailPage({ album }: { album: Album }) {
  const cover = album.coverFullSrc || album.coverSrc;

  return (
    <LegacyShell active="gallery">
      <LegacyPageBanner title={album.title} crumb="相册" />
      <section id="corses-singel" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="corses-singel-left mt-30">
                {cover ? (
                  <div className="legacy-detail-cover">
                    <Image
                      src={cover}
                      alt={album.title}
                      width={850}
                      height={560}
                      sizes="(max-width: 991px) 100vw, 66vw"
                      priority
                    />
                  </div>
                ) : null}

                <div className="title pt-40">
                  <h3>{album.title}</h3>
                </div>
                <div className="course-terms">
                  <ul>
                    {album.eventDate || album.eventYear ? (
                      <li>
                        <div className="course-category">
                          <h6>{album.eventDate || album.eventYear}</h6>
                        </div>
                      </li>
                    ) : null}
                  </ul>
                </div>

                {album.description ? <p>{album.description}</p> : null}
              </div>
            </div>
          </div>

          <div className="row pt-40">
            <div className="col-lg-12">
              <div className="legacy-photo-grid">
                {album.photos.map((photo) => {
                  const src = photo.thumbSrc || photo.fullSrc;
                  if (!src) return null;

                  return (
                    <a
                      href={photo.fullSrc || src}
                      className="legacy-photo"
                      data-legacy-lightbox
                      data-legacy-lightbox-group={`album-${album.id}`}
                      key={photo.id}
                    >
                      <Image
                        src={src}
                        alt={photo.alt || photo.title || album.title}
                        width={270}
                        height={210}
                        sizes="(max-width: 767px) 50vw, (max-width: 991px) 33vw, 25vw"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

export function LegacyMemoryListItem({ item }: { item: ContentItem }) {
  const image = itemImage(item);
  const href = contentPath("/memory", item);

  return (
    <div className="singel-event-list mt-30">
      <div className="event-thum">
        <a href={href}>
          {image ? (
            <Image
              src={image}
              alt={item.title}
              width={280}
              height={190}
              sizes="(max-width: 991px) 100vw, 280px"
            />
          ) : (
            <span className="legacy-image-placeholder">回忆</span>
          )}
        </a>
      </div>
      <div className="event-cont">
        {iconText("fa-calendar", displayDate(item))}
        <a href={href}>
          <h4>{item.title}</h4>
        </a>
        {iconText("fa-clock-o", item.fields.time)}
        {iconText("fa-map-marker", item.fields.venue)}
        {item.excerpt ? <p>{item.excerpt}</p> : null}
      </div>
    </div>
  );
}

export function LegacyMemoryListPage({ memories, page = 1 }: { memories: ContentItem[]; page?: number }) {
  const pagination = getPaginationWindow(memories.length, 6, page);
  const visibleMemories = memories.slice(pagination.start, pagination.end);

  return (
    <LegacyShell active="memory">
      <LegacyPageBanner title="全部回忆" crumb="回忆" image="/legacy-theme/images/memory-banner.jpg" positionY="83%" />
      <section id="event-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            {visibleMemories.map((item) => (
              <div className="col-lg-6" key={item.id}>
                <LegacyMemoryListItem key={item.id} item={item} />
              </div>
            ))}
          </div>
          <div className="row">
            <div className="col-lg-12">
              <LegacyPagination
                basePath="/memory"
                currentPage={pagination.currentPage}
                pageCount={pagination.pageCount}
              />
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

export function LegacyAnnouncementCard({ item }: { item: ContentItem }) {
  const image = itemImage(item);
  const href = contentPath("/announcement", item);

  return (
    <div className="singel-blog mt-30">
      <div className="blog-thum">
        <a href={href}>
          {image ? (
            <img src={item.image?.fullSrc || image} alt={item.title} />
          ) : null}
        </a>
      </div>
      <div className="blog-cont">
        <a href={href}>
          <h3>{item.title}</h3>
        </a>
        <ul>
          {displayDate(item) ? (
            <li>
              <a href="javascript:;">
                <i className="fa fa-calendar" aria-hidden="true" />
                {displayDate(item)}
              </a>
            </li>
          ) : null}
          {item.fields.author ? (
            <li>
              <a href="javascript:;">
                <i className="fa fa-user" aria-hidden="true" />
                {String(item.fields.author)}
              </a>
            </li>
          ) : null}
          {item.fields.category ? (
            <li>
              <a href="javascript:;">
                <i className="fa fa-tags" aria-hidden="true" />
                {String(item.fields.category)}
              </a>
            </li>
          ) : null}
        </ul>
        {item.excerpt ? <p>{item.excerpt}</p> : null}
      </div>
    </div>
  );
}

export function LegacyAnnouncementListPage({
  announcements,
  page = 1,
}: {
  announcements: ContentItem[];
  page?: number;
}) {
  const pagination = getPaginationWindow(announcements.length, 2, page);
  const visibleAnnouncements = announcements.slice(pagination.start, pagination.end);

  return (
    <LegacyShell active="announcement">
      <LegacyPageBanner title="全部通告" crumb="通告" image="/legacy-theme/images/hcom3.jpg" bannerClassName="pt-105 pb-130 bg_cover" positionY="15%" />
      <section id="blog-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {visibleAnnouncements.map((item) => (
                <LegacyAnnouncementCard key={item.id} item={item} />
              ))}
              <LegacyPagination
                basePath="/announcement"
                currentPage={pagination.currentPage}
                pageCount={pagination.pageCount}
                alignmentClassName="justify-content-lg-end justify-content-center"
              />
            </div>
            <div className="col-lg-4">
              <LegacyAnnouncementSidebar items={announcements} />
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyAnnouncementSidebar({ items }: { items: ContentItem[] }) {
  const categorySet = new Set(items.map((item) => String(item.fields.category || "")).filter(Boolean));
  const legacyCategoryOrder = ["活动", "奖励金", "周年活动"];
  const categories = [
    ...legacyCategoryOrder.filter((category) => categorySet.has(category)),
    ...Array.from(categorySet).filter((category) => !legacyCategoryOrder.includes(category)),
  ];

  return (
    <div className="saidbar">
      <div className="row">
        <div className="col-lg-12 col-md-6">
          <div className="saidbar-search mt-30">
            <form action="/announcement" method="GET">
              <input type="text" name="keyword_search" placeholder="关键词搜索" />
              <button type="submit">
                <i className="fa fa-search" aria-hidden="true" />
              </button>
            </form>
          </div>
          <div className="categories mt-30">
            <h4>类别分类</h4>
            <ul>
              {categories.map((category) => (
                <li key={category}>
                  <a href={`/announcement?cat_=${encodeURIComponent(category)}`}>{category}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-lg-12 col-md-6">
          <div className="saidbar-post mt-30">
            <h4>重点更新</h4>
            <ul>
              {items.slice(0, 3).map((item) => {
                const image = itemImage(item);

                return (
                  <li key={item.id}>
                    <a href={contentPath("/announcement", item)}>
                      <div className="singel-post">
                        <div className="thum">
                          {image ? <img src={image} style={{ width: "120px", height: "90px" }} alt={item.title} /> : null}
                        </div>
                        <div className="cont">
                          <h6>{item.title}</h6>
                          {displayDate(item) ? <span>{displayDate(item)}</span> : null}
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegacySidebar({
  title,
  items,
  basePath,
  categoryTitle = "类别分类",
}: {
  title: string;
  items: ContentItem[];
  basePath: string;
  categoryTitle?: string;
}) {
  const categories = Array.from(
    new Set(items.map((item) => String(item.fields.category || "")).filter(Boolean)),
  );

  return (
    <aside className="saidbar mt-30">
      <div className="row">
        {categories.length > 0 ? (
          <div className="col-lg-12 col-md-6">
            <div className="categories">
              <h4>{categoryTitle}</h4>
              <ul>
                {categories.map((category) => (
                  <li key={category}>
                    <span>{category}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        <div className="col-lg-12 col-md-6">
          <div className="saidbar-post mt-30">
            <h4>{title}</h4>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <a href={contentPath(basePath, item)}>
                    <h6>{item.title}</h6>
                    {displayDate(item) ? <span>{displayDate(item)}</span> : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function LegacyContentDetailPage({
  active,
  crumb,
  item,
}: {
  active: "announcement" | "memory" | "education";
  crumb: string;
  item: ContentItem;
}) {
  const image = item.image?.fullSrc || itemImage(item);
  const sidebarTitle =
    active === "announcement"
      ? "重点更新"
      : active === "memory"
        ? "全部回忆"
        : "教育基金/校友贡献";
  const sidebarItems =
    active === "announcement"
      ? siteData.announcements.slice(0, 5)
      : active === "memory"
        ? siteData.memories.slice(0, 5)
        : siteData.contributions.slice(0, 5);
  const sidebarBasePath =
    active === "education" ? "/education-foundation-contribution" : `/${active}`;

  return (
    <LegacyShell active={active}>
      <LegacyPageBanner title={item.title} crumb={crumb} />
      <section id="blog-singel" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <article className="blog-details mt-30">
                {image ? (
                  <div className="legacy-detail-cover">
                    <Image
                      src={image}
                      alt={item.title}
                      width={850}
                      height={500}
                      sizes="(max-width: 991px) 100vw, 66vw"
                      priority
                    />
                  </div>
                ) : null}
                <div className="cont pt-40">
                  <h3>{item.title}</h3>
                  <ul>
                    {displayDate(item) ? <li>{displayDate(item)}</li> : null}
                    {item.fields.category ? <li>{String(item.fields.category)}</li> : null}
                    {item.fields.venue ? <li>{String(item.fields.venue)}</li> : null}
                  </ul>
                  {item.excerpt ? <p className="legacy-excerpt">{item.excerpt}</p> : null}
                  {item.contentHtml ? (
                    <div
                      className="legacy-prose"
                      dangerouslySetInnerHTML={{ __html: item.contentHtml }}
                    />
                  ) : (
                    <p>{item.text}</p>
                  )}
                </div>
              </article>
            </div>
            <div className="col-lg-4">
              <LegacySidebar
                title={sidebarTitle}
                items={sidebarItems}
                basePath={sidebarBasePath}
                categoryTitle="类别分类"
              />
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

export function LegacyCommitteePage({ members }: { members: ContentItem[] }) {
  return (
    <LegacyShell active="committee">
      <LegacyPageBanner
        title="泗里街高级(华侨)中学校友会第10届执委名单(2023年 - 2024年)"
        crumb="委员会"
      />
      <section id="teachers-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            {members.map((member) => {
              const image = member.image?.fullSrc || member.image?.thumbSrc;
              const name = String(member.fields.name || member.title);
              const position = String(member.fields.position || member.title);

              return (
                <div className="col-lg-3 col-sm-6" key={member.id}>
                  <div className="singel-teachers mt-30 text-center">
                    <div className="image legacy-teacher-image">
                      {image ? (
                        <Image
                          src={image}
                          alt={name}
                          width={270}
                          height={340}
                          sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 25vw"
                        />
                      ) : (
                        <span className="legacy-image-placeholder">委员</span>
                      )}
                    </div>
                    <div className="cont">
                      <h6>{name}</h6>
                      <span>{position}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

export function LegacyGenericPage({ page }: { page: ContentItem }) {
  const staticContent = staticPageContent[page.slug];
  const active =
    page.slug === "contact-us"
      ? "contact"
      : page.slug.includes("education")
        ? "education"
        : page.slug === "sponsor"
          ? "sponsor"
          : "about";

  if (page.slug === "contact-us") {
    return <LegacyContactPage page={page} />;
  }

  if (page.slug === "about-us") {
    return <LegacyAboutUsPage />;
  }

  if (page.slug === "quote") {
    return <LegacyQuotePage />;
  }

  if (page.slug === "consultant") {
    return <LegacyConsultantPage />;
  }

  if (page.slug === "bursary") {
    return <LegacyBursaryPage />;
  }

  if (page.slug === "feedback") {
    return <LegacyFeedbackPage />;
  }

  if (page.slug === "sponsor") {
    return <LegacySponsorPage />;
  }

  if (page.slug === "education-foundation") {
    return <LegacyEducationFoundationPage />;
  }

  if (page.slug === "education-foundation-contribution") {
    return <LegacyEducationContributionPage />;
  }

  if (page.slug === "education-foundation-sponsor") {
    return <LegacyEducationSponsorPage />;
  }

  return (
    <LegacyShell active={active}>
      <LegacyPageBanner
        title={staticContent?.heading || page.title}
        crumb={staticContent?.eyebrow || page.title}
      />
      <section id="about-page" className="pt-70 pb-110 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="about-image mt-50">
                <Image
                  src="/legacy-theme/images/about-banner.JPG"
                  alt={staticContent?.heading || page.title}
                  width={570}
                  height={380}
                  sizes="(max-width: 991px) 100vw, 50vw"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-cont mt-50">
                <LegacySectionTitle
                  eyebrow={staticContent?.eyebrow || "关于我们"}
                  title={staticContent?.heading || page.title}
                />
                {staticContent ? (
                  <>
                    {staticContent.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {staticContent.sections ? (
                      <div className="row pt-20">
                        {staticContent.sections.map((section) => (
                          <div className="col-md-6" key={section.title}>
                            <div className="about-singel-items mt-30">
                              <h4>{section.title}</h4>
                              <p>{section.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : page.contentHtml ? (
                  <div
                    className="legacy-prose"
                    dangerouslySetInnerHTML={{ __html: page.contentHtml }}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyQuotePage() {
  const portrait = imageSource(mediaTitle("YB"));

  return (
    <LegacyShell active="about">
      <LegacyPageBanner
        title="关于我们"
        crumb="精辟语录"
        image="/legacy-theme/images/hcom2.jpg"
        positionY="9%"
      />
      <section className="pt-90 pb-45">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-4 col-md-8">
              <div className="teachers-left mt-0">
                <div className="hero">
                  {portrait ? <img src={portrait} alt="拿督斯里范长锡" /> : null}
                </div>
                <div className="name quote-name">
                  <h6>拿督斯里范长锡国会议员</h6>
                  <span>华侨校友</span>
                </div>
              </div>
            </div>
            <div className="col-lg-8">
              <div className="teachers-right mt-0">
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="dashboard"
                    role="tabpanel"
                    aria-labelledby="dashboard-tab"
                  >
                    <div className="dashboard-cont">
                      <div className="singel-dashboard web-feedback-contact pt-40">
                        <h4 className="mb-20">献词</h4>
                        <p>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;能获得大家的邀请来说几句话，我满怀感恩。如果没有当年母校的栽培，就没有今天更好的自己，母校的恩情我心心念念。这让我时刻谨记要努力不懈为别人付出更多，要竭尽全力为大家创造更好的生活条件，营造一个更好的生活环境。感恩是通向幸福最好的钥匙，知道这是最正确的途径，我诚心邀请更多的校友结伴同行，大家一起来建设母校，让更多的莘莘学子也有机会如同我们般在母校的培育之下，茁壮成长。
                          <br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;今天的世界转变太大也太快，科技如人工智能的革新给人类生活的方方面面带来了巨大的冲击，教育更是首当其冲。今天的学校已经无法只是发挥传统的为学生“传道授业解惑”的功能，它必须对外部瞬息万变的世界做出回应，观念的革新及制度的创新尤为关键。办教育已经不再仅仅是在学校服务的教育工作者个人的事，教育影响幅度的大小和社会不同集体参与程度的高低息息相关。对学校的认知应该从传统的在校园内的“小”学校的概念扩大至包含周遭整个大环境的“大”学校的概念。
                          <br />
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;有鉴于此，我恳切希望母校在大家的群策群力之下，教育的功能能发挥到最极致。教育乃立国之本，学校办好了，学生身心灵都能全面发展了，那就是我们爱家爱国最好的证明了。
                          <br />
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyConsultantPage() {
  const consultants = [
    ["联邦天然资源,环境永续部副部长,泗里街国会议员兼卢勃区立法议员拿督斯里范长锡", "永久名誉顾问"],
    ["拿督IR夏忠泰", "永久名誉顾问"],
    ["邱祥熙", "永久名誉主席"],
    ["汪景忠", "永久名誉主席"],
    ["詹庆将", "永久名誉主席"],
    ["杨世贤", "华侨校友总召集人"],
    ["拿督陈冠勋州立法议员", "顾问"],
    ["拿督张公贤", "顾问"],
    ["翁娆琴", "顾问"],
    ["刘会建", "顾问"],
    ["王焕义", "顾问"],
    ["黄拔鹏", "顾问"],
    ["詹亲傧", "顾问"],
    ["詹胜运", "顾问"],
    ["郭和来", "顾问"],
    ["陈泰富", "顾问"],
    ["刘世仁", "顾问"],
    ["林万权", "顾问"],
    ["夏忠良", "顾问"],
    ["黄良明", "顾问"],
    ["黄华强", "顾问"],
    ["黄灵花", "顾问"],
    ["詹利运", "顾问"],
    ["李忠平", "顾问"],
    ["吴绍义", "顾问"],
    ["林和桂", "顾问"],
    ["陈新合", "顾问"],
    ["张昌存", "顾问"],
    ["刘贤蒙", "顾问"],
    ["黄灵彪", "顾问"],
    ["陈耀钦", "顾问"],
    ["范友江", "顾问"],
    ["张济盟", "顾问"],
    ["范菖躘", "顾问"],
    ["郑玉祥", "顾问"],
    ["黄守光", "顾问"],
    ["陈鹏祯", "顾问"],
    ["严云飞", "顾问"],
    ["黄圣安", "顾问"],
    ["张公庆", "顾问"],
    ["锺珍和", "顾问"],
    ["詹淑文", "顾问"],
    ["郑其昌", "顾问"],
    ["黄政声", "顾问"],
    ["黄灵冠", "顾问"],
    ["詹端朝", "顾问"],
    ["杨尚存", "顾问"],
    ["陈守隆", "顾问"],
    ["陈新同", "顾问"],
    ["谢祯兴", "顾问"],
  ];

  return (
    <LegacyShell active="about">
      <LegacyPageBanner
        title="泗里街高级(华侨)中学校友会顾问团"
        crumb="顾问团"
        parentCrumb="关于我们"
        image="/legacy-theme/images/previous-committee-banner.jpg"
      />
      <section className="pb-120 gray-bg">
        <div className="pt-45 previous-committee-wrapper">
          <h2 style={{ textAlign: "center" }}>泗里街高级(华侨)中学校友会顾问团名单</h2>
          <ol style={{ margin: "30px" }}>
            {consultants.map(([name, role]) => (
              <li key={`${name}-${role}`}>
                <span>{name}</span>
                <span>{role}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyBursaryPage() {
  const aboutImage = imageSource(mediaTitle("IMG-20180629-WA0107"));
  const slides = [
    "/legacy-theme/images/bursary-lim-support.jpg",
    "/legacy-theme/images/bursary-spm-award.jpg",
    "/legacy-theme/images/bursary-tan-ling-moi.jpg",
  ];
  const reasons = [
    {
      number: "01",
      title: "教育是改变命运的关键",
      text: "教育是打破贫困、改变命运的重要途径。您的支持将为有需要的学生提供接受优质教育的机会，帮助他们走出困境，实现自我。",
    },
    {
      number: "02",
      title: "回馈社群",
      text: "您的捐赠将成为支持社群发展的重要力量。通过您的慷慨捐赠，我们能够建立一个更加团结、充满活力的校友社群，共同为社会做出积极贡献。",
    },
    {
      number: "03",
      title: "捐赠与赞助",
      text: "我们诚挚邀请校友、家长和社会各界的慷慨捐赠和赞助，共同支持助学金计划。您的捐赠将直接帮助更多有需要的学生获得教育机会，为他们的未来铺平道路。",
    },
  ];

  return (
    <LegacyShell active="about">
      <section id="bursary-banner">
        <LegacySlider className="slider-active" kind="hero">
          {slides.map((image) => (
            <LegacyBackgroundSlide image={image} key={image}>
              <div className="container legacy-bursary-slide-container">
                <div className="row">
                  <div className="col-md-12">
                    <div className="slider-cont">
                      <h1 style={{ textAlign: "center" }} data-animation="bounceInLeft" data-delay="1s">
                        校友会助学金计划
                      </h1>
                      <ul style={{ textAlign: "center" }}>
                        <li>
                          <a
                            data-animation="fadeInUp"
                            data-delay="1.6s"
                            className="main-btn"
                            href="#bursary-about"
                          >
                            了解更多
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </LegacyBackgroundSlide>
          ))}
        </LegacySlider>
      </section>
      <section id="bursary-about" className="pt-70 pb-110">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title mt-50">
                <h5>助学金计划</h5>
                <h2>共筑梦想 扶助未来</h2>
              </div>
              <div className="about-cont">
                <p>
                  欢迎来到泗里街高级(华侨)中学助学金计划！我们的助学金计划旨在为有需要的学生提供经济援助，帮助他们实现教育梦想。通过这个计划，我们希望能够支持更多学生克服经济障碍，接受优质的教育，成为未来的领导者和贡献者。
                  我们的使命是通过提供财政援助和资源支持，促进教育机会的平等和普及。我们相信每个人都有权接受教育，无论其经济背景如何。助学金计划是我们为实现这一目标所采取的重要举措之一。通过您的支持和参与，我们能够为更多有才华的学生提供机会，让他们展现潜能，实现自我。
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image mt-50">
                {aboutImage ? <img src={aboutImage} alt="" /> : null}
              </div>
            </div>
          </div>
          <div className="about-items pt-60">
            <div className="row justify-content-center">
              {reasons.map((reason) => (
                <div className="col-lg-4 col-md-6 col-sm-10" key={reason.number}>
                  <div className="about-singel-items mt-30">
                    <span>{reason.number}</span>
                    <h4>{reason.title}</h4>
                    <p>{reason.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyFeedbackPage() {
  return (
    <LegacyShell active="about">
      <LegacyPageBanner
        title="网站反馈"
        crumb="网站反馈"
        image="/legacy-theme/images/feedback.jpg"
        bannerClassName="pt-105 pb-130 bg_cover"
      />
      <section id="developer-1" className="pt-70 pb-100 gray-bg">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9">
              <div className="teachers-right mt-50">
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-pane fade show active"
                    id="dashboard"
                    role="tabpanel"
                    aria-labelledby="dashboard-tab"
                  >
                    <div className="dashboard-cont">
                      <div className="singel-dashboard web-feedback-contact pt-40">
                        <h4 className="mb-20">开发团队感言</h4>
                        <p>尊敬的校友和访客们，</p>
                        <br />
                        <p>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;首先，我们网站开发团队要由衷地感谢泗里街高级(华侨)中学校友会，给予我们这个宝贵的机会来为校友们贡献一点点我们的技能和能力。这个项目对我们来说不仅是一项任务，更是一份崇高的使命，一个让我们能够回馈母校的机会。因此，我们深感荣幸能够参与并建立这个网站，为校友们提供一个专属的平台，以凝聚我们校友的力量，传播和延续学校的精神和传统。
                        </p>
                        <br />
                        <p>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;我们的愿景一直是建立一个专属于泗里街高级(华侨)中学所有校友们聚集的平台。这个平台的目标是将散落在世界各地的校友们聚集在一起，共同传承学校的精神，汇聚校友的智慧、经验和情感，创造一个具有凝聚力的校友社群。我们想要打造一个让校友们可以更紧密联系、分享故事、建立新的友谊、回顾过去和展望未来的场所。这个平台不仅是一个交流的空间，更是我们共同的文化遗产，一个纪念我们母校的殿堂。
                        </p>
                        <br />
                        <p>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;今天，我们非常自豪地展示这个网站，但我们也知道这只是一个开始。我们承诺，在未来，我们将不断努力改进这个网站，增加更多功能，以满足校友们的需求和期望。我们将持续优化用户体验，确保您能够轻松浏览、参与和与校友互动。我们将努力让这个网站成为一个真正有意义的空间，一个可以汇聚校友智慧和情感的场所。确保这个平台能够充分发挥其潜力，成为所有校友的珍贵资源。
                        </p>
                        <br />
                        <p>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;感谢您的支持和信任。让我们一起继续努力，共同塑造一个充满活力和团结的校友社区！
                        </p>
                        <br />
                        <p>衷心感谢。</p>
                        <br />
                        <h4 className="mb-20">联系我们</h4>
                        <p>
                          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;当您探索我们的网站或有任何建议、意见或疑问需要与我们交流时，我们的专业网站开发团队将随时为您提供热忱的帮助和周到的支持。无论您身处何处，都可以通过以下多种方式与我们联系，以确保您的需求得到满足并得到及时解答，
                        </p>
                        <br />
                        <p>电子邮件：</p>
                        <div className="row">
                          <div className="col-md-6">
                            <p>
                              技术支持：
                              <a href="mailto:lausiexiong0916@gmail.com"> lausiexiong99366@gmail.com</a>
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p>
                              意见反馈：
                              <a href="mailto:lausiexiong0916@gmail.com"> annielau002@gmail.com</a>
                            </p>
                            <br />
                          </div>
                        </div>
                        <p>手机号码：</p>
                        <div className="row">
                          <div className="col-md-6">
                            <p>
                              刘世雄: <a href="tel:+60128453318"> +60128453318</a>
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p>
                              刘兆芳: <a href="tel:+60128996160"> +60128996160</a>
                            </p>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <p>
                              刘钊希: <a href="tel:+60168545205"> +60168545205</a>
                            </p>
                          </div>
                          <div className="col-md-6">
                            <p>
                              刘钊辰: <a href="tel:+60146992502"> +60146992502</a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacySponsorPage() {
  return (
    <LegacyShell active="sponsor">
      <LegacyPageBanner title="赞助商" crumb="赞助商列表" />
      <section id="sponsor-part">
        <div id="prior-sponsor" className="container-fluid pt-50 gray-bg">
          {sponsorPriorImages.map((image) => (
            <img src={sponsorAdSrc(image)} className="img-responsive" alt="" key={image} />
          ))}
        </div>

        <div id="gallery" className="container-fluid gray-bg pb-90">
          {sponsorGalleryImages.map((image) => (
            <img src={sponsorAdSrc(image)} className="img-responsive" alt="" key={image} />
          ))}
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyEducationFoundationPage() {
  const members = [
    { name: "Neigne Hun Hee", role: "领队", image: mediaTitle("Ngieng Hun Hee-Resized") },
    { name: "詹庆将医生", role: "委员", image: mediaTitle("詹庆将-Resized") },
    { name: "Chieng Kuok Hien", role: "委员", image: mediaTitle("Chieng Kuok Hien-Resized") },
    { name: "Wong King Tung", role: "委员", image: mediaTitle("Wong King Tung-Resized"), alt: "Wong King Tungn" },
    { name: "Ling Leh Hieh", role: "委员", image: mediaTitle("WhatsApp-Image-2023-09-17-at-18.54.21") },
    { name: "Chieng Swee Eng", role: "委员", image: mediaTitle("WhatsApp-Image-2023-09-17"), alt: "Chieng Sweet Eng" },
  ];

  return (
    <LegacyShell active="education">
      <LegacyPageBanner title="泗里街高级(华侨)中学教育基金委员会" crumb="教育基金" image="/legacy-theme/images/edu-committee.png" />
      <section id="teachers-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            {members.map((member) => (
              <div className="col-lg-3 col-sm-6" key={member.name}>
                <div className="singel-teachers mt-30 text-center">
                  <div className="image">
                    {member.image ? (
                      <img
                        src={imageSource(member.image)}
                        style={{ width: "270px", height: "350px" }}
                        alt={member.alt || member.name}
                      />
                    ) : null}
                  </div>
                  <div className="cont">
                    <a href="javascript:;">
                      <h6>{member.name}</h6>
                    </a>
                    <span>{member.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyEducationContributionPage() {
  return (
    <LegacyShell active="education">
      <LegacyPageBanner title="教育基金/校友卓越贡献" crumb="教育基金/校友贡献" image="/legacy-theme/images/edu-sponsor.png" />
      <section id="event-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            {siteData.contributions.map((item) => (
              <div className="col-lg-6" key={item.id}>
                <LegacyEducationContributionListItem item={item} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyEducationContributionListItem({ item }: { item: ContentItem }) {
  const image = itemImage(item);
  const href = contentPath("/education-foundation-contribution", item);

  return (
    <div className="singel-event-list mt-30">
      <div className="event-thum">
        <a href={href}>
          {image ? (
            <Image
              src={image}
              alt={item.title}
              width={280}
              height={190}
              sizes="(max-width: 991px) 100vw, 280px"
            />
          ) : null}
        </a>
      </div>
      <div className="event-cont">
        {iconText("fa-calendar", displayDate(item))}
        <a href={href}>
          <h4>{item.title}</h4>
        </a>
        {iconText("fa-clock-o", item.fields.time)}
        {iconText("fa-map-marker", item.fields.venue)}
        {item.excerpt ? <p>{item.excerpt}</p> : null}
      </div>
    </div>
  );
}

function LegacyEducationSponsorPage() {
  const sponsorList = mediaTitle("sponsor-list");

  return (
    <LegacyShell active="education">
      <LegacyPageBanner title="母校筑梦之路赞助者" crumb="赞助者" image="/legacy-theme/images/edu-sponsor.png" />
      <section id="sponsor-photo" className="pt-90 pb-120 gray-bg">
        <div className="container">
          {sponsorList ? <img src={imageSource(sponsorList)} alt="" /> : null}
        </div>
      </section>
    </LegacyShell>
  );
}

function LegacyAboutPartnerCarousel() {
  const partnerImages = [
    "HSL.png",
    "2023/09/1.png",
    "2023/09/2.png",
    "HSL.png",
    "2023/09/1.png",
    "2023/09/2.png",
  ].map((name) => siteData.media.find((media) => media.originalUploadPath.includes(name))?.fullSrc);

  return (
    <div id="patnar-logo" className="pt-40 pb-80 gray-bg">
      <div className="container">
        <LegacySlider className="row patnar-slied" kind="partner">
          {partnerImages.map((image, index) => (
            <div className="col-lg-12" key={`${image}-${index}`}>
              <div className="singel-patnar text-center mt-40">
                {image ? (
                  <img src={image} alt="Logo" />
                ) : null}
              </div>
            </div>
          ))}
        </LegacySlider>
      </div>
    </div>
  );
}

function LegacyAboutUsPage() {
  const content = staticPageContent["about-us"];
  const certificates = siteData.media.filter((media) =>
    media.originalUploadPath.includes("pendaftaran-alumni_page"),
  );
  const testimonials = [
    {
      imageName: "Wong-Siong-Nee",
      name: "黄祥尼",
      role: "校友会 - 主席",
      text: "在这个充满活力和热情的校友大家庭中，我看到了无限的潜力和机会。我们校友会的使命是连接我们的校友，促进合作和交流，并为校友们提供支持和资源。在未来的日子里，我希望我们能够继续努力，让校友会变得更加强大和有意义。",
    },
    {
      imageName: "Lau-Ben-Hai",
      name: "刘孟海",
      role: "校友会 - 副主席",
      text: "我非常高兴能够与大家共同为校友会的使命而努力。我们的校友大家庭是一个充满温暖和团结的地方，我相信我们可以一起取得更多成就。",
    },
    {
      imageName: "范昌安",
      name: "范昌安",
      role: "校友会 - 副主席",
      text: "在副主席的职务下，我承诺将竭尽所能，协助主席和校友会委员会，确保校友会的活动和项目能够顺利进行。我鼓励每一位校友积极参与，分享你们的想法和建议，因为我们是校友会成功的关键。 ",
    },
    {
      imageName: "陈友胜",
      name: "陈友胜",
      role: "校友会 - 秘书",
      text: "我有幸能够记录下我们的活动和决策，以及与校友们保持联系。我将努力确保校友会的日常工作顺利进行，并为校友们提供所需的支持。 ",
    },
    {
      imageName: "Wong-Lin-Chui",
      name: "黄羚翠",
      role: "校友会 - 财政",
      text: "坚实的财政基础是我们成功的见证。通过明智的资金管理和财政决策，我们已经实现了财务稳健，为学校的未来奠定了坚实的基础。 ",
    },
  ];
  const aboutItems = [
    {
      text: "我们的校友社群拥有各行各业的卓越人才，无论是在职业生涯还是社会活动中，他们都取得了杰出的成就。我们致力于建立一个紧密联系的社群，校友之间相互支持、鼓励和合作，共同实现个人和集体的目标。",
      title: "为什么是我们",
    },
    ...(content.sections || []),
  ];

  return (
    <LegacyShell active="about">
      <LegacyPageBanner title="关于我们" crumb="校友会详情" />

      <section id="about-page" className="pt-70 pb-110">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title mt-50">
                <h5>{content.eyebrow}</h5>
                <h2>{content.heading}</h2>
              </div>
              <div className="about-cont">
                <p>
                  {content.paragraphs[0]}
                  <br />
                  <br />
                  {content.paragraphs[1]}
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="about-image mt-50">
                <Image
                  src="/legacy-theme/images/about-welcome.jpg"
                  alt=""
                  width={570}
                  height={380}
                  sizes="(max-width: 991px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
          <div className="about-items pt-60">
            <div className="row justify-content-center">
              {aboutItems.map((item, index) => (
                <div className="col-lg-4 col-md-6 col-sm-10" key={item.title}>
                  <div className="about-singel-items mt-30">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div
        id="counter-part"
        className="bg_cover pt-65 pb-110"
        data-overlay="5"
        style={{
          backgroundImage: "url(/legacy-theme/images/about-donate.jpg)",
          backgroundPositionY: "63%",
        }}
      >
        <div className="container">
          <div className="row">
            {[
              { label: "校友会活动数量", total: 30000 },
              { label: "众筹资金总额", total: 41000 },
              { label: "校友参与人数", total: 11000 },
            ].map((counter) => (
              <div className="col-lg-4 col-sm-6" key={counter.label}>
                <div className="singel-counter text-center mt-40">
                  <span>
                    <LegacyCounter total={counter.total} />+
                  </span>
                  <p>{counter.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section id="teachers-part" className="pt-65 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="section-title mt-50 pb-35">
                <h5>委员会</h5>
                <h2>校友会执委</h2>
              </div>
            </div>
          </div>
          <div className="row">
            {siteData.committees.map((member) => {
              const image = member.image?.fullSrc || member.image?.thumbSrc;
              const name = String(member.fields.name || member.title);
              const position = String(member.fields.position || member.title);

              return (
                <div className="col-lg-3 col-sm-6" key={member.id}>
                  <div className="singel-teachers mt-30 text-center">
                    <div className="image legacy-teacher-image">
                      {image ? (
                        <Image
                          src={image}
                          alt={name}
                          width={270}
                          height={350}
                          sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 25vw"
                        />
                      ) : null}
                    </div>
                    <div className="cont">
                      <a href="javascript:;">
                        <h6>{name}</h6>
                      </a>
                      <span>{position}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="sijil-part" className="pt-65 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="section-title mt-50 pb-35">
                <h5>发展历程</h5>
                <h2>注册证书</h2>
              </div>
            </div>
          </div>
        </div>
        <div id="gallery" className="container-fluid pt-50 gray-bg pb-90">
          {certificates.map((certificate) => {
            const src = certificate.fullSrc || certificate.thumbSrc;
            if (!src) return null;

            return (
              <a data-legacy-lightbox href={src} key={certificate.id}>
                <Image
                  src={src}
                  alt=""
                  className="img-responsive"
                  width={certificate.fullWidth || 1200}
                  height={certificate.fullHeight || 1700}
                  sizes="100vw"
                />
              </a>
            );
          })}
        </div>
      </section>

      <section id="about-page-extra" className="pt-10 pb-180">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="about-image mt-50">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  height="315"
                  src="https://www.youtube.com/embed/4CtdjKwQbwI?si=4spCLyyHs1pLxp3b"
                  title="YouTube video player"
                  width="100%"
                />
              </div>
            </div>
            <div className="col-lg-6">
              <div className="section-title mt-50">
                <h2>传承价值观</h2>
              </div>
              <div className="about-cont">
                <p>
                  作为一所具有丰富历史和声誉的学校，我们校友会的使命是继承和传承学校的精神，将校友们联系在一起。我们相信，通过校友会，我们可以共同创造更多的机会，推动彼此的发展。
                  <br />
                  <br />
                  如果你是我们的校友，或者对我们的校友会感兴趣，欢迎与我们联系。我们期待与你分享更多关于校友会的信息，以及在未来与你共同创造更多精彩的时刻。让我们共同携手，为我们的校友会写下崭新的篇章！
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="testimonial"
        className="bg_cover pt-115 pb-115"
        data-overlay="6"
        style={{ backgroundImage: "url(/legacy-theme/images/testimonial-background.jpg)" }}
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title pb-40">
                <h5>见证</h5>
                <h2>校友感言</h2>
              </div>
            </div>
          </div>
          <LegacySlider className="row testimonial-slied mt-40" kind="testimonial">
            {testimonials.map((testimonial) => {
              const image = siteData.media.find((media) =>
                media.originalUploadPath.includes(testimonial.imageName),
              );

              return (
                <div className="col-lg-6" key={testimonial.name}>
                  <div className="singel-testimonial">
                    {image ? (
                      <div className="testimonial-thum">
                        <Image
                          src={image.thumbSrc || image.fullSrc}
                          alt={testimonial.name}
                          width={90}
                          height={120}
                          sizes="90px"
                        />
                        <div className="quote">
                          <i className="fa fa-quote-right" aria-hidden="true" />
                        </div>
                      </div>
                    ) : null}
                    <div className="testimonial-cont">
                      <p>{testimonial.text}</p>
                      <h6>{testimonial.name}</h6>
                      <span>{testimonial.role}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </LegacySlider>
        </div>
      </section>
      <LegacyAboutPartnerCarousel />
    </LegacyShell>
  );
}

function LegacyContactPage({ page }: { page: ContentItem }) {
  const staticContent = staticPageContent[page.slug];

  return (
    <LegacyShell active="contact">
      <LegacyPageBanner
        title={staticContent?.heading || page.title}
        crumb="联络我们"
        image="/legacy-theme/images/contact-banner.jpg"
        bannerClassName="pt-105 pb-130 bg_cover"
        positionY="70%"
      />
      <section id="contact-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="contact-from mt-30">
                <div className="section-title">
                  <h5>联络</h5>
                  <h2>保持联系</h2>
                </div>
                <div className="main-form pt-30">
                  <form method="POST">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="singel-form  form-group">
                          <input name="client_name" type="text" placeholder="姓名" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="singel-form  form-group">
                          <input name="client_email" type="email" placeholder="邮件地址" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="singel-form  form-group">
                          <input name="client_subject" type="text" placeholder="标题" required />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="singel-form  form-group">
                          <input name="client_phone" type="text" placeholder="手机号码" required />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="singel-form  form-group">
                          <textarea
                            name="client_message"
                            placeholder="请描述您的想法和问题，我们会尽快回复"
                            required
                          />
                        </div>
                      </div>
                      <div className="col-md-12">
                        <div className="singel-form">
                          <button type="submit" name="client_send" value="client_send" className="main-btn">
                            发送
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="contact-address mt-30">
                <ul>
                  <li>
                    <div className="singel-address">
                      <div className="icon">
                        <i className="fa fa-home" aria-hidden="true" />
                      </div>
                      <div className="cont">
                        <p>Peti Surat 78, 96100, Sarikei, Sarawak, Malaysia</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="singel-address">
                      <div className="icon">
                        <i className="fa fa-phone" aria-hidden="true" />
                      </div>
                      <div className="cont">
                        <p>084-655 686</p>
                        <p>019-818 5105</p>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="singel-address">
                      <div className="icon">
                        <i className="fa fa-envelope-o" aria-hidden="true" />
                      </div>
                      <div className="cont">
                        <p>stshwachiewalumni@gmail.com</p>
                        <p>stsalumniassociationweb@gmail.com</p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="map mt-30">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4193.228778913893!2d111.52330007518108!3d2.0890103587538302!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31f9c3b50749eb15%3A0x529d7e5300a0085e!2sSMK%20Tinggi%20Sarikei!5e1!3m2!1sen!2smy!4v1686571626273!5m2!1sen!2smy"
                  width="450"
                  height="210"
                  style={{ border: 0, width: "100%" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}
