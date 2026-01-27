// Shared Material Request data and types

export type MaterialRequestStatus = 'not_received' | 'received' | 'partially_received';

export interface MaterialRequestItem {
  id: string;
  materialCode: string;
  materialName: string;
  unit: string;
  requestedQty: number;
  receivedQty: number;
}

export interface MaterialRequest {
  id: string;
  code: string;
  title: string;
  requestDate: string;
  requiredDate: string;
  requester: string;
  department: string;
  supplier?: string;
  status: MaterialRequestStatus;
  items: MaterialRequestItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const statusLabels: Record<MaterialRequestStatus, string> = {
  not_received: 'Chưa nhận',
  received: 'Đã nhận đủ',
  partially_received: 'Nhận một phần',
};

export const statusVariants: Record<MaterialRequestStatus, 'danger' | 'success' | 'warning'> = {
  not_received: 'danger',
  received: 'success',
  partially_received: 'warning',
};

// Mock data
export const mockMaterialRequests: MaterialRequest[] = [
  {
    id: 'req-1',
    code: 'YC-2024-001',
    title: 'Yêu cầu vật tư thép tầng 8',
    requestDate: '2024-03-10',
    requiredDate: '2024-03-20',
    requester: 'Nguyễn Văn A',
    department: 'Đội thi công 1',
    supplier: 'Hòa Phát Steel',
    status: 'partially_received',
    items: [
      { id: 'i1', materialCode: 'THEP-16', materialName: 'Thép phi 16 SD390', unit: 'kg', requestedQty: 5000, receivedQty: 3500 },
      { id: 'i2', materialCode: 'THEP-12', materialName: 'Thép phi 12 SD390', unit: 'kg', requestedQty: 3000, receivedQty: 3000 },
      { id: 'i3', materialCode: 'THEP-10', materialName: 'Thép phi 10 SD390', unit: 'kg', requestedQty: 2000, receivedQty: 0 },
    ],
    notes: 'Ưu tiên thép phi 16 cho sàn tầng 8',
    createdAt: '2024-03-10T08:30:00',
    updatedAt: '2024-03-15T14:20:00',
  },
  {
    id: 'req-2',
    code: 'YC-2024-002',
    title: 'Vật tư bê tông block B',
    requestDate: '2024-03-12',
    requiredDate: '2024-03-18',
    requester: 'Trần Văn B',
    department: 'Đội thi công 2',
    supplier: 'Bê tông Việt Đức',
    status: 'received',
    items: [
      { id: 'i4', materialCode: 'BT-C30', materialName: 'Bê tông C30', unit: 'm³', requestedQty: 50, receivedQty: 50 },
      { id: 'i5', materialCode: 'BT-C25', materialName: 'Bê tông C25', unit: 'm³', requestedQty: 30, receivedQty: 30 },
    ],
    createdAt: '2024-03-12T09:15:00',
    updatedAt: '2024-03-17T16:45:00',
  },
  {
    id: 'req-3',
    code: 'YC-2024-003',
    title: 'Coffa và giàn giáo tầng 9',
    requestDate: '2024-03-14',
    requiredDate: '2024-03-25',
    requester: 'Lê Thị C',
    department: 'Đội thi công 1',
    status: 'not_received',
    items: [
      { id: 'i6', materialCode: 'VAN-10x20', materialName: 'Ván coffa 10x20cm', unit: 'tấm', requestedQty: 200, receivedQty: 0 },
      { id: 'i7', materialCode: 'GIAN-GIAO', materialName: 'Giàn giáo tiêu chuẩn', unit: 'bộ', requestedQty: 50, receivedQty: 0 },
    ],
    notes: 'Cần trước ngày 25/3 để kịp tiến độ',
    createdAt: '2024-03-14T11:00:00',
    updatedAt: '2024-03-14T11:00:00',
  },
  {
    id: 'req-4',
    code: 'YC-2024-004',
    title: 'Vật tư MEP tầng 5-6',
    requestDate: '2024-03-15',
    requiredDate: '2024-03-28',
    requester: 'Phạm Văn D',
    department: 'Đội MEP',
    supplier: 'Nhựa Bình Minh',
    status: 'not_received',
    items: [
      { id: 'i8', materialCode: 'ONG-DN100', materialName: 'Ống PVC DN100', unit: 'm', requestedQty: 500, receivedQty: 0 },
      { id: 'i9', materialCode: 'ONG-DN50', materialName: 'Ống PVC DN50', unit: 'm', requestedQty: 300, receivedQty: 0 },
      { id: 'i10', materialCode: 'DAY-1.5', materialName: 'Dây điện 1.5mm²', unit: 'm', requestedQty: 2000, receivedQty: 0 },
    ],
    createdAt: '2024-03-15T07:45:00',
    updatedAt: '2024-03-15T07:45:00',
  },
  {
    id: 'req-5',
    code: 'YC-2024-005',
    title: 'Vật tư hoàn thiện block A',
    requestDate: '2024-03-08',
    requiredDate: '2024-03-15',
    requester: 'Hoàng Văn E',
    department: 'Đội hoàn thiện',
    supplier: 'Jotun Vietnam',
    status: 'partially_received',
    items: [
      { id: 'i11', materialCode: 'SON-NT', materialName: 'Sơn nội thất cao cấp', unit: 'thùng', requestedQty: 100, receivedQty: 60 },
      { id: 'i12', materialCode: 'BOT-TT', materialName: 'Bột trét tường', unit: 'bao', requestedQty: 200, receivedQty: 200 },
    ],
    createdAt: '2024-03-08T14:30:00',
    updatedAt: '2024-03-13T10:15:00',
  },
];

// Helper to compute stats from request list
export const computeRequestStats = (requests: MaterialRequest[]) => ({
  total: requests.length,
  notReceived: requests.filter(r => r.status === 'not_received').length,
  partiallyReceived: requests.filter(r => r.status === 'partially_received').length,
  received: requests.filter(r => r.status === 'received').length,
});
