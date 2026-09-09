create table if not exists public.learning_daily_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  track_id text,
  title text not null default 'Plan du jour',
  subtitle text,
  estimated_minutes integer not null default 30,
  tasks jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active','completed','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, plan_date)
);

alter table public.learning_daily_plans enable row level security;
create policy if not exists "daily plans select own" on public.learning_daily_plans for select to authenticated using ((select auth.uid()) = user_id);
create policy if not exists "daily plans insert own" on public.learning_daily_plans for insert to authenticated with check ((select auth.uid()) = user_id);
create policy if not exists "daily plans update own" on public.learning_daily_plans for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index if not exists learning_daily_plans_user_date_idx on public.learning_daily_plans(user_id, plan_date desc);