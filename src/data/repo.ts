export type ProjectStatus = 'active' | 'paused' | 'completed';
export type ProjectStage = 'foundation' | 'structure' | 'finishing';

export interface Project {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address: string;
  status: ProjectStatus;
  stage: ProjectStage;
  budget: number;
  actual: number;
  committed: number;
  forecast: number;
  progress: number;
  startDate: string;
  endDate: string;
  alertCount: number;
  manager: string;
}

export interface ProjectInput {
  code: string;
  name: string;
  address: string;
  status: ProjectStatus;
  stage: ProjectStage;
  manager: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface Repo {
  listProjects: () => Promise<Project[]>;
  createProject: (input: ProjectInput) => Promise<Project>;
}
