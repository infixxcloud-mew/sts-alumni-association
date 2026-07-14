"use client";

import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import Slider, { type CustomArrowProps, type Settings } from "react-slick";
import {
  getLegacyCarouselOptions,
  getLegacyViewportCarouselOptions,
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

export function LegacySlider({ children, className, kind }: LegacySliderProps) {
  const options = getLegacyCarouselOptions(kind);
  const [hasMounted, setHasMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number | null>(null);

  useEffect(() => {
    const updateViewportWidth = () => setViewportWidth(window.innerWidth);
    const mountTimer = window.setTimeout(() => setHasMounted(true), 0);

    updateViewportWidth();
    window.addEventListener("resize", updateViewportWidth);
    return () => {
      window.clearTimeout(mountTimer);
      window.removeEventListener("resize", updateViewportWidth);
    };
  }, []);

  const viewportOptions = getLegacyViewportCarouselOptions(kind, viewportWidth);
  const settings: Settings = {
    arrows: viewportOptions.arrows,
    autoplay: options.autoplayDelay !== null,
    autoplaySpeed: options.autoplayDelay ?? undefined,
    dots: kind === "testimonial",
    fade: options.transition === "fade",
    infinite: options.infinite,
    nextArrow: <LegacyArrow direction="next" />,
    pauseOnHover: kind !== "hero",
    prevArrow: <LegacyArrow direction="prev" />,
    slidesToScroll: 1,
    slidesToShow: viewportOptions.slidesToShow,
    speed: kind === "hero" ? 500 : 800,
  };

  if (!hasMounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Slider {...settings} className={className} key={`${kind}-${viewportWidth ?? "desktop"}`}>
      {children}
    </Slider>
  );
}
