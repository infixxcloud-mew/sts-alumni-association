# Alumni content UI design

## Intent

Polish the legacy alumni pages shown in the supplied screenshots, make announcement category and keyword filters work, and let admins choose which CMS announcements appear under “重点更新”.

## Goals

- Reduce the opacity of the white panels behind the homepage about text and upcoming events.
- Use `#ffc600` for announcement dates and category metadata shown in the screenshots.
- Put gallery card dates and titles on separate lines, and center album photo thumbnails.
- Filter announcements by selected category and keyword, including paginated URLs.
- Add an admin-selectable featured flag for CMS announcements and show selected items in announcement sidebars.

## Constraints and non-goals

- Keep the existing legacy theme and public content model; do not redesign pages.
- Store the featured state in `cms_content.is_featured`, separate from `sort_order`.
- Update the checked-in idempotent Supabase schema. The live Supabase project is not currently connected, so do not execute a database change.
- When no CMS announcement is featured, preserve the current static top-three sidebar fallback.
- Do not change the hardcoded homepage event content as part of this visual task.

## Approaches

- Add a dedicated `is_featured` column and an admin checkbox (chosen): clear intent, independent of ordering, and covered by existing admin update RLS policies.
- Reuse `sort_order` as a featured marker: avoids a schema change but mixes display ordering with a separate editorial choice.
- Hardcode featured slugs: requires code changes whenever admins want a different list and does not meet the admin-control request.

## Implementation decisions

- Category and keyword filters are read from the Next.js page `searchParams` and combined with AND semantics.
- Featured CMS announcements are multi-select; if at least one is selected, those replace the legacy fallback list.
- Existing announcement and CMS merge precedence remains CMS-first by slug.
- The public fallback remains the first three static announcements until the database migration is applied and at least one CMS announcement is selected.

## Verification

- Review the final diff and run the repository lint and production build commands.
- Automated test files are not added or run in this task.
- Live database behavior remains contingent on applying the updated Supabase schema to the correct project.
