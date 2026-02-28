import type { IntegrationCategory, IntegrationIconKey, IntegrationItem, IntegrationStatus } from "@/features/integrations/types";
import { supabase } from "@/lib/supabaseClient";

export interface OrgIntegrationRow {
  id: string;
  org_id: string;
  provider: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  icon_key: IntegrationIconKey;
  enabled: boolean;
  status: IntegrationStatus;
  last_sync_at: string | null;
  last_error: string | null;
  created_at: string;
  updated_at: string;
}

interface CatalogItem {
  provider: string;
  name: string;
  description: string;
  category: IntegrationCategory;
  iconKey: IntegrationIconKey;
}

export const INTEGRATION_CATALOG: CatalogItem[] = [
  {
    provider: "google-drive",
    name: "Google Drive",
    description: "Luu tru va dong bo tai lieu cong viec.",
    category: "cloud",
    iconKey: "cloud",
  },
  {
    provider: "dropbox",
    name: "Dropbox",
    description: "Sao luu va chia se file.",
    category: "cloud",
    iconKey: "cloud",
  },
  {
    provider: "supabase-backup",
    name: "Database Backup",
    description: "Sao luu co so du lieu va snapshot van hanh.",
    category: "cloud",
    iconKey: "database",
  },
  {
    provider: "gmail",
    name: "Gmail / SMTP",
    description: "Gui email thong bao tu dong.",
    category: "communication",
    iconKey: "mail",
  },
  {
    provider: "slack",
    name: "Slack",
    description: "Thong bao va cong tac nhom.",
    category: "communication",
    iconKey: "message",
  },
  {
    provider: "zalo",
    name: "Zalo OA",
    description: "Gui thong bao qua Zalo.",
    category: "communication",
    iconKey: "message",
  },
  {
    provider: "vnpay",
    name: "VNPay",
    description: "Cong cu thu phi truc tuyen.",
    category: "payment",
    iconKey: "credit-card",
  },
  {
    provider: "momo",
    name: "MoMo",
    description: "Vi dien tu cho quy trinh thu phi.",
    category: "payment",
    iconKey: "credit-card",
  },
  {
    provider: "google-sheets",
    name: "Google Sheets",
    description: "Xuat bao cao tu dong.",
    category: "productivity",
    iconKey: "file-spreadsheet",
  },
  {
    provider: "google-calendar",
    name: "Google Calendar",
    description: "Dong bo lich va deadline.",
    category: "productivity",
    iconKey: "calendar",
  },
];

const assertClient = () => {
  if (!supabase) {
    throw new Error("Missing Supabase env");
  }

  return supabase;
};

const formatRelativeSync = (isoValue: string | null) => {
  if (!isoValue) {
    return undefined;
  }

  const deltaMinutes = Math.max(0, Math.round((Date.now() - new Date(isoValue).getTime()) / 60000));
  if (deltaMinutes < 1) return "Vua cap nhat";
  if (deltaMinutes < 60) return `${deltaMinutes} phut truoc`;

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) return `${deltaHours} gio truoc`;

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays} ngay truoc`;
};

const mapRowToItem = (row: OrgIntegrationRow): IntegrationItem => ({
  id: row.provider,
  name: row.name,
  description: row.description,
  category: row.category,
  iconKey: row.icon_key,
  status: row.enabled ? row.status : "disconnected",
  lastSync: formatRelativeSync(row.last_sync_at),
});

const toSeedRow = (orgId: string, item: CatalogItem) => ({
  org_id: orgId,
  provider: item.provider,
  name: item.name,
  description: item.description,
  category: item.category,
  icon_key: item.iconKey,
  enabled: false,
  status: "disconnected" as IntegrationStatus,
});

export const ensureOrgIntegrations = async (orgId: string) => {
  const client = assertClient();
  const { data, error } = await client
    .from("org_integrations")
    .select(
      "id, org_id, provider, name, description, category, icon_key, enabled, status, last_sync_at, last_error, created_at, updated_at",
    )
    .eq("org_id", orgId);

  if (error) {
    throw error;
  }

  const existingProviders = new Set((data ?? []).map((row) => String(row.provider)));
  const missingRows = INTEGRATION_CATALOG
    .filter((item) => !existingProviders.has(item.provider))
    .map((item) => toSeedRow(orgId, item));

  if (missingRows.length > 0) {
    const { error: insertError } = await client.from("org_integrations").insert(missingRows);
    if (insertError) {
      throw insertError;
    }
  }
};

export const listOrgIntegrations = async (orgId: string) => {
  await ensureOrgIntegrations(orgId);
  const client = assertClient();
  const { data, error } = await client
    .from("org_integrations")
    .select(
      "id, org_id, provider, name, description, category, icon_key, enabled, status, last_sync_at, last_error, created_at, updated_at",
    )
    .eq("org_id", orgId)
    .order("provider", { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as OrgIntegrationRow[]).map(mapRowToItem);
};

export interface UpdateOrgIntegrationInput {
  enabled?: boolean;
  status?: IntegrationStatus;
  last_sync_at?: string | null;
  last_error?: string | null;
}

export const updateOrgIntegration = async (
  orgId: string,
  provider: string,
  input: UpdateOrgIntegrationInput,
) => {
  const client = assertClient();
  const payload = {
    ...input,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("org_integrations")
    .update(payload)
    .eq("org_id", orgId)
    .eq("provider", provider)
    .select(
      "id, org_id, provider, name, description, category, icon_key, enabled, status, last_sync_at, last_error, created_at, updated_at",
    )
    .single();

  if (error) {
    throw error;
  }

  return mapRowToItem(data as OrgIntegrationRow);
};
