-- Helper: evaluate org membership/role safely (works even if org_members is absent during deploy order)
create or replace function public.is_org_member(
  p_org_id uuid,
  p_roles text[] default null
)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_exists boolean := false;
begin
  if auth.uid() is null or p_org_id is null then
    return false;
  end if;

  if to_regclass('public.org_members') is null then
    return false;
  end if;

  if p_roles is null then
    execute $q$
      select exists (
        select 1
        from public.org_members m
        where m.org_id = $1
          and m.user_id = $2
      )
    $q$
    into v_exists
    using p_org_id, auth.uid();
  else
    execute $q$
      select exists (
        select 1
        from public.org_members m
        where m.org_id = $1
          and m.user_id = $2
          and m.role = any($3)
      )
    $q$
    into v_exists
    using p_org_id, auth.uid(), p_roles;
  end if;

  return coalesce(v_exists, false);
end;
$$;

revoke all on function public.is_org_member(uuid, text[]) from public;
grant execute on function public.is_org_member(uuid, text[]) to authenticated;

-- organizations: sensitive fields include plan_id, plan_overrides
do $$
begin
  if to_regclass('public.organizations') is null then
    raise notice 'organizations table not found; skipping organizations RLS';
  else
    alter table public.organizations enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'organizations'
        and policyname = 'organizations_select_member'
    ) then
      create policy organizations_select_member
        on public.organizations
        for select
        to authenticated
        using (public.is_org_member(id, null::text[]));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'organizations'
        and policyname = 'organizations_update_admin'
    ) then
      create policy organizations_update_admin
        on public.organizations
        for update
        to authenticated
        using (public.is_org_member(id, array['owner','admin']))
        with check (public.is_org_member(id, array['owner','admin']));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'organizations'
        and policyname = 'organizations_delete_owner'
    ) then
      create policy organizations_delete_owner
        on public.organizations
        for delete
        to authenticated
        using (public.is_org_member(id, array['owner']));
    end if;
  end if;
end
$$;

-- org_members: membership roster is sensitive
do $$
begin
  if to_regclass('public.org_members') is null then
    raise notice 'org_members table not found; skipping org_members RLS';
  else
    alter table public.org_members enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_members'
        and policyname = 'org_members_select_member'
    ) then
      create policy org_members_select_member
        on public.org_members
        for select
        to authenticated
        using (public.is_org_member(org_id, null::text[]));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_members'
        and policyname = 'org_members_insert_admin'
    ) then
      create policy org_members_insert_admin
        on public.org_members
        for insert
        to authenticated
        with check (public.is_org_member(org_id, array['owner','admin']));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_members'
        and policyname = 'org_members_update_admin'
    ) then
      create policy org_members_update_admin
        on public.org_members
        for update
        to authenticated
        using (public.is_org_member(org_id, array['owner','admin']))
        with check (public.is_org_member(org_id, array['owner','admin']));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_members'
        and policyname = 'org_members_delete_admin'
    ) then
      create policy org_members_delete_admin
        on public.org_members
        for delete
        to authenticated
        using (public.is_org_member(org_id, array['owner','admin']));
    end if;
  end if;
end
$$;

-- projects: isolate data by organization
do $$
begin
  if to_regclass('public.projects') is null then
    raise notice 'projects table not found; skipping projects RLS';
  else
    alter table public.projects enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'projects'
        and policyname = 'projects_select_member'
    ) then
      create policy projects_select_member
        on public.projects
        for select
        to authenticated
        using (public.is_org_member(org_id, null::text[]));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'projects'
        and policyname = 'projects_insert_editor'
    ) then
      create policy projects_insert_editor
        on public.projects
        for insert
        to authenticated
        with check (public.is_org_member(org_id, array['owner','admin','editor','manager']));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'projects'
        and policyname = 'projects_update_editor'
    ) then
      create policy projects_update_editor
        on public.projects
        for update
        to authenticated
        using (public.is_org_member(org_id, array['owner','admin','editor','manager']))
        with check (public.is_org_member(org_id, array['owner','admin','editor','manager']));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'projects'
        and policyname = 'projects_delete_admin'
    ) then
      create policy projects_delete_admin
        on public.projects
        for delete
        to authenticated
        using (public.is_org_member(org_id, array['owner','admin']));
    end if;
  end if;
end
$$;

-- org_usage: quotas/usage metrics are sensitive
do $$
begin
  if to_regclass('public.org_usage') is null then
    raise notice 'org_usage table not found; skipping org_usage RLS';
  else
    alter table public.org_usage enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_usage'
        and policyname = 'org_usage_select_admin'
    ) then
      create policy org_usage_select_admin
        on public.org_usage
        for select
        to authenticated
        using (public.is_org_member(org_id, array['owner','admin']));
    end if;
  end if;
end
$$;

-- plans: hide internal limit config from anon
do $$
begin
  if to_regclass('public.plans') is null then
    raise notice 'plans table not found; skipping plans RLS';
  else
    alter table public.plans enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'plans'
        and policyname = 'plans_select_authenticated'
    ) then
      create policy plans_select_authenticated
        on public.plans
        for select
        to authenticated
        using (auth.uid() is not null);
    end if;
  end if;
end
$$;

-- org_subscriptions (legacy billing path)
do $$
begin
  if to_regclass('public.org_subscriptions') is null then
    raise notice 'org_subscriptions table not found; skipping org_subscriptions RLS';
  else
    alter table public.org_subscriptions enable row level security;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_subscriptions'
        and policyname = 'org_subscriptions_select_member'
    ) then
      create policy org_subscriptions_select_member
        on public.org_subscriptions
        for select
        to authenticated
        using (public.is_org_member(org_id, null::text[]));
    end if;

    if not exists (
      select 1 from pg_policies
      where schemaname = 'public'
        and tablename = 'org_subscriptions'
        and policyname = 'org_subscriptions_modify_admin'
    ) then
      create policy org_subscriptions_modify_admin
        on public.org_subscriptions
        for all
        to authenticated
        using (public.is_org_member(org_id, array['owner','admin']))
        with check (public.is_org_member(org_id, array['owner','admin']));
    end if;
  end if;
end
$$;
