import type { DataUser } from "@/lib/data/types";

export const demoUsers: DataUser[] = [
  {
    id: "user-a1",
    name: "Tran Minh Quan",
    email: "owner@hbc.vn",
    role: "owner",
    status: "active",
    assignedProjectIds: ["proj-a1", "proj-a2", "proj-a3", "proj-a4"],
    joinedAt: "2023-01-15",
  },
  {
    id: "user-a2",
    name: "Le Thi Huong",
    email: "pm@hbc.vn",
    role: "admin",
    status: "active",
    assignedProjectIds: ["proj-a1", "proj-a2"],
    joinedAt: "2023-02-08",
  },
  {
    id: "user-a3",
    name: "Pham Van Duc",
    email: "qs@hbc.vn",
    role: "manager",
    status: "active",
    assignedProjectIds: ["proj-a1", "proj-a3"],
    joinedAt: "2023-03-21",
  },
  {
    id: "user-a4",
    name: "Nguyen Thi Mai",
    email: "warehouse@hbc.vn",
    role: "member",
    status: "active",
    assignedProjectIds: ["proj-a1", "proj-a2", "proj-a3"],
    joinedAt: "2023-04-11",
  },
  {
    id: "user-a5",
    name: "Vo Van Tai",
    email: "accountant@hbc.vn",
    role: "viewer",
    status: "invited",
    assignedProjectIds: ["proj-a1", "proj-a2"],
    joinedAt: "2023-05-02",
  },
];
