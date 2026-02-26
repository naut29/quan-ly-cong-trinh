export type ApprovalMode = "none" | "multi_step";
export type SupportTier = "email_standard" | "priority" | "sla";

export interface PlanLimits {
  max_members: number | null;
  max_active_projects: number | null;
  max_storage_mb: number | null;
  max_upload_mb_per_day: number | null;
  max_file_mb: number | null;
  max_download_gb_per_month: number | null;
  export_per_day: number | null;
  approval_enabled: ApprovalMode;
  support: SupportTier;
}

export interface OrgUsage {
  members_count: number;
  active_projects_count: number;
  storage_used_mb: number;
  download_used_gb_month: number;
  upload_used_mb_day: number;
  export_used_day: number;
  month_key: string;
  day_key: string;
  updated_at: string;
}

export interface GuardDecision {
  allowed: boolean;
  reason?: string;
}

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toNumberOrZero = (value: unknown): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const toApprovalMode = (value: unknown): ApprovalMode => {
  if (value === "multi_step") return "multi_step";
  return "none";
};

const toSupportTier = (value: unknown): SupportTier => {
  if (value === "priority" || value === "sla") return value;
  return "email_standard";
};

const defaultPlanLimits: PlanLimits = {
  max_members: null,
  max_active_projects: null,
  max_storage_mb: null,
  max_upload_mb_per_day: null,
  max_file_mb: null,
  max_download_gb_per_month: null,
  export_per_day: null,
  approval_enabled: "none",
  support: "email_standard",
};

const defaultOrgUsage: OrgUsage = {
  members_count: 0,
  active_projects_count: 0,
  storage_used_mb: 0,
  download_used_gb_month: 0,
  upload_used_mb_day: 0,
  export_used_day: 0,
  month_key: "",
  day_key: "",
  updated_at: "",
};

export const normalizePlanLimits = (value: unknown): PlanLimits => {
  const limits = (value ?? {}) as Record<string, unknown>;
  return {
    max_members: toNumberOrNull(limits.max_members),
    max_active_projects: toNumberOrNull(limits.max_active_projects),
    max_storage_mb: toNumberOrNull(limits.max_storage_mb),
    max_upload_mb_per_day: toNumberOrNull(limits.max_upload_mb_per_day),
    max_file_mb: toNumberOrNull(limits.max_file_mb),
    max_download_gb_per_month: toNumberOrNull(limits.max_download_gb_per_month),
    export_per_day: toNumberOrNull(limits.export_per_day),
    approval_enabled: toApprovalMode(limits.approval_enabled),
    support: toSupportTier(limits.support),
  };
};

export const normalizeOrgUsage = (value: unknown): OrgUsage => {
  const usage = (value ?? {}) as Record<string, unknown>;
  return {
    members_count: toNumberOrZero(usage.members_count),
    active_projects_count: toNumberOrZero(usage.active_projects_count),
    storage_used_mb: toNumberOrZero(usage.storage_used_mb),
    download_used_gb_month: toNumberOrZero(usage.download_used_gb_month),
    upload_used_mb_day: toNumberOrZero(usage.upload_used_mb_day),
    export_used_day: toNumberOrZero(usage.export_used_day),
    month_key: typeof usage.month_key === "string" ? usage.month_key : "",
    day_key: typeof usage.day_key === "string" ? usage.day_key : "",
    updated_at: typeof usage.updated_at === "string" ? usage.updated_at : "",
  };
};

export const getDefaultPlanLimits = (): PlanLimits => ({ ...defaultPlanLimits });
export const getDefaultOrgUsage = (): OrgUsage => ({ ...defaultOrgUsage });

const exceedsLimit = (nextValue: number, limit: number | null) =>
  limit !== null && nextValue > limit;

export const canInviteMember = (
  limits: PlanLimits,
  usage: OrgUsage,
  membersToInvite = 1,
): GuardDecision => {
  const nextCount = usage.members_count + Math.max(1, membersToInvite);
  if (exceedsLimit(nextCount, limits.max_members)) {
    return {
      allowed: false,
      reason: `Da dat gioi han thanh vien (${limits.max_members}).`,
    };
  }
  return { allowed: true };
};

export const canCreateProject = (
  limits: PlanLimits,
  usage: OrgUsage,
  projectsToCreate = 1,
): GuardDecision => {
  const nextCount = usage.active_projects_count + Math.max(1, projectsToCreate);
  if (exceedsLimit(nextCount, limits.max_active_projects)) {
    return {
      allowed: false,
      reason: `Da dat gioi han du an dang hoat dong (${limits.max_active_projects}).`,
    };
  }
  return { allowed: true };
};

export const canUpload = (
  limits: PlanLimits,
  usage: OrgUsage,
  uploadMb: number,
  fileMb: number,
): GuardDecision => {
  if (exceedsLimit(fileMb, limits.max_file_mb)) {
    return {
      allowed: false,
      reason: `Kich thuoc tep vuot gioi han ${limits.max_file_mb}MB.`,
    };
  }

  const nextUpload = usage.upload_used_mb_day + Math.max(0, uploadMb);
  if (exceedsLimit(nextUpload, limits.max_upload_mb_per_day)) {
    return {
      allowed: false,
      reason: `Da dung het luong upload/ngay (${limits.max_upload_mb_per_day}MB).`,
    };
  }

  return { allowed: true };
};

export const canDownload = (
  limits: PlanLimits,
  usage: OrgUsage,
  downloadGb: number,
): GuardDecision => {
  const nextDownload = usage.download_used_gb_month + Math.max(0, downloadGb);
  if (exceedsLimit(nextDownload, limits.max_download_gb_per_month)) {
    return {
      allowed: false,
      reason: `Da dung het bang thong tai xuong/thang (${limits.max_download_gb_per_month}GB).`,
    };
  }

  return { allowed: true };
};

export const canExport = (limits: PlanLimits, usage: OrgUsage): GuardDecision => {
  const nextCount = usage.export_used_day + 1;
  if (exceedsLimit(nextCount, limits.export_per_day)) {
    return {
      allowed: false,
      reason: `Da dat gioi han xuat du lieu/ngay (${limits.export_per_day}).`,
    };
  }

  return { allowed: true };
};

export const canUseApproval = (limits: PlanLimits): GuardDecision => {
  if (limits.approval_enabled === "none") {
    return {
      allowed: false,
      reason: "Tinh nang phe duyet khong co trong goi hien tai.",
    };
  }

  return { allowed: true };
};
