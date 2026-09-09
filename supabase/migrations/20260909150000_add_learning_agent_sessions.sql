create table if not exists public.learning_agent_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  track_id text,
  available_minutes integer not null default 30 check (available_minutes between 10 and 180),
  title text not null,
  subtitle text,
  tasks jsonb not null default '[]'::jsonb,
  priorities jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_agent_sessions_user_created_idx on public.learning_agent_sessions(user_id, created_at desc);

alter table public.learning_agent_sessions enable row level security;

create policy "agent sessions own rows" on public.learning_agent_sessions
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create or replace function public.touch_learning_agent_session()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learning_agent_sessions_touch on public.learning_agent_sessions;
create trigger learning_agent_sessions_touch
before update on public.learning_agent_sessions
for each row execute function public.touch_learning_agent_session();
