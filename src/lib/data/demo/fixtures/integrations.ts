import type { IntegrationSummary } from "@/lib/data/types";

export const demoIntegrations: IntegrationSummary[] = [
  {
    id: "misa",
    name: "MISA AMIS",
    status: "connected",
    description: "Dong bo cong no va hoa don o che do demo.",
  },
  {
    id: "r2",
    name: "R2 Storage",
    status: "demo-only",
    description: "Upload duoc mo phong, khong ghi file that.",
  },
  {
    id: "slack",
    name: "Slack",
    status: "available",
    description: "Canh bao va thong bao duoc mo phong bang mock payload.",
  },
];
