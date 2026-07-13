# WordPress to Next.js Migration

## Local Source Backup

- WordPress export XML: `../wordpress-source/-.WordPress.2026-07-13.xml`
- Downloaded uploads: `../wordpress-source/wp-content/uploads`
- Media verification: `../migration-audit/media-verify-summary.json`
- Migration audit: `../migration-audit/migration-report.md`

The WordPress source backup is read-only archive material. Do not delete or overwrite it.

## Generated Next.js Data

- Data generator: `scripts/prepare-wordpress-data.mjs`
- Generated app data: `src/data/generated/site-data.json`
- Optimized media: `public/media`

Regenerate after updating the WordPress export or media backup:

```bash
npm run prepare:wp
```

## Build

```bash
npm run lint
npm run build
```

This project is now a dynamic Next.js app because `/admin` writes to Supabase and public pages read newly published CMS content at request time.

## Free Hosting Target

Recommended free setup:

- Vercel Hobby for the Next.js app and custom domain
- Supabase Free for Auth and Postgres
- Cloudflare R2 Free tier for media storage

Vercel:

- Framework preset: Next.js
- Build command: `npm run build`
- Output directory: leave empty/default
- Environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
  - `R2_ACCOUNT_ID`
  - `R2_ACCESS_KEY_ID`
  - `R2_SECRET_ACCESS_KEY`
  - `R2_BUCKET_NAME`
  - `R2_PUBLIC_BASE_URL`

## Supabase Admin CMS

Run `supabase/schema.sql` in the Supabase SQL Editor. It creates:

- `admin_profiles`
- `cms_media`
- `cms_albums`
- `cms_album_photos`
- `cms_content`

Create a Supabase Auth user in the dashboard, then grant admin access:

```sql
insert into public.admin_profiles (user_id)
select id
from auth.users
where email = 'your-email@example.com'
on conflict do nothing;
```

Admin URL:

```text
/admin
```

The admin UI supports creating and editing albums, announcements, and memories. It compresses images in the browser, uploads them to Cloudflare R2 through a server-side API route, stores the image URL in Supabase, and uses publish/draft status instead of deletion.

## Cloudflare R2 Media Storage

The optimized WordPress media in `public/media` is about 622 MB. For Vercel deployment, move these static media files into Cloudflare R2 before production deployment. `.vercelignore` excludes `public/media` from Vercel uploads.

Create one R2 bucket, for example:

```text
sts-alumni-media
```

Set the bucket to public with either an `r2.dev` public URL or a custom public domain, then put these values in `.env.local`:

```bash
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=sts-alumni-media
R2_PUBLIC_BASE_URL=https://your-public-r2-domain
```

Dry-run first. This only counts local files and does not upload:

```bash
npm run upload:media:r2 -- --dry-run
```

Upload and rewrite `src/data/generated/site-data.json` media URLs to R2 public URLs:

```bash
npm run upload:media:r2
```

Do not expose `R2_SECRET_ACCESS_KEY` in browser code or any `NEXT_PUBLIC_` environment variable.

## Privacy

Do not publish exported `contact_us`, `member_form`, `attendance_info`, or `tabung_form` records without a privacy review.
