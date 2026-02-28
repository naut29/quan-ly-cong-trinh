create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  name text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (org_id, key)
);

create index if not exists roles_org_id_idx on public.roles (org_id);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  module_key text not null,
  action text not null check (action in ('view', 'edit', 'approve')),
  created_at timestamptz not null default now(),
  unique (role_id, module_key, action)
);

create index if not exists role_permissions_role_id_idx on public.role_permissions (role_id);

alter table public.org_members
  add column if not exists role_id uuid references public.roles(id) on delete restrict;

create or replace function public.seed_org_roles(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_org_id is null then
    return;
  end if;

  insert into public.roles (org_id, key, name, description)
  values
    (p_org_id, 'owner', 'Owner', 'Toan quyen quan tri va phe duyet.'),
    (p_org_id, 'admin', 'Admin', 'Quan tri van hanh va cap quyen.'),
    (p_org_id, 'manager', 'Manager', 'Quan ly thuc thi va dieu phoi cong viec.'),
    (p_org_id, 'member', 'Member', 'Thanh vien thao tac theo pham vi duoc giao.'),
    (p_org_id, 'viewer', 'Viewer', 'Chi xem va theo doi.')
  on conflict (org_id, key) do update
  set
    name = excluded.name,
    description = excluded.description,
    updated_at = now();
end;
$$;

create or replace function public.seed_org_role_permissions(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_admin_id uuid;
  v_manager_id uuid;
  v_member_id uuid;
  v_viewer_id uuid;
begin
  if p_org_id is null then
    return;
  end if;

  perform public.seed_org_roles(p_org_id);

  select id into v_owner_id from public.roles where org_id = p_org_id and key = 'owner' limit 1;
  select id into v_admin_id from public.roles where org_id = p_org_id and key = 'admin' limit 1;
  select id into v_manager_id from public.roles where org_id = p_org_id and key = 'manager' limit 1;
  select id into v_member_id from public.roles where org_id = p_org_id and key = 'member' limit 1;
  select id into v_viewer_id from public.roles where org_id = p_org_id and key = 'viewer' limit 1;

  insert into public.role_permissions (role_id, module_key, action)
  select v_owner_id, module_key, action
  from (
    values
      ('dashboard', 'view'),
      ('dashboard', 'edit'),
      ('projects', 'view'),
      ('projects', 'edit'),
      ('wbs', 'view'),
      ('wbs', 'edit'),
      ('boq', 'view'),
      ('boq', 'edit'),
      ('materials', 'view'),
      ('materials', 'edit'),
      ('norms', 'view'),
      ('norms', 'edit'),
      ('costs', 'view'),
      ('costs', 'edit'),
      ('contracts', 'view'),
      ('contracts', 'edit'),
      ('payments', 'view'),
      ('payments', 'edit'),
      ('approvals', 'view'),
      ('approvals', 'edit'),
      ('approvals', 'approve'),
      ('progress', 'view'),
      ('progress', 'edit'),
      ('reports', 'view'),
      ('reports', 'edit')
  ) seeded(module_key, action)
  where v_owner_id is not null
  on conflict (role_id, module_key, action) do nothing;

  insert into public.role_permissions (role_id, module_key, action)
  select v_admin_id, module_key, action
  from (
    values
      ('dashboard', 'view'),
      ('dashboard', 'edit'),
      ('projects', 'view'),
      ('projects', 'edit'),
      ('wbs', 'view'),
      ('wbs', 'edit'),
      ('boq', 'view'),
      ('boq', 'edit'),
      ('materials', 'view'),
      ('materials', 'edit'),
      ('norms', 'view'),
      ('norms', 'edit'),
      ('costs', 'view'),
      ('costs', 'edit'),
      ('contracts', 'view'),
      ('contracts', 'edit'),
      ('payments', 'view'),
      ('payments', 'edit'),
      ('approvals', 'view'),
      ('approvals', 'edit'),
      ('approvals', 'approve'),
      ('progress', 'view'),
      ('progress', 'edit'),
      ('reports', 'view'),
      ('reports', 'edit')
  ) seeded(module_key, action)
  where v_admin_id is not null
  on conflict (role_id, module_key, action) do nothing;

  insert into public.role_permissions (role_id, module_key, action)
  select v_manager_id, module_key, action
  from (
    values
      ('dashboard', 'view'),
      ('projects', 'view'),
      ('projects', 'edit'),
      ('wbs', 'view'),
      ('wbs', 'edit'),
      ('boq', 'view'),
      ('boq', 'edit'),
      ('materials', 'view'),
      ('materials', 'edit'),
      ('norms', 'view'),
      ('norms', 'edit'),
      ('costs', 'view'),
      ('costs', 'edit'),
      ('contracts', 'view'),
      ('payments', 'view'),
      ('approvals', 'view'),
      ('approvals', 'edit'),
      ('progress', 'view'),
      ('progress', 'edit'),
      ('reports', 'view')
  ) seeded(module_key, action)
  where v_manager_id is not null
  on conflict (role_id, module_key, action) do nothing;

  insert into public.role_permissions (role_id, module_key, action)
  select v_member_id, module_key, action
  from (
    values
      ('dashboard', 'view'),
      ('projects', 'view'),
      ('wbs', 'view'),
      ('boq', 'view'),
      ('materials', 'view'),
      ('norms', 'view'),
      ('costs', 'view'),
      ('contracts', 'view'),
      ('payments', 'view'),
      ('approvals', 'view'),
      ('progress', 'view'),
      ('reports', 'view')
  ) seeded(module_key, action)
  where v_member_id is not null
  on conflict (role_id, module_key, action) do nothing;

  insert into public.role_permissions (role_id, module_key, action)
  select v_viewer_id, module_key, action
  from (
    values
      ('dashboard', 'view'),
      ('projects', 'view'),
      ('reports', 'view')
  ) seeded(module_key, action)
  where v_viewer_id is not null
  on conflict (role_id, module_key, action) do nothing;
end;
$$;

create or replace function public.ensure_org_rbac_seed(p_org_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_org_id is null or auth.uid() is null then
    return;
  end if;

  if not public.is_org_member(p_org_id, null::text[]) then
    return;
  end if;

  perform public.seed_org_roles(p_org_id);
  perform public.seed_org_role_permissions(p_org_id);
end;
$$;

do $$
declare
  v_org record;
begin
  for v_org in select id from public.organizations loop
    perform public.seed_org_roles(v_org.id);
    perform public.seed_org_role_permissions(v_org.id);
  end loop;
end
$$;

update public.org_members m
set role_id = r.id
from public.roles r
where r.org_id = m.org_id
  and r.key = case lower(coalesce(m.role, ''))
    when 'owner' then 'owner'
    when 'company_owner' then 'owner'
    when 'admin' then 'admin'
    when 'manager' then 'manager'
    when 'project_manager' then 'manager'
    when 'member' then 'member'
    when 'editor' then 'member'
    when 'viewer' then 'viewer'
    else 'member'
  end;

update public.org_members m
set role = r.key
from public.roles r
where r.id = m.role_id
  and (m.role is distinct from r.key);

drop trigger if exists org_members_sync_role_columns on public.org_members;
create or replace function public.sync_org_member_role_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.roles;
  v_role_key text;
begin
  if new.org_id is null then
    return new;
  end if;

  perform public.seed_org_roles(new.org_id);

  v_role_key := case lower(coalesce(new.role, ''))
    when 'owner' then 'owner'
    when 'company_owner' then 'owner'
    when 'admin' then 'admin'
    when 'manager' then 'manager'
    when 'project_manager' then 'manager'
    when 'member' then 'member'
    when 'editor' then 'member'
    when 'viewer' then 'viewer'
    else null
  end;

  if new.role_id is not null then
    select *
    into v_role
    from public.roles
    where id = new.role_id
      and org_id = new.org_id
    limit 1;

    if v_role.id is null then
      raise exception 'role_id % does not belong to org %', new.role_id, new.org_id;
    end if;

    new.role := v_role.key;
    return new;
  end if;

  if v_role_key is null then
    v_role_key := 'member';
  end if;

  select *
  into v_role
  from public.roles
  where org_id = new.org_id
    and key = v_role_key
  limit 1;

  if v_role.id is not null then
    new.role_id := v_role.id;
    new.role := v_role.key;
  end if;

  return new;
end;
$$;

create trigger org_members_sync_role_columns
before insert or update of org_id, role, role_id
on public.org_members
for each row
execute function public.sync_org_member_role_columns();

create or replace function public.is_org_member(
  p_org_id uuid,
  p_roles text[] default null
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
        p_roles is null
        or coalesce(r.key, m.role)::text = any(p_roles)
      )
  );
$$;

create or replace function public.is_org_admin(p_org_id uuid)
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
      and coalesce(r.key, m.role)::text in ('owner', 'admin')
  );
$$;

revoke all on function public.is_org_member(uuid, text[]) from public;
revoke all on function public.is_org_admin(uuid) from public;
revoke all on function public.seed_org_roles(uuid) from public;
revoke all on function public.seed_org_role_permissions(uuid) from public;
revoke all on function public.ensure_org_rbac_seed(uuid) from public;
grant execute on function public.is_org_member(uuid, text[]) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;
grant execute on function public.ensure_org_rbac_seed(uuid) to authenticated;

create or replace function public.list_org_members(p_org_id uuid)
returns table (
  org_id uuid,
  user_id uuid,
  role text,
  role_id uuid,
  role_key text,
  role_name text,
  status text,
  created_at timestamptz,
  email text,
  full_name text
)
language sql
security definer
stable
set search_path = public
as $$
  select
    m.org_id,
    m.user_id,
    coalesce(r.key, m.role) as role,
    m.role_id,
    coalesce(r.key, m.role) as role_key,
    r.name as role_name,
    m.status,
    m.created_at,
    p.email,
    p.full_name
  from public.org_members m
  left join public.roles r on r.id = m.role_id
  left join public.profiles p on p.id = m.user_id
  where m.org_id = p_org_id
    and public.is_org_member(p_org_id, null::text[])
  order by m.created_at asc;
$$;

revoke all on function public.list_org_members(uuid) from public;
grant execute on function public.list_org_members(uuid) to authenticated;

alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'roles'
      and policyname = 'roles_select_member_live'
  ) then
    create policy roles_select_member_live
      on public.roles
      for select
      to authenticated
      using (public.is_org_member(org_id, null::text[]));
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'roles'
      and policyname = 'roles_modify_admin_live'
  ) then
    create policy roles_modify_admin_live
      on public.roles
      for all
      to authenticated
      using (public.is_org_admin(org_id))
      with check (public.is_org_admin(org_id));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_permissions'
      and policyname = 'role_permissions_select_member_live'
  ) then
    create policy role_permissions_select_member_live
      on public.role_permissions
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.roles r
          where r.id = role_permissions.role_id
            and public.is_org_member(r.org_id, null::text[])
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'role_permissions'
      and policyname = 'role_permissions_modify_admin_live'
  ) then
    create policy role_permissions_modify_admin_live
      on public.role_permissions
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.roles r
          where r.id = role_permissions.role_id
            and public.is_org_admin(r.org_id)
        )
      )
      with check (
        exists (
          select 1
          from public.roles r
          where r.id = role_permissions.role_id
            and public.is_org_admin(r.org_id)
        )
      );
  end if;
end
$$;
