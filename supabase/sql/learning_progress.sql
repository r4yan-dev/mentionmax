-- MentionMax persistent learning graph.
-- Applied to project: ideyxjuptbizfubyokim during the adaptive-learning build.

create table if not exists public.learning_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('quiz','ai_corrector','exercise','diagnostic')),
  subject_id text,
  track_id text,
  chapter text,
  topic text,
  concept_id text,
  outcome text not null check (outcome in ('correct','partial','incorrect','skipped')),
  points_earned numeric,
  points_possible numeric,
  difficulty integer,
  mistake_type text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_events_user_concept_idx
  on public.learning_events(user_id, subject_id, concept_id, created_at desc);

create table if not exists public.learner_mastery (
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  chapter text not null default '',
  topic text not null default '',
  concept_id text not null,
  mastery numeric not null default 0.5 check (mastery >= 0 and mastery <= 1),
  confidence numeric not null default 0 check (confidence >= 0 and confidence <= 1),
  attempts integer not null default 0,
  correct integer not null default 0,
  partial integer not null default 0,
  incorrect integer not null default 0,
  recent_mistakes jsonb not null default '[]'::jsonb,
  trend text not null default 'new' check (trend in ('improving','stable','declining','new')),
  last_attempt timestamptz,
  last_correct timestamptz,
  last_review timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, subject_id, chapter, topic, concept_id)
);

create index if not exists learner_mastery_priority_idx
  on public.learner_mastery(user_id, mastery asc, updated_at desc);

create table if not exists public.learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text,
  track_id text,
  chapter text,
  topic text,
  kind text not null check (kind in ('course_overview','exercise','quiz','revision')),
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create index if not exists learning_recommendations_user_idx
  on public.learning_recommendations(user_id, created_at desc);

alter table public.learning_events enable row level security;
alter table public.learner_mastery enable row level security;
alter table public.learning_recommendations enable row level security;

revoke all on public.learning_events from anon;
revoke all on public.learner_mastery from anon;
revoke all on public.learning_recommendations from anon;
grant select, insert on public.learning_events to authenticated;
grant select on public.learner_mastery to authenticated;
grant select on public.learning_recommendations to authenticated;

drop policy if exists learning_events_select_own on public.learning_events;
create policy learning_events_select_own on public.learning_events
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists learning_events_insert_own on public.learning_events;
create policy learning_events_insert_own on public.learning_events
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists learner_mastery_select_own on public.learner_mastery;
create policy learner_mastery_select_own on public.learner_mastery
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists learning_recommendations_select_own on public.learning_recommendations;
create policy learning_recommendations_select_own on public.learning_recommendations
  for select to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.refresh_learner_mastery()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  new_mastery numeric;
  new_confidence numeric;
  trend_value text;
begin
  with scored as (
    select
      e.*,
      case e.outcome when 'correct' then 1.0 when 'partial' then 0.5 when 'incorrect' then 0.0 else 0.25 end as outcome_score,
      row_number() over(order by e.created_at desc) as rn
    from public.learning_events e
    where e.user_id = new.user_id
      and coalesce(e.subject_id,'') = coalesce(new.subject_id,'')
      and coalesce(e.chapter,'') = coalesce(new.chapter,'')
      and coalesce(e.topic,'') = coalesce(new.topic,'')
      and coalesce(e.concept_id,'') = coalesce(new.concept_id,'')
  ),
  weighted as (
    select *, exp(-extract(epoch from (now()-created_at))/2592000.0) as w
    from scored
  ),
  stats as (
    select
      coalesce(sum(outcome_score*w)/nullif(sum(w),0),0.5) as mastery,
      count(*)::int as attempts,
      count(*) filter (where outcome='correct')::int as correct,
      count(*) filter (where outcome='partial')::int as partial,
      count(*) filter (where outcome='incorrect')::int as incorrect,
      max(created_at) as last_attempt,
      max(created_at) filter (where outcome='correct') as last_correct
    from weighted
  ),
  recent as (
    select
      avg(outcome_score) filter (where rn<=5) as recent_avg,
      avg(outcome_score) filter (where rn between 6 and 10) as prior_avg
    from scored
  )
  select stats.*, recent.recent_avg, recent.prior_avg into r
  from stats, recent;

  new_mastery := greatest(0, least(1, r.mastery));
  new_confidence := greatest(0, least(1, r.attempts::numeric / 8.0));

  if r.attempts = 0 then
    trend_value := 'new';
  elsif r.prior_avg is null then
    trend_value := 'new';
  elsif r.recent_avg > r.prior_avg + 0.08 then
    trend_value := 'improving';
  elsif r.recent_avg < r.prior_avg - 0.08 then
    trend_value := 'declining';
  else
    trend_value := 'stable';
  end if;

  insert into public.learner_mastery(
    user_id, subject_id, chapter, topic, concept_id, mastery, confidence,
    attempts, correct, partial, incorrect, trend, last_attempt, last_correct, updated_at
  ) values (
    new.user_id, coalesce(new.subject_id,''), coalesce(new.chapter,''), coalesce(new.topic,''),
    coalesce(new.concept_id,''), new_mastery, new_confidence, r.attempts, r.correct,
    r.partial, r.incorrect, trend_value, r.last_attempt, r.last_correct, now()
  )
  on conflict(user_id,subject_id,chapter,topic,concept_id) do update set
    mastery=excluded.mastery,
    confidence=excluded.confidence,
    attempts=excluded.attempts,
    correct=excluded.correct,
    partial=excluded.partial,
    incorrect=excluded.incorrect,
    trend=excluded.trend,
    last_attempt=excluded.last_attempt,
    last_correct=excluded.last_correct,
    updated_at=now();

  return new;
end;
$$;

drop trigger if exists learning_events_refresh_mastery on public.learning_events;
create trigger learning_events_refresh_mastery
after insert on public.learning_events
for each row execute function public.refresh_learner_mastery();
