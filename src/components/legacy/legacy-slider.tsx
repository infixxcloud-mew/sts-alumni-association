"use client";

import type { KeyboardEvent, ReactNode } from "react";
import Slider, { type CustomArrowProps, type Settings } from "react-slick";
import {
  getLegacyCarouselOptions,
  type LegacyCarouselKind,
} from "@/components/legacy/legacy-interactions";

type LegacySliderProps = {
  children: ReactNode;
  className: string;
  kind: LegacyCarouselKind;
};

function LegacyArrow({
  className,
  direction,
  onClick,
}: CustomArrowProps & { direction: "next" | "prev" }) {
  const iconClass = direction === "next" ? "fa-angle-right" : "fa-angle-left";

  function handleKeyDown(event: KeyboardEvent<HTMLSpanElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  return (
    <span
      className={`${direction} ${className || ""}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <i className={`fa ${iconClass}`} aria-hidden="true" />
    </span>
  );
}

function responsiveSettings(kind: LegacyCarouselKind): NonNullable<Settings["responsive"]> {
  const options = getLegacyCarouselOptions(kind);

  if (kind === "hero") {
    return [{ breakpoint: 767, settings: { arrows: false, dots: false } }];
  }

  if (kind === "category") {
    return [
      { breakpoint: 922, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
    ];
  }

  if (kind === "course") {
    return [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 3, slidesToScroll: 1 },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: options.slidesAt.tablet,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: options.slidesAt.mobile,
          slidesToScroll: 1,
        },
      },
    ];
  }

  if (kind === "testimonial") {
    return [
      {
        breakpoint: 1200,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: options.slidesAt.tablet,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: options.slidesAt.mobile,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: options.slidesAt.mobile,
          slidesToScroll: 1,
        },
      },
    ];
  }

  return [
    { breakpoint: 1200, settings: { slidesToShow: 4, slidesToScroll: 1 } },
    {
      breakpoint: 992,
      settings: {
        slidesToShow: options.slidesAt.tablet,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 768,
      settings: {
        slidesToShow: options.slidesAt.mobile,
        slidesToScroll: 1,
      },
    },
    {
      breakpoint: 576,
      settings: {
        slidesToShow: options.slidesAt.mobile,
        slidesToScroll: 1,
      },
    },
  ];
}

export function LegacySlider({ children, className, kind }: LegacySliderProps) {
  const options = getLegacyCarouselOptions(kind);
  const showArrows = kind !== "testimonial" && kind !== "partner";
  const settings: Settings = {
    arrows: showArrows,
    autoplay: options.autoplayDelay !== null,
    autoplaySpeed: options.autoplayDelay ?? undefined,
    dots: kind === "testimonial",
    fade: options.transition === "fade",
    infinite: options.infinite,
    nextArrow: <LegacyArrow direction="next" />,
    pauseOnHover: kind !== "hero",
    prevArrow: <LegacyArrow direction="prev" />,
    responsive: responsiveSettings(kind),
    slidesToScroll: 1,
    slidesToShow: options.slidesAt.desktop,
    speed: kind === "hero" ? 500 : 800,
  };

  return (
    <Slider {...settings} className={className}>
      {children}
    </Slider>
  );
}
