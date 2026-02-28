do $$
begin
  if to_regclass('public.organizations') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'organizations'
      and policyname = 'organizations_select_super_admin'
  ) then
    create policy organizations_select_super_admin
      on public.organizations
      for select
      to authenticated
      using (public.is_super_admin());
  end if;

  if to_regclass('public.org_members') is not null and not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'org_members'
      and policyname = 'org_members_select_super_admin'
  ) then
    create policy org_members_select_super_admin
      on public.org_members
      for select
      to authenticated
      using (public.is_super_admin());
  end if;
end
$$;
