create extension if not exists "pgcrypto";

-- organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tax_code text,
  address text,
  phone text,
  email text,
  website text,
  representative_name text,
  representative_title text,
  description text,
  plan text not null default 'starter',
  created_at timestamptz not null default now()
);

alter table public.organizations add column if not exists tax_code text;
alter table public.organizations add column if not exists address text;
alter table public.organizations add column if not exists phone text;
alter table public.organizations add column if not exists email text;
alter table public.organizations add column if not exists website text;
alter table public.organizations add column if not exists representative_name text;
alter table public.organizations add column if not exists representative_title text;
alter table public.organizations add column if not exists description text;
alter table public.organizations add column if not exists plan text;
alter table public.organizations add column if not exists created_at timestamptz default now();

update public.organizations set plan = 'starter' where plan is null;

-- org members
create table if not exists public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.org_members add column if not exists status text;
alter table public.org_members add column if not exists created_at timestamptz default now();

update public.org_members set status = 'active' where status is null;

create unique index if not exists org_members_org_user_unique_idx
  on public.org_members (org_id, user_id);

-- projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  code text,
  status text not null default 'active',
  budget numeric,
  progress integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.projects add column if not exists org_id uuid;
alter table public.projects add column if not exists code text;
alter table public.projects add column if not exists status text;
alter table public.projects add column if not exists budget numeric;
alter table public.projects add column if not exists progress integer;
alter table public.projects add column if not exists created_at timestamptz default now();
alter table public.projects add column if not exists address text;
alter table public.projects add column if not exists stage text;
alter table public.projects add column if not exists actual numeric;
alter table public.projects add column if not exists committed numeric;
alter table public.projects add column if not exists forecast numeric;
alter table public.projects add column if not exists start_date date;
alter table public.projects add column if not exists end_date date;
alter table public.projects add column if not exists alert_count integer;
alter table public.projects add column if not exists manager text;

update public.projects set status = 'active' where status is null;
update public.projects set progress = 0 where progress is null;
update public.projects set alert_count = 0 where alert_count is null;

create index if not exists projects_org_id_idx on public.projects(org_id);

-- project assignments
create table if not exists public.project_assignments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create unique index if not exists project_assignments_project_user_unique_idx
  on public.project_assignments (project_id, user_id);

create index if not exists project_assignments_user_idx on public.project_assignments(user_id);

-- activity logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  module text not null,
  description text,
  ip text,
  status text not null default 'success',
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_org_created_idx
  on public.activity_logs (org_id, created_at desc);

-- billing tables
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  plan text not null default 'starter',
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists subscriptions_org_unique_idx
  on public.subscriptions (org_id);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  invoice_no text not null,
  amount numeric not null default 0,
  currency text not null default 'VND',
  status text not null default 'pending',
  issued_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists invoices_org_invoice_no_unique_idx
  on public.invoices (org_id, invoice_no);

create index if not exists invoices_org_issued_idx
  on public.invoices (org_id, issued_at desc);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  created_at timestamptz not null default now()
);

create index if not exists payment_methods_org_idx on public.payment_methods(org_id);

-- profiles (for member lookup by email)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  org_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists org_id uuid;
alter table public.profiles add column if not exists created_at timestamptz default now();

create unique index if not exists profiles_email_lower_unique_idx
  on public.profiles (lower(email))
  where email is not null;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id)
  do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

-- membership helpers
drop function if exists public.ensure_org_subscription(uuid);
drop function if exists public.is_org_active(uuid);
drop function if exists public.list_org_members(uuid);

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
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and (p_roles is null or m.role::text = any(p_roles))
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
    where m.org_id = p_org_id
      and m.user_id = auth.uid()
      and m.role::text in ('owner', 'admin')
  );
$$;

revoke all on function public.is_org_member(uuid, text[]) from public;
revoke all on function public.is_org_admin(uuid) from public;
grant execute on function public.is_org_member(uuid, text[]) to authenticated;
grant execute on function public.is_org_admin(uuid) to authenticated;

create or replace function public.ensure_org_subscription(p_org_id uuid)
returns public.subscriptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text := 'starter';
  v_row public.subscriptions;
begin
  if p_org_id is null then
    return null;
  end if;

  select coalesce(o.plan, 'starter')
  into v_plan
  from public.organizations o
  where o.id = p_org_id;

  insert into public.subscriptions (
    org_id,
    plan,
    status,
    current_period_start,
    current_period_end,
    updated_at
  )
  values (
    p_org_id,
    v_plan,
    'active',
    now(),
    now() + interval '30 days',
    now()
  )
  on conflict (org_id)
  do update set
    plan = coalesce(public.subscriptions.plan, excluded.plan),
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

create or replace function public.is_org_active(org_id uuid)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_status text;
begin
  if org_id is null then
    return false;
  end if;

  if not public.is_org_member(org_id, null::text[]) then
    return false;
  end if;

  select s.status
  into v_status
  from public.subscriptions s
  where s.org_id = org_id
  order by s.updated_at desc nulls last
  limit 1;

  if v_status is null then
    return true;
  end if;

  return v_status not in ('inactive', 'cancelled', 'expired');
end;
$$;

create or replace function public.list_org_members(p_org_id uuid)
returns table (
  org_id uuid,
  user_id uuid,
  role text,
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
    m.role,
    m.status,
    m.created_at,
    p.email,
    p.full_name
  from public.org_members m
  left join public.profiles p on p.id = m.user_id
  where m.org_id = p_org_id
    and public.is_org_member(p_org_id, null::text[])
  order by m.created_at asc;
$$;

revoke all on function public.ensure_org_subscription(uuid) from public;
revoke all on function public.is_org_active(uuid) from public;
revoke all on function public.list_org_members(uuid) from public;
grant execute on function public.ensure_org_subscription(uuid) to authenticated;
grant execute on function public.is_org_active(uuid) to authenticated;
grant execute on function public.list_org_members(uuid) to authenticated;

-- RLS
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_assignments enable row level security;
alter table public.activity_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_methods enable row level security;
alter table public.profiles enable row level security;

-- organizations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'organizations_select_member_live'
  ) THEN
    CREATE POLICY organizations_select_member_live
      ON public.organizations
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'organizations_update_admin_live'
  ) THEN
    CREATE POLICY organizations_update_admin_live
      ON public.organizations
      FOR UPDATE
      TO authenticated
      USING (public.is_org_admin(id))
      WITH CHECK (public.is_org_admin(id));
  END IF;
END
$$;

-- org_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'org_members' AND policyname = 'org_members_select_member_live'
  ) THEN
    CREATE POLICY org_members_select_member_live
      ON public.org_members
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'org_members' AND policyname = 'org_members_insert_admin_live'
  ) THEN
    CREATE POLICY org_members_insert_admin_live
      ON public.org_members
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_org_admin(org_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'org_members' AND policyname = 'org_members_update_admin_live'
  ) THEN
    CREATE POLICY org_members_update_admin_live
      ON public.org_members
      FOR UPDATE
      TO authenticated
      USING (public.is_org_admin(org_id))
      WITH CHECK (public.is_org_admin(org_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'org_members' AND policyname = 'org_members_delete_admin_live'
  ) THEN
    CREATE POLICY org_members_delete_admin_live
      ON public.org_members
      FOR DELETE
      TO authenticated
      USING (public.is_org_admin(org_id));
  END IF;
END
$$;

-- projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'projects_select_member_live'
  ) THEN
    CREATE POLICY projects_select_member_live
      ON public.projects
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'projects_insert_member_live'
  ) THEN
    CREATE POLICY projects_insert_member_live
      ON public.projects
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'projects' AND policyname = 'projects_update_member_live'
  ) THEN
    CREATE POLICY projects_update_member_live
      ON public.projects
      FOR UPDATE
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]))
      WITH CHECK (public.is_org_member(org_id, null::text[]));
  END IF;
END
$$;

-- project_assignments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_assignments' AND policyname = 'project_assignments_select_member_live'
  ) THEN
    CREATE POLICY project_assignments_select_member_live
      ON public.project_assignments
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.id = project_assignments.project_id
            AND public.is_org_member(p.org_id, null::text[])
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'project_assignments' AND policyname = 'project_assignments_modify_member_live'
  ) THEN
    CREATE POLICY project_assignments_modify_member_live
      ON public.project_assignments
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.id = project_assignments.project_id
            AND public.is_org_member(p.org_id, null::text[])
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.projects p
          WHERE p.id = project_assignments.project_id
            AND public.is_org_member(p.org_id, null::text[])
        )
      );
  END IF;
END
$$;

-- activity_logs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'activity_logs' AND policyname = 'activity_logs_select_member_live'
  ) THEN
    CREATE POLICY activity_logs_select_member_live
      ON public.activity_logs
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'activity_logs' AND policyname = 'activity_logs_insert_member_live'
  ) THEN
    CREATE POLICY activity_logs_insert_member_live
      ON public.activity_logs
      FOR INSERT
      TO authenticated
      WITH CHECK (
        public.is_org_member(org_id, null::text[])
        AND actor_user_id = auth.uid()
      );
  END IF;
END
$$;

-- billing tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'subscriptions_select_member_live'
  ) THEN
    CREATE POLICY subscriptions_select_member_live
      ON public.subscriptions
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'subscriptions_modify_admin_live'
  ) THEN
    CREATE POLICY subscriptions_modify_admin_live
      ON public.subscriptions
      FOR ALL
      TO authenticated
      USING (public.is_org_admin(org_id))
      WITH CHECK (public.is_org_admin(org_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'invoices_select_member_live'
  ) THEN
    CREATE POLICY invoices_select_member_live
      ON public.invoices
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'invoices_modify_admin_live'
  ) THEN
    CREATE POLICY invoices_modify_admin_live
      ON public.invoices
      FOR ALL
      TO authenticated
      USING (public.is_org_admin(org_id))
      WITH CHECK (public.is_org_admin(org_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_methods' AND policyname = 'payment_methods_select_member_live'
  ) THEN
    CREATE POLICY payment_methods_select_member_live
      ON public.payment_methods
      FOR SELECT
      TO authenticated
      USING (public.is_org_member(org_id, null::text[]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'payment_methods' AND policyname = 'payment_methods_modify_admin_live'
  ) THEN
    CREATE POLICY payment_methods_modify_admin_live
      ON public.payment_methods
      FOR ALL
      TO authenticated
      USING (public.is_org_admin(org_id))
      WITH CHECK (public.is_org_admin(org_id));
  END IF;
END
$$;

-- profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_select_authenticated_live'
  ) THEN
    CREATE POLICY profiles_select_authenticated_live
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() is not null);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_insert_self_live'
  ) THEN
    CREATE POLICY profiles_insert_self_live
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_update_self_live'
  ) THEN
    CREATE POLICY profiles_update_self_live
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END
$$;
