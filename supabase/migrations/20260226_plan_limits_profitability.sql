create extension if not exists "pgcrypto";

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  price_vnd bigint,
  cta_label text,
  limits jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'plans_code_key'
      and conrelid = 'public.plans'::regclass
  ) then
    alter table public.plans add constraint plans_code_key unique (code);
  end if;
end
$$;

insert into public.plans (id, code, name, price_vnd, cta_label, limits)
values
  (
    '11111111-1111-4111-8111-111111111111',
    'starter',
    'Starter',
    990000,
    null,
    jsonb_build_object(
      'max_members', 10,
      'max_active_projects', 10,
      'max_storage_mb', 30720,
      'max_upload_mb_per_day', 2048,
      'max_file_mb', 50,
      'max_download_gb_per_month', 200,
      'export_per_day', 30,
      'approval_enabled', 'none',
      'support', 'email_standard'
    )
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'pro',
    'Pro',
    3000000,
    null,
    jsonb_build_object(
      'max_members', 30,
      'max_active_projects', 30,
      'max_storage_mb', 204800,
      'max_upload_mb_per_day', 10240,
      'max_file_mb', 200,
      'max_download_gb_per_month', 1024,
      'export_per_day', null,
      'approval_enabled', 'multi_step',
      'support', 'priority'
    )
  ),
  (
    '33333333-3333-4333-8333-333333333333',
    'enterprise',
    'Enterprise',
    5000000,
    'Contact',
    jsonb_build_object(
      'max_members', null,
      'max_active_projects', null,
      'max_storage_mb', 512000,
      'max_upload_mb_per_day', null,
      'max_file_mb', null,
      'max_download_gb_per_month', null,
      'export_per_day', null,
      'approval_enabled', 'multi_step',
      'support', 'sla'
    )
  )
on conflict (code)
do update set
  name = excluded.name,
  price_vnd = excluded.price_vnd,
  cta_label = excluded.cta_label,
  limits = excluded.limits,
  updated_at = now();

do $$
begin
  if to_regclass('public.organizations') is null then
    raise notice 'organizations table not found; skipped plan columns';
  else
    alter table public.organizations
      add column if not exists plan_id uuid,
      add column if not exists plan_overrides jsonb;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'organizations_plan_id_fkey'
        and conrelid = 'public.organizations'::regclass
    ) then
      alter table public.organizations
        add constraint organizations_plan_id_fkey
        foreign key (plan_id)
        references public.plans(id);
    end if;

    update public.organizations
    set plan_id = '11111111-1111-4111-8111-111111111111'
    where plan_id is null;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.organizations') is null then
    raise notice 'organizations table not found; skipped org_usage table';
  else
    create table if not exists public.org_usage (
      org_id uuid primary key references public.organizations(id) on delete cascade,
      members_count integer not null default 0,
      active_projects_count integer not null default 0,
      storage_used_mb numeric(14,2) not null default 0,
      download_used_gb_month numeric(14,3) not null default 0,
      upload_used_mb_day numeric(14,2) not null default 0,
      export_used_day integer not null default 0,
      month_key text not null default to_char(timezone('utc', now()), 'YYYY-MM'),
      day_key date not null default (timezone('utc', now()))::date,
      updated_at timestamptz not null default now()
    );

    insert into public.org_usage (org_id)
    select o.id
    from public.organizations o
    on conflict (org_id) do nothing;
  end if;
end
$$;

create or replace function public.ensure_org_usage_row(p_org_id uuid)
returns public.org_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month_key text := to_char(timezone('utc', now()), 'YYYY-MM');
  v_day_key date := (timezone('utc', now()))::date;
  v_members_count integer := 0;
  v_active_projects_count integer := 0;
  v_usage public.org_usage;
begin
  if p_org_id is null then
    return null;
  end if;

  insert into public.org_usage (org_id, month_key, day_key)
  values (p_org_id, v_month_key, v_day_key)
  on conflict (org_id) do nothing;

  if to_regclass('public.org_members') is not null then
    execute 'select count(*)::int from public.org_members where org_id = $1'
      into v_members_count
      using p_org_id;
  end if;

  if to_regclass('public.projects') is not null then
    execute 'select count(*)::int from public.projects where org_id = $1'
      into v_active_projects_count
      using p_org_id;
  end if;

  update public.org_usage
  set
    members_count = greatest(v_members_count, 0),
    active_projects_count = greatest(v_active_projects_count, 0),
    download_used_gb_month = case
      when month_key = v_month_key then download_used_gb_month
      else 0
    end,
    month_key = v_month_key,
    upload_used_mb_day = case
      when day_key = v_day_key then upload_used_mb_day
      else 0
    end,
    export_used_day = case
      when day_key = v_day_key then export_used_day
      else 0
    end,
    day_key = v_day_key,
    updated_at = now()
  where org_id = p_org_id
  returning * into v_usage;

  return v_usage;
end;
$$;

create or replace function public.get_org_plan_context(p_org_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org record;
  v_limits jsonb := '{}'::jsonb;
  v_plan_code text := null;
  v_plan_name text := null;
  v_usage public.org_usage;
begin
  if auth.uid() is null then
    return null;
  end if;

  if p_org_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.org_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
  ) then
    return null;
  end if;

  select o.id, o.plan_id, o.plan_overrides
  into v_org
  from public.organizations o
  where o.id = p_org_id;

  if v_org.id is null then
    return null;
  end if;

  if v_org.plan_id is null then
    update public.organizations
    set plan_id = '11111111-1111-4111-8111-111111111111'
    where id = p_org_id
      and plan_id is null;

    select o.id, o.plan_id, o.plan_overrides
    into v_org
    from public.organizations o
    where o.id = p_org_id;
  end if;

  select p.code, p.name, coalesce(p.limits, '{}'::jsonb)
  into v_plan_code, v_plan_name, v_limits
  from public.plans p
  where p.id = v_org.plan_id;

  v_usage := public.ensure_org_usage_row(p_org_id);

  return jsonb_build_object(
    'org_id', p_org_id,
    'plan_id', v_org.plan_id,
    'plan_code', v_plan_code,
    'plan_name', v_plan_name,
    'base_limits', v_limits,
    'overrides', coalesce(v_org.plan_overrides, '{}'::jsonb),
    'limits', v_limits || coalesce(v_org.plan_overrides, '{}'::jsonb),
    'usage', to_jsonb(v_usage)
  );
end;
$$;

create or replace function public.record_org_usage_event(
  p_org_id uuid,
  p_event text,
  p_amount numeric default 0
)
returns public.org_usage
language plpgsql
security definer
set search_path = public
as $$
declare
  v_usage public.org_usage;
  v_amount numeric := greatest(coalesce(p_amount, 0), 0);
begin
  if auth.uid() is null then
    return null;
  end if;

  if p_org_id is null then
    return null;
  end if;

  if not exists (
    select 1
    from public.org_members m
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
  ) then
    return null;
  end if;

  v_usage := public.ensure_org_usage_row(p_org_id);

  if p_event = 'download' then
    update public.org_usage
    set
      download_used_gb_month = download_used_gb_month + v_amount,
      updated_at = now()
    where org_id = p_org_id
    returning * into v_usage;
  elsif p_event = 'upload' then
    update public.org_usage
    set
      upload_used_mb_day = upload_used_mb_day + v_amount,
      updated_at = now()
    where org_id = p_org_id
    returning * into v_usage;
  elsif p_event = 'export' then
    update public.org_usage
    set
      export_used_day = export_used_day + 1,
      download_used_gb_month = download_used_gb_month + v_amount,
      updated_at = now()
    where org_id = p_org_id
    returning * into v_usage;
  end if;

  return v_usage;
end;
$$;

revoke all on function public.ensure_org_usage_row(uuid) from public;
revoke all on function public.get_org_plan_context(uuid) from public;
revoke all on function public.record_org_usage_event(uuid, text, numeric) from public;

grant execute on function public.get_org_plan_context(uuid) to authenticated;
grant execute on function public.record_org_usage_event(uuid, text, numeric) to authenticated;
