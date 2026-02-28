create table if not exists public.platform_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_super_admin(p_user_id uuid default auth.uid())
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_target_user_id uuid := coalesce(p_user_id, auth.uid());
  v_exists boolean := false;
begin
  if v_target_user_id is null then
    return false;
  end if;

  if to_regclass('public.platform_roles') is null then
    return false;
  end if;

  execute $q$
    select exists (
      select 1
      from public.platform_roles pr
      where pr.user_id = $1
        and pr.role = 'super_admin'
    )
  $q$
  into v_exists
  using v_target_user_id;

  return coalesce(v_exists, false);
end;
$$;

revoke all on table public.platform_roles from public;
revoke all on function public.is_super_admin(uuid) from public;

grant select, insert, update, delete on table public.platform_roles to authenticated;
grant execute on function public.is_super_admin(uuid) to authenticated;

alter table public.platform_roles enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_roles'
      and policyname = 'platform_roles_select_self'
  ) then
    create policy platform_roles_select_self
      on public.platform_roles
      for select
      to authenticated
      using (user_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_roles'
      and policyname = 'platform_roles_select_super_admin'
  ) then
    create policy platform_roles_select_super_admin
      on public.platform_roles
      for select
      to authenticated
      using (public.is_super_admin());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_roles'
      and policyname = 'platform_roles_insert_super_admin'
  ) then
    create policy platform_roles_insert_super_admin
      on public.platform_roles
      for insert
      to authenticated
      with check (public.is_super_admin());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_roles'
      and policyname = 'platform_roles_update_super_admin'
  ) then
    create policy platform_roles_update_super_admin
      on public.platform_roles
      for update
      to authenticated
      using (public.is_super_admin())
      with check (public.is_super_admin());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'platform_roles'
      and policyname = 'platform_roles_delete_super_admin'
  ) then
    create policy platform_roles_delete_super_admin
      on public.platform_roles
      for delete
      to authenticated
      using (public.is_super_admin());
  end if;
end
$$;
