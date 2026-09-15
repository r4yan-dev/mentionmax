create table if not exists public.student_learning_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_completed boolean not null default false,
  strong_subjects text[] not null default '{}',
  weak_subjects text[] not null default '{}',
  priority_subjects text[] not null default '{}',
  subject_status jsonb not null default '{}'::jsonb,
  session_minutes integer not null default 30 check (session_minutes between 10 and 180),
  academic_start_date date not null default '2026-09-01'::date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_exams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  exam_date date not null,
  subjects text[] not null default '{}',
  coverage jsonb not null default '{}'::jsonb,
  mastery integer check (mastery is null or mastery between 0 and 100),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.student_learning_profiles enable row level security;
alter table public.student_exams enable row level security;

revoke all on public.student_learning_profiles from anon;
revoke all on public.student_exams from anon;
grant select, insert, update, delete on public.student_learning_profiles to authenticated;
grant select, insert, update, delete on public.student_exams to authenticated;

drop policy if exists "Users manage own learning profile" on public.student_learning_profiles;
create policy "Users manage own learning profile" on public.student_learning_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own exams" on public.student_exams;
create policy "Users manage own exams" on public.student_exams
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create index if not exists student_exams_user_date_idx on public.student_exams(user_id, exam_date);
create index if not exists student_exams_user_updated_idx on public.student_exams(user_id, updated_at desc);

alter table public.learning_agent_sessions add column if not exists explanation text;
