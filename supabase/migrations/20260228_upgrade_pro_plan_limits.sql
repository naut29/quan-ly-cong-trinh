do $$
begin
  if to_regclass('public.plans') is null then
    raise notice 'plans table not found; skipping pro plan upgrade';
    return;
  end if;

  insert into public.plans (id, code, name, price_vnd, cta_label, limits)
  values (
    '22222222-2222-4222-8222-222222222222',
    'pro',
    'Pro',
    3000000,
    null,
    jsonb_build_object(
      'max_members', 50,
      'max_active_projects', 50,
      'max_storage_mb', 307200,
      'max_upload_mb_per_day', 20480,
      'max_file_mb', 500,
      'max_download_gb_per_month', 3072,
      'export_per_day', null,
      'approval_enabled', 'multi_step',
      'support', 'priority'
    )
  )
  on conflict (code)
  do update set
    name = excluded.name,
    price_vnd = excluded.price_vnd,
    cta_label = excluded.cta_label,
    limits = excluded.limits,
    updated_at = now();
end
$$;
