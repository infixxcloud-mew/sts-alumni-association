import assert from "node:assert/strict";
import test from "node:test";
import {
  getLegacyCarouselOptions,
  getPaginationWindow,
} from "../src/components/legacy/legacy-interactions.ts";
import { getCounterValue } from "../src/components/legacy/legacy-counter-value.ts";

test("uses the legacy WordPress Slick timing and responsive settings", () => {
  assert.deepEqual(getLegacyCarouselOptions("hero"), {
    autoplayDelay: 10000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 1, tablet: 1, mobile: 1 },
    transition: "fade",
  });

  assert.deepEqual(getLegacyCarouselOptions("course"), {
    autoplayDelay: 5000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 3, tablet: 2, mobile: 1 },
    transition: "slide",
  });

  assert.deepEqual(getLegacyCarouselOptions("testimonial"), {
    autoplayDelay: 180000,
    infinite: true,
    mobileArrows: false,
    slidesAt: { desktop: 2, tablet: 1, mobile: 1 },
    transition: "slide",
  });
});

test("returns the exact page window and valid page number for WordPress-style archives", () => {
  assert.deepEqual(getPaginationWindow(14, 6, 1), {
    currentPage: 1,
    pageCount: 3,
    start: 0,
    end: 6,
  });

  assert.deepEqual(getPaginationWindow(14, 6, 9), {
    currentPage: 3,
    pageCount: 3,
    start: 12,
    end: 14,
  });

  assert.deepEqual(getPaginationWindow(0, 6, 1), {
    currentPage: 1,
    pageCount: 1,
    start: 0,
    end: 0,
  });

  assert.deepEqual(getPaginationWindow(14, 6, Number.NaN), {
    currentPage: 1,
    pageCount: 3,
    start: 0,
    end: 6,
  });
});

test("progresses WordPress counter values without overshooting the displayed total", () => {
  assert.equal(getCounterValue(30000, 0, 3000), 0);
  assert.equal(getCounterValue(30000, 1500, 3000), 15000);
  assert.equal(getCounterValue(30000, 5000, 3000), 30000);
});
