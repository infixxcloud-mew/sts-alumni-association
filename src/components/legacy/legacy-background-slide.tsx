"use client";

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

type LegacyBackgroundSlideProps = {
  children: ReactNode;
  image: string;
  position?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children" | "className" | "style"> & {
    className?: string;
    style?: CSSProperties;
  };

export function LegacyBackgroundSlide({
  children,
  className,
  image,
  position,
  style,
  ...sliderProps
}: LegacyBackgroundSlideProps) {
  return (
    <div
      {...sliderProps}
      className={`single-slider bg_cover pt-150 ${className || ""}`}
      data-overlay="4"
      style={{
        ...style,
        backgroundImage: `url(${image})`,
        backgroundPositionY: position,
      }}
    >
      {children}
    </div>
  );
}
