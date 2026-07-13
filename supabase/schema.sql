create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  alt text not null default '',
  caption text not null default '',
  storage_path text not null,
  public_url text not null,
  width integer,
  height integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_albums (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  event_date text not null default '',
  event_year text not null default '',
  description text not null default '',
  cover_media_id uuid references public.cms_media(id) on delete set null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cms_album_photos (
  album_id uuid not null references public.cms_albums(id) on delete cascade,
  media_id uuid not null references public.cms_media(id) on delete cascade,
  title text not null default '',
  caption text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (album_id, media_id)
);

create table if not exists public.cms_content (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('announcement', 'memory')),
  slug text not null,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  display_date text not null default '',
  category text not null default '',
  venue text not null default '',
  cover_media_id uuid references public.cms_media(id) on delete set null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, slug)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_cms_albums_updated_at on public.cms_albums;
create trigger set_cms_albums_updated_at
before update on public.cms_albums
for each row execute function public.set_updated_at();

drop trigger if exists set_cms_content_updated_at on public.cms_content;
create trigger set_cms_content_updated_at
before update on public.cms_content
for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.cms_media enable row level security;
alter table public.cms_albums enable row level security;
alter table public.cms_album_photos enable row level security;
alter table public.cms_content enable row level security;

drop policy if exists "Admins can read own admin profile" on public.admin_profiles;
create policy "Admins can read own admin profile"
on public.admin_profiles
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Public can read cms media" on public.cms_media;
create policy "Public can read cms media"
on public.cms_media
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can manage cms media" on public.cms_media;
drop policy if exists "Admins can insert cms media" on public.cms_media;
create policy "Admins can insert cms media"
on public.cms_media
for insert
to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can update cms media" on public.cms_media;
create policy "Admins can update cms media"
on public.cms_media
for update
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()))
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Public can read published albums" on public.cms_albums;
create policy "Public can read published albums"
on public.cms_albums
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage albums" on public.cms_albums;
drop policy if exists "Admins can read albums" on public.cms_albums;
create policy "Admins can read albums"
on public.cms_albums
for select
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can insert albums" on public.cms_albums;
create policy "Admins can insert albums"
on public.cms_albums
for insert
to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can update albums" on public.cms_albums;
create policy "Admins can update albums"
on public.cms_albums
for update
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()))
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Public can read published album photos" on public.cms_album_photos;
create policy "Public can read published album photos"
on public.cms_album_photos
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.cms_albums
    where cms_albums.id = cms_album_photos.album_id
      and cms_albums.is_published = true
  )
);

drop policy if exists "Admins can manage album photos" on public.cms_album_photos;
drop policy if exists "Admins can read album photos" on public.cms_album_photos;
create policy "Admins can read album photos"
on public.cms_album_photos
for select
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can insert album photos" on public.cms_album_photos;
create policy "Admins can insert album photos"
on public.cms_album_photos
for insert
to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can update album photos" on public.cms_album_photos;
create policy "Admins can update album photos"
on public.cms_album_photos
for update
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()))
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Public can read published content" on public.cms_content;
create policy "Public can read published content"
on public.cms_content
for select
to anon, authenticated
using (is_published = true);

drop policy if exists "Admins can manage content" on public.cms_content;
drop policy if exists "Admins can read content" on public.cms_content;
create policy "Admins can read content"
on public.cms_content
for select
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can insert content" on public.cms_content;
create policy "Admins can insert content"
on public.cms_content
for insert
to authenticated
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

drop policy if exists "Admins can update content" on public.cms_content;
create policy "Admins can update content"
on public.cms_content
for update
to authenticated
using (exists (select 1 from public.admin_profiles where user_id = auth.uid()))
with check (exists (select 1 from public.admin_profiles where user_id = auth.uid()));

-- Media files are stored in Cloudflare R2. Supabase stores only the public URL
-- and metadata in public.cms_media.
