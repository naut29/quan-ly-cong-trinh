import type { RoleSummary } from "@/lib/data/types";

export const demoRoles: RoleSummary[] = [
  {
    id: "owner",
    label: "Owner",
    memberCount: 1,
    description: "Toan quyen tren du lieu demo cua doanh nghiep.",
  },
  {
    id: "admin",
    label: "Admin",
    memberCount: 1,
    description: "Quan tri thanh vien, billing va cau hinh demo.",
  },
  {
    id: "manager",
    label: "Manager",
    memberCount: 1,
    description: "Dieu phoi du an, phe duyet va theo doi tien do.",
  },
  {
    id: "member",
    label: "Member",
    memberCount: 1,
    description: "Cap nhat van hanh va nghiep vu hien truong.",
  },
  {
    id: "viewer",
    label: "Viewer",
    memberCount: 1,
    description: "Chi xem bao cao va thong tin tong hop.",
  },
];
