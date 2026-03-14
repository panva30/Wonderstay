-- ==========================================
-- STEP 1: INITIALIZE EXTENSIONS AND TYPES
-- ==========================================
create extension if not exists "pgcrypto";
create extension if not exists btree_gist;

drop type if exists public.category_enum cascade;
create type public.category_enum as enum ('Mountain','Treehouse','Desert','Island','BeachFront','Hill Station','Others');

drop type if exists public.season_enum cascade;
create type public.season_enum as enum ('Winter','Summer','Monsoon','All');

drop type if exists public.booking_status_enum cascade;
create type public.booking_status_enum as enum ('upcoming','ongoing','completed','cancelled');

-- ==========================================
-- STEP 2: CREATE TABLES
-- ==========================================

-- Resorts Table
drop table if exists public.resorts cascade;
create table public.resorts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  image text,
  gallery text[] not null default '{}',
  price integer not null,
  location text not null,
  country text not null default 'India',
  category public.category_enum not null,
  season public.season_enum not null,
  amenities text[] not null default '{}',
  capacity_guests integer not null,
  capacity_beds integer not null,
  capacity_baths integer not null,
  avg_rating numeric(4,2) not null default 0,
  review_count integer not null default 0,
  owner_name text not null,
  coordinates double precision[] not null,
  transport_info jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coordinates_length check (array_length(coordinates,1) = 2)
);

-- Reviews Table
drop table if exists public.reviews cascade;
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.resorts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  comment text not null,
  rating integer not null,
  created_at timestamptz not null default now(),
  constraint rating_range check (rating between 1 and 5)
);

-- Bookings Table
drop table if exists public.bookings cascade;
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.resorts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  start_date date not null,
  end_date date not null,
  guests integer not null,
  total integer not null,
  status public.booking_status_enum not null default 'upcoming',
  cancellation_reason text,
  created_at timestamptz not null default now()
);

-- Profiles Table
drop table if exists public.profiles cascade;
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text default 'user', -- 'user' or 'owner'
  created_at timestamptz not null default now()
);

-- ==========================================
-- STEP 3: TRIGGERS AND FUNCTIONS
-- ==========================================

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists resorts_set_updated_at on public.resorts;
create trigger resorts_set_updated_at
before update on public.resorts
for each row execute function public.set_updated_at();

-- Auto-update resort ratings
create or replace function public.update_resort_review_stats()
returns trigger language plpgsql as $$
declare
  rid uuid;
begin
  rid := coalesce(new.listing_id, old.listing_id);
  update public.resorts
  set review_count = (select count(*) from public.reviews where listing_id = rid),
      avg_rating   = coalesce((select avg(rating)::numeric(4,2) from public.reviews where listing_id = rid), 0)
  where id = rid;
  return null;
end;
$$;

drop trigger if exists reviews_after_ins on public.reviews;
create trigger reviews_after_ins
after insert on public.reviews
for each row execute function public.update_resort_review_stats();

-- Profile auto-creation on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', new.email), 
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'user')
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      avatar_url = excluded.avatar_url,
      role = excluded.role;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ==========================================
-- STEP 4: RLS POLICIES
-- ==========================================

alter table public.resorts enable row level security;
alter table public.reviews enable row level security;
alter table public.profiles enable row level security;
alter table public.bookings enable row level security;

-- Resorts
drop policy if exists resorts_select_public on public.resorts;
create policy resorts_select_public on public.resorts for select using (true);
drop policy if exists resorts_insert_owner on public.resorts;
create policy resorts_insert_owner on public.resorts for insert to authenticated with check (true);
drop policy if exists resorts_update_owner on public.resorts;
create policy resorts_update_owner on public.resorts for update to authenticated using (owner_id = auth.uid());
drop policy if exists resorts_delete_owner on public.resorts;
create policy resorts_delete_owner on public.resorts for delete to authenticated using (owner_id = auth.uid());

-- Reviews
drop policy if exists reviews_select_public on public.reviews;
create policy reviews_select_public on public.reviews for select using (true);
drop policy if exists reviews_insert_auth on public.reviews;
create policy reviews_insert_auth on public.reviews for insert to authenticated with check (true);

-- Profiles
drop policy if exists profiles_select_all on public.profiles;
create policy profiles_select_all on public.profiles for select using (true);
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (id = auth.uid());

-- Bookings
drop policy if exists bookings_select_own on public.bookings;
create policy bookings_select_own on public.bookings for select to authenticated using (user_id = auth.uid());

-- ==========================================
-- STEP 5: STORAGE SETUP
-- ==========================================

insert into storage.buckets (id, name, public)
values ('resort-images', 'resort-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists resort_images_public_read on storage.objects;
create policy resort_images_public_read on storage.objects for select using (bucket_id = 'resort-images');
drop policy if exists resort_images_auth_insert on storage.objects;
create policy resort_images_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'resort-images');
drop policy if exists resort_images_auth_delete on storage.objects;
create policy resort_images_auth_delete on storage.objects for delete to authenticated using (bucket_id = 'resort-images');

drop policy if exists avatars_public_read on storage.objects;
create policy avatars_public_read on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists avatars_auth_insert on storage.objects;
create policy avatars_auth_insert on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
drop policy if exists avatars_auth_update on storage.objects;
create policy avatars_auth_update on storage.objects for update to authenticated using (bucket_id = 'avatars');
