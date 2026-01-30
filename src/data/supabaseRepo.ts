import { supabase } from '@/lib/supabaseClient';
import type { Project, ProjectInput, Repo } from './repo';

const TABLE = 'projects';

export const supabaseRepo: Repo = {
  listProjects: async () => {
    const { data, error } = await supabase.from(TABLE).select('*');
    if (error) throw error;
    return (data ?? []) as Project[];
  },
  createProject: async (input: ProjectInput) => {
    const payload = {
      tenantId: input.tenantId ?? null,
      code: input.code,
      name: input.name,
      address: input.address,
      status: input.status,
      stage: input.stage,
      manager: input.manager,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
      actual: 0,
      committed: 0,
      forecast: input.budget,
      progress: 0,
      alertCount: 0,
    };
    const { data, error } = await supabase.from(TABLE).insert(payload).select('*').single();
    if (error) throw error;
    return data as Project;
  },
};
