import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  Search, 
  Plus,
  Download,
  Upload,
  Filter,
  ChevronRight,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KPICard } from '@/components/ui/kpi-card';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency, formatCurrencyFull } from '@/data/mockData';

// Mock BOQ data
const mockBOQKPIs = {
  totalItems: 485,
  totalValue: 285000000000,
  approved: 412,
  pending: 58,
  rejected: 15,
};

const mockBOQItems = [
  { id: '1', code: 'MONG-01', name: 'Đào đất móng', unit: 'm³', quantity: 2500, unitPrice: 125000, total: 312500000, status: 'approved' },
  { id: '2', code: 'MONG-02', name: 'Bê tông lót móng C10', unit: 'm³', quantity: 180, unitPrice: 1150000, total: 207000000, status: 'approved' },
  { id: '3', code: 'MONG-03', name: 'Bê tông móng C30', unit: 'm³', quantity: 850, unitPrice: 1450000, total: 1232500000, status: 'approved' },
  { id: '4', code: 'MONG-04', name: 'Thép móng SD390', unit: 'kg', quantity: 45000, unitPrice: 18500, total: 832500000, status: 'pending' },
  { id: '5', code: 'COT-01', name: 'Bê tông cột C30', unit: 'm³', quantity: 520, unitPrice: 1450000, total: 754000000, status: 'approved' },
  { id: '6', code: 'COT-02', name: 'Thép cột SD390', unit: 'kg', quantity: 38000, unitPrice: 18500, total: 703000000, status: 'approved' },
  { id: '7', code: 'DAM-01', name: 'Bê tông dầm C30', unit: 'm³', quantity: 680, unitPrice: 1450000, total: 986000000, status: 'pending' },
  { id: '8', code: 'SAN-01', name: 'Bê tông sàn C25', unit: 'm³', quantity: 1200, unitPrice: 1250000, total: 1500000000, status: 'approved' },
  { id: '9', code: 'SAN-02', name: 'Thép sàn SD390', unit: 'kg', quantity: 85000, unitPrice: 18500, total: 1572500000, status: 'rejected' },
  { id: '10', code: 'TUONG-01', name: 'Xây tường gạch 100', unit: 'm²', quantity: 3500, unitPrice: 185000, total: 647500000, status: 'approved' },
];

const BOQ: React.FC = () => {
  const { id: projectId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredItems = mockBOQItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <StatusBadge status="success"><Check className="h-3 w-3" /> Đã duyệt</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Chờ duyệt</StatusBadge>;
      case 'rejected':
        return <StatusBadge status="danger"><X className="h-3 w-3" /> Từ chối</StatusBadge>;
      default:
        return <StatusBadge status="neutral">{status}</StatusBadge>;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="page-title">Dự toán (BOQ)</h1>
            <p className="page-subtitle">Quản lý bảng khối lượng và đơn giá</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Excel
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm hạng mục
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
          <KPICard
            title="Tổng hạng mục"
            value={mockBOQKPIs.totalItems}
            icon={FileText}
          />
          <KPICard
            title="Tổng giá trị"
            value={formatCurrency(mockBOQKPIs.totalValue)}
            variant="primary"
          />
          <KPICard
            title="Đã duyệt"
            value={mockBOQKPIs.approved}
            subtitle={`${Math.round(mockBOQKPIs.approved / mockBOQKPIs.totalItems * 100)}%`}
            variant="success"
          />
          <KPICard
            title="Chờ duyệt"
            value={mockBOQKPIs.pending}
            subtitle="Cần xử lý"
          />
          <KPICard
            title="Từ chối"
            value={mockBOQKPIs.rejected}
            variant="destructive"
          />
        </div>

        {/* Filter Bar */}
        <div className="filter-bar rounded-xl bg-card">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm hạng mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="pending">Chờ duyệt</SelectItem>
              <SelectItem value="rejected">Từ chối</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Nhóm công việc" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả nhóm</SelectItem>
              <SelectItem value="foundation">Móng</SelectItem>
              <SelectItem value="structure">Kết cấu</SelectItem>
              <SelectItem value="finishing">Hoàn thiện</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* BOQ Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã công tác</th>
                <th>Tên công tác</th>
                <th>ĐVT</th>
                <th className="text-right">Khối lượng</th>
                <th className="text-right">Đơn giá</th>
                <th className="text-right">Thành tiền</th>
                <th>Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="cursor-pointer">
                  <td className="font-medium font-mono">{item.code}</td>
                  <td>{item.name}</td>
                  <td className="text-muted-foreground">{item.unit}</td>
                  <td className="text-right font-medium">{item.quantity.toLocaleString()}</td>
                  <td className="text-right">{item.unitPrice.toLocaleString()}</td>
                  <td className="text-right font-medium">{formatCurrency(item.total)}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/50">
                <td colSpan={5} className="font-semibold">Tổng cộng</td>
                <td className="text-right font-bold">{formatCurrency(filteredItems.reduce((sum, item) => sum + item.total, 0))}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BOQ;
