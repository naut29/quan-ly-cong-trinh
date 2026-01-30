import { supabase } from '@/lib/supabaseClient';
import type { Project, ProjectInput, Repo } from './repo';

const TABLE = 'projects';

const mapProject = (row: any, companyId: string): Project => ({
  id: row.id,
  tenantId: row.company_id ?? companyId,
  code: row.code ?? row.name ?? 'PRJ',
  name: row.name ?? 'Untitled',
  address: row.address ?? '',
  status: row.status ?? 'active',
  stage: row.stage ?? 'foundation',
  budget: row.budget ?? 0,
  actual: row.actual ?? 0,
  committed: row.committed ?? 0,
  forecast: row.forecast ?? row.budget ?? 0,
  progress: row.progress ?? 0,
  startDate: row.start_date ?? row.startDate ?? row.created_at ?? '',
  endDate: row.end_date ?? row.endDate ?? '',
  alertCount: row.alert_count ?? row.alertCount ?? 0,
  manager: row.manager ?? '',
});

export const createSupabaseRepo = (companyId: string): Repo => ({
  listProjects: async () => {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('company_id', companyId);
    if (error) throw error;
    return (data ?? []).map((row) => mapProject(row, companyId));
  },
  createProject: async (input: ProjectInput) => {
    if (!companyId) {
      throw new Error('Missing company_id for project creation.');
    }
    const payload = {
      company_id: companyId,
      name: input.name,
    };
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) throw error;
    return mapProject(data, companyId);
  },
});
