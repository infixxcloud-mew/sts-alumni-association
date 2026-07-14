import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

test("keeps Bootstrap slide columns at the Slick slide width", async () => {
  const stylesheet = await readFile(resolve("src/app/globals.css"), "utf8");

  assert.match(
    stylesheet,
    /\.legacy-site \{\s*width: 100%;\s*color: #505050;\s*font-family: "Roboto", sans-serif;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.slick-slide > div > \.col-lg-4,[\s\S]*?\.legacy-site \.slick-slide > div > \.col-lg-6,[\s\S]*?flex: 0 0 100%;[\s\S]*?max-width: 100%;[\s\S]*?width: 100%;/,
  );
  assert.doesNotMatch(
    stylesheet,
    /\.legacy-site \.single-slider \{\s*min-height: 620px;/,
  );
  assert.match(
    stylesheet,
    /@media \(max-width: 767px\) \{[\s\S]*?\.legacy-site \.slider-cont h1 \{\s*font-size: 30px;\s*line-height: 36px;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.patnar-slied \.slick-slide > div > \.col-lg-12 \{\s*display: block !important;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.course-slied \.slick-slide > div > \.col-lg-4\.col-md-6 \{\s*display: block !important;/,
  );
  assert.match(
    stylesheet,
    /\.legacy-site \.category-slied \.singel-category \.icon \{\s*display: inline-block;/,
  );
});

test("keeps the legacy homepage hero, course card, and header markup", async () => {
  const [home, navigation, shell, backgroundSlide, slider] = await Promise.all([
    readFile(resolve("src/components/legacy/legacy-home.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-nav.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-shell.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-background-slide.tsx"), "utf8"),
    readFile(resolve("src/components/legacy/legacy-slider.tsx"), "utf8"),
  ]);

  assert.match(home, /image: "\/legacy-theme\/images\/Snapseed-4-scaled\.jpg"/);
  assert.match(home, /image: "\/legacy-theme\/images\/Snapseed-5-scaled\.jpg"/);
  assert.match(home, /image: "\/legacy-theme\/images\/Snapseed-6-scaled\.jpg"/);
  assert.match(home, /function LegacyHomeAlbumCard/);
  assert.match(home, /import \{ LegacyBackgroundSlide \}/);
  assert.match(home, /<LegacyBackgroundSlide/);
  assert.match(backgroundSlide, /^"use client";/);
  assert.match(backgroundSlide, /className/);
  assert.match(backgroundSlide, /\.\.\.style/);
  assert.match(slider, /const \[hasMounted, setHasMounted\]/);
  assert.match(slider, /if \(!hasMounted\)/);
  assert.match(home, /className="fa fa-star"/);
  assert.match(home, /className="fa fa-calendar"/);
  assert.doesNotMatch(home, /<LegacyAlbumCard album=/);
  assert.match(navigation, /width=\{300\}/);
  assert.match(shell, /className="row no-gutters"/);
  assert.match(shell, /className="col-lg-12 col-md-12 col-sm-12 col-12"/);
});

test("keeps partner logos at their legacy intrinsic image size", async () => {
  const home = await readFile(resolve("src/components/legacy/legacy-home.tsx"), "utf8");

  assert.match(home, /<img src=\{image\} alt="Logo" \/>/);
  assert.doesNotMatch(
    home,
    /<Image src=\{image\} alt="Logo" width=\{180\} height=\{100\}/,
  );
});
