import { createProject, deleteProject, listProjectsByOrg, updateProject } from "@/lib/api/projects";
import type { Project, ProjectInput, Repo } from './repo';

export const createSupabaseRepo = (companyId: string): Repo => ({
  listProjects: async () => {
    return listProjectsByOrg(companyId) as Promise<Project[]>;
  },
  createProject: async (input: ProjectInput) => {
    if (!companyId) {
      throw new Error('Missing company_id for project creation.');
    }
    return createProject(companyId, {
      code: input.code,
      name: input.name,
      address: input.address,
      status: input.status,
      stage: input.stage,
      manager: input.manager,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
    }) as Promise<Project>;
  },
  updateProject: async (projectId: string, input: ProjectInput) => {
    if (!companyId) {
      throw new Error('Missing company_id for project update.');
    }
    return updateProject(companyId, projectId, {
      code: input.code,
      name: input.name,
      address: input.address,
      status: input.status,
      stage: input.stage,
      manager: input.manager,
      startDate: input.startDate,
      endDate: input.endDate,
      budget: input.budget,
    }) as Promise<Project>;
  },
  deleteProject: async (projectId: string) => {
    if (!companyId) {
      throw new Error('Missing company_id for project delete.');
    }
    await deleteProject(companyId, projectId);
  },
});

export const supabaseRepo = createSupabaseRepo("");
