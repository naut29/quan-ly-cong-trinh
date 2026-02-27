create extension if not exists pgcrypto;

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  object_key text not null unique,
  filename text not null,
  size bigint not null check (size >= 0),
  content_type text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists project_files_org_id_idx on public.project_files(org_id);
create index if not exists project_files_project_id_idx on public.project_files(project_id);
create index if not exists project_files_created_at_idx on public.project_files(created_at desc);

grant select, insert, delete on public.project_files to authenticated;

alter table public.project_files enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_files'
      and policyname = 'project_files_select_member'
  ) then
    create policy project_files_select_member
      on public.project_files
      for select
      to authenticated
      using (public.is_org_member(org_id, null::text[]));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_files'
      and policyname = 'project_files_insert_member'
  ) then
    create policy project_files_insert_member
      on public.project_files
      for insert
      to authenticated
      with check (
        public.is_org_member(org_id, null::text[])
        and created_by = auth.uid()
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_files'
      and policyname = 'project_files_delete_owner_admin_or_creator'
  ) then
    create policy project_files_delete_owner_admin_or_creator
      on public.project_files
      for delete
      to authenticated
      using (
        public.is_org_member(org_id, array['owner', 'admin'])
        or created_by = auth.uid()
      );
  end if;
end
$$;
