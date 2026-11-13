create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles -------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 120),
  avatar_url text check (avatar_url is null or char_length(avatar_url) <= 2048),
  location text not null default '' check (char_length(location) <= 120),
  zone text not null default '' check (char_length(zone) <= 20),
  units text not null default 'imperial' check (units in ('imperial', 'metric')),
  notify_watering boolean not null default true,
  notify_planting boolean not null default true,
  weekly_digest boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "Users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "Users create own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120),
    left(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'), 2048)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Plants ---------------------------------------------------------------------
create table public.plants (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  name text not null check (char_length(name) between 1 and 120),
  species text not null default '' check (char_length(species) <= 160),
  image_key text not null default '' check (char_length(image_key) <= 64),
  location text not null default '' check (char_length(location) <= 120),
  last_watered date not null,
  water_every_days integer not null check (water_every_days between 1 and 365),
  sunlight text not null check (char_length(sunlight) <= 40),
  last_fertilized date not null,
  fertilize_every_days integer not null check (fertilize_every_days between 1 and 365),
  health text not null check (char_length(health) <= 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
grant select, insert, update, delete on public.plants to authenticated;
grant all on public.plants to service_role;
alter table public.plants enable row level security;
create policy "Users manage own plants" on public.plants for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create trigger plants_updated_at before update on public.plants for each row execute function public.set_updated_at();

-- Tasks ----------------------------------------------------------------------
create table public.tasks (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 64),
  title text not null check (char_length(title) between 1 and 200),
  type text not null check (type in ('water', 'fertilize', 'plant', 'prune', 'harvest')),
  due date not null,
  time text check (time is null or char_length(time) <= 10),
  image_key text check (image_key is null or char_length(image_key) <= 64),
  plant_id text check (plant_id is null or char_length(plant_id) <= 64),
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index tasks_user_due_idx on public.tasks (user_id, due);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;
alter table public.tasks enable row level security;
create policy "Users manage own tasks" on public.tasks for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create trigger tasks_updated_at before update on public.tasks for each row execute function public.set_updated_at();

-- Planner beds ---------------------------------------------------------------
create table public.planner_beds (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rows integer not null check (rows between 1 and 12),
  cols integer not null check (cols between 1 and 16),
  cells jsonb not null default '[]'::jsonb check (jsonb_typeof(cells) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.planner_beds to authenticated;
grant all on public.planner_beds to service_role;
alter table public.planner_beds enable row level security;
create policy "Users manage own planner bed" on public.planner_beds for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create trigger planner_beds_updated_at before update on public.planner_beds for each row execute function public.set_updated_at();

-- Newsletter -----------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254 and email = lower(email) and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  created_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_key unique (email)
);
grant insert on public.newsletter_subscribers to anon, authenticated;
grant all on public.newsletter_subscribers to service_role;
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert to anon, authenticated with check (true);