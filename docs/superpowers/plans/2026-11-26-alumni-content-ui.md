# Alumni Content UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the supplied visual adjustments, implement announcement filters, and let admins select featured CMS announcements.

**Architecture:** Preserve the legacy page components and add scoped overrides in `src/app/globals.css`. Read announcement filters from App Router `searchParams`, and carry a new `is_featured` property from Supabase rows through the CMS merge into the sidebar. Update the checked-in Supabase schema without applying it to a live project.

**Tech Stack:** Next.js 16.2.10 App Router, React 19, TypeScript, Supabase JS, legacy Bootstrap CSS.

**Spec:** `docs/superpowers/specs/2026-11-26-alumni-content-ui-design.md`

## Global Constraints

- Honor `AGENTS.md`: read the relevant Next.js documentation from `node_modules/next/dist/docs/` before writing code.
- Keep `#ffc600` as the accent color requested by the user.
- Keep featured state separate from `sort_order`.
- Do not query or mutate a live Supabase project; the STS project is not connected.
- Do not add or run test suites in this task.

## Review Focus

- Empty or unknown category values leave the announcement list usable — inspect normalization and query parsing.
- Repeated query parameters cannot break category or keyword filtering — normalize array-valued `searchParams`.
- Pagination retains active filters — inspect both pagination route pages and generated links.
- Legacy fallback remains visible when no CMS announcement is featured — inspect list and detail sidebars.
- Existing CMS records remain editable after adding `is_featured` — inspect SQL migration compatibility and admin query fields.

---

### Task 1: Featured announcement data and admin control

**Files:**
- Modify: `supabase/schema.sql`
- Modify: `src/lib/site-data.ts`
- Modify: `src/lib/cms-data.ts`
- Modify: `src/components/admin/admin-app.tsx`

- [x] Add an idempotent `is_featured boolean not null default false` column to `public.cms_content`.
- [x] Carry the boolean into CMS content fields and admin result/form state.
- [x] Add an announcement-only checkbox in the admin content editor and save it with insert/update payloads.

### Task 2: Featured sidebar content

**Files:**
- Modify: `src/app/announcement/page.tsx`
- Modify: `src/app/announcement/[slug]/page.tsx`
- Modify: `src/app/announcement/page/[page]/page.tsx`
- Modify: `src/components/legacy/legacy-list-pages.tsx`

- [x] Derive selected featured notices from merged CMS-first announcements.
- [x] Use the selected set in list/detail “重点更新” areas and preserve the static first-three fallback when the selected set is empty.
- [x] Keep all announcement categories available independently from the featured subset.

### Task 3: Functional category and keyword filters

**Files:**
- Modify: `src/app/announcement/page.tsx`
- Modify: `src/app/announcement/page/[page]/page.tsx`
- Modify: `src/components/legacy/legacy-list-pages.tsx`

- [x] Parse `cat_` and `keyword_search` as strings from promised Next.js `searchParams`.
- [x] Apply category and keyword matching together before rendering and pagination.
- [x] Preserve current filters in category links, search forms, and pagination links.

### Task 4: Screenshot-aligned legacy styling

**Files:**
- Modify: `src/components/legacy/legacy-list-pages.tsx`
- Modify: `src/app/globals.css`

- [x] Lower the opacity of the homepage about and upcoming-event panels.
- [x] Put gallery dates on their own row above titles.
- [x] Center the album photo grid and thumbnails.
- [x] Apply `#ffc600` to visible announcement date/category text and selected category links.

### Task 5: Review and verification

**Files:**
- Review: all changed source and SQL files

- [x] Inspect the full diff and confirm no unrelated files changed.
- [x] Run `npm run lint`.
- [x] Run `npm run build`.
- [x] Report that the Supabase schema addition must be applied to the STS project before the admin checkbox can persist in production.
