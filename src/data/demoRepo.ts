import { projects as seedProjects, tenants } from "@/data/mockData";
import type { Project, ProjectInput, Repo } from "./repo";

const generateId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const purgeDemoProjects = () => {
  // Demo mode is fully fixture-based now. Keep this no-op for legacy callers.
};

export const demoRepo: Repo = {
  listProjects: async () => [...seedProjects],
  createProject: async (input: ProjectInput) => {
    const tenantId = tenants[0]?.id || "tenant-demo";

    return {
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
    } satisfies Project;
  },
};
