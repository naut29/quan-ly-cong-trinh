import type { IntegrationSummary } from "@/lib/data/types";

export const demoIntegrations: IntegrationSummary[] = [
  {
    id: "google-drive",
    name: "Google Drive",
    status: "connected",
    description: "Luu tru va dong bo tai lieu du an trong demo.",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    status: "available",
    description: "Sao luu va chia se file trong demo mode.",
  },
  {
    id: "database-backup",
    name: "Database Backup",
    status: "connected",
    description: "Sao luu co so du lieu bang fixtures.",
  },
  {
    id: "gmail",
    name: "Gmail / SMTP",
    status: "connected",
    description: "Gui email thong bao tu payload mo phong.",
  },
  {
    id: "slack",
    name: "Slack",
    status: "available",
    description: "Thong bao va cong tac nhom bang mock state.",
  },
  {
    id: "zalo",
    name: "Zalo OA",
    status: "warning",
    description: "Kenh canh bao demo, khong goi request that.",
  },
  {
    id: "vnpay",
    name: "VNPay",
    status: "connected",
    description: "Thanh toan truc tuyen duoc mo phong.",
  },
  {
    id: "momo",
    name: "MoMo",
    status: "available",
    description: "Thanh toan qua vi dien tu bang mock state.",
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    status: "connected",
    description: "Xuat bao cao tu du lieu fixture.",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    status: "available",
    description: "Dong bo lich va deadline tren memory state.",
  },
];
