create extension if not exists "pgcrypto";

-- Company members
create table if not exists public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  user_id uuid references auth.users(id),
  email text not null,
  role text not null check (role in ('owner','admin','editor','viewer')),
  status text not null check (status in ('invited','active','disabled')),
  invited_by uuid references auth.users(id),
  invited_at timestamptz default now(),
  accepted_at timestamptz
);

create unique index if not exists company_members_company_email_idx
  on public.company_members (company_id, email);

-- Invites
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  email text not null,
  role text not null check (role in ('owner','admin','editor','viewer')),
  token text unique not null,
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz default now(),
  accepted_at timestamptz,
  revoked_at timestamptz
);

-- Audit logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- Approval requests
create table if not exists public.approval_requests (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id),
  entity_type text not null,
  entity_id uuid not null,
  status text not null check (status in ('draft','submitted','approved','rejected','cancelled')),
  submitted_by uuid references auth.users(id),
  submitted_at timestamptz,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  decision_note text,
  created_at timestamptz default now()
);

alter table public.company_members enable row level security;
alter table public.invites enable row level security;
alter table public.audit_logs enable row level security;
alter table public.approval_requests enable row level security;

-- Company members policies
create policy "members_can_read_own_membership"
  on public.company_members
  for select
  using (auth.uid() = user_id);

create policy "admins_can_read_members"
  on public.company_members
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = company_members.company_id
        and p.role in ('owner','admin')
    )
  );

-- Invites policies (read only for admins)
create policy "admins_can_read_invites"
  on public.invites
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = invites.company_id
        and p.role in ('owner','admin')
    )
  );

-- Audit logs readable by admins
create policy "admins_can_read_audit_logs"
  on public.audit_logs
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = audit_logs.company_id
        and p.role in ('owner','admin')
    )
  );

-- Approval requests policies
create policy "members_can_read_approvals"
  on public.approval_requests
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.company_id = approval_requests.company_id
    )
  );
