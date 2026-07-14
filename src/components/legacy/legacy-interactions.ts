export type LegacyCarouselKind =
  | "hero"
  | "category"
  | "course"
  | "testimonial"
  | "partner";

type LegacyCarouselOptions = {
  autoplayDelay: number | null;
  infinite: boolean;
  mobileArrows: boolean;
  slidesAt: {
    desktop: number;
    tablet: number;
    mobile: number;
  };
  transition: "fade" | "slide";
};

const carouselOptions: Record<LegacyCarouselKind, LegacyCarouselOptions> = {
  hero: {
    autoplayDelay: 10000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 1, tablet: 1, mobile: 1 },
    transition: "fade",
  },
  category: {
    autoplayDelay: null,
    infinite: false,
    mobileArrows: true,
    slidesAt: { desktop: 3, tablet: 2, mobile: 1 },
    transition: "slide",
  },
  course: {
    autoplayDelay: 5000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 3, tablet: 2, mobile: 1 },
    transition: "slide",
  },
  testimonial: {
    autoplayDelay: 180000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 2, tablet: 1, mobile: 1 },
    transition: "slide",
  },
  partner: {
    autoplayDelay: 5000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 4, tablet: 3, mobile: 2 },
    transition: "slide",
  },
};

export function getLegacyCarouselOptions(kind: LegacyCarouselKind) {
  return carouselOptions[kind];
}

export function getPaginationWindow(total: number, pageSize: number, requestedPage: number) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(
    Math.max(1, Number.isFinite(requestedPage) ? requestedPage : 1),
    pageCount,
  );
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageCount,
    start,
    end: Math.min(start + pageSize, total),
  };
}
