"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { MediaItem } from "@/lib/site-data";

export function PhotoGallery({ photos }: { photos: MediaItem[] }) {
  const usablePhotos = useMemo(
    () => photos.filter((photo) => photo.thumbSrc || photo.fullSrc),
    [photos],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePhoto = activeIndex === null ? null : usablePhotos[activeIndex];

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) =>
          index === null ? index : (index - 1 + usablePhotos.length) % usablePhotos.length,
        );
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) =>
          index === null ? index : (index + 1) % usablePhotos.length,
        );
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, usablePhotos.length]);

  if (usablePhotos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-stone-500">
        这个相册暂时没有可显示的照片。
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {usablePhotos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative aspect-square overflow-hidden rounded-md bg-stone-200 text-left focus:ring-2 focus:ring-[#7a1f24] focus:ring-offset-2 focus:outline-none"
            title={photo.title || photo.alt}
          >
            <Image
              src={photo.thumbSrc || photo.fullSrc}
              alt={photo.alt || photo.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
              {photo.title}
            </span>
          </button>
        ))}
      </div>

      {activePhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title || "照片查看器"}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="关闭照片"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((index) =>
                index === null
                  ? index
                  : (index - 1 + usablePhotos.length) % usablePhotos.length,
              )
            }
            className="absolute left-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="上一张"
          >
            <ChevronLeft aria-hidden="true" className="h-6 w-6" />
          </button>

          <figure className="flex h-full max-h-[88vh] w-full max-w-6xl flex-col items-center justify-center gap-4">
            <div className="relative min-h-0 w-full flex-1">
              <Image
                src={activePhoto.fullSrc || activePhoto.thumbSrc}
                alt={activePhoto.alt || activePhoto.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
            <figcaption className="max-w-4xl text-center text-sm leading-6 text-white/85">
              <span className="font-semibold text-white">{activePhoto.title}</span>
              {activePhoto.caption ? <span> · {activePhoto.caption}</span> : null}
            </figcaption>
          </figure>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((index) =>
                index === null ? index : (index + 1) % usablePhotos.length,
              )
            }
            className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
            aria-label="下一张"
          >
            <ChevronRight aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      ) : null}
    </>
  );
}
