import { isDemoPath } from '@/lib/appMode';
import { demoRepo } from './demoRepo';
import { supabaseRepo } from './supabaseRepo';

export const getRepo = (pathname: string = window.location.pathname) =>
  isDemoPath(pathname) ? demoRepo : supabaseRepo;
