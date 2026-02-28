export type RolesMatrixMode = "app" | "demo";

export interface RolesMatrixRole {
  id: string;
  label: string;
}

export interface RolesMatrixPermissionCell {
  view: boolean;
  edit: boolean;
  approve: boolean;
}

export interface PermissionMatrixRow {
  module: string;
  label: string;
  supportsApprove: boolean;
  permissions: Record<string, RolesMatrixPermissionCell>;
}

export type PermissionMatrix = PermissionMatrixRow[];
