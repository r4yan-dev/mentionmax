create table if not exists public.group_challenges (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text,
  metric text not null check (metric in ('focus_minutes','focus_sessions')),
  target integer not null check (target between 1 and 100000),
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.group_resources (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 140),
  description text,
  resource_type text not null check (resource_type in ('course','exercise','quiz','document','external')),
  target_url text not null check (char_length(trim(target_url)) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.group_announcements (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.study_groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.group_challenges enable row level security;
alter table public.group_resources enable row level security;
alter table public.group_announcements enable row level security;

create index if not exists group_challenges_group_dates_idx on public.group_challenges(group_id, starts_at, ends_at);
create index if not exists group_resources_group_created_idx on public.group_resources(group_id, created_at desc);
create index if not exists group_announcements_group_created_idx on public.group_announcements(group_id, created_at desc);

create policy "Group members can view challenges" on public.group_challenges
for select to authenticated
using (exists (select 1 from public.study_group_members m where m.group_id = group_challenges.group_id and m.user_id = (select auth.uid())));

create policy "Group members can create challenges" on public.group_challenges
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (select 1 from public.study_group_members m where m.group_id = group_challenges.group_id and m.user_id = (select auth.uid()))
);

create policy "Group members can view resources" on public.group_resources
for select to authenticated
using (exists (select 1 from public.study_group_members m where m.group_id = group_resources.group_id and m.user_id = (select auth.uid())));

create policy "Group members can create resources" on public.group_resources
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (select 1 from public.study_group_members m where m.group_id = group_resources.group_id and m.user_id = (select auth.uid()))
);

create policy "Group members can view announcements" on public.group_announcements
for select to authenticated
using (exists (select 1 from public.study_group_members m where m.group_id = group_announcements.group_id and m.user_id = (select auth.uid())));

create policy "Group members can create announcements" on public.group_announcements
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (select 1 from public.study_group_members m where m.group_id = group_announcements.group_id and m.user_id = (select auth.uid()))
);

create or replace function public.get_social_challenge_dashboard(p_group_id uuid)
returns table (
  challenge_id uuid,
  title text,
  description text,
  metric text,
  target integer,
  starts_at timestamptz,
  ends_at timestamptz,
  created_by uuid,
  display_name text,
  member_user_id uuid,
  progress integer,
  rank integer
)
language sql
security definer
set search_path = public, pg_catalog
as $$
  with member_rows as (
    select m.user_id, coalesce(p.display_name, 'Élève') as display_name
    from public.study_group_members m
    left join public.profiles p on p.id = m.user_id
    where m.group_id = p_group_id
  ),
  challenge_rows as (
    select c.* from public.group_challenges c
    where c.group_id = p_group_id
      and c.ends_at >= now()
    order by c.ends_at asc, c.created_at desc
    limit 5
  ),
  progress_rows as (
    select
      c.id as challenge_id,
      c.title,
      c.description,
      c.metric,
      c.target,
      c.starts_at,
      c.ends_at,
      c.created_by,
      m.display_name,
      m.user_id as member_user_id,
      case
        when c.metric = 'focus_minutes' then coalesce((
          select floor(sum(fs.actual_seconds) / 60.0)::integer
          from public.focus_sessions fs
          where fs.group_id = c.group_id
            and fs.user_id = m.user_id
            and fs.status = 'completed'
            and fs.started_at >= c.starts_at
            and fs.started_at <= c.ends_at
        ), 0)
        when c.metric = 'focus_sessions' then coalesce((
          select count(*)::integer
          from public.focus_sessions fs
          where fs.group_id = c.group_id
            and fs.user_id = m.user_id
            and fs.status = 'completed'
            and fs.started_at >= c.starts_at
            and fs.started_at <= c.ends_at
        ), 0)
        else 0
      end as progress
    from challenge_rows c
    join member_rows m on true
  )
  select
    p.challenge_id, p.title, p.description, p.metric, p.target,
    p.starts_at, p.ends_at, p.created_by, p.display_name,
    p.member_user_id, p.progress,
    dense_rank() over (partition by p.challenge_id order by p.progress desc, p.member_user_id) as rank
  from progress_rows p
  order by p.starts_at, p.progress desc, p.display_name;
$$;

revoke all on function public.get_social_challenge_dashboard(uuid) from public;
grant execute on function public.get_social_challenge_dashboard(uuid) to authenticated;
