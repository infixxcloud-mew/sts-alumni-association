"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Lightbox =
  | { src: string; type: "image" }
  | { src: string; type: "video" };

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get("v");
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  } catch {
    return url;
  }
}

function scrollToTop() {
  const startPosition = window.scrollY;
  const startTime = performance.now();
  const duration = 1500;

  function step(now: number) {
    const progress = Math.min(1, (now - startTime) / duration);
    const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
    window.scrollTo(0, Math.round(startPosition * (1 - easedProgress)));
    if (progress < 1) window.requestAnimationFrame(step);
  }

  window.requestAnimationFrame(step);
}

export function LegacyInteractionLayer() {
  const [lightbox, setLightbox] = useState<Lightbox | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    function updateScrollState() {
      const scrollTop = window.scrollY;
      setShowBackToTop(scrollTop > 600);
      document.querySelector(".legacy-site .navigation")?.classList.toggle("sticky", scrollTop >= 200);
    }

    function handleDocumentClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;

      const video = event.target.closest<HTMLAnchorElement>("a.Video-popup");
      if (video?.href) {
        event.preventDefault();
        setLightbox({ src: youtubeEmbedUrl(video.href), type: "video" });
        return;
      }

      const image = event.target.closest<HTMLAnchorElement>("a[data-legacy-lightbox]");
      if (image?.href) {
        event.preventDefault();
        setLightbox({ src: image.href, type: "image" });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightbox(null);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <a
        href="#header-part"
        className="back-to-top"
        onClick={(event) => {
          event.preventDefault();
          scrollToTop();
        }}
        style={{ display: showBackToTop ? "block" : "none" }}
      >
        <i className="fa fa-angle-up" aria-hidden="true" />
      </a>

      {lightbox ? (
        <div
          className="legacy-lightbox"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setLightbox(null);
          }}
          role="presentation"
        >
          <div className="legacy-lightbox-content" role="dialog" aria-modal="true">
            <button className="legacy-lightbox-close" onClick={() => setLightbox(null)} type="button">
              &times;
            </button>
            {lightbox.type === "video" ? (
              <div className="legacy-video-frame">
                <iframe
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  src={lightbox.src}
                  title=""
                />
              </div>
            ) : (
              <Image
                src={lightbox.src}
                alt=""
                width={1600}
                height={1200}
                sizes="100vw"
                unoptimized
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
