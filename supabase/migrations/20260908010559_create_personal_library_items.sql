create table if not exists public.personal_library_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_type text not null check (resource_type in ('handnote','summary','flashcards','quiz')),
  title text not null,
  subject text,
  chapter text,
  source_type text not null default 'text',
  source_ref text,
  content jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.personal_library_items enable row level security;

drop policy if exists "Users can view their own library items" on public.personal_library_items;
create policy "Users can view their own library items"
  on public.personal_library_items for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own library items" on public.personal_library_items;
create policy "Users can insert their own library items"
  on public.personal_library_items for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own library items" on public.personal_library_items;
create policy "Users can update their own library items"
  on public.personal_library_items for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own library items" on public.personal_library_items;
create policy "Users can delete their own library items"
  on public.personal_library_items for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.personal_library_items to authenticated;
