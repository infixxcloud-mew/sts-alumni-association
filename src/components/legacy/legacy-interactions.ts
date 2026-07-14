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

export function getLegacyViewportCarouselOptions(
  kind: LegacyCarouselKind,
  viewportWidth: number | null,
) {
  const options = getLegacyCarouselOptions(kind);
  const desktop = {
    arrows: kind !== "testimonial" && kind !== "partner",
    slidesToShow: options.slidesAt.desktop,
  };

  if (viewportWidth === null) return desktop;

  if (kind === "hero") {
    return {
      arrows: viewportWidth >= 767,
      slidesToShow: 1,
    };
  }

  if (kind === "category") {
    return {
      arrows: true,
      slidesToShow: viewportWidth < 576 ? 1 : viewportWidth < 768 ? 2 : 3,
    };
  }

  if (kind === "course") {
    return {
      arrows: viewportWidth >= 768,
      slidesToShow: viewportWidth < 768 ? 1 : viewportWidth < 992 ? options.slidesAt.tablet : 3,
    };
  }

  if (kind === "testimonial") {
    return {
      arrows: false,
      slidesToShow: viewportWidth < 992 ? options.slidesAt.mobile : options.slidesAt.desktop,
    };
  }

  return {
    arrows: false,
    slidesToShow: viewportWidth < 768 ? options.slidesAt.mobile : viewportWidth < 992 ? options.slidesAt.tablet : 4,
  };
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
