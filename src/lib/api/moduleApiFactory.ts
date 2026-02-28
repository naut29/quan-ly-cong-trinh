import type { ProjectModuleKey, UpsertProjectModuleRecordInput } from "@/lib/api/projectModuleRecords";
import {
  createProjectModuleRecord,
  deleteProjectModuleRecord,
  listProjectModuleRecords,
  updateProjectModuleRecord,
} from "@/lib/api/projectModuleRecords";

export const createProjectModuleApi = (moduleKey: ProjectModuleKey) => ({
  list: (orgId: string, projectId: string) => listProjectModuleRecords(orgId, projectId, moduleKey),
  create: (orgId: string, projectId: string, input: UpsertProjectModuleRecordInput) =>
    createProjectModuleRecord(orgId, projectId, moduleKey, input),
  update: (recordId: string, input: UpsertProjectModuleRecordInput) =>
    updateProjectModuleRecord(recordId, input),
  remove: (recordId: string) => deleteProjectModuleRecord(recordId),
});
