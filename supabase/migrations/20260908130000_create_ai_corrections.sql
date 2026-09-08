create table if not exists public.ai_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_id text not null,
  subject_id text,
  track_id text,
  statement text not null,
  student_answers jsonb not null default '[]'::jsonb,
  result jsonb not null,
  provider text not null default 'gemini',
  created_at timestamptz not null default now(),
  constraint ai_corrections_answers_array check (jsonb_typeof(student_answers) = 'array'::text),
  constraint ai_corrections_result_object check (jsonb_typeof(result) = 'object'::text)
);

alter table public.ai_corrections enable row level security;

drop policy if exists "Users can read their AI corrections" on public.ai_corrections;
create policy "Users can read their AI corrections"
on public.ai_corrections
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their AI corrections" on public.ai_corrections;
create policy "Users can create their AI corrections"
on public.ai_corrections
for insert
to authenticated
with check ((select auth.uid()) = user_id);

grant select, insert on table public.ai_corrections to authenticated;
create index if not exists ai_corrections_user_created_idx on public.ai_corrections(user_id, created_at desc);
create index if not exists ai_corrections_exercise_idx on public.ai_corrections(user_id, exercise_id, created_at desc);
