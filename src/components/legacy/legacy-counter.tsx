"use client";

import { useEffect, useRef, useState } from "react";
import { getCounterValue } from "@/components/legacy/legacy-counter-value";

export function LegacyCounter({ total }: { total: number }) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let frame = 0;
    let started = false;

    function animate(startTime: number) {
      function step(now: number) {
        const nextValue = getCounterValue(total, now - startTime, 3000);
        setValue(nextValue);
        if (nextValue < total) frame = window.requestAnimationFrame(step);
      }

      frame = window.requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || started) return;
        started = true;
        animate(performance.now());
        observer.disconnect();
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [total]);

  return <span className="counter" ref={elementRef}>{value.toLocaleString("en-US")}</span>;
}
