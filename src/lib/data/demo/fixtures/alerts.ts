import type { DataAlert } from "@/lib/data/types";

export const demoAlerts: DataAlert[] = [
  {
    id: "alert-1",
    projectId: "proj-a1",
    type: "error",
    title: "Vuot dinh muc thep",
    description: "San tang 8 vuot 12.5% dinh muc thep phi 16.",
    module: "materials",
    createdAt: "2024-03-15",
  },
  {
    id: "alert-2",
    projectId: "proj-a1",
    type: "warning",
    title: "Cham tien do",
    description: "Cong tac hoan thien block A cham 5 ngay so voi ke hoach.",
    module: "progress",
    createdAt: "2024-03-14",
  },
  {
    id: "alert-3",
    projectId: "proj-a1",
    type: "warning",
    title: "Thanh toan qua han",
    description: "Hop dong NCC-001 co khoan thanh toan qua han 3 ngay.",
    module: "payments",
    createdAt: "2024-03-13",
  },
  {
    id: "alert-4",
    projectId: "proj-a2",
    type: "info",
    title: "Hoan tat nghiem thu dot 3",
    description: "Ho so nghiem thu phan hoan thien da duoc xac nhan.",
    module: "approvals",
    createdAt: "2024-03-12",
  },
];
