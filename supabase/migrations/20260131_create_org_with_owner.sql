drop function if exists public.create_organization_with_owner(text, text);

create or replace function public.create_organization_with_owner(p_name text, p_slug text)
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org public.organizations;
begin
  insert into public.organizations (name, slug)
  values (p_name, p_slug)
  returning * into new_org;

  insert into public.org_members (org_id, user_id, role)
  values (new_org.id, auth.uid(), 'owner')
  on conflict do nothing;

  return new_org;
end;
$$;
