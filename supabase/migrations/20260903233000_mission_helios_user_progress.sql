create table if not exists public.mission_helios_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  answers jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, exercise_id),
  constraint mission_helios_progress_answers_array check (jsonb_typeof(answers) = 'array')
);

alter table public.mission_helios_progress enable row level security;

drop policy if exists "Users can read their Helios progress" on public.mission_helios_progress;
create policy "Users can read their Helios progress"
on public.mission_helios_progress
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their Helios progress" on public.mission_helios_progress;
create policy "Users can create their Helios progress"
on public.mission_helios_progress
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their Helios progress" on public.mission_helios_progress;
create policy "Users can update their Helios progress"
on public.mission_helios_progress
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

grant select, insert, update on table public.mission_helios_progress to authenticated;
create index if not exists mission_helios_progress_user_idx on public.mission_helios_progress(user_id, updated_at desc);
