export type IntegrationStatus = "connected" | "disconnected" | "error";

export type IntegrationCategory =
  | "cloud"
  | "communication"
  | "payment"
  | "productivity";

export type IntegrationIconKey =
  | "cloud"
  | "mail"
  | "message"
  | "credit-card"
  | "file-spreadsheet"
  | "calendar"
  | "database";

export interface IntegrationItem {
  id: string;
  name: string;
  description: string;
  iconKey: IntegrationIconKey;
  status: IntegrationStatus;
  category: IntegrationCategory;
  lastSync?: string;
}
