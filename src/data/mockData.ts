// Types
export type UserRole = 'super_admin' | 'company_owner' | 'project_manager' | 'qs_controller' | 'warehouse' | 'accountant' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  tenantId: string;
  projectIds: string[];
}

export interface Tenant {
  id: string;
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: string;
}

export interface Project {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  address: string;
  status: 'active' | 'paused' | 'completed';
  stage: 'foundation' | 'structure' | 'finishing';
  budget: number;
  actual: number;
  committed: number;
  forecast: number;
  progress: number;
  startDate: string;
  endDate: string;
  alertCount: number;
  manager: string;
}

export interface Permission {
  module: string;
  view: boolean;
  edit: boolean;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Mock Tenants
export const tenants: Tenant[] = [
  {
    id: 'tenant-a',
    name: 'Công ty CP Xây dựng Hòa Bình',
    logo: undefined,
    address: '235 Võ Văn Tần, Q.3, TP.HCM',
    phone: '028 3932 0188',
    email: 'info@hbc.vn',
    plan: 'enterprise',
    createdAt: '2023-01-15',
  },
  {
    id: 'tenant-b',
    name: 'Công ty TNHH Xây dựng Thành Công',
    logo: undefined,
    address: '15 Nguyễn Du, Q.1, TP.HCM',
    phone: '028 3821 5566',
    email: 'contact@thanhcong.vn',
    plan: 'professional',
    createdAt: '2023-06-20',
  },
];

// Mock Users
export const users: User[] = [
  // Super Admin
  {
    id: 'user-super',
    email: 'admin@platform.vn',
    name: 'Nguyễn Văn Admin',
    role: 'super_admin',
    tenantId: '',
    projectIds: [],
  },
  // Tenant A Users
  {
    id: 'user-a1',
    email: 'owner@hbc.vn',
    name: 'Trần Minh Quân',
    role: 'company_owner',
    tenantId: 'tenant-a',
    projectIds: [],
  },
  {
    id: 'user-a2',
    email: 'pm@hbc.vn',
    name: 'Lê Thị Hương',
    role: 'project_manager',
    tenantId: 'tenant-a',
    projectIds: ['proj-a1', 'proj-a2'],
  },
  {
    id: 'user-a3',
    email: 'qs@hbc.vn',
    name: 'Phạm Văn Đức',
    role: 'qs_controller',
    tenantId: 'tenant-a',
    projectIds: ['proj-a1', 'proj-a3'],
  },
  {
    id: 'user-a4',
    email: 'warehouse@hbc.vn',
    name: 'Nguyễn Thị Mai',
    role: 'warehouse',
    tenantId: 'tenant-a',
    projectIds: ['proj-a1', 'proj-a2', 'proj-a3'],
  },
  {
    id: 'user-a5',
    email: 'accountant@hbc.vn',
    name: 'Võ Văn Tài',
    role: 'accountant',
    tenantId: 'tenant-a',
    projectIds: ['proj-a1', 'proj-a2'],
  },
  // Tenant B Users
  {
    id: 'user-b1',
    email: 'owner@thanhcong.vn',
    name: 'Hoàng Văn Thắng',
    role: 'company_owner',
    tenantId: 'tenant-b',
    projectIds: [],
  },
  {
    id: 'user-b2',
    email: 'pm@thanhcong.vn',
    name: 'Đặng Thị Lan',
    role: 'project_manager',
    tenantId: 'tenant-b',
    projectIds: ['proj-b1', 'proj-b2'],
  },
  {
    id: 'user-b3',
    email: 'viewer@thanhcong.vn',
    name: 'Trịnh Văn Nam',
    role: 'viewer',
    tenantId: 'tenant-b',
    projectIds: ['proj-b1'],
  },
];

// Mock Projects
export const projects: Project[] = [
  // Tenant A Projects
  {
    id: 'proj-a1',
    tenantId: 'tenant-a',
    code: 'HBC-2024-001',
    name: 'Chung cư The Horizon',
    address: 'Q.7, TP.HCM',
    status: 'active',
    stage: 'structure',
    budget: 285000000000,
    actual: 142500000000,
    committed: 185000000000,
    forecast: 295000000000,
    progress: 48,
    startDate: '2024-01-15',
    endDate: '2025-12-31',
    alertCount: 5,
    manager: 'Lê Thị Hương',
  },
  {
    id: 'proj-a2',
    tenantId: 'tenant-a',
    code: 'HBC-2024-002',
    name: 'Biệt thự Palm City',
    address: 'Q.2, TP.HCM',
    status: 'active',
    stage: 'finishing',
    budget: 156000000000,
    actual: 128000000000,
    committed: 148000000000,
    forecast: 158000000000,
    progress: 82,
    startDate: '2023-06-01',
    endDate: '2024-08-31',
    alertCount: 2,
    manager: 'Lê Thị Hương',
  },
  {
    id: 'proj-a3',
    tenantId: 'tenant-a',
    code: 'HBC-2024-003',
    name: 'Văn phòng Saigon Tower',
    address: 'Q.1, TP.HCM',
    status: 'active',
    stage: 'foundation',
    budget: 420000000000,
    actual: 52000000000,
    committed: 95000000000,
    forecast: 420000000000,
    progress: 12,
    startDate: '2024-03-01',
    endDate: '2026-06-30',
    alertCount: 1,
    manager: 'Nguyễn Văn Tùng',
  },
  {
    id: 'proj-a4',
    tenantId: 'tenant-a',
    code: 'HBC-2023-008',
    name: 'Khu dân cư Green Valley',
    address: 'Bình Dương',
    status: 'completed',
    stage: 'finishing',
    budget: 89000000000,
    actual: 87500000000,
    committed: 87500000000,
    forecast: 87500000000,
    progress: 100,
    startDate: '2022-09-01',
    endDate: '2024-01-31',
    alertCount: 0,
    manager: 'Trần Văn Hải',
  },
  // Tenant B Projects
  {
    id: 'proj-b1',
    tenantId: 'tenant-b',
    code: 'TC-2024-001',
    name: 'Nhà phố Thảo Điền',
    address: 'Q.2, TP.HCM',
    status: 'active',
    stage: 'structure',
    budget: 45000000000,
    actual: 22000000000,
    committed: 32000000000,
    forecast: 47000000000,
    progress: 52,
    startDate: '2024-02-01',
    endDate: '2024-12-31',
    alertCount: 3,
    manager: 'Đặng Thị Lan',
  },
  {
    id: 'proj-b2',
    tenantId: 'tenant-b',
    code: 'TC-2024-002',
    name: 'Showroom Auto Center',
    address: 'Q.Tân Bình, TP.HCM',
    status: 'paused',
    stage: 'foundation',
    budget: 28000000000,
    actual: 8500000000,
    committed: 12000000000,
    forecast: 30000000000,
    progress: 28,
    startDate: '2024-04-15',
    endDate: '2025-03-31',
    alertCount: 8,
    manager: 'Đặng Thị Lan',
  },
  {
    id: 'proj-b3',
    tenantId: 'tenant-b',
    code: 'TC-2023-005',
    name: 'Resort Phú Quốc',
    address: 'Phú Quốc, Kiên Giang',
    status: 'active',
    stage: 'finishing',
    budget: 125000000000,
    actual: 98000000000,
    committed: 118000000000,
    forecast: 128000000000,
    progress: 75,
    startDate: '2023-01-01',
    endDate: '2024-09-30',
    alertCount: 4,
    manager: 'Lý Văn Minh',
  },
];

// Role Labels
export const roleLabels: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  company_owner: 'Giám đốc Công ty',
  project_manager: 'Quản lý Dự án',
  qs_controller: 'QS/Kiểm soát Chi phí',
  warehouse: 'Kho/Vật tư',
  accountant: 'Kế toán',
  viewer: 'Xem',
};

// Module names in Vietnamese
export const moduleNames: Record<string, string> = {
  dashboard: 'Bảng điều khiển',
  projects: 'Dự án',
  wbs: 'Phân rã công việc',
  boq: 'Dự toán',
  materials: 'Vật tư',
  norms: 'Định mức',
  costs: 'Chi phí',
  contracts: 'Hợp đồng',
  payments: 'Thanh toán',
  progress: 'Tiến độ',
  reports: 'Báo cáo',
  admin: 'Quản trị',
};

// Role Permissions
export const rolePermissions: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: Object.keys(moduleNames).map(m => ({ module: m, view: true, edit: true })),
  },
  {
    role: 'company_owner',
    permissions: Object.keys(moduleNames).map(m => ({ module: m, view: true, edit: true })),
  },
  {
    role: 'project_manager',
    permissions: [
      { module: 'dashboard', view: true, edit: false },
      { module: 'projects', view: true, edit: true },
      { module: 'wbs', view: true, edit: true },
      { module: 'boq', view: true, edit: true },
      { module: 'materials', view: true, edit: true },
      { module: 'norms', view: true, edit: true },
      { module: 'costs', view: true, edit: true },
      { module: 'contracts', view: true, edit: false },
      { module: 'payments', view: true, edit: false },
      { module: 'progress', view: true, edit: true },
      { module: 'reports', view: true, edit: false },
      { module: 'admin', view: false, edit: false },
    ],
  },
  {
    role: 'qs_controller',
    permissions: [
      { module: 'dashboard', view: true, edit: false },
      { module: 'projects', view: true, edit: false },
      { module: 'wbs', view: true, edit: true },
      { module: 'boq', view: true, edit: true },
      { module: 'materials', view: true, edit: false },
      { module: 'norms', view: true, edit: true },
      { module: 'costs', view: true, edit: true },
      { module: 'contracts', view: true, edit: false },
      { module: 'payments', view: true, edit: false },
      { module: 'progress', view: true, edit: false },
      { module: 'reports', view: true, edit: true },
      { module: 'admin', view: false, edit: false },
    ],
  },
  {
    role: 'warehouse',
    permissions: [
      { module: 'dashboard', view: true, edit: false },
      { module: 'projects', view: true, edit: false },
      { module: 'wbs', view: true, edit: false },
      { module: 'boq', view: true, edit: false },
      { module: 'materials', view: true, edit: true },
      { module: 'norms', view: true, edit: false },
      { module: 'costs', view: false, edit: false },
      { module: 'contracts', view: false, edit: false },
      { module: 'payments', view: false, edit: false },
      { module: 'progress', view: true, edit: false },
      { module: 'reports', view: true, edit: false },
      { module: 'admin', view: false, edit: false },
    ],
  },
  {
    role: 'accountant',
    permissions: [
      { module: 'dashboard', view: true, edit: false },
      { module: 'projects', view: true, edit: false },
      { module: 'wbs', view: true, edit: false },
      { module: 'boq', view: true, edit: false },
      { module: 'materials', view: true, edit: false },
      { module: 'norms', view: false, edit: false },
      { module: 'costs', view: true, edit: true },
      { module: 'contracts', view: true, edit: true },
      { module: 'payments', view: true, edit: true },
      { module: 'progress', view: false, edit: false },
      { module: 'reports', view: true, edit: true },
      { module: 'admin', view: false, edit: false },
    ],
  },
  {
    role: 'viewer',
    permissions: Object.keys(moduleNames).map(m => ({ 
      module: m, 
      view: m !== 'admin', 
      edit: false 
    })),
  },
];

// Status labels
export const projectStatusLabels: Record<Project['status'], string> = {
  active: 'Đang thi công',
  paused: 'Tạm dừng',
  completed: 'Hoàn thành',
};

export const projectStageLabels: Record<Project['stage'], string> = {
  foundation: 'Móng',
  structure: 'Thân',
  finishing: 'Hoàn thiện',
};

// Format currency
export const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)} tỷ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)} tr`;
  }
  return new Intl.NumberFormat('vi-VN').format(value);
};

// Format currency full
export const formatCurrencyFull = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};

// Mock alerts
export interface Alert {
  id: string;
  projectId: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  module: string;
  createdAt: string;
}

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    projectId: 'proj-a1',
    type: 'error',
    title: 'Vượt định mức thép',
    description: 'Sàn tầng 8 vượt 12.5% định mức thép phi 16',
    module: 'materials',
    createdAt: '2024-03-15',
  },
  {
    id: 'alert-2',
    projectId: 'proj-a1',
    type: 'warning',
    title: 'Chậm tiến độ',
    description: 'Công tác hoàn thiện block A chậm 5 ngày so với kế hoạch',
    module: 'progress',
    createdAt: '2024-03-14',
  },
  {
    id: 'alert-3',
    projectId: 'proj-a1',
    type: 'warning',
    title: 'Thanh toán quá hạn',
    description: 'Hợp đồng NCC-001 có khoản thanh toán quá hạn 3 ngày',
    module: 'payments',
    createdAt: '2024-03-13',
  },
];
