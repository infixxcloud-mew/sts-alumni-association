import Image from "next/image";
import Link from "next/link";
import { getPaginationWindow } from "@/components/legacy/legacy-interactions";
import { LegacyCounter } from "@/components/legacy/legacy-counter";
import { LegacySlider } from "@/components/legacy/legacy-slider";
import { LegacyPageBanner, LegacySectionTitle, LegacyShell } from "@/components/legacy/legacy-shell";
import type { Album, ContentItem } from "@/lib/site-data";
import { displayDate, itemImage, siteData } from "@/lib/site-data";
import { staticPageContent } from "@/lib/static-pages";

function contentPath(basePath: string, item: ContentItem) {
  return `${basePath}/${encodeURIComponent(item.slug)}`;
}

function albumPath(album: Album) {
  return `/gallery/${encodeURIComponent(album.slug)}`;
}

function LegacyPagination({
  basePath,
  currentPage,
  pageCount,
}: {
  basePath: string;
  currentPage: number;
  pageCount: number;
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
      <ul className="pagination justify-content-center">
        <li className="page-item">
          {currentPage > 1 ? (
            <Link className="prev page-numbers" href={href(currentPage - 1)}>
              上一页 &lt;&lt;
            </Link>
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
              <Link className="page-numbers" href={href(page)} key={page}>
                {page}
              </Link>
            );
          })}
          {currentPage < pageCount ? (
            <Link className="next page-numbers" href={href(currentPage + 1)}>
              下一页 &gt;&gt;
            </Link>
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
        <div className="image legacy-card-image">
          <Link href={href}>
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
          </Link>
        </div>
        <div className="price">
          <span>{album.eventYear || "相册"}</span>
        </div>
      </div>
      <div className="cont">
        {album.eventDate ? <span>{album.eventDate}</span> : null}
        <Link href={href}>
          <h4>{album.title}</h4>
        </Link>
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
      <LegacyPageBanner title="全部相册" crumb="相册" />
      <section id="gallery-list" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            {visibleAlbums.map((album) => (
              <div className="col-lg-4 col-md-6" key={album.id}>
                <LegacyAlbumCard album={album} />
              </div>
            ))}
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
                      key={photo.id}
                    >
                      <Image
                        src={src}
                        alt={photo.alt || photo.title || album.title}
                        width={270}
                        height={210}
                        sizes="(max-width: 767px) 50vw, (max-width: 991px) 33vw, 25vw"
                      />
                      {photo.title ? <span>{photo.title}</span> : null}
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
      <div className="event-thum legacy-event-thumb">
        <Link href={href}>
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
        </Link>
      </div>
      <div className="event-cont">
        {displayDate(item) ? <span>{displayDate(item)}</span> : null}
        <Link href={href}>
          <h4>{item.title}</h4>
        </Link>
        {item.fields.time ? <span>{String(item.fields.time)}</span> : null}
        {item.fields.venue ? <span>{String(item.fields.venue)}</span> : null}
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
      <LegacyPageBanner title="全部回忆" crumb="回忆" />
      <section id="event-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              {visibleMemories.map((item) => (
                <LegacyMemoryListItem key={item.id} item={item} />
              ))}
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
      <div className="blog-thum legacy-blog-thumb">
        <Link href={href}>
          {image ? (
            <Image
              src={image}
              alt={item.title}
              width={770}
              height={430}
              sizes="(max-width: 991px) 100vw, 66vw"
            />
          ) : (
            <span className="legacy-image-placeholder">通告</span>
          )}
        </Link>
      </div>
      <div className="blog-cont">
        <Link href={href}>
          <h3>{item.title}</h3>
        </Link>
        <ul>
          {displayDate(item) ? <li>{displayDate(item)}</li> : null}
          {item.fields.author ? <li>{String(item.fields.author)}</li> : null}
          {item.fields.category ? <li>{String(item.fields.category)}</li> : null}
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
      <LegacyPageBanner title="全部通告" crumb="通告" />
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
              />
            </div>
            <div className="col-lg-4">
              <LegacySidebar
                title="重点更新"
                items={announcements.slice(0, 5)}
                basePath="/announcement"
                categoryTitle="类别分类"
              />
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
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
                  <Link href={contentPath(basePath, item)}>
                    <h6>{item.title}</h6>
                    {displayDate(item) ? <span>{displayDate(item)}</span> : null}
                  </Link>
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
  active: "announcement" | "memory";
  crumb: string;
  item: ContentItem;
}) {
  const image = item.image?.fullSrc || itemImage(item);

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
                title={active === "announcement" ? "重点更新" : "全部回忆"}
                items={
                  active === "announcement"
                    ? siteData.announcements.slice(0, 5)
                    : siteData.memories.slice(0, 5)
                }
                basePath={`/${active}`}
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
      />
      <section id="contact-page" className="pt-90 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-7">
              <div className="contact-from mt-30">
                <div className="section-title pb-30">
                  <h5>联络</h5>
                  <h2>保持联系</h2>
                </div>
                <form className="legacy-contact-form" action="#">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="singel-form form-group">
                        <input name="client_name" type="text" placeholder="姓名" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="singel-form form-group">
                        <input name="client_email" type="email" placeholder="邮件地址" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="singel-form form-group">
                        <input name="client_subject" type="text" placeholder="标题" />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="singel-form form-group">
                        <input name="client_phone" type="text" placeholder="手机号码" />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="singel-form form-group">
                        <textarea
                          name="client_message"
                          placeholder="请描述您的想法和问题，我们会尽快回复"
                        />
                      </div>
                    </div>
                    <div className="col-md-12">
                      <div className="singel-form">
                        <button type="button" className="main-btn">
                          发送
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="contact-address mt-30">
                <ul>
                  {(staticContent?.facts || []).map((fact) => (
                    <li key={fact.label}>
                      <div className="cont">
                        <h6>{fact.label}</h6>
                        <p>{fact.value}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </LegacyShell>
  );
}
