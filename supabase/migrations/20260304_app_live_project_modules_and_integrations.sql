create extension if not exists pgcrypto;

create or replace function public.has_org_permission(
  p_org_id uuid,
  p_module_key text,
  p_action text
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.org_members m
    left join public.roles r on r.id = m.role_id
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and (
        coalesce(r.key, m.role::text) in ('owner', 'admin')
        or exists (
          select 1
          from public.role_permissions rp
          where rp.role_id = m.role_id
            and rp.module_key = p_module_key
            and rp.action = p_action
        )
      )
  );
$$;

revoke all on function public.has_org_permission(uuid, text, text) from public;
grant execute on function public.has_org_permission(uuid, text, text) to authenticated;

create table if not exists public.project_module_records (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  module_key text not null check (
    module_key in (
      'wbs',
      'boq',
      'materials',
      'norms',
      'costs',
      'contracts',
      'payments',
      'approvals',
      'progress',
      'reports'
    )
  ),
  name text not null,
  code text,
  status text not null default 'active',
  amount numeric not null default 0,
  progress integer not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_module_records_org_idx
  on public.project_module_records (org_id, project_id, module_key, updated_at desc);

create table if not exists public.org_integrations (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  name text not null,
  description text not null,
  category text not null check (category in ('cloud', 'communication', 'payment', 'productivity')),
  icon_key text not null check (
    icon_key in ('cloud', 'mail', 'message', 'credit-card', 'file-spreadsheet', 'calendar', 'database')
  ),
  enabled boolean not null default false,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, provider)
);

create index if not exists org_integrations_org_idx
  on public.org_integrations (org_id, provider);

grant select, insert, update, delete on public.project_module_records to authenticated;
grant select, insert, update, delete on public.org_integrations to authenticated;

alter table public.project_module_records enable row level security;
alter table public.org_integrations enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_module_records'
      and policyname = 'project_module_records_select_member'
  ) then
    create policy project_module_records_select_member
      on public.project_module_records
      for select
      to authenticated
      using (public.is_org_member(org_id, null::text[]));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_module_records'
      and policyname = 'project_module_records_insert_permitted'
  ) then
    create policy project_module_records_insert_permitted
      on public.project_module_records
      for insert
      to authenticated
      with check (
        public.has_org_permission(org_id, module_key, 'edit')
        and (created_by is null or created_by = auth.uid())
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_module_records'
      and policyname = 'project_module_records_update_permitted'
  ) then
    create policy project_module_records_update_permitted
      on public.project_module_records
      for update
      to authenticated
      using (public.has_org_permission(org_id, module_key, 'edit'))
      with check (public.has_org_permission(org_id, module_key, 'edit'));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'project_module_records'
      and policyname = 'project_module_records_delete_permitted'
  ) then
    create policy project_module_records_delete_permitted
      on public.project_module_records
      for delete
      to authenticated
      using (public.has_org_permission(org_id, module_key, 'edit'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'org_integrations'
      and policyname = 'org_integrations_select_member'
  ) then
    create policy org_integrations_select_member
      on public.org_integrations
      for select
      to authenticated
      using (public.is_org_member(org_id, null::text[]));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'org_integrations'
      and policyname = 'org_integrations_modify_admin'
  ) then
    create policy org_integrations_modify_admin
      on public.org_integrations
      for all
      to authenticated
      using (public.is_org_admin(org_id))
      with check (public.is_org_admin(org_id));
  end if;
end
$$;
