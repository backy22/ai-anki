-- Run once in Supabase Dashboard → SQL Editor (or via `supabase db push` if you use the CLI).

-- Profiles (optional row per auth user; app works with auth id alone, but this matches lookups)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Flashcards
create table public.cards (
  id serial primary key,
  created_at timestamptz not null default now(),
  user_id uuid not null references auth.users (id) on delete cascade,
  word text not null,
  definition text not null
);

create index cards_user_id_idx on public.cards (user_id);

alter table public.cards enable row level security;

create policy "cards_select_own"
  on public.cards for select
  using (auth.uid() = user_id);

create policy "cards_insert_own"
  on public.cards for insert
  with check (auth.uid() = user_id);

create policy "cards_update_own"
  on public.cards for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cards_delete_own"
  on public.cards for delete
  using (auth.uid() = user_id);

-- Auto-create a profile row when a user signs up (optional but keeps profiles in sync)
create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user ();
