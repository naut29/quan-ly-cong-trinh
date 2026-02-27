import { projects as seedProjects, tenants } from '@/data/mockData';
import { DEMO_STORAGE_PREFIX } from '@/lib/demoStorage';
import type { Project, ProjectInput, Repo } from './repo';

const LEGACY_DEMO_PROJECTS_KEY = 'demo_projects_store';
export const DEMO_PROJECTS_KEY = `${DEMO_STORAGE_PREFIX}projects_store`;

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage;
};

const loadProjects = (): Project[] => {
  const storage = getStorage();
  const raw = storage?.getItem(DEMO_PROJECTS_KEY) ?? storage?.getItem(LEGACY_DEMO_PROJECTS_KEY);
  if (!raw) return seedProjects;
  try {
    const projects = JSON.parse(raw) as Project[];
    storage?.setItem(DEMO_PROJECTS_KEY, JSON.stringify(projects));
    storage?.removeItem(LEGACY_DEMO_PROJECTS_KEY);
    return projects;
  } catch {
    storage?.removeItem(DEMO_PROJECTS_KEY);
    storage?.removeItem(LEGACY_DEMO_PROJECTS_KEY);
    return seedProjects;
  }
};

const saveProjects = (projects: Project[]) => {
  const storage = getStorage();
  storage?.setItem(DEMO_PROJECTS_KEY, JSON.stringify(projects));
  storage?.removeItem(LEGACY_DEMO_PROJECTS_KEY);
};

let cachedProjects: Project[] | null = null;

const getProjects = () => {
  if (!cachedProjects) {
    cachedProjects = loadProjects();
  }
  return cachedProjects;
};

export const purgeDemoProjects = () => {
  cachedProjects = null;
  const storage = getStorage();
  storage?.removeItem(DEMO_PROJECTS_KEY);
  storage?.removeItem(LEGACY_DEMO_PROJECTS_KEY);
};

const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const demoRepo: Repo = {
  listProjects: async () => {
    return [...getProjects()];
  },
  createProject: async (input: ProjectInput) => {
    const tenantId = tenants[0]?.id || 'tenant-demo';
    const newProject: Project = {
      id: generateId(),
      tenantId,
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
    const projects = [newProject, ...getProjects()];
    cachedProjects = projects;
    saveProjects(projects);
    return newProject;
  },
};
