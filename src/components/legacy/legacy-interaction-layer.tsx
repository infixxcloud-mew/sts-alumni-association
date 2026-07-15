"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

type Lightbox =
  | { images: string[]; index: number; type: "image" }
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
  const [zoom, setZoom] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);

  function showRelativeImage(step: number) {
    setLightbox((current) => {
      if (!current || current.type !== "image" || current.images.length === 0) return current;

      setZoom(1);
      return {
        ...current,
        index: (current.index + step + current.images.length) % current.images.length,
      };
    });
  }

  function adjustZoom(step: number) {
    setZoom((current) => Math.min(3, Math.max(1, Number((current + step).toFixed(2)))));
  }

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
        const group = image.dataset.legacyLightboxGroup;
        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>("a[data-legacy-lightbox]"),
        ).filter((anchor) => anchor.href && (!group || anchor.dataset.legacyLightboxGroup === group));
        const images = anchors.map((anchor) => anchor.href);
        const index = Math.max(0, images.indexOf(image.href));

        setZoom(1);
        setLightbox({ images: images.length > 0 ? images : [image.href], index, type: "image" });
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (!lightbox) return;

      if (event.key === "Escape") {
        setLightbox(null);
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        setLightbox((current) => {
          if (!current || current.type !== "image" || current.images.length <= 1) return current;

          setZoom(1);
          const step = event.key === "ArrowLeft" ? -1 : 1;
          return {
            ...current,
            index: (current.index + step + current.images.length) % current.images.length,
          };
        });
        return;
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((current) => Math.min(3, Number((current + 0.25).toFixed(2))));
        return;
      }

      if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setZoom((current) => Math.max(1, Number((current - 0.25).toFixed(2))));
      }
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
  }, [lightbox]);

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
              <>
                {lightbox.images.length > 1 ? (
                  <>
                    <button
                      aria-label="Previous image"
                      className="legacy-lightbox-control legacy-lightbox-prev"
                      onClick={() => showRelativeImage(-1)}
                      type="button"
                    >
                      <i className="fa fa-angle-left" aria-hidden="true" />
                    </button>
                    <button
                      aria-label="Next image"
                      className="legacy-lightbox-control legacy-lightbox-next"
                      onClick={() => showRelativeImage(1)}
                      type="button"
                    >
                      <i className="fa fa-angle-right" aria-hidden="true" />
                    </button>
                  </>
                ) : null}
                <div className="legacy-lightbox-tools">
                  <button
                    aria-label="Zoom out"
                    className="legacy-lightbox-tool legacy-lightbox-zoom-out"
                    onClick={() => adjustZoom(-0.25)}
                    type="button"
                  >
                    <i className="fa fa-search-minus" aria-hidden="true" />
                  </button>
                  <button
                    aria-label="Zoom in"
                    className="legacy-lightbox-tool legacy-lightbox-zoom-in"
                    onClick={() => adjustZoom(0.25)}
                    type="button"
                  >
                    <i className="fa fa-search-plus" aria-hidden="true" />
                  </button>
                </div>
                <img
                  className="legacy-lightbox-image"
                  src={lightbox.images[lightbox.index]}
                  alt=""
                  style={{ transform: `scale(${zoom})` }}
                />
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
