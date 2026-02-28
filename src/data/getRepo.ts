import { isDemoPath } from '@/lib/appMode';
import { demoRepo } from './demoRepo';
import { createSupabaseRepo, supabaseRepo } from './supabaseRepo';

export const getRepo = (
  pathname: string = window.location.pathname,
  companyId?: string | null,
) => {
  if (isDemoPath(pathname)) {
    return demoRepo;
  }

  if (companyId) {
    return createSupabaseRepo(companyId);
  }

  return supabaseRepo;
};
