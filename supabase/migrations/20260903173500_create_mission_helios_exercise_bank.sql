create table public.mission_helios_chapters (
  id bigint generated always as identity primary key,
  day smallint not null unique check (day between 1 and 15),
  chapter_number smallint not null unique check (chapter_number between 1 and 15),
  title text not null,
  mission_context text not null,
  exercise_count smallint not null default 20 check (exercise_count = 20),
  created_at timestamptz not null default now()
);

create table public.mission_helios_exercises (
  id bigint generated always as identity primary key,
  chapter_id bigint not null references public.mission_helios_chapters(id) on delete cascade,
  exercise_number smallint not null check (exercise_number between 1 and 20),
  title text not null,
  context text not null,
  parts jsonb not null,
  animation text not null,
  difficulty smallint not null check (difficulty between 1 and 5),
  is_synthesis boolean not null default false,
  created_at timestamptz not null default now(),
  unique (chapter_id, exercise_number),
  check (jsonb_typeof(parts) = 'array')
);

create index mission_helios_exercises_chapter_idx
  on public.mission_helios_exercises (chapter_id, exercise_number);

alter table public.mission_helios_chapters enable row level security;
alter table public.mission_helios_exercises enable row level security;

create policy "Mission Helios chapters are publicly readable"
  on public.mission_helios_chapters
  for select to anon, authenticated using (true);

create policy "Mission Helios exercises are publicly readable"
  on public.mission_helios_exercises
  for select to anon, authenticated using (true);
