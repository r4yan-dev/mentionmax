drop policy if exists "Group members can create announcements" on public.group_announcements;
create policy "Group admins can create announcements" on public.group_announcements
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.study_group_members m
    where m.group_id = group_announcements.group_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin')
  )
);
