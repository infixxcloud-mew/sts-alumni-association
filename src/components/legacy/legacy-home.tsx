import Image from "next/image";
import Link from "next/link";
import { LegacyBackgroundSlide } from "@/components/legacy/legacy-background-slide";
import { LegacySectionTitle, LegacyShell } from "@/components/legacy/legacy-shell";
import { LegacySlider } from "@/components/legacy/legacy-slider";
import type { Album, ContentItem } from "@/lib/site-data";
import { displayDate, itemImage, siteData } from "@/lib/site-data";

const categories = [
  { image: "Daco_449945-e1694688404241.png", title: "互助社群" },
  { image: "/legacy-theme/images/all-icon/ctg-2.png", title: "持续学习和发展" },
  { image: "/legacy-theme/images/all-icon/ctg-3.png", title: "卓越知识共享" },
  { image: "Daco_172611-e1694688391554.png", title: "荣誉与奖励" },
  { image: "Daco_4413866-e1694688417110.png", title: "精心策划活动" },
];

const resources = [
  {
    title: "志愿者机会",
    text: "作为校友，您有机会回馈社会我们提供各种志愿者机会，参与社区服务和支持学校项目，以及与其他校友一起建立联系",
  },
  {
    title: "学术支持",
    text: "我们为校友提供学术支持，包括讲座、研讨会和指导无论您是寻找职业发展建议还是追求继续教育的机会，我们都在这里支持您",
  },
  {
    title: "校友数据库",
    text: "通过我们的校友数据库，您可以轻松联系其他校友，建立联系和网络，分享经验和机会，以及寻找失散多年的朋友",
  },
];

const futureEvents = [
  {
    date: "2023年 10月",
    title: "谭玲妹升学奖励金",
    time: "待定",
    venue: "学校大礼堂",
  },
  {
    date: "2024年 1月 - 2024年 12月",
    title: "领养活动",
    time: "全天",
    venue: "泗里街高级(华侨)中学",
  },
  {
    date: "2024年 1月 - 2024年 12月",
    title: "爱心活动",
    time: "全天",
    venue: "泗里街高级(华侨)中学",
  },
];

const testimonials = [
  {
    name: "黄祥尼",
    role: "校友会 - 主席",
    imageName: "Wong-Siong-Nee",
    text: "在这个充满活力和热情的校友大家庭中，我看到了无限的潜力和机会。我们校友会的使命是连接我们的校友，促进合作和交流，并为校友们提供支持和资源。在未来的日子里，我希望我们能够继续努力，让校友会变得更加强大和有意义。",
  },
  {
    name: "刘孟海",
    role: "校友会 - 副主席",
    imageName: "Lau-Ben-Hai",
    text: "我非常高兴能够与大家共同为校友会的使命而努力。我们的校友大家庭是一个充满温暖和团结的地方，我相信我们可以一起取得更多成就。",
  },
  {
    name: "范昌安",
    role: "校友会 - 副主席",
    imageName: "范昌安",
    text: "在副主席的职务下，我承诺将竭尽所能，协助主席和校友会委员会，确保校友会的活动和项目能够顺利进行。我鼓励每一位校友积极参与，分享你们的想法和建议，因为我们是校友会成功的关键。 ",
  },
  {
    name: "陈友胜",
    role: "校友会 - 秘书",
    imageName: "陈友胜",
    text: "我有幸能够记录下我们的活动和决策，以及与校友们保持联系。我将努力确保校友会的日常工作顺利进行，并为校友们提供所需的支持。 ",
  },
  {
    name: "黄羚翠",
    role: "校友会 - 财政",
    imageName: "Wong-Lin-Chui",
    text: "坚实的财政基础是我们成功的见证。通过明智的资金管理和财政决策，我们已经实现了财务稳健，为学校的未来奠定了坚实的基础。 ",
  },
];

function mediaByName(name: string) {
  return siteData.media.find((media) => media.originalUploadPath.includes(name))?.fullSrc;
}

function memberName(member: ContentItem) {
  return String(member.fields.name || member.title);
}

function memberPosition(member: ContentItem) {
  return String(member.fields.position || member.title);
}

function legacyAlbumPath(album: Album) {
  return `/gallery/${encodeURIComponent(album.slug)}`;
}

function LegacyHomeAlbumCard({ album }: { album: Album }) {
  const href = legacyAlbumPath(album);
  const image = album.coverFullSrc || album.coverSrc;

  return (
    <div className="singel-course">
      <div className="thum">
        <div className="image">
          <Link href={href}>
            {/* The WordPress card uses a native image element, which preserves its loading and sizing behavior. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={album.title} />
          </Link>
        </div>
        <div className="price">
          <span>
            <i className="fa fa-star" aria-hidden="true" />
          </span>
        </div>
      </div>
      <div className="cont">
        <span>
          <i className="fa fa-calendar" aria-hidden="true" style={{ color: "#ffc600", fontSize: 15 }} />
          {"\u00A0\u00A0\u00A0"}
          {album.eventDate}
        </span>
        <br />
        <Link href={href}>
          <h4>{album.title}</h4>
        </Link>
        <br />
        <br />
      </div>
    </div>
  );
}

function LegacyHomeAnnouncement({ item, featured = false }: { item: ContentItem; featured?: boolean }) {
  const image = itemImage(item);
  const href = `/announcement/${encodeURIComponent(item.slug)}`;
  const author = item.fields.author ? String(item.fields.author) : "";
  const thumbnail = image ? (
    <Link href={href}>
      <Image
        src={image}
        alt={item.title}
        width={featured ? 570 : 180}
        height={featured ? 270 : 130}
        sizes={featured ? "(max-width: 991px) 100vw, 50vw" : "(max-width: 575px) 100vw, 33vw"}
      />
    </Link>
  ) : null;

  const metadata = (
    <ul>
      {displayDate(item) ? (
        <li>
          <a href="javascript:;">
            <i className="fa fa-calendar" aria-hidden="true" />
            {displayDate(item)}
          </a>
        </li>
      ) : null}
      {author ? (
        <li>
          <a href="javascript:;">
            <i className="fa fa-user" aria-hidden="true" />
            {author}
          </a>
        </li>
      ) : null}
    </ul>
  );

  if (featured) {
    return (
      <div className="singel-news mt-30">
        <div className="news-thum pb-25">{thumbnail}</div>
        <div className="news-cont">
          {metadata}
          <Link href={href}>
            <h3>{item.title}</h3>
          </Link>
          {item.excerpt ? <p>{item.excerpt}</p> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="singel-news news-list">
      <div className="row">
        <div className="col-sm-4">
          <div className="news-thum mt-30">{thumbnail}</div>
        </div>
        <div className="col-sm-8">
          <div className="news-cont mt-30">
            {metadata}
            <Link href={href}>
              <h3>{item.title}</h3>
            </Link>
            {item.excerpt ? <p>{item.excerpt}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LegacyHomePage({
  albums,
  announcements,
  committees,
}: {
  albums: Album[];
  announcements: ContentItem[];
  memories: ContentItem[];
  committees: ContentItem[];
}) {
  const featuredAlbums = albums.slice(0, 6);
  const featuredAnnouncements = announcements.slice(0, 4);
  const committeePreview = committees.slice(0, 4);
  const heroSlides = [
    {
      image: "/legacy-theme/images/Snapseed-4-scaled.jpg",
      position: "60%",
      text: "我们的社群汇聚了志同道合的人们，传承了丰富的历史，鼓舞着彼此，共同书写卓越的故事，憧憬前程无限",
      title: "连接、传承、共创：致力于卓越的家园",
    },
    {
      image: "/legacy-theme/images/Snapseed-5-scaled.jpg",
      position: "60%",
      text: "这里，我们凝聚在一起，以深厚的传统为支撑，激励着彼此，一同探寻无限可能，共同创造卓越成就的明天",
      title: "共铸卓越：团结在梦想的坚实基石上",
    },
    {
      image: "/legacy-theme/images/Snapseed-6-scaled.jpg",
      position: "30%",
      text: "细致追溯着光辉灿烂的历史，共同铸造未来令人瞩目的卓越故事，成为连接着过去与未来的坚实纽带",
      title: "追溯荣光，塑造卓越：共同的故事",
    },
  ];

  return (
    <LegacyShell active="home">
      <section id="slider-part">
        <LegacySlider className="slider-active" kind="hero">
          {heroSlides.map((slide) => (
            <LegacyBackgroundSlide image={slide.image} key={slide.title} position={slide.position}>
              <div className="container">
                <div className="row">
                  <div className="col-xl-7 col-lg-9">
                    <div className="slider-cont">
                      <h1 data-animation="bounceInLeft" data-delay="1s" style={{ animationDelay: "1s" }}>
                        {slide.title}
                      </h1>
                      <p data-animation="fadeInUp" data-delay="1.3s" style={{ animationDelay: "1.3s" }}>
                        {slide.text}
                      </p>
                      <ul>
                        <li>
                          <Link
                            className="main-btn"
                            data-animation="fadeInUp"
                            data-delay="1.6s"
                            href="#about-part"
                            style={{ animationDelay: "1.6s" }}
                          >
                            往下阅读
                          </Link>
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

      <section id="category-part">
        <div className="container">
          <div className="category pt-40 pb-80">
            <div className="row">
              <div className="col-lg-4">
                <div className="category-text pt-40">
                  <h2>探索卓越辉煌之旅，与我们一同书写传奇</h2>
                </div>
              </div>
              <div className="col-lg-6 offset-lg-1 col-md-8 offset-md-2 col-sm-8 offset-sm-2 col-8 offset-2">
                <LegacySlider className="row category-slied mt-40" kind="category">
                  {categories.map((category, index) => {
                    const image = category.image.startsWith("/")
                      ? category.image
                      : mediaByName(category.image);

                    return (
                      <div className="col-lg-4" key={category.title}>
                        <a href="javascript:;">
                          <span className={`singel-category text-center color-${(index % 3) + 1}`}>
                            <span className="icon">
                              {image ? (
                                <Image src={image} alt="" width={100} height={81} sizes="100px" />
                              ) : null}
                            </span>
                            <span className="cont">
                              <span>{category.title}</span>
                            </span>
                          </span>
                        </a>
                      </div>
                    );
                  })}
                </LegacySlider>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about-part" className="pt-65">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="section-title mt-50">
                <h5>关于我们</h5>
                <h2>欢迎来到泗里街高级(华侨)中学校友会</h2>
              </div>
              <div className="about-cont">
                <p>
                  我们自豪地呈现泗里街高级(华侨)中学卓越辉煌的校友们所筑梦的空间。作为一个富有传统和创新精神的学校，我们在华侨社群中有着不可磨灭的历史地位。校友会成立于2003年，至今已经20周年，而这个网站则是我们与全球校友共同连接和分享的平台，旨在传承和延续卓越的华侨精神
                  <br />
                  <br />
                  在这里，您将发现丰富的校友资源、精彩的校友故事，以及我们的校友们在各行各业取得的卓越成就。我们骄傲地展示着泗里街高级(华侨)中学的丰富历史和杰出校友们的荣誉传统
                </p>
                <Link className="main-btn mt-35" href="/about-us">
                  了解更多
                </Link>
              </div>
            </div>
            <div className="col-lg-6 offset-lg-1">
              <div className="about-event mt-50">
                <div className="event-title">
                  <h3>未来精彩</h3>
                </div>
                <ul>
                  {futureEvents.map((item) => (
                    <li key={item.title}>
                      <div className="singel-event">
                        <span>{item.date}</span>
                        <Link href="/announcement">
                          <h4>{item.title}</h4>
                        </Link>
                        <span>{item.time}</span>
                        <span>{item.venue}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="about-bg">
            <Image
              src="/legacy-theme/images/homepage-about-background.png"
              alt="泗里街高级(华侨)中学"
              width={560}
              height={680}
              sizes="(max-width: 991px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      <section id="apply-aprt" className="pb-120">
        <div className="container">
          <div className="apply">
            <div className="row no-gutters">
              <div className="col-lg-6">
                <div className="apply-cont apply-color-1">
                  <h3>激励创新，传承荣光</h3>
                  <p>
                    我们视自己为不断追求创新的探险家，秉承着传承者的责任，将珍贵的历史智慧传承给后代我们是历史书写者，记录下每一个激动人心的瞬间，怀着深沉的敬畏之情回顾过去，热切地憧憬着充满希望的未来，坚信我们的努力将书写卓越的篇章
                  </p>
                  <Link className="main-btn" href="/gallery">
                    瞻仰历史
                  </Link>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="apply-cont apply-color-2">
                  <h3>传统荣耀，未来愿景</h3>
                  <p>
                    我们深深扎根于光辉传统的土壤中，不断汲取智慧的养分，我们是那些将目光锁定在光明未来的人，我们志愿成为共同创造光荣故事的伙伴之一，时刻准备着在历史的舞台上发挥我们的作用，为共同的愿景努力奋斗，创造永恒的遗产
                  </p>
                  <Link className="main-btn" href="/announcement">
                    展望前程
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="section-title pb-25">
              <h5>2023年校友筑梦工程</h5>
            </div>
          </div>
        </div>
      </div>

      <section id="slider-part-edu">
        <LegacySlider className="slider-active" kind="hero">
          {[
            "/legacy-theme/images/digital-learning-center-3-2.jpeg",
            "/legacy-theme/images/digital-learning-center-3-1.jpeg",
            "/legacy-theme/images/digital-learning-center-1-2.jpg",
            "/legacy-theme/images/digital-learning-center-1-1.jpg",
          ].map((image) => (
            <LegacyBackgroundSlide image={image} key={image}>
              <div className="container" style={{ paddingTop: "9%" }}>
                <div className="row">
                  <div className="col-md-12">
                    <div className="slider-cont">
                      <h1
                        data-animation="bounceInLeft"
                        data-delay="1s"
                        style={{ animationDelay: "1s", textAlign: "center" }}
                      >
                        数码学习中心
                      </h1>
                      <ul style={{ textAlign: "center" }}>
                        <li>
                          <Link
                            className="main-btn"
                            data-animation="fadeInUp"
                            data-delay="1.6s"
                            href="/education-foundation-contribution"
                            style={{ animationDelay: "1.6s" }}
                          >
                            (1939-1970)华侨校友贡献
                          </Link>
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

      <section id="course-part" className="pt-115 pb-120 gray-bg">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <LegacySectionTitle eyebrow="相册" title="精选相册" />
            </div>
          </div>
          <LegacySlider className="row course-slied mt-30" kind="course">
            {featuredAlbums.map((album) => (
              <div className="col-lg-4 col-md-6" key={album.id}>
                <LegacyHomeAlbumCard album={album} />
              </div>
            ))}
          </LegacySlider>
        </div>
      </section>

      <section
        id="video-feature"
        className="bg_cover pt-60 pb-110"
        style={{
          backgroundImage: "url(/legacy-theme/images/video-banner-1.jpg)",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-last order-lg-first">
              <div className="video text-lg-left text-center pt-50">
                <a className="Video-popup" href="https://www.youtube.com/watch?v=IZe-aA0fsp8">
                  <i className="fa fa-play" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="col-lg-5 offset-lg-1 order-first order-lg-last">
              <div className="feature pt-50">
                <div className="feature-title">
                  <h3>校友会资源</h3>
                </div>
                <ul>
                  {resources.map((resource, index) => (
                    <li key={resource.title}>
                      <div className="singel-feature">
                        <div className="icon">
                          <Image
                            src={`/legacy-theme/images/all-icon/f-${index + 1}.png`}
                            alt=""
                            width={54}
                            height={54}
                          />
                        </div>
                        <div className="cont">
                          <h4>{resource.title}</h4>
                          <p>{resource.text}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="feature-bg" />
      </section>

      <section id="teachers-part" className="pt-70 pb-120">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <div className="section-title mt-50">
                <h5>委员会</h5>
                <h2>聚智共谋 共铸辉煌</h2>
              </div>
              <div className="teachers-cont">
                <p>
                  委员会致力于成为校友会的关键支柱，负责引领和推动各种关键活动和项目。我们的责任是聚集校友的智慧和资源，共同制定和实施计划，以推动校友会的使命和目标。我们以协作、创新和坚韧的精神，积极参与各种活动，包括社交聚会、学术研究、文化艺术以及信息传递。通过共同的努力，我们致力于维护和增强校友会的联系网，并为所有校友提供丰富和有意义的体验。
                  <br />
                  <br />
                  未来展望是继续壮大委员会，使其成为校友会的核心力量，鼓励校友积极参与各项活动和推动新项目。希望扩大影响，为校友提供更多机会，包括个人发展、社交联系和专业成就。继续倡导协作和团队合作，建立强大团结的校友社群，为学校和社会做出积极贡献。通过聚智共谋，共铸辉煌未来。
                </p>
                <a href="https://rb.gy/f9zyni" target="blank" className="main-btn mt-55">
                  2024年校友会特刊
                </a>
              </div>
            </div>
            <div className="col-lg-6 offset-lg-1">
              <div className="teachers mt-20">
                <div className="row">
                  {committeePreview.map((member) => {
                    const image = member.image?.fullSrc || member.image?.thumbSrc;
                    return (
                      <div className="col-sm-6" key={member.id}>
                        <div className="singel-teachers mt-30 text-center">
                          <div className="image legacy-teacher-image">
                            {image ? (
                              <Image
                                src={image}
                                alt={memberName(member)}
                                width={270}
                                height={370}
                                sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 25vw"
                              />
                            ) : (
                              <span className="legacy-image-placeholder">委员</span>
                            )}
                          </div>
                          <div className="cont">
                            <h6>{memberName(member)}</h6>
                            <span>{memberPosition(member)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              <LegacySectionTitle eyebrow="见证" title="校友感言" />
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

      <section id="news-part" className="pt-90 pb-110">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title pb-50">
                <h5>通告</h5>
                <h2>最新资讯</h2>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-6">
              {featuredAnnouncements[0] ? (
                <LegacyHomeAnnouncement featured item={featuredAnnouncements[0]} />
              ) : null}
            </div>
            <div className="col-lg-6">
              {featuredAnnouncements.slice(1).map((item) => (
                <LegacyHomeAnnouncement item={item} key={item.id} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div id="patnar-logo" className="pt-40 pb-80 gray-bg">
        <div className="container">
          <LegacySlider className="row patnar-slied" kind="partner">
            {[
              mediaByName("HSL.png"),
              mediaByName("2023/09/1.png"),
              mediaByName("2023/09/2.png"),
              mediaByName("HSL.png"),
              mediaByName("2023/09/1.png"),
              mediaByName("2023/09/2.png"),
            ].map((image, index) => (
              <div className="col-lg-12" key={`${image}-${index}`}>
                <div className="singel-patnar text-center mt-40">
                  {image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={image} alt="Logo" />
                  ) : null}
                </div>
              </div>
            ))}
          </LegacySlider>
        </div>
      </div>
    </LegacyShell>
  );
}
